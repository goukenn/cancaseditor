// author: C.A.D. BONDJE DOUE
// file: ShortcutSettings.js
// @desc: custom shortcut keys. The page of the settings dialog ("Shortcuts"), the storage of the custom keys
// in the user options (option "shortcuts": {actionName: keyCode|null}, only the changed actions) and their
// application at startup / when the options come from the server.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const R = () => _NS.R || {};
	const T = (k) => R()[k] || k;
	const OPTION = 'shortcuts';
	// configurable actions: [action name, translation key of its label]
	const GROUPS = [
		{ title: 'shortcuts.group.tools', items: ['selection', 'line', 'rectangle', 'roundrect', 'circle', 'polygon', 'bezier', 'plume', 'arc', 'spline', 'star', 'text', 'linearbrush', 'radialbrush']
			.map((n) => ['editor.selectool.' + n, 'editor.selectool.' + n]) },
		{ title: 'shortcuts.group.edit', items: [['editor.undo', 'edit.undo'], ['editor.redo', 'edit.redo'], ['editor.delete', 'edit.delete'],
			['editor.copy', 'edit.copy'], ['editor.paste', 'edit.paste'], ['editor.selectall', 'edit.selectall']] }
	];
	const names = () => GROUPS.reduce((l, g) => l.concat(g.items.map((i) => i[0])), []);
	const labelOf = (name) => { const g = GROUPS.map((x) => x.items.find((i) => i[0] == name)).find(Boolean); return T(g ? g[1] : name); };
	/** the key an action is shown with: the first one (the backspace on macOS for delete, as in the menu) */
	function primary(name) {
		const codes = AC.shortcutCodes(name);
		if (codes.length == 0) { return null; }
		return (/Mac|iPhone|iPad/i.test(navigator.platform || '') && codes.indexOf(AC.Key.Backspace) != -1) ? AC.Key.Backspace : codes[0];
	}
	function defaultPrimary(name) {
		const d = (AC.shortcutDefaults()[name] || []);
		if (d.length == 0) { return null; }
		return (/Mac|iPhone|iPad/i.test(navigator.platform || '') && d.indexOf(AC.Key.Backspace) != -1) ? AC.Key.Backspace : d[0];
	}
	/** the stored custom keys */
	function stored() {
		let v = _NS.prefs && _NS.prefs.get(OPTION, null);
		if (typeof v == 'string') { try { v = JSON.parse(v); } catch (e) { v = null; } }
		return (v && typeof v == 'object') ? v : {};
	}
	function apply() {
		AC.applyShortcuts(stored());
	}
	// ------------------------------------------------------------------ dialog page
	/** state edited by the page: {codes: {action: code|null}} */
	function createDraft() {
		AC.shortcutDefaults(); // the defaults are taken before any change
		const codes = {};
		names().forEach((n) => { codes[n] = primary(n); });
		return { codes, initial: Object.assign({}, codes) };
	}
	function buildPage(editor, draft) {
		const root = document.createElement('div');
		const note = document.createElement('p');
		note.className = 'ce-sc-note';
		note.textContent = T('shortcuts.hint');
		const info = document.createElement('p');
		info.className = 'ce-sc-info';
		const fields = {}; // action => button
		const show = (n) => { fields[n].textContent = draft.codes[n] ? AC.formatShortcut(draft.codes[n]) : T('shortcuts.none'); fields[n].style.opacity = draft.codes[n] ? 1 : .55; };
		function assign(name, code) {
			info.textContent = '';
			if (code) {
				// a key belongs to one action: it is taken from the other one
				names().forEach((o) => {
					if (o != name && draft.codes[o] === code) {
						draft.codes[o] = null;
						show(o);
						info.textContent = T('shortcuts.moved').replace('%s', labelOf(o));
					}
				});
			}
			draft.codes[name] = code;
			show(name);
		}
		const MODIFIERS = [16, 17, 18, 91, 93, 224];
		function row(name) {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'ce-sc-key';
			fields[name] = btn;
			let before = null;
			const stop = () => { btn.onkeydown = null; };
			btn.onclick = () => {
				before = draft.codes[name];
				btn.textContent = T('shortcuts.press');
				btn.focus();
				btn.onkeydown = (e) => {
					if (MODIFIERS.indexOf(e.keyCode) != -1) { return; } // wait for the key
					e.preventDefault();
					e.stopPropagation();
					if (e.key == 'Escape') { stop(); show(name); return; }
					if (e.key == 'Tab') { return; }
					stop();
					assign(name, AC.getKeyFromEvent(e));
				};
				btn.onblur = () => { stop(); show(name); };
			};
			const reset = document.createElement('button');
			reset.type = 'button';
			reset.textContent = '↺';
			reset.title = T('shortcuts.reset');
			reset.className = 'ce-sc-mini';
			reset.onclick = () => assign(name, defaultPrimary(name));
			const clear = document.createElement('button');
			clear.type = 'button';
			clear.textContent = '×';
			clear.title = T('shortcuts.clear');
			clear.className = 'ce-sc-mini';
			clear.onclick = () => assign(name, null);
			show(name);
			const r = document.createElement('div');
			r.className = 'ce-row ce-sc-row';
			const l = document.createElement('label');
			l.textContent = labelOf(name);
			l.className = 'ce-sc-lbl';
			r.append(l, btn, reset, clear);
			return r;
		}
		root.append(note, info);
		GROUPS.forEach((g) => {
			const h = document.createElement('div');
			h.textContent = T(g.title);
			h.className = 'ce-sc-head';
			root.append(h);
			g.items.forEach((i) => root.append(row(i[0])));
		});
		const all = document.createElement('button');
		all.type = 'button';
		all.textContent = T('shortcuts.resetall');
		all.className = 'ce-sc-all';
		all.onclick = () => { info.textContent = ''; names().forEach((n) => { draft.codes[n] = defaultPrimary(n); show(n); }); };
		root.append(all);
		return root;
	}
	/** store the custom keys (only those that differ from the defaults) and apply them */
	function save(draft) {
		if (!draft) { return; }
		const map = stored();
		names().forEach((n) => {
			if (draft.codes[n] === draft.initial[n]) { return; } // untouched
			if (draft.codes[n] === defaultPrimary(n)) { delete map[n]; } else { map[n] = draft.codes[n]; }
		});
		// the action that lost its key to another one is stored as having no key
		names().forEach((n) => { if (draft.codes[n] === null && defaultPrimary(n) !== null) { map[n] = null; } });
		_NS.prefs.set(OPTION, JSON.stringify(map));
		apply();
	}
	// the custom keys are applied once the editor exists and again when the server options arrive
	_NS.whenEditor(() => setTimeout(() => {
		apply();
		_NS.prefs && _NS.prefs.onChange((what, name) => { if (what == 'server' || name == OPTION) { apply(); } });
	}, 0));
	_NS.shortcutSettings = { createDraft, buildPage, save, apply };
})();
