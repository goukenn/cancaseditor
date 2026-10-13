// author: C.A.D. BONDJE DOUE
// file: DocumentLabelDrag.js
// @desc: drag the id label of a document (drawn above its top-left corner when the scene has several
// documents) to change the location of the document on the surface. A click without move selects the document.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const MOVE_THRESHOLD = 3; // px before a press becomes a drag
	function init(editor) {
		const c = editor.canvas && editor.canvas.o;
		if (!c) { return; }
		let drag = null;
		let cursorSet = false;
		const local = (e) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
		const hit = (p) => (editor.documentLabels || []).find((l) => p.x >= l.x && p.x <= l.x + l.w && p.y >= l.y && p.y <= l.y + l.h);
		// capture phase: a press on a label must not reach the current tool
		c.addEventListener('pointerdown', (e) => {
			if (e.button !== 0) { return; }
			const l = hit(local(e));
			if (!l) {
				// a press inside another document: it becomes the current one (tools work on the current document)
				const p = local(e);
				const areas = editor.documentAreas || [];
				const inside = (a) => p.x >= a.x && p.x <= a.x + a.w && p.y >= a.y && p.y <= a.y + a.h;
				const cur = areas.find((a) => a.doc === editor.document);
				if (areas.length > 1 && !(cur && inside(cur))) {
					const t = areas.find(inside);
					if (t) { editor.activateDocument(t.doc); }
				}
				return;
			}
			drag = { doc: l.doc, sx: e.clientX, sy: e.clientY, ox: l.doc.x, oy: l.doc.y, view: editor.getView(), moved: false };
			try { c.setPointerCapture(e.pointerId); } catch (x) { }
			e.preventDefault(); // also cancels the compatibility mouse events
			e.stopImmediatePropagation();
		}, true);
		c.addEventListener('pointermove', (e) => {
			if (drag) {
				const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
				if (!drag.moved && Math.abs(dx) < MOVE_THRESHOLD && Math.abs(dy) < MOVE_THRESHOLD) { return; }
				drag.moved = true;
				// screen pixels => scene units (the view of the current document is the reference)
				// the distance between the press point and the cursor on the surface (screen pixels) gives the
				// move in scene units; computed from the start state so that nothing accumulates
				const v = drag.view;
				drag.doc.x = drag.ox + dx / v.zoom;
				drag.doc.y = drag.oy + dy / v.zoom;
				if (drag.doc === editor.document) {
					// the view is relative to the current document: pan with it, or it would stay still on screen
					// while all the other documents move the opposite way
					editor.setView({ zoom: v.zoom, panx: v.panx + dx, pany: v.pany + dy });
				}
				editor.refresh();
				e.stopImmediatePropagation();
				return;
			}
			const over = !!hit(local(e));
			if (over) { c.style.cursor = 'move'; cursorSet = true; }
			else if (cursorSet) { c.style.cursor = ''; cursorSet = false; }
		}, true);
		const end = (e) => {
			if (!drag) { return; }
			const d = drag;
			drag = null;
			try { c.releasePointerCapture(e.pointerId); } catch (x) { }
			if (d.moved) { editor.documentsArea = editor.getDocumentsArea(); } // review the area holding all the documents
			if (!d.moved && e.type == 'pointerup') { // a click: select the document
				editor.document = d.doc;
				const ly = d.doc.getLayers();
				editor.layer = ly.length > 0 ? ly[ly.length - 1] : null;
			}
			editor.refresh();
			e.stopImmediatePropagation();
		};
		c.addEventListener('pointerup', end, true);
		c.addEventListener('pointercancel', end, true);
	}
	_NS.whenEditor((editor) => setTimeout(() => init(editor), 0));
})();
