// author: C.A.D. BONDJE DOUE
// file: GroupActions.js
// @desc: group / ungroup the selected elements. A group (DrawingElements.group, see drawing2d/layer.js) is a layer
// placed inside a layer: it keeps the z-order position of its members and behaves as one element (opacity, filter,
// clip, blending mode, move, order). Ungrouping puts the members back at its position.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const Key = AC.Key;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;
	/** the selected elements of the selection tool (a single element or a multi selection) */
	function selection(editor) {
		const t = editor.tool;
		const el = t && t.elem;
		if (!el) { return []; }
		return el.type === 2 && el.items ? Array.prototype.slice.call(el.items) : [el];
	}
	const kind = (e) => (e.getType ? e.getType() : '');
	const groupable = (e) => kind(e) != 'layer' && kind(e) != 'document' && !!e['@container'];
	/** m2 applied after m1 (matrices as [a b c d e f]) */
	const mul = (m2, m1) => [
		m2[0] * m1[0] + m2[2] * m1[1], m2[1] * m1[0] + m2[3] * m1[1],
		m2[0] * m1[2] + m2[2] * m1[3], m2[1] * m1[2] + m2[3] * m1[3],
		m2[0] * m1[4] + m2[2] * m1[5] + m2[4], m2[1] * m1[4] + m2[3] * m1[5] + m2[5]];
	function group(editor) {
		const items = selection(editor).filter(groupable);
		if (items.length < 2) { _NS.gui.notify.Show(editor, T('msg.group.min')); return false; }
		const c = items[0]['@container'];
		if (!items.every((i) => i['@container'] === c)) { _NS.gui.notify.Show(editor, T('msg.group.same')); return false; }
		items.sort((a, b) => c.getChildIndex(a) - c.getChildIndex(b));
		const top = c.getChildIndex(items[items.length - 1]);
		const g = editor.createElement('group');
		c.add(g);
		items.forEach((i) => c.remove(i));
		items.forEach((i) => g.add(i));
		// the group takes the place of its top most member
		c.setChildIndex(g, Math.max(0, top - items.length + 1));
		editor.Edit(null, editor.tool);
		if (editor.tool && editor.tool.selectElement) { editor.tool.selectElement(g); } else { editor.refresh(); }
		return true;
	}
	function ungroup(editor) {
		const groups = selection(editor).filter((e) => kind(e) == 'group');
		if (groups.length == 0) { _NS.gui.notify.Show(editor, T('msg.group.none')); return false; }
		const freed = [];
		groups.forEach((g) => {
			const c = g['@container'];
			const at = c.getChildIndex(g);
			const kids = Array.prototype.slice.call(g.Elements);
			const gm = g.matrix && !g.matrix.isIdentity() ? g.matrix.element.slice(0, 6) : null;
			c.remove(g);
			kids.forEach((k, n) => {
				g.remove(k);
				k['@container'] = null;
				c.add(k);
				if (gm) { k.matrix.copytransform(mul(gm, k.matrix.element.slice(0, 6))); k.initialize && k.initialize(); }
				c.setChildIndex(k, at + n);
				freed.push(k);
			});
		});
		editor.Edit(null, editor.tool);
		editor.refresh();
		return true;
	}
	AC.regActions(Key.Ctrl | Key.G, 'editor.group', (a) => { group(a); });
	AC.regActions(Key.Ctrl | Key.Shift | Key.G, 'editor.ungroup', (a) => { ungroup(a); });
	AC.regMenuAction('edit.group', { index: 620, callback: (a) => group(a) });
	AC.regMenuAction('edit.ungroup', { index: 621, callback: (a) => ungroup(a) });
	_NS.groups = { group, ungroup };
})();
