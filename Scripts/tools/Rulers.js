// author: C.A.D. BONDJE DOUE
// file: Rulers.js
// @desc: horizontal and vertical rulers of the editor surface, attached to the current document: the zero is the
// top-left corner of the document, the units are the ones of the document and follow the zoom and the pan. The
// extent of the document is highlighted on both rulers. Shown or hidden from View > Rulers or the general settings
// (preference `rulers`); nothing is drawn when there is no current document.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const SIZE = 20; // px
	const STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
	const visible = () => !!(_NS.prefs && _NS.prefs.get('rulers', false) === true);
	/** the top of the surface that is not hidden by the menu bar (the canvas runs under it) */
	function menuBottom() {
		const mn = document.querySelector('ul.menu');
		return mn ? mn.getBoundingClientRect().bottom : 0;
	}
	const css = (n, d) => (getComputedStyle(document.documentElement).getPropertyValue(n) || '').trim() || d;
	function draw(ctx, W, H, dx, dy, z, doc) {
		if (!visible() || !doc || !(z > 0)) { return; }
		const top = menuBottom();
		const bg = css('--ci-pop', '#2e2e2e'), fg = css('--ci-fg', '#ddd'), dim = css('--ci-dim', '#9a9a9a'),
			line = css('--ci-line', '#4a4a4a'), accent = css('--ci-accent', '#a14fd0');
		// a step with at least 60px between two labels
		const step = STEPS.find((s) => s * z >= 60) || STEPS[STEPS.length - 1];
		const minor = step / 5 * z >= 6 ? step / 5 : (step / 2 * z >= 6 ? step / 2 : step);
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.font = '10px sans-serif';
		ctx.textBaseline = 'top';
		ctx.fillStyle = bg;
		ctx.fillRect(0, top, W, SIZE);
		ctx.fillRect(0, top, SIZE, H - top);
		// extent of the document
		ctx.globalAlpha = .35;
		ctx.fillStyle = accent;
		ctx.fillRect(Math.max(SIZE, dx), top, doc.width * z, SIZE);
		ctx.fillRect(0, Math.max(top + SIZE, dy), SIZE, doc.height * z);
		ctx.globalAlpha = 1;
		ctx.strokeStyle = line;
		ctx.fillStyle = fg;
		ctx.lineWidth = 1;
		const ticks = (horizontal) => {
			const o = horizontal ? dx : dy, max = horizontal ? W : H, min = horizontal ? SIZE : top + SIZE;
			const first = Math.ceil((min - o) / z / minor) * minor, last = (max - o) / z;
			ctx.beginPath();
			for (let u = first; u <= last; u += minor) {
				const p = Math.round(o + u * z) + .5;
				const major = Math.abs(u / step - Math.round(u / step)) < 1e-6;
				const len = major ? SIZE : SIZE / 3;
				if (horizontal) { ctx.moveTo(p, top + SIZE - len); ctx.lineTo(p, top + SIZE); } else { ctx.moveTo(SIZE - len, p); ctx.lineTo(SIZE, p); }
			}
			ctx.stroke();
			for (let u = Math.ceil(first / step) * step; u <= last; u += step) {
				const p = Math.round(o + u * z);
				const label = String(Math.round(u * 100) / 100);
				if (horizontal) { ctx.fillText(label, p + 3, top + 2); } else {
					ctx.save();
					ctx.translate(2, p - 3);
					ctx.rotate(-Math.PI / 2);
					ctx.fillText(label, 0, 0);
					ctx.restore();
				}
			}
		};
		ticks(true);
		ticks(false);
		// corner and borders
		ctx.fillStyle = bg;
		ctx.fillRect(0, top, SIZE, SIZE);
		ctx.strokeStyle = line;
		ctx.strokeRect(.5, top + .5, W, SIZE);
		ctx.strokeRect(.5, top + .5, SIZE, H);
		ctx.fillStyle = dim;
		ctx.restore();
	}
	function toggle(editor) {
		_NS.prefs.set('rulers', !visible());
		editor.resizeCanvas(false);
		editor.refresh();
	}
	_NS.rulers = { draw, visible, SIZE };
	AC.regMenuAction('view.rulers', { index: 15, callback: (a) => toggle(a) });
	_NS.whenEditor((editor) => {
		_NS.prefs && _NS.prefs.onChange((what, name) => { if (what == 'server' || name == 'rulers') { editor.refresh(); } });
	});
})();
