// author: C.A.D. BONDJE DOUE
// file: SurfacePan.js
// @desc: pan the whole surface (every document) by dragging with the middle mouse button, whatever the active tool.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	function init(editor) {
		const c = editor.canvas && editor.canvas.o;
		if (!c) { return; }
		let pan = null;
		// capture phase: the active tool never sees the middle button
		c.addEventListener('pointerdown', (e) => {
			if (e.button !== 1) { return; }
			pan = { sx: e.clientX, sy: e.clientY, view: editor.getView(), cursor: c.style.cursor };
			c.style.cursor = 'grabbing';
			try { c.setPointerCapture(e.pointerId); } catch (x) { }
			e.preventDefault();
			e.stopImmediatePropagation();
		}, true);
		c.addEventListener('pointermove', (e) => {
			if (!pan) { return; }
			// the distance from the press point gives the pan: nothing accumulates
			editor.setView({ zoom: pan.view.zoom, panx: pan.view.panx + e.clientX - pan.sx, pany: pan.view.pany + e.clientY - pan.sy });
			e.stopImmediatePropagation();
		}, true);
		const end = (e) => {
			if (!pan) { return; }
			c.style.cursor = pan.cursor;
			pan = null;
			try { c.releasePointerCapture(e.pointerId); } catch (x) { }
			e.stopImmediatePropagation();
		};
		c.addEventListener('pointerup', end, true);
		c.addEventListener('pointercancel', end, true);
		// the browser autoscroll starts on the middle mousedown and the compatibility mouse events are not sent
		// after a prevented pointerdown, but older engines still need this
		c.addEventListener('mousedown', (e) => { if (e.button === 1) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
		c.addEventListener('auxclick', (e) => { if (e.button === 1) { e.preventDefault(); } }, true);
	}
	_NS.whenEditor((editor) => setTimeout(() => init(editor), 0));
})();
