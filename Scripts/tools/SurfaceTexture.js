// author: C.A.D. BONDJE DOUE
// file: SurfaceTexture.js
// @desc: texture drawn on the background of the editor surface (behind the documents): graph paper, grid or dots.
// Configured in the general settings (preferences surfaceTexture, surfaceGridSize, surfaceTextureColor); the grid is
// expressed in scene units, so it follows the zoom and the pan, and its origin is the one of the current document.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const TEXTURES = ['none', 'graph', 'grid', 'dots'];
	const MAJOR_EVERY = 5; // graph paper: a heavier line every 5 cells
	const MIN_STEP = 6; // px: a finer grid is not drawn (it would be a flat tint)
	const pref = (k, d) => (_NS.prefs ? _NS.prefs.get(k, d) : d);
	function settings() {
		let t = pref('surfaceTexture', 'none');
		if (TEXTURES.indexOf(t) == -1) { t = 'none'; }
		let size = Math.floor(Number(pref('surfaceGridSize', 20)));
		if (!(size >= 2)) { size = 20; }
		let color = String(pref('surfaceTextureColor', '#7f7f7f'));
		if (!/^#[0-9a-f]{6}$/i.test(color)) { color = '#7f7f7f'; }
		return { texture: t, size: Math.min(size, 1000), color };
	}
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} W canvas width (px)
	 * @param {number} H canvas height (px)
	 * @param {number} dx screen position of the scene origin
	 * @param {number} dy
	 * @param {number} z zoom
	 */
	function draw(ctx, W, H, dx, dy, z) {
		const s = settings();
		if (s.texture == 'none' || !(z > 0)) { return; }
		const step = s.size * z;
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.strokeStyle = ctx.fillStyle = s.color;
		const x0 = ((dx % step) + step) % step, y0 = ((dy % step) + step) % step;
		if (s.texture == 'dots') {
			if (step >= MIN_STEP) {
				ctx.globalAlpha = .45;
				for (let x = x0; x < W; x += step) {
					for (let y = y0; y < H; y += step) { ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2); }
				}
			}
			ctx.restore();
			return;
		}
		const lines = (st, alpha, w) => {
			ctx.globalAlpha = alpha;
			ctx.lineWidth = w;
			ctx.beginPath();
			const ox = ((dx % st) + st) % st, oy = ((dy % st) + st) % st;
			for (let x = ox; x < W; x += st) { const p = Math.round(x) + .5; ctx.moveTo(p, 0); ctx.lineTo(p, H); }
			for (let y = oy; y < H; y += st) { const p = Math.round(y) + .5; ctx.moveTo(0, p); ctx.lineTo(W, p); }
			ctx.stroke();
		};
		if (s.texture == 'grid') {
			if (step >= MIN_STEP) { lines(step, .3, 1); }
		} else { // graph paper: fine lines + heavier lines every MAJOR_EVERY cells
			if (step >= MIN_STEP) { lines(step, .14, 1); }
			if (step * MAJOR_EVERY >= MIN_STEP) { lines(step * MAJOR_EVERY, .3, 1); }
		}
		ctx.restore();
	}
	_NS.surfaceTexture = { draw, settings, TEXTURES };
	_NS.whenEditor((editor) => {
		_NS.prefs && _NS.prefs.onChange((what, name) => {
			if (what == 'server' || /^surface/.test(name || '')) { editor.refresh(); }
		});
	});
})();
