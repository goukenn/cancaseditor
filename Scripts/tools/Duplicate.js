// author: C.A.D. BONDJE DOUE
// file: Duplicate.js
// @desc: duplicate elements. Used by the selection tool (Ctrl + drag) and the edit.duplicate action (Ctrl + D).
// A copy is made through the xml visitor/decoder (the same path as save/load), is inserted just above its source in the
// same container, and gets the id "<type>#<N>" where N is the number of elements of that type in the scene.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const Key = AC.Key;
	const DC = () => _NS.DrawingElements.drawing2DContainer;
	const kind = (e) => (e.getType ? e.getType() : '');
	/** every element of the scene (recursively), the list given first */
	function walk(list, cb) {
		for (let i = 0; i < list.length; i++) {
			cb(list[i]);
			if (igk.system.isInherit(list[i], DC())) { walk(list[i].Elements, cb); }
		}
	}
	/** give the "<type>#<N>" id to the element and to the elements it contains */
	function renameTree(editor, root) {
		const fix = (e) => {
			const t = kind(e);
			let n = 0, used = {};
			walk(editor.list, (x) => { if (x !== e && kind(x) == t) { n++; } used[x.id] = 1; });
			n++;
			while ((t + '#' + n) in used) { n++; }
			e.id = t + '#' + n;
		};
		fix(root);
		if (igk.system.isInherit(root, DC())) { walk(root.Elements, fix); }
	}
	/**
	 * copy one element
	 * @returns the copy (already in the scene, above its source) or null
	 */
	function cloneElement(editor, src) {
		const c = src['@container'];
		const t = kind(src);
		if (!c || t == 'layer' || t == 'document') { return null; }
		const xml = _NS.visitors.xml([src]);
		const q = igk.createNode('dummy');
		q.setHtml(igk.html.closeEmptyTag(xml));
		const gkds = q.select('gkds').first();
		if (!gkds) { return null; }
		const before = editor.layer;
		const loading = editor['@loading'];
		const known = new Set();
		walk(editor.list, (x) => known.add(x));
		try {
			// the decoder adds the first element to the current layer: point it to the source container
			if (kind(c) == 'layer') { editor.layer = c; }
			editor['@loading'] = 1;
			_NS.encoder.xml.loadItems({ initialize: function () { } }, gkds, editor);
		} finally {
			if (loading === undefined) { delete editor['@loading']; } else { editor['@loading'] = loading; }
			editor.layer = before;
		}
		// the new elements: the one whose container is not new itself is the copy
		let made = null;
		walk(editor.list, (x) => { if (!made && !known.has(x) && known.has(x['@container'])) { made = x; } });
		if (!made) { return null; }
		const mc = made['@container'];
		if (mc !== c) { mc && mc.remove(made); c.add(made); }
		c.setChildIndex(made, c.getChildIndex(src) + 1);
		renameTree(editor, made);
		return made;
	}
	/** copy the elements, returns the copies */
	function duplicate(editor, items) {
		const copies = [];
		items.slice().sort((a, b) => a['@container'] === b['@container'] ? a['@container'].getChildIndex(a) - b['@container'].getChildIndex(b) : 0).forEach((i) => {
			const n = cloneElement(editor, i);
			if (n) { copies.push(n); }
		});
		return copies;
	}
	/** the selected elements of the selection tool */
	function selection(editor) {
		const el = editor.tool && editor.tool.elem;
		if (!el) { return []; }
		return el.type === 2 && el.items ? Array.prototype.slice.call(el.items) : [el];
	}
	AC.regActions(Key.Ctrl | Key.D, 'editor.duplicate', (a, e) => {
		if (e && e.target && e.target.tagName && (e.target.tagName.toLowerCase() == 'input')) { e.handle = 0; return; }
		const copies = duplicate(a, selection(a));
		if (copies.length && a.tool && a.tool.selectItems) { a.tool.selectItems(copies); } else { a.refresh(); }
	});
	AC.regMenuAction('edit.duplicate', {
		index: 610, callback: (a) => {
			const copies = duplicate(a, selection(a));
			if (copies.length && a.tool && a.tool.selectItems) { a.tool.selectItems(copies); } else { a.refresh(); }
		}
	});
	_NS.duplicateElements = duplicate;
})();
