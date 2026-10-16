// author: C.A.D. BONDJE DOUE
// file: ColumnGrid.js
// @desc: vertical column guides of a document: the page is split in N equal columns (N from 1 to 12, like the
// Balafon igk-col-12-N grid) separated by a gap (default 10px, shown as a shaded gutter). Screen only (never exported).
// While the guides are shown they are magnetic: moving or resizing an element snaps its edges to the column edges.
// Toggled from View > Column grid, the document settings or the property inspector (document.showColumns).
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	// the color (any css color, the opacity is its alpha) as r, g, b, a
	function rgba(css) {
		const ctx = document.createElement('canvas').getContext('2d');
		ctx.fillStyle = '#000000';
		ctx.fillStyle = css;
		const v = ctx.fillStyle;
		if (/^#[0-9a-f]{6}$/i.test(v)) { return { r: parseInt(v.substr(1, 2), 16), g: parseInt(v.substr(3, 2), 16), b: parseInt(v.substr(5, 2), 16), a: 1 }; }
		const m = /rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)(?:\D+([\d.]+))?/.exec(v);
		return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : { r: 0, g: 0, b: 0, a: 0 };
	}
	const MIN_GAP = 4; // px: closer separators are not drawn
	/** the columns of a document: [{x0, x1}] in document units (N columns of equal width separated by `columnGap`) */
	function columns(d) {
		const n = d.columns, gap = Math.min(d.columnGap, d.width / Math.max(n, 1) / 2);
		const w = (d.width - (n - 1) * gap) / n;
		const list = [];
		for (let i = 0; i < n; i++) { list.push({ x0: i * (w + gap), x1: i * (w + gap) + w }); }
		return list;
	}
	/** the x positions (document units) the elements snap to while the guides are shown, null otherwise */
	function snapLines(d) {
		if (!d || !d.showColumns || !(d.columns > 1)) { return null; }
		const l = [];
		columns(d).forEach((c) => l.push(c.x0, c.x1));
		return l;
	}
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Array<{doc:*, x:number, y:number, w:number, h:number}>} areas the pages, in canvas pixels
	 */
	function draw(ctx, areas) {
		if (!areas) { return; }
		areas.forEach((a) => {
			const d = a.doc, c = rgba(d.columnColor), o = c.a, accent = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
			if (!(o > 0)) { return; }
			if (!d.showColumns || !(d.columns > 1) || !(a.w / d.columns >= MIN_GAP)) { return; }
			const k = a.w / d.width; // pixels per document unit
			const cols = columns(d);
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			// gutters: shaded bands between two columns
			ctx.fillStyle = accent;
			ctx.globalAlpha = o; // the gutters use the opacity of the grid
			for (let i = 0; i < cols.length - 1; i++) {
				const x = a.x + cols[i].x1 * k, w = (cols[i + 1].x0 - cols[i].x1) * k;
				if (w > 0) { ctx.fillRect(x, a.y, w, a.h); }
			}
			// the edges of every column (both sides of a gutter)
			ctx.strokeStyle = accent;
			ctx.lineWidth = 1;
			ctx.setLineDash([4, 3]);
			ctx.beginPath();
			for (let i = 0; i < cols.length; i++) {
				[cols[i].x0, cols[i].x1].forEach((u, j) => {
					if ((i == 0 && j == 0) || (i == cols.length - 1 && j == 1)) { return; } // the page border
					const x = Math.round(a.x + u * k) + .5;
					ctx.moveTo(x, a.y);
					ctx.lineTo(x, a.y + a.h);
				});
			}
			ctx.globalAlpha = Math.min(1, o * 3); // the edges are a little stronger than the gutters
			ctx.stroke();
			ctx.restore();
		});
	}
	function toggle(editor) {
		const d = editor.document;
		if (!d) {
			_NS.gui.notify.Show(editor, (_NS.R && _NS.R['doc.nodoc']) || 'doc.nodoc');
			return;
		}
		d.showColumns = !d.showColumns;
		editor.refresh();
		editor.raiseEvent('currentDocumentChanged', { old: d, current: d }); // the inspector shows the new state
	}
	_NS.columnGrid = { draw, columns, snapLines };
	AC.regMenuAction('view.columns', { index: 16, checked: (a) => !!(a.document && a.document.showColumns && a.document.showColumns !== 'false'), callback: (a) => toggle(a) });
})();
