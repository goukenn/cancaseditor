// author: C.A.D. BONDJE DOUE
// file: SurfacesDialog.js
// @desc: surfaces (the whole scene: one or several documents) saved on the account of a connected user.
// The name is a path: "/" builds directories. A user has a limited number of surfaces (10 by default, see
// Lib/Classes/Surfaces.php); a surface is private, shared with other users (read only) or public.
// Server: <appUri>/surfaces. Menu: File > Save to my account..., File > Open from my account...
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const R = () => _NS.R || {};
	const T = (k, d) => R()[k] || d || k;
	const KEY_CURRENT = 'cancas.surface';
	const uri = () => igk.system.io.baseUri() + '/surfaces';
	const css = '.sf-tabs{display:flex;gap:4px;margin-bottom:8px;border-bottom:1px solid var(--cm-line,#444)}' +
		'.sf-tabs button{flex:1;background:transparent!important;border-bottom:2px solid transparent!important;border-radius:0!important}' +
		'.sf-tabs button.on{border-bottom-color:var(--cm-accent,#5b4bd6)!important;font-weight:bold}' +
		'.sf-name{display:flex;gap:6px;margin-bottom:8px}.sf-name input{flex:1}' +
		'.sf-quota{opacity:.7;font-size:12px;margin:0 0 8px}.sf-empty{opacity:.6;font-style:italic;padding:8px}' +
		'.sf-row{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;cursor:pointer}.sf-row:hover{background:rgba(127,127,127,.2)}' +
		'.sf-row .sf-label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sf-row .sf-sub{opacity:.6;font-size:11px}' +
		'.sf-row button{padding:2px 6px;font-size:11px}.sf-dir{font-weight:bold;opacity:.85}' +
		'.sf-share{display:flex;gap:6px;padding:2px 6px 6px 24px}.sf-share input{flex:1}';
	const _el = (tag, props, children) => {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	};
	const fmt = (s, ...a) => String(s).replace(/%s/g, () => a.shift());
	const store = {
		get() { try { return JSON.parse(window.localStorage.getItem(KEY_CURRENT) || 'null'); } catch (e) { return null; } },
		set(v) { try { v ? window.localStorage.setItem(KEY_CURRENT, JSON.stringify(v)) : window.localStorage.removeItem(KEY_CURRENT); } catch (e) { } }
	};
	async function call(method, fields, query) {
		const init = { method, credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } };
		if (fields) {
			const fd = new FormData();
			Object.keys(fields).forEach((k) => fd.append(k, fields[k]));
			init.body = fd;
		}
		const r = await fetch(uri() + (query || ''), init);
		const text = await r.text();
		let json = null;
		try { json = JSON.parse(text); } catch (e) { }
		return { ok: r.ok, status: r.status, json, text };
	}
	const api = _NS.surfaces = {
		get current() { return store.get(); },
		list: async () => { const r = await call('GET'); return r.ok ? r.json : null; },
		open: (id) => call('GET', null, '?id=' + encodeURIComponent(id)),
		save: (name, content) => call('POST', { op: 'save', name, content }),
		rename: (id, name) => call('POST', { op: 'rename', id, name }),
		remove: (id) => call('POST', { op: 'delete', id }),
		visibility: (id, value) => call('POST', { op: 'visibility', id, value }),
		share: (id, login, on) => call('POST', { op: on ? 'share' : 'unshare', id, login })
	};
	function errorText(r, quota) {
		const e = r.json && r.json.error;
		if (e == 'quota') { return fmt(T('surf.err.quota'), (r.json && r.json.quota) || quota || ''); }
		if (e == 'invalid name') { return T('surf.err.name'); }
		if (e == 'unknown user') { return T('surf.err.user'); }
		if (e == 'too large') { return T('surf.err.large'); }
		if (r.status == 401) { return T('surf.signin'); }
		return T('surf.err.generic') + (e ? ' (' + e + ')' : '');
	}
	const signedIn = (editor) => {
		if (_NS.prefs && _NS.prefs.signedIn) { return true; }
		_NS.gui.notify.Show(editor, T('surf.signin'));
		return false;
	};
	/** save the scene under a name (overwrites the surface of the same name) */
	async function saveAs(editor, name) {
		if (_NS.storage && _NS.storage.blockedByDuplicates(editor)) { return false; } // ids must be unique first
		const xml = _NS.visitors.xml(editor.list, {});
		const r = await api.save(name, xml);
		if (!r.ok) { _NS.gui.notify.Show(editor, errorText(r)); return false; }
		store.set({ id: r.json.id, name: r.json.name });
		_NS.gui.notify.Show(editor, fmt(T('surf.saved'), r.json.name));
		return true;
	}
	/** replace the scene by the one of a surface */
	async function openSurface(editor, item) {
		const r = await api.open(item.id);
		if (!r.ok || !r.text) { _NS.gui.notify.Show(editor, errorText(r)); return false; }
		if (!_NS.encoder.xml.decodeString(r.text, editor)) { _NS.gui.notify.Show(editor, T('surf.err.generic')); return false; }
		// a surface of another user is read only: saving it creates a copy on this account
		store.set(item.mine ? { id: item.id, name: item.name } : null);
		if (editor.documents.length > 1) { editor.viewAllDocuments(); } else { editor.resetFitAreaZoom(); }
		_NS.Actions.invoke('editor.selectool.selection');
		editor.refresh();
		_NS.gui.notify.Show(editor, fmt(T('surf.loaded'), item.name));
		return true;
	}
	function tree(items) {
		const root = { dirs: {}, items: [] };
		items.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach((it) => {
			const parts = it.name.split('/');
			let n = root;
			parts.slice(0, -1).forEach((p) => { n = n.dirs[p] = n.dirs[p] || { dirs: {}, items: [] }; });
			n.items.push({ it, leaf: parts[parts.length - 1] });
		});
		return root;
	}
	/**
	 * @param {*} editor
	 * @param {'open'|'save'} mode
	 */
	async function showDialog(editor, mode) {
		if (!signedIn(editor)) { return; }
		let data = await api.list();
		if (!data) { _NS.gui.notify.Show(editor, T('surf.signin')); return; }
		if (!document.getElementById('cancas-surf-css')) { document.head.append(_el('style', { id: 'cancas-surf-css', textContent: css })); }
		let tab = 'mine';
		const closed = {}; // folder path => true
		const shareOpen = {}; // surface id => the sharing row is shown
		const body = _el('div');
		const cur = api.current;
		const nameInput = _el('input', { type: 'text', value: (cur && cur.name) || '', placeholder: T('surf.name') });
		nameInput.setAttribute('list', 'sf-dirs'); // read only property
		const dirs = _el('datalist', { id: 'sf-dirs' });
		let dlg = null;
		const refresh = async () => { const d = await api.list(); if (d) { data = d; } draw(); };
		const act = (label, fn, title) => _el('button', { type: 'button', textContent: label, title: title || label, onclick: (e) => { e.stopPropagation(); fn(e); } });
		function rowFor(entry, depth, tabName) {
			const it = entry.it;
			const r = _el('div', { className: 'sf-row' });
			r.style.paddingLeft = (6 + depth * 14) + 'px';
			r.append(_el('span', { className: 'sf-label', textContent: entry.leaf }));
			if (!it.mine) { r.append(_el('span', { className: 'sf-sub', textContent: fmt(T('surf.owner'), it.owner) })); }
			if (it.mine) {
				r.append(act(T(it.visibility == 'public' ? 'surf.public' : 'surf.private'), async () => { await api.visibility(it.id, it.visibility == 'public' ? 'private' : 'public'); refresh(); }, T('surf.visibility')));
				r.append(act(T('surf.share') + (it.shared.length ? ' (' + it.shared.length + ')' : ''), () => { shareOpen[it.id] = !shareOpen[it.id]; draw(); }));
				const del = act(T('surf.delete'), async () => {
					if (!it._confirm) { it._confirm = true; del.textContent = T('surf.confirm'); return; }
					await api.remove(it.id);
					const c = api.current;
					if (c && c.id == it.id) { store.set(null); }
					refresh();
				});
				r.append(del);
			}
			r.onclick = () => {
				if (mode == 'save') { if (it.mine) { nameInput.value = it.name; } return; }
				openSurface(editor, it).then((ok) => ok && dlg.close());
			};
			const frag = [r];
			if (it.mine && shareOpen[it.id]) {
				const login = _el('input', { type: 'text', placeholder: T('surf.login') });
				const add = _el('button', { type: 'button', textContent: T('surf.share'), onclick: async () => {
					const res = await api.share(it.id, login.value.trim(), true);
					if (!res.ok) { _NS.gui.notify.Show(editor, errorText(res)); return; }
					await refresh();
				} });
				const box = _el('div', { className: 'sf-share' }, [login, add]);
				const shared = _el('div', { className: 'sf-sub sf-shared' });
				it.shared.forEach((l) => shared.append(_el('span', { textContent: l + ' ' }), act('✕', async () => { await api.share(it.id, l, false); refresh(); }, T('surf.unshare'))));
				frag.push(box);
				it.shared.length && frag.push(shared);
			}
			return frag;
		}
		function renderNode(n, depth, path, host, tabName) {
			Object.keys(n.dirs).sort().forEach((d) => {
				const p = path + d + '/';
				const row = _el('div', { className: 'sf-row sf-dir', textContent: (closed[tabName + p] ? '▸ ' : '▾ ') + d });
				row.style.paddingLeft = (6 + depth * 14) + 'px';
				row.onclick = () => { closed[tabName + p] = !closed[tabName + p]; draw(); };
				host.append(row);
				if (!closed[tabName + p]) { renderNode(n.dirs[d], depth + 1, p, host, tabName); }
			});
			n.items.forEach((e) => rowFor(e, depth, tabName).forEach((x) => host.append(x)));
		}
		function draw() {
			body.textContent = '';
			dirs.textContent = '';
			const seen = {};
			data.mine.forEach((s) => { const p = s.name.split('/'); for (let i = 1; i < p.length; i++) { seen[p.slice(0, i).join('/') + '/'] = 1; } });
			Object.keys(seen).forEach((d) => dirs.append(_el('option', { value: d })));
			const tabs = _el('div', { className: 'sf-tabs' });
			[['mine', 'surf.mine'], ['shared', 'surf.shared'], ['public', 'surf.publictab']].forEach(([n, k]) => {
				tabs.append(_el('button', { type: 'button', textContent: T(k) + ' (' + data[n].length + ')', className: tab == n ? 'on' : '', onclick: () => { tab = n; draw(); } }));
			});
			if (mode == 'save') {
				const go = _el('button', { type: 'button', className: 'primary', textContent: T('surf.save') });
				go.onclick = async () => {
					const name = nameInput.value.trim();
					if (!name) { return; }
					if (await saveAs(editor, name)) { dlg.close(); }
				};
				body.append(_el('div', { className: 'sf-name' }, [nameInput, dirs, go]));
			}
			body.append(_el('p', { className: 'sf-quota', textContent: fmt(T('surf.quota'), data.used, data.quota) }), tabs);
			const items = data[tab];
			if (items.length == 0) { body.append(_el('div', { className: 'sf-empty', textContent: T('surf.empty') })); }
			else { renderNode(tree(items), 0, '', body, tab); }
		}
		draw();
		dlg = _NS.ui.modal({ title: T(mode == 'save' ? 'file.saveAccount' : 'file.openAccount').replace(/\.\.\.$/, ''), content: body });
	}
	AC.regMenuAction('file.saveAccount', {
		index: -88,
		callback: (a) => {
			if (!signedIn(a)) { return; }
			showDialog(a, 'save');
		}
	});
	AC.regMenuAction('file.openAccount', {
		index: -87,
		callback: (a) => { if (signedIn(a)) { showDialog(a, 'open'); } }
	});
	/** File > Save: a connected user also saves the surface under its name on the account (asks for the name once) */
	_NS.surfaces.saveCurrent = async function (editor) {
		if (!(_NS.prefs && _NS.prefs.signedIn)) { return false; }
		const c = store.get();
		if (!c) { showDialog(editor, 'save'); return true; }
		return saveAs(editor, c.name);
	};
})();
