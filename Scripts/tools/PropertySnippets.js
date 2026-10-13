// author: C.A.D. BONDJE DOUE
// file: PropertySnippets.js
// @desc: on-canvas handles (snippets) to edit the properties of the selected element with the mouse:
//  - brush mode (when the fill is a gradient brush): start/end points of a linear gradient, center and radii of a
//    radial one; a chip switches between the handles of the shape (the tool snippets) and the handles of the brush
//  - shadow markers: one draggable marker per shadow (its offset)
// The handles of the shape itself stay the snippets of the tool (drawing2d/overlayLayers/snippets.js).
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const B = () => _NS.brushes;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;
	const SVG_NS = 'http://www.w3.org/2000/svg';
	const CSS = '.ps-host{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:6;overflow:hidden}' +
		'.ps-host svg{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}' +
		'.ps-h{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;box-sizing:border-box;border:2px solid #fff;border-radius:50%;background:#a14fd0;box-shadow:0 0 0 1px rgba(0,0,0,.65);cursor:move;pointer-events:all;touch-action:none}' +
		'.ps-h.shadow{border-radius:2px;width:11px;height:11px;margin:-5px 0 0 -5px;background:#222;transform:rotate(45deg)}' +
		'.ps-h.dim{width:9px;height:9px;margin:-4px 0 0 -4px;cursor:pointer}' +
		'.ps-dot{position:absolute;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;border:1px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.6);pointer-events:none}' +
		'.ps-chip{position:absolute;top:8px;left:50%;transform:translateX(-50%);display:flex;gap:2px;padding:2px;border-radius:14px;background:rgba(0,0,0,.6);pointer-events:all}' +
		'.ps-chip button{border:0;background:transparent;color:#ddd;padding:3px 12px;border-radius:12px;cursor:pointer;font:12px sans-serif}' +
		'.ps-chip button.on{background:#a14fd0;color:#fff}';
	let mode = 'shape'; // 'shape' | 'brush'
	let lastEl = null;
	function _el(tag, props) { return Object.assign(document.createElement(tag), props || {}); }
	function init(editor) {
		if (!document.getElementById('cancas-snippets-css')) {
			document.head.append(_el('style', { id: 'cancas-snippets-css', textContent: CSS }));
		}
		const surface = editor.canvas.o.parentNode;
		const host = _el('div', { className: 'ps-host' });
		const lines = document.createElementNS(SVG_NS, 'svg');
		host.append(lines);
		surface.append(host);
		let scheduled = 0;
		let dragging = false; // the handles are not rebuilt while one is dragged (it would lose the pointer capture)
		const view = () => editor.matrix.element; // [zoom, 0, 0, zoom, tx, ty]
		const toScreen = (p) => ({ x: p.x * view()[0] + view()[4], y: p.y * view()[3] + view()[5] });
		const mat = (el) => (el.matrix && el.matrix.element) ? el.matrix.element : [1, 0, 0, 1, 0, 0];
		const world = (el, p) => { const m = mat(el); return { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] }; };
		const local = (el, p) => { // inverse of the element matrix
			const m = mat(el), det = m[0] * m[3] - m[1] * m[2];
			if (!det) { return p; }
			const x = p.x - m[4], y = p.y - m[5];
			return { x: (m[3] * x - m[2] * y) / det, y: (-m[1] * x + m[0] * y) / det };
		};
		const boundOf = (el) => {
			let b = el.bound;
			if (Array.isArray(b)) { b = b[0]; }
			return (b && typeof b.x == 'number' && b.width > 0 && b.height > 0) ? b : { x: 0, y: 0, width: 100, height: 100 };
		};
		const clear = () => {
			Array.from(host.children).forEach((c) => { if (c !== lines) { c.remove(); } });
			lines.textContent = '';
		};
		const line = (a, b) => {
			const l = document.createElementNS(SVG_NS, 'line');
			[['x1', a.x], ['y1', a.y], ['x2', b.x], ['y2', b.y]].forEach(([k, v]) => l.setAttribute(k, v));
			l.setAttribute('stroke', '#a14fd0');
			l.setAttribute('stroke-width', '1.5');
			l.setAttribute('stroke-dasharray', '4 3');
			lines.append(l);
		};
		const circle = (c, r) => {
			const e = document.createElementNS(SVG_NS, 'circle');
			e.setAttribute('cx', c.x); e.setAttribute('cy', c.y); e.setAttribute('r', Math.max(r, 0));
			e.setAttribute('fill', 'none'); e.setAttribute('stroke', '#a14fd0'); e.setAttribute('stroke-width', '1.5'); e.setAttribute('stroke-dasharray', '4 3');
			lines.append(e);
		};
		/** a draggable handle at a screen position; onMove receives the document position of the pointer */
		const handle = (p, cls, title, onMove) => {
			const h = _el('div', { className: 'ps-h ' + (cls || ''), title: title || '' });
			h.style.left = p.x + 'px';
			h.style.top = p.y + 'px';
			h.onpointerdown = (e) => {
				e.preventDefault();
				e.stopPropagation();
				dragging = true; // the move/up listeners are on the window: they do not depend on the pointer capture
				const mv = (ev) => {
					ev.stopPropagation(); // the tool under the pointer must not react
					onMove(editor.getDeviceLocation(ev.clientX, ev.clientY), ev);
					const r = surface.getBoundingClientRect();
					h.style.left = (ev.clientX - r.left) + 'px';
					h.style.top = (ev.clientY - r.top) + 'px';
					editor.refresh();
				};
				const up = () => {
					window.removeEventListener('pointermove', mv, true);
					window.removeEventListener('pointerup', up, true);
					window.removeEventListener('pointercancel', up, true);
					dragging = false;
					const el = editor.element;
					el && editor.raiseEvent('selectChanged', { items: [el] }); // the inspector shows the new values
				};
				window.addEventListener('pointermove', mv, true);
				window.addEventListener('pointerup', up, true);
				window.addEventListener('pointercancel', up, true);
			};
			host.append(h);
			return h;
		};
		const frac = (el, b, dp) => { const l = local(el, dp); return { x: (l.x - b.x) / b.width, y: (l.y - b.y) / b.height }; };
		const round3 = (v) => Math.round(v * 1000) / 1000;
		function brushHandles(el) {
			const id = B().idOf(el.fill), def = B().get(id);
			if (!def || def.type == 'texture') { return; }
			const b = boundOf(el);
			const at = (f) => toScreen(world(el, { x: b.x + f.x * b.width, y: b.y + f.y * b.height }));
			if (def.type == 'linear') {
				const a = at(def.p1), z = at(def.p2);
				line(a, z);
				def.stops.forEach((s) => {
					const d = _el('div', { className: 'ps-dot' });
					d.style.left = (a.x + (z.x - a.x) * s.o) + 'px';
					d.style.top = (a.y + (z.y - a.y) * s.o) + 'px';
					d.style.background = s.c;
					host.append(d);
				});
				handle(a, '', 'x1 y1', (dp) => { const f = frac(el, b, dp); B().update(id, { p1: { x: round3(f.x), y: round3(f.y) } }); });
				handle(z, '', 'x2 y2', (dp) => { const f = frac(el, b, dp); B().update(id, { p2: { x: round3(f.x), y: round3(f.y) } }); });
			} else {
				const R = Math.max(b.width, b.height);
				const c = at(def.center);
				const outer = toScreen(world(el, { x: b.x + def.center.x * b.width + def.r1 * R, y: b.y + def.center.y * b.height }));
				const inner = toScreen(world(el, { x: b.x + def.center.x * b.width + def.r0 * R, y: b.y + def.center.y * b.height }));
				circle(c, Math.hypot(outer.x - c.x, outer.y - c.y));
				if (def.r0 > 0) { circle(c, Math.hypot(inner.x - c.x, inner.y - c.y)); }
				line(c, outer);
				handle(c, '', 'x y', (dp) => { const f = frac(el, b, dp); B().update(id, { center: { x: round3(f.x), y: round3(f.y) } }); });
				handle(outer, '', 'r1', (dp) => {
					const l = local(el, dp), cx = b.x + def.center.x * b.width, cy = b.y + def.center.y * b.height;
					B().update(id, { r1: round3(Math.hypot(l.x - cx, l.y - cy) / R) });
				});
				handle(inner, 'dim', 'r0', (dp) => {
					const l = local(el, dp), cx = b.x + def.center.x * b.width, cy = b.y + def.center.y * b.height;
					B().update(id, { r0: round3(Math.hypot(l.x - cx, l.y - cy) / R) });
				});
			}
		}
		function shadowMarkers(el) {
			if (!el.activeShadows) { return; }
			const b = boundOf(el);
			const w = world(el, { x: b.x + b.width / 2, y: b.y + b.height / 2 });
			const c = toScreen(w);
			el.activeShadows().forEach((sh) => {
				// the offset is in document space: it does not rotate with the element
				const p = toScreen({ x: w.x + sh.x, y: w.y + sh.y });
				line(c, p);
				handle(p, 'shadow', T('snip.shadow'), (dp, ev) => {
					sh.x = Math.round((dp.x - w.x) * (ev.shiftKey ? 1 : 1) * 10) / 10;
					sh.y = Math.round((dp.y - w.y) * 10) / 10;
				});
			});
		}
		function chip(el) {
			const brush = !!B() && B().isRef(el.fill) && !!B().get(B().idOf(el.fill)) && B().get(B().idOf(el.fill)).type != 'texture';
			if (!brush) { mode = 'shape'; return; }
			const c = _el('div', { className: 'ps-chip' });
			[['shape', 'snip.mode.shape'], ['brush', 'snip.mode.brush']].forEach(([m, k]) => {
				const b = _el('button', { type: 'button', textContent: T(k), className: mode == m ? 'on' : '' });
				b.onclick = () => { mode = m; update(); };
				c.append(b);
			});
			host.append(c);
		}
		function update() {
			scheduled = 0;
			if (dragging) { return; }
			clear();
			const el = editor.element;
			const tool = surface.querySelector('.snippet-host'); // the handles of the tool (shape points)
			if (!el || !el['@container'] || el.visible === false) { if (tool) { tool.style.display = ''; } return; }
			if (el !== lastEl) { lastEl = el; mode = 'shape'; }
			chip(el);
			if (tool) { tool.style.display = mode == 'brush' ? 'none' : ''; }
			if (mode == 'brush') { brushHandles(el); }
			shadowMarkers(el);
		}
		const schedule = () => { if (!scheduled) { scheduled = requestAnimationFrame(update); } };
		['itemStartEdition', 'itemEndEdition', 'selectChanged', 'zoomChanged', 'currentLayerChanged', 'currentDocumentChanged', 'elementRemoved'].forEach((n) => editor.regEvent(n, schedule));
		const refresh = editor.refresh;
		editor.refresh = function () { const r = refresh.apply(this, arguments); schedule(); return r; };
		_NS.propertySnippets = { update: schedule, get mode() { return mode; }, set mode(v) { mode = v; update(); } };
	}
	_NS.whenEditor((editor) => setTimeout(() => init(editor), 0));
})();
