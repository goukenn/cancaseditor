// author: C.A.D. BONDJE DOUE
// file: StorageTool.js
// @desc: persistence of the editor.
//  - the current document is autosaved in localStorage (xml) and restored on startup
//  - editor options/plugins live in localStorage; for authenticated users they are also synchronized
//    with the server (<appUri>/settings, <appUri>/plugins). The server values override the local ones.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const KEY_DOC = 'cancas.doc';
	const KEY_SET = 'cancas.settings';
	const AUTOSAVE_DELAY = 800;
	const PUSH_DELAY = 600;
	const R = () => _NS.R || {};
	// localStorage can be unavailable (private window, blocked data) or full
	const store = {
		get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
		set(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
		remove(k) { try { window.localStorage.removeItem(k); } catch (e) { } }
	};
	const _fetchInit = (method, fields) => {
		const init = { method, credentials: 'same-origin', headers: { 'IGK-AJX': '1' } };
		if (fields) {
			const fd = new FormData();
			Object.keys(fields).forEach((k) => fd.append(k, fields[k]));
			init.body = fd;
		}
		return init;
	};
	const appUri = () => igk.system.io.baseUri();
	// ------------------------------------------------------------------ preferences
	let data = { options: {}, plugins: [] };
	try {
		const d = JSON.parse(store.get(KEY_SET) || '{}');
		data.options = (d.options && typeof d.options == 'object') ? d.options : {};
		data.plugins = Array.isArray(d.plugins) ? d.plugins : [];
	} catch (e) { }
	const listeners = [];
	let pending = {}; // options not pushed to the server
	let pushTimer = null;
	const persistLocal = () => store.set(KEY_SET, JSON.stringify(data));
	const emit = (what, name) => listeners.forEach((f) => f(what, name));
	const prefs = _NS.prefs = {
		signedIn: false, // known after the first server answer
		user: null, // login of the authenticated user
		get(name, def) { return (name in data.options) ? data.options[name] : def; },
		set(name, value) {
			if (data.options[name] === value) { return; }
			data.options[name] = value;
			persistLocal();
			pending[name] = value;
			if (prefs.signedIn) {
				clearTimeout(pushTimer);
				pushTimer = setTimeout(push, PUSH_DELAY);
			}
			emit('option', name);
		},
		get plugins() { return data.plugins; },
		/** @param {(what:string, name?:string)=>void} fn */
		onChange(fn) { listeners.push(fn); },
		async addPlugin(p) {
			const item = { id: 0, name: p.name, url: p.url, enabled: p.enabled ? 1 : 0 };
			if (prefs.signedIn) {
				const r = await fetch(appUri() + '/plugins', _fetchInit('POST', { op: 'save', name: item.name, url: item.url, enabled: item.enabled }));
				if (!r.ok) { throw new Error(R()['plugins.invalid']); }
				item.id = (await r.json()).id;
			} else {
				item.id = -Date.now(); // local only
			}
			data.plugins.push(item);
			persistLocal();
			emit('plugins');
		},
		async setPluginEnabled(item, enabled) {
			item.enabled = enabled ? 1 : 0;
			if (prefs.signedIn && item.id > 0) {
				await fetch(appUri() + '/plugins', _fetchInit('POST', { op: 'save', id: item.id, name: item.name, url: item.url, enabled: item.enabled }));
			}
			persistLocal();
			emit('plugins');
		},
		async removePlugin(item) {
			if (prefs.signedIn && item.id > 0) {
				await fetch(appUri() + '/plugins', _fetchInit('POST', { op: 'delete', id: item.id }));
			}
			data.plugins = data.plugins.filter((p) => p !== item);
			persistLocal();
			emit('plugins');
		},
		/** load the settings of the authenticated user. Server values override local ones. */
		async loadServer() {
			let r;
			try { r = await fetch(appUri() + '/settings', _fetchInit('GET')); } catch (e) { return false; }
			if (!r.ok) {
				prefs.signedIn = false; // anonymous: local only
				prefs.user = null;
				emit('auth');
				return false;
			}
			const d = await r.json();
			prefs.signedIn = true;
			prefs.user = d.user || null;
			// numbers and booleans are stored as text on the server: restore the local type
			Object.keys(d.options || {}).forEach((k) => {
				let v = d.options[k];
				const cur = data.options[k];
				if (typeof cur == 'boolean') { v = (v === 'true' || v === '1' || v === true); }
				else if (typeof cur == 'number') { v = Number(v); }
				data.options[k] = v;
			});
			data.plugins = d.plugins || [];
			persistLocal();
			// push the local options the server does not know yet
			Object.keys(data.options).forEach((k) => { if (!(k in (d.options || {}))) { pending[k] = data.options[k]; } });
			Object.keys(pending).length > 0 && push();
			emit('server');
			return true;
		}
	};
	async function push() {
		const o = pending;
		pending = {};
		if (!prefs.signedIn || Object.keys(o).length == 0) { return; }
		try {
			const r = await fetch(appUri() + '/settings', _fetchInit('POST', { options: JSON.stringify(o) }));
			if (!r.ok) { Object.assign(pending, o); }
		} catch (e) { Object.assign(pending, o); }
	}
	// ------------------------------------------------------------------ document + history
	// The document is tracked by snapshots (xml). A snapshot is taken once the editor is idle after any
	// change (events, property inspector edits, tool drags...: every redraw schedules a check). A snapshot
	// that differs from the current one is stored as the document and pushed on the undo stack.
	const KEY_HIST = 'cancas.history';
	// the view (zoom and pan = location) of each document and the current document: not part of the document
	// text, so that moving the view does not create history entries
	const KEY_VIEWS = 'cancas.views';
	function saveViews(editor) {
		const o = { current: editor.document ? editor.document.id : null, views: {} };
		editor.documents.forEach((d) => {
			const v = d === editor.document ? editor.getView() : d.view;
			if (v) { o.views[d.id] = v; }
		});
		store.set(KEY_VIEWS, JSON.stringify(o));
	}
	/** @returns {boolean} true when the view of the current document was restored */
	function applyViews(editor) {
		let o = null;
		try { o = JSON.parse(store.get(KEY_VIEWS) || 'null'); } catch (e) { }
		if (!o || !o.views) { return false; }
		const assign = () => editor.documents.forEach((d) => { if (o.views[d.id]) { d.view = o.views[d.id]; } });
		assign();
		const cur = editor.documents.find((d) => d.id == o.current);
		if (cur && cur !== editor.document) {
			editor.document = cur;
			const ly = cur.getLayers();
			editor.layer = ly.length > 0 ? ly[ly.length - 1] : null;
			assign(); // switching the document stored the view of the previous one
		}
		const v = editor.document && editor.document.view;
		if (v) { editor.setView(v); return true; }
		return false;
	}
	const CHECK_DELAY = 300;
	const DEFAULT_UNDO_LIMIT = 100;
	let m_dirty = false;
	let m_saved = null; // Date of the last save
	let m_restoring = false;
	let m_timer = null;
	let m_hist = { list: [], index: -1 }; // undo stack: list of snapshots, index = current one
	const undoLimit = () => {
		const n = Math.floor(Number(prefs.get('undoLimit', DEFAULT_UNDO_LIMIT)));
		return n >= 1 ? Math.min(n, 1000) : DEFAULT_UNDO_LIMIT;
	};
	// an empty scene is a valid snapshot (the state before the first change)
	const snapshot = (editor) => _NS.visitors.xml ? _NS.visitors.xml(editor.list, {}) : null;
	function trimHistory() {
		const over = m_hist.list.length - undoLimit();
		if (over > 0) {
			m_hist.list.splice(0, over);
			m_hist.index = Math.max(0, m_hist.index - over);
		}
	}
	function persistHistory() {
		// the stack can exceed the storage quota: keep it in memory only then
		if (!store.set(KEY_HIST, JSON.stringify(m_hist))) {
			store.remove(KEY_HIST);
		}
	}
	const storage = _NS.storage = {
		get dirty() { return m_dirty; },
		get lastSaved() { return m_saved; },
		get canUndo() { return m_hist.index > 0; },
		get canRedo() { return m_hist.index < m_hist.list.length - 1; },
		get historySize() { return m_hist.list.length; },
		onChange: [],
		_emit() { this.onChange.forEach((f) => f(this)); },
		/** take a snapshot now: store it and push it on the undo stack when it changed */
		checkpoint(editor, silent) {
			clearTimeout(m_timer);
			if (m_restoring || editor['@loading']) { return false; }
			const xml = snapshot(editor);
			if (xml === null) { return false; }
			if (xml === m_hist.list[m_hist.index]) {
				// unchanged: only the pending state needs to be settled
				if (m_dirty) { m_dirty = false; this._emit(); }
				return true;
			}
			m_hist.list.splice(m_hist.index + 1); // a new change drops the redo part
			m_hist.list.push(xml);
			m_hist.index = m_hist.list.length - 1;
			trimHistory();
			let ok = true;
			if (prefs.get('autosave', true) !== false) {
				ok = store.set(KEY_DOC, xml);
				persistHistory();
				if (ok) { m_dirty = false; m_saved = new Date(); }
			}
			this._emit();
			if (!silent || !ok) {
				_NS.gui.notify.Show(editor, R()[ok ? 'msg.save.saved' : 'msg.save.failed']);
			}
			return ok;
		},
		/** explicit save (File > Save): store the current document whatever the autosave option is */
		saveNow(editor, silent) {
			clearTimeout(m_timer);
			const xml = snapshot(editor);
			if (xml === null) { return false; }
			if (xml !== m_hist.list[m_hist.index]) {
				m_hist.list.splice(m_hist.index + 1);
				m_hist.list.push(xml);
				m_hist.index = m_hist.list.length - 1;
				trimHistory();
			}
			const ok = store.set(KEY_DOC, xml);
			persistHistory();
			if (ok) { m_dirty = false; m_saved = new Date(); }
			this._emit();
			if (!silent || !ok) {
				_NS.gui.notify.Show(editor, R()[ok ? 'msg.save.saved' : 'msg.save.failed']);
			}
			return ok;
		},
		/** load a snapshot in the editor without recording a change */
		_apply(editor, xml) {
			m_restoring = true;
			try {
				if (!_NS.encoder.xml.decodeString(xml, editor)) { return false; }
				editor.refresh();
				return true;
			} catch (e) {
				console.error('restore failed', e);
				return false;
			} finally {
				m_restoring = false;
			}
		},
		undo(editor) {
			if (!this.canUndo) { return false; }
			this.checkpoint(editor, true); // settle pending changes first
			if (!this.canUndo) { return false; }
			m_hist.index--;
			return this._move(editor);
		},
		redo(editor) {
			this.checkpoint(editor, true);
			if (!this.canRedo) { return false; }
			m_hist.index++;
			return this._move(editor);
		},
		_move(editor) {
			const xml = m_hist.list[m_hist.index];
			const ok = this._apply(editor, xml);
			// the serialization of the loaded scene is the reference: it avoids a false change after the move
			const norm = ok && snapshot(editor);
			if (norm) { m_hist.list[m_hist.index] = norm; }
			if (ok && prefs.get('autosave', true) !== false) {
				store.set(KEY_DOC, norm || xml);
				persistHistory();
				m_dirty = false;
				m_saved = new Date();
			}
			this._emit();
			return ok;
		},
		/**
		 * look for values written by an earlier version that are not valid (the text "null", "undefined", "NaN"):
		 * they end up in canvas/css properties and the browser reports 'Error in parsing value for ...'.
		 * @returns {Array<{key:string, where:string, value:string}>}
		 */
		diagnose() {
			const found = [];
			const ATTR = /<(\w+)[^>]*?\s([\w:-]+)="(null|undefined|NaN)"/g;
			const scan = (key, text, label) => {
				let m;
				ATTR.lastIndex = 0;
				while ((m = ATTR.exec(text || ''))) { found.push({ key, where: label + ' <' + m[1] + ' ' + m[2] + '>', value: m[3] }); }
			};
			scan(KEY_DOC, store.get(KEY_DOC), 'document');
			try {
				const h = JSON.parse(store.get(KEY_HIST) || 'null');
				(h && h.list || []).forEach((x, i) => scan(KEY_HIST, x, 'history[' + i + ']'));
			} catch (e) { }
			Object.keys(data.options).forEach((k) => {
				const v = data.options[k];
				if (v === null || v === 'null' || v === 'undefined') { found.push({ key: KEY_SET, where: 'option ' + k, value: String(v) }); }
			});
			return found;
		},
		/** remove the invalid values found by diagnose() from the stored document, history and options */
		cleanStored() {
			const BAD = /\s[\w:-]+="(null|undefined|NaN)"/g;
			const doc = store.get(KEY_DOC);
			if (doc) { store.set(KEY_DOC, doc.replace(BAD, '')); }
			try {
				const h = JSON.parse(store.get(KEY_HIST) || 'null');
				if (h && Array.isArray(h.list)) { h.list = h.list.map((x) => String(x).replace(BAD, '')); store.set(KEY_HIST, JSON.stringify(h)); }
			} catch (e) { }
			Object.keys(data.options).forEach((k) => {
				const v = data.options[k];
				if (v === null || v === 'null' || v === 'undefined') { delete data.options[k]; }
			});
			persistLocal();
		},
		/** restore the stored document and its history */
		restore(editor) {
			const bad = this.diagnose();
			if (bad.length > 0) {
				console.warn('[cancasEditor] invalid values found in localStorage (the source of CSS parse errors such as "Error in parsing value for \'null\'"); they are removed:', bad);
				this.cleanStored();
			}
			const xml = store.get(KEY_DOC);
			if (!xml) { return false; }
			if (!this._apply(editor, xml)) {
				// keep the stored text: the next autosave would overwrite it with the partially loaded scene
				store.set(KEY_DOC + '.failed', xml);
				return false;
			}
			if (!applyViews(editor)) { editor.resetFitAreaZoom(); }
			editor.refresh();
			try {
				const h = JSON.parse(store.get(KEY_HIST) || 'null');
				// the stored stack is only valid when it ends on the stored document
				if (h && Array.isArray(h.list) && h.list[h.index] === xml) { m_hist = h; }
			} catch (e) { }
			if (m_hist.list[m_hist.index] !== xml) { m_hist = { list: [xml], index: 0 }; }
			const norm = snapshot(editor);
			if (norm) { m_hist.list[m_hist.index] = norm; }
			trimHistory();
			m_dirty = false;
			this._emit();
			return true;
		},
		clear(editor) {
			store.remove(KEY_DOC);
			store.remove(KEY_HIST);
			store.remove(KEY_VIEWS);
			store.remove(KEY_SET);
			store.remove('cancas.lang');
			data = { options: {}, plugins: [] };
			pending = {};
			m_hist = { list: [], index: -1 };
			m_dirty = false;
			m_saved = null;
			this._emit();
			editor && _NS.gui.notify.Show(editor, R()['msg.stored.cleared']);
		}
	};
	function scheduleCheck(editor) {
		if (m_restoring || editor['@loading']) { return; }
		if (!m_dirty) { m_dirty = true; storage._emit(); }
		clearTimeout(m_timer);
		m_timer = setTimeout(() => storage.checkpoint(editor, true), CHECK_DELAY);
	}
	_NS.whenEditor((editor) => {
		storage.restore(editor);
		_NS.boot && _NS.boot.done('document');
		// baseline of the history (the visitors are loaded after the tools)
		setTimeout(() => { if (m_hist.index < 0) { storage.checkpoint(editor, true); } }, 0);
		['elementAdded', 'elementRemoved', 'itemEndEdition', 'currentDocumentChanged', 'titleChanged'].forEach((n) => {
			editor.regEvent(n, () => scheduleCheck(editor));
		});
		// any redraw can follow a change made without event (property inspector, handles...)
		const refresh = editor.refresh;
		editor.refresh = function () {
			const r = refresh.apply(this, arguments);
			scheduleCheck(editor);
			return r;
		};
		// the view of the documents is stored apart from the document (debounced)
		let viewTimer = null;
		const scheduleViews = () => { clearTimeout(viewTimer); viewTimer = setTimeout(() => saveViews(editor), 400); };
		['zoomChanged', 'currentDocumentChanged'].forEach((n) => editor.regEvent(n, scheduleViews));
		window.addEventListener('pagehide', () => saveViews(editor));
		// the user options: lang is applied once the server answered
		const loaded = prefs.loadServer();
		loaded.finally(() => _NS.boot && _NS.boot.done('settings'));
		loaded.then((ok) => {
			const lg = prefs.get('lang');
			if (ok && lg && _NS.lang && _NS.lang.current && lg != _NS.lang.current) {
				_NS.lang.set(lg, editor);
			}
		});
		prefs.onChange((what, name) => { if (name == 'undoLimit') { trimHistory(); } });
		window.addEventListener('pagehide', () => { storage.checkpoint(editor, true); });
	});
	// ------------------------------------------------------------------ menus
	AC.regMenuAction("file.saveAs", {
		index: -85,
		callback: function (a) { a.saveToXML(); }
	});
	AC.regMenuAction("settings.clearStored", {
		index: 200,
		callback: function (a) { storage.clear(a); }
	});
	AC.regMenuAction("settings.plugins", {
		callback: function (a) { showPlugins(a); }
	});
	storage.showPlugins = showPlugins;
	function showPlugins(editor) {
		const T = R();
		const root = document.createElement('div');
		const list = document.createElement('div');
		const note = document.createElement('p');
		note.style.cssText = 'font-size:12px;opacity:.8';
		const name = Object.assign(document.createElement('input'), { type: 'text', placeholder: T['plugins.name'] });
		const url = Object.assign(document.createElement('input'), { type: 'url', placeholder: T['plugins.url'] });
		url.style.flex = '1';
		const add = Object.assign(document.createElement('button'), { textContent: T['plugins.add'] });
		const form = document.createElement('div');
		form.style.cssText = 'display:flex;gap:6px;margin-top:10px';
		form.append(name, url, add);
		const draw = () => {
			list.textContent = '';
			note.textContent = prefs.signedIn ? '' : T['plugins.localonly'];
			if (prefs.plugins.length == 0) {
				list.textContent = T['plugins.empty'];
			}
			prefs.plugins.forEach((p) => {
				const row = document.createElement('div');
				row.style.cssText = 'display:flex;gap:8px;align-items:center;padding:4px 0';
				const cb = Object.assign(document.createElement('input'), { type: 'checkbox', checked: !!p.enabled, title: T['plugins.enabled'] });
				cb.onchange = () => prefs.setPluginEnabled(p, cb.checked);
				const lb = document.createElement('span');
				lb.style.flex = '1';
				lb.textContent = p.name + ' - ' + p.url;
				const del = Object.assign(document.createElement('button'), { textContent: T['plugins.delete'] });
				del.onclick = () => prefs.removePlugin(p);
				row.append(cb, lb, del);
				list.append(row);
			});
		};
		add.onclick = async () => {
			if (!name.value.trim() || !/^https?:\/\//i.test(url.value.trim())) {
				_NS.gui.notify.Show(editor, T['plugins.invalid']);
				return;
			}
			try {
				await prefs.addPlugin({ name: name.value.trim(), url: url.value.trim(), enabled: true });
				name.value = url.value = '';
			} catch (e) {
				_NS.gui.notify.Show(editor, e.message);
			}
		};
		const onChange = (what) => { if (what == 'plugins' || what == 'server' || what == 'auth') { draw(); } };
		prefs.onChange(onChange);
		root.append(list, form, note);
		draw();
		_NS.ui.modal({ title: T['plugins.title'], content: root, onclose: () => { const i = listeners.indexOf(onChange); i >= 0 && listeners.splice(i, 1); } });
	}
})();
