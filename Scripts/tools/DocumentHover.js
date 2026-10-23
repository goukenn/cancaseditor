// author: C.A.D. BONDJE DOUE
// file: DocumentHover.js
// @desc: hovering a document that is not the current one (several documents) draws a shadow-box selection
// around it, as a hint that a click will select it (see DocumentLabelDrag.js).
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const COLOR = '#c58bf0';

	function init(editor) {
		const c = editor.canvas && editor.canvas.o;
		if (!c) { return; }
		const set = (doc) => {
			if (editor.hoverDocument === doc) { return; }
			editor.hoverDocument = doc;
			editor.refresh();
		};
		c.addEventListener('pointermove', (e) => {
			if (e.buttons) { set(null); return; } // pressing / dragging: no hint
			const r = c.getBoundingClientRect();
			const x = e.clientX - r.left, y = e.clientY - r.top;
			const areas = editor.documentAreas || [];
			const t = areas.length > 1 && areas.find((a) => a.doc !== editor.document && x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h);
			set(t ? t.doc : null);
		});
		c.addEventListener('pointerleave', () => set(null));
	}
	_NS.documentHover = {
		/** draw the shadow-box of the hovered document (screen space) */
		draw(ctx, editor) {
			const d = editor.hoverDocument;
			const a = d && (editor.documentAreas || []).find((i) => i.doc === d);
			if (!a || d === editor.document) { return; }
			ctx.save();
			ctx.shadowColor = COLOR;
			ctx.shadowBlur = 16;
			ctx.strokeStyle = COLOR;
			ctx.lineWidth = 2;
			ctx.strokeRect(a.x - 1, a.y - 1, a.w + 2, a.h + 2);
			ctx.restore();
		}
	};
	_NS.whenEditor((editor) => setTimeout(() => init(editor), 0));
})();
