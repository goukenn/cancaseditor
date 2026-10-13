// author: C.A.D. BONDJE DOUE
// file: InspectorPanel.js
// @desc: design mode content of the property inspector: alignment, position/size/rotation, radius,
// appearance and style (fills, borders) sections with a color picker popover.
// Used by tools/PropertyInspectorTool.js (docked panel and small screen modal).
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const R = () => _NS.R || {};
	const T = (k, d) => R()[k] || d || k;
	// ---------------------------------------------------------------- styles
	const CSS = ':root{--ci-fg:#ddd;--ci-dim:#9a9a9a;--ci-input:#222;--ci-line:#4a4a4a;--ci-pop:#2e2e2e;--ci-accent:#a14fd0}' +
		'[data-ce-theme="light"]{--ci-fg:#222;--ci-dim:#6b6b6b;--ci-input:#fff;--ci-line:#b9bfbc;--ci-pop:#f4f4f4;--ci-accent:#7d3cc2}' +
		'.ci-root{color:var(--ci-fg);font-size:12px}' +
		'.ci-root input[type=number],.ci-root input[type=text],.ci-root select{width:100%;box-sizing:border-box;background:var(--ci-input);color:var(--ci-fg);border:1px solid transparent;border-radius:5px;padding:6px 8px;font:inherit;min-width:0}' +
		'.ci-root input:focus,.ci-root select:focus{outline:none;border-color:var(--ci-accent)}' +
		'.ci-root input[type=range]{width:100%;accent-color:var(--ci-accent)}' +
		'.ci-bar{display:flex;justify-content:space-between;padding:4px 2px 10px}' +
		'.ci-ico{background:transparent;border:0;color:var(--ci-fg);width:26px;height:26px;padding:3px;border-radius:4px;cursor:pointer;line-height:0}' +
		'.ci-ico:hover{background:rgba(127,127,127,.25)}.ci-ico.on{color:var(--ci-accent)}.ci-ico svg{width:100%;height:100%}' +
		'.ci-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;margin-bottom:10px}' +
		'.ci-grid .ci-field{position:relative}' +
		'.ci-field>span{position:absolute;right:8px;top:50%;transform:translateY(-50%);color:var(--ci-dim);font-size:10px;pointer-events:none}' +
		'.ci-pair{display:flex;gap:6px;align-items:center}' +
		'.ci-sec-h{display:flex;align-items:center;justify-content:space-between;margin:14px 0 8px;padding-top:10px;border-top:1px solid var(--ci-line);color:var(--ci-dim);font-size:11px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;user-select:none}' +
		'.ci-sec-h svg{width:12px;height:12px;transition:transform .15s}.ci-sec.closed .ci-sec-h svg{transform:rotate(-90deg)}.ci-sec.closed .ci-sec-b{display:none}' +
		'.ci-row{display:flex;align-items:center;gap:8px;margin:6px 0}.ci-row>label{flex:none;width:72px}' +
		'.ci-row.slider{display:grid;grid-template-columns:1fr 48px;gap:10px}' +
		'.ci-sub{display:flex;align-items:center;justify-content:space-between;margin:10px 0 6px;font-weight:bold}' +
		'.ci-fill{display:grid;grid-template-columns:18px 30px 1fr 56px;gap:8px;align-items:center;margin:6px 0}' +
		'.ci-swatch{width:30px;height:24px;border:1px solid var(--ci-line);border-radius:5px;cursor:pointer;padding:0;background-image:linear-gradient(45deg,#999 25%,transparent 25%,transparent 75%,#999 75%),linear-gradient(45deg,#999 25%,#fff 25%,#fff 75%,#999 75%);background-size:8px 8px;background-position:0 0,4px 4px;position:relative;overflow:hidden}' +
		'.ci-swatch i{position:absolute;inset:0}' +
		'.ci-title{font-weight:bold;margin:2px 0 8px;opacity:.85}' +
		// color picker popover
		'.ci-pop{position:fixed;z-index:1100;width:248px;box-sizing:border-box;padding:12px;background:var(--ci-pop);color:var(--ci-fg);border:1px solid var(--ci-line);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.45);font:12px sans-serif}' +
		'.ci-pop h4{margin:0 0 8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--ci-dim)}' +
		'.ci-sv{position:relative;height:130px;border-radius:5px;overflow:hidden;cursor:crosshair;touch-action:none}.ci-sv canvas{width:100%;height:100%;display:block}' +
		'.ci-dot{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.5);pointer-events:none}' +
		'.ci-sliders{display:flex;gap:10px;align-items:center;margin:10px 0}.ci-sliders>div:not(.ci-prev){flex:1;display:flex;flex-direction:column;gap:8px}' +
		'.ci-prev{width:30px;height:30px;border-radius:50%;border:1px solid var(--ci-line);flex:none}' +
		'.ci-pop input[type=range]{-webkit-appearance:none;appearance:none;height:10px;border-radius:5px;margin:0;width:100%;accent-color:initial}' +
		'.ci-pop input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #333;box-shadow:0 0 0 1px #fff}' +
		'.ci-pop input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid #333}' +
		'.ci-hue{background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)}' +
		'.ci-vals{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr 1fr;gap:6px}.ci-vals div{text-align:center;color:var(--ci-dim);font-size:10px}' +
		'.ci-vals input{text-align:center;padding:6px 2px!important}.ci-vals input[type=number]{-moz-appearance:textfield;appearance:textfield}.ci-vals input::-webkit-inner-spin-button,.ci-vals input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}';
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	}
	function _css() {
		if (!document.getElementById('cancas-inspector-css')) {
			document.head.append(_el('style', { id: 'cancas-inspector-css', textContent: CSS }));
		}
	}
	const svg = (d, w) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.6) + '" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
	const ICONS = {
		left: svg('<path d="M4 3v18"/><rect x="7" y="6" width="12" height="4" rx="1"/><rect x="7" y="14" width="8" height="4" rx="1"/>'),
		center: svg('<path d="M12 3v18"/><rect x="5" y="6" width="14" height="4" rx="1"/><rect x="7" y="14" width="10" height="4" rx="1"/>'),
		right: svg('<path d="M20 3v18"/><rect x="5" y="6" width="12" height="4" rx="1"/><rect x="9" y="14" width="8" height="4" rx="1"/>'),
		top: svg('<path d="M3 4h18"/><rect x="6" y="7" width="4" height="12" rx="1"/><rect x="14" y="7" width="4" height="8" rx="1"/>'),
		middle: svg('<path d="M3 12h18"/><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="7" width="4" height="10" rx="1"/>'),
		bottom: svg('<path d="M3 20h18"/><rect x="6" y="5" width="4" height="12" rx="1"/><rect x="14" y="9" width="4" height="8" rx="1"/>'),
		flipH: svg('<path d="M12 3v18" stroke-dasharray="2 2"/><path d="M9 7 3 17h6zM15 7l6 10h-6z"/>'),
		flipV: svg('<path d="M3 12h18" stroke-dasharray="2 2"/><path d="M7 9 17 9 12 3zM7 15h10l-5 6z"/>'),
		lockOn: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
		lockOff: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'),
		chevron: svg('<path d="m6 9 6 6 6-6"/>', 2)
	};
	// ---------------------------------------------------------------- colors
	const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
	/** any css color => {r,g,b,a} */
	function parseColor(css) {
		const ctx = document.createElement('canvas').getContext('2d');
		ctx.fillStyle = '#000000';
		ctx.fillStyle = (css && css != 'none') ? css : 'rgba(0,0,0,0)';
		const v = ctx.fillStyle;
		if (/^#[0-9a-f]{6}$/i.test(v)) {
			return { r: parseInt(v.substr(1, 2), 16), g: parseInt(v.substr(3, 2), 16), b: parseInt(v.substr(5, 2), 16), a: 1 };
		}
		const m = /rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)(?:\D+([\d.]+))?/.exec(v);
		return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : { r: 0, g: 0, b: 0, a: 1 };
	}
	const toHex = (c) => '#' + [c.r, c.g, c.b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase();
	function rgb2hsv({ r, g, b }) {
		r /= 255; g /= 255; b /= 255;
		const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
		let h = 0;
		if (d) { h = mx == r ? ((g - b) / d) % 6 : mx == g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) { h += 360; } }
		return { h, s: mx ? d / mx : 0, v: mx };
	}
	function hsv2rgb({ h, s, v }) {
		const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
		const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
		return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
	}
	// ---------------------------------------------------------------- color picker popover
	let m_pop = null;
	function closePicker() {
		if (m_pop) { m_pop.cleanup(); m_pop.el.remove(); m_pop = null; }
	}
	/**
	 * @param {HTMLElement} anchor element the popover is placed next to
	 * @param {{r:number,g:number,b:number,a:number}} start
	 * @param {(c:{r,g,b,a})=>void} onChange
	 */
	function openPicker(anchor, start, onChange) {
		closePicker();
		_css();
		const hsv = rgb2hsv(start);
		let alpha = start.a;
		const sv = _el('div', { className: 'ci-sv' });
		const canvas = _el('canvas', { width: 216, height: 130 });
		const dot = _el('div', { className: 'ci-dot' });
		sv.append(canvas, dot);
		const hue = _el('input', { type: 'range', min: 0, max: 360, value: Math.round(hsv.h), className: 'ci-hue' });
		const al = _el('input', { type: 'range', min: 0, max: 100, value: Math.round(alpha * 100) });
		const prev = _el('div', { className: 'ci-prev' });
		const hex = _el('input', { type: 'text', maxLength: 7 });
		const nums = ['r', 'g', 'b'].map(() => _el('input', { type: 'number', min: 0, max: 255 }));
		const aIn = _el('input', { type: 'number', min: 0, max: 100 });
		const lab = (t) => _el('div', { textContent: t });
		const vals = _el('div', { className: 'ci-vals' }, [
			_el('div', {}, [hex, lab(T('ins.hex', 'Hex'))]),
			...nums.map((n, i) => _el('div', {}, [n, lab('RGB'[i])])),
			_el('div', {}, [aIn, lab(T('ins.alpha', 'Alpha'))])]);
		const box = _el('div', { className: 'ci-pop ci-root' }, [
			_el('h4', { textContent: T('ins.colorpicker', 'Color picker') }), sv,
			_el('div', { className: 'ci-sliders' }, [prev, _el('div', {}, [hue, al])]), vals]);
		const drawSV = () => {
			const g = canvas.getContext('2d');
			g.fillStyle = 'hsl(' + hsv.h + ',100%,50%)';
			g.fillRect(0, 0, 216, 130);
			let l = g.createLinearGradient(0, 0, 216, 0);
			l.addColorStop(0, '#fff'); l.addColorStop(1, 'rgba(255,255,255,0)');
			g.fillStyle = l; g.fillRect(0, 0, 216, 130);
			l = g.createLinearGradient(0, 0, 0, 130);
			l.addColorStop(0, 'rgba(0,0,0,0)'); l.addColorStop(1, '#000');
			g.fillStyle = l; g.fillRect(0, 0, 216, 130);
		};
		const sync = (skip) => {
			const rgb = hsv2rgb(hsv);
			dot.style.left = (hsv.s * 100) + '%';
			dot.style.top = ((1 - hsv.v) * 100) + '%';
			prev.style.background = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
			al.style.background = 'linear-gradient(90deg,rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0),rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + '))';
			if (skip !== 'hex') { hex.value = toHex(rgb).substr(1); }
			if (skip !== 'rgb') { [rgb.r, rgb.g, rgb.b].forEach((n, i) => { nums[i].value = n; }); }
			if (skip !== 'a') { aIn.value = Math.round(alpha * 100); }
			onChange(Object.assign(rgb, { a: alpha }));
		};
		const fromPointer = (e) => {
			const r = sv.getBoundingClientRect();
			hsv.s = clamp((e.clientX - r.left) / r.width, 0, 1);
			hsv.v = 1 - clamp((e.clientY - r.top) / r.height, 0, 1);
			sync();
		};
		sv.addEventListener('pointerdown', (e) => {
			sv.setPointerCapture(e.pointerId);
			fromPointer(e);
			const mv = (ev) => fromPointer(ev);
			const up = () => { sv.removeEventListener('pointermove', mv); sv.removeEventListener('pointerup', up); };
			sv.addEventListener('pointermove', mv);
			sv.addEventListener('pointerup', up);
		});
		hue.oninput = () => { hsv.h = +hue.value; drawSV(); sync(); };
		al.oninput = () => { alpha = al.value / 100; sync(); };
		hex.oninput = () => {
			if (/^[0-9a-f]{6}$/i.test(hex.value)) { Object.assign(hsv, rgb2hsv(parseColor('#' + hex.value))); hue.value = Math.round(hsv.h); drawSV(); sync('hex'); }
		};
		nums.forEach((n) => {
			n.oninput = () => {
				const c = { r: clamp(+nums[0].value, 0, 255), g: clamp(+nums[1].value, 0, 255), b: clamp(+nums[2].value, 0, 255) };
				Object.assign(hsv, rgb2hsv(c)); hue.value = Math.round(hsv.h); drawSV(); sync('rgb');
			};
		});
		aIn.oninput = () => { alpha = clamp(+aIn.value, 0, 100) / 100; al.value = Math.round(alpha * 100); sync('a'); };
		document.body.append(box);
		// place at the left of the anchor (the inspector is docked on the right), inside the viewport
		const ar = anchor.getBoundingClientRect(), bw = box.offsetWidth, bh = box.offsetHeight;
		box.style.left = clamp(ar.left - bw - 12 > 8 ? ar.left - bw - 12 : ar.right + 12, 8, window.innerWidth - bw - 8) + 'px';
		box.style.top = clamp(ar.top - 20, 8, Math.max(8, window.innerHeight - bh - 8)) + 'px';
		drawSV();
		sync();
		const outside = (e) => { if (!box.contains(e.target) && !anchor.contains(e.target)) { closePicker(); } };
		const esc = (e) => { if (e.key == 'Escape') { closePicker(); } };
		document.addEventListener('pointerdown', outside, true);
		document.addEventListener('keydown', esc, true);
		m_pop = { el: box, cleanup() { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', esc, true); } };
	}
	// ---------------------------------------------------------------- widgets
	const collapsed = {}; // section name => closed
	function section(name, title, build) {
		const body = _el('div', { className: 'ci-sec-b' });
		const head = _el('div', { className: 'ci-sec-h' }, [_el('span', { textContent: title }), _el('span')]);
		head.lastChild.innerHTML = ICONS.chevron;
		const sec = _el('div', { className: 'ci-sec' + (collapsed[name] ? ' closed' : '') }, [head, body]);
		head.onclick = () => { collapsed[name] = !collapsed[name]; sec.classList.toggle('closed', !!collapsed[name]); };
		build(body);
		return sec;
	}
	function field(label, input) {
		return _el('div', { className: 'ci-field' }, [input, _el('span', { textContent: label })]);
	}
	function numInput(value, onchange, o) {
		o = o || {};
		const i = _el('input', { type: 'number', step: o.step || 1 });
		if ('min' in o) { i.min = o.min; }
		if ('max' in o) { i.max = o.max; }
		i.value = value;
		i.oninput = () => { if (i.value !== '' && !isNaN(+i.value)) { onchange(+i.value); } };
		return i;
	}
	const round2 = (n) => Math.round(n * 100) / 100;
	/**
	 * color row: [enabled] [swatch] [hex] [opacity %]
	 * @param {{get:()=>string, set:(v:string)=>void, getOpacity?:()=>number, setOpacity?:(v:number)=>void, apply:Function}} a
	 */
	function colorRow(a) {
		let last = null; // color kept while the row is disabled
		const cur = () => a.get();
		const off = (v) => !v || v == 'none' || v == 'transparent';
		const on = _el('input', { type: 'checkbox', checked: !off(cur()) });
		const sw = _el('button', { className: 'ci-swatch', type: 'button' });
		const fillSw = _el('i');
		sw.append(fillSw);
		const hex = _el('input', { type: 'text', maxLength: 7 });
		const op = _el('input', { type: 'number', min: 0, max: 100 });
		const paint = () => {
			const c = parseColor(cur());
			const o = a.getOpacity ? a.getOpacity() : c.a;
			fillSw.style.background = off(cur()) ? 'transparent' : 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + o + ')';
			hex.value = off(cur()) ? '' : toHex(c).substr(1);
			op.value = Math.round((a.getOpacity ? a.getOpacity() : c.a) * 100);
			on.checked = !off(cur());
		};
		on.onchange = () => {
			if (on.checked) { a.apply(() => a.set(last || '#000000')); } else { last = cur(); a.apply(() => a.set('transparent')); }
			paint();
		};
		sw.onclick = () => {
			const c = parseColor(off(cur()) ? (last || '#000000') : cur());
			c.a = a.getOpacity ? a.getOpacity() : c.a;
			openPicker(sw, c, (n) => {
				a.apply(() => { a.set(toHex(n)); if (a.setOpacity) { a.setOpacity(round2(n.a)); } });
				paint();
			});
		};
		hex.onchange = () => {
			if (/^#?[0-9a-f]{6}$/i.test(hex.value)) { a.apply(() => a.set('#' + hex.value.replace('#', ''))); }
			paint();
		};
		op.oninput = () => {
			if (op.value === '') { return; }
			const v = clamp(+op.value, 0, 100) / 100;
			if (a.setOpacity) { a.apply(() => a.setOpacity(v)); }
		};
		paint();
		return _el('div', { className: 'ci-fill' }, [on, sw, hex, a.setOpacity ? _el('div', { className: 'ci-field' }, [op, _el('span', { textContent: '%' })]) : _el('span')]);
	}
	function sliderRow(label, value, min, max, onchange, suffix) {
		const r = _el('input', { type: 'range', min, max, value });
		const t = _el('input', { type: 'number', min, max, value });
		r.oninput = () => { t.value = r.value; onchange(+r.value); };
		t.oninput = () => { if (t.value !== '') { r.value = t.value; onchange(+t.value); } };
		return _el('div', {}, [_el('div', { className: 'ci-sub', textContent: label }), _el('div', { className: 'ci-row slider' }, [r, t])]);
	}
	// ---------------------------------------------------------------- geometry helpers
	const hasBound = (el) => { try { const b = el.bound; return !!b && typeof b.x == 'number' && typeof b.width == 'number'; } catch (e) { return false; } };
	const mat = (el) => (el.matrix && el.matrix.element) ? el.matrix.element.slice(0, 6) : [1, 0, 0, 1, 0, 0];
	const isIdentity = (el) => { const m = mat(el); return m[0] == 1 && m[1] == 0 && m[2] == 0 && m[3] == 1 && m[4] == 0 && m[5] == 0; };
	const apply2 = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
	function worldBound(el) {
		const b = el.bound, m = mat(el);
		const p = [apply2(m, b.x, b.y), apply2(m, b.x + b.width, b.y), apply2(m, b.x, b.y + b.height), apply2(m, b.x + b.width, b.y + b.height)];
		const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
		const x = Math.min(...xs), y = Math.min(...ys);
		return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
	}
	/** m2 applied after m1 (canvas convention: x' = a x + c y + e) */
	const mul = (m2, m1) => [
		m2[0] * m1[0] + m2[2] * m1[1], m2[1] * m1[0] + m2[3] * m1[1],
		m2[0] * m1[2] + m2[2] * m1[3], m2[1] * m1[2] + m2[3] * m1[3],
		m2[0] * m1[4] + m2[2] * m1[5] + m2[4], m2[1] * m1[4] + m2[3] * m1[5] + m2[5]];
	function setMatrix(el, m) {
		if (el.matrix && el.matrix.copytransform) { el.matrix.copytransform(m); }
	}
	function moveBy(el, dx, dy) {
		if (isIdentity(el)) {
			const b = el.bound;
			el.bound = { x: b.x + dx, y: b.y + dy, width: b.width, height: b.height };
		} else {
			setMatrix(el, mul([1, 0, 0, 1, dx, dy], mat(el)));
		}
	}
	function aboutCenter(el, t) { // t(cx, cy) => matrix applied in world space around the center of the element
		const w = worldBound(el), cx = w.x + w.width / 2, cy = w.y + w.height / 2;
		setMatrix(el, mul(t(cx, cy), mat(el)));
	}
	// ---------------------------------------------------------------- panels
	function elementPanel(editor, el) {
		const root = _el('div', { className: 'ci-root' });
		const apply = (fn) => { fn(); el.initialize && el.initialize(); editor.refresh(); };
		root.append(_el('div', { className: 'ci-title', textContent: el.getType() + ' #' + el.id }));
		if (hasBound(el)) {
			const doc = editor.document;
			const align = (kind) => apply(() => {
				if (!doc) { return; }
				const w = worldBound(el);
				const dx = kind == 'left' ? -w.x : kind == 'center' ? (doc.width - w.width) / 2 - w.x : kind == 'right' ? doc.width - w.width - w.x : 0;
				const dy = kind == 'top' ? -w.y : kind == 'middle' ? (doc.height - w.height) / 2 - w.y : kind == 'bottom' ? doc.height - w.height - w.y : 0;
				moveBy(el, dx, dy);
			});
			const bar = _el('div', { className: 'ci-bar' });
			['left', 'center', 'right', 'top', 'middle', 'bottom'].forEach((k) => {
				const b = _el('button', { className: 'ci-ico', type: 'button', title: T('ins.align.' + k) });
				b.innerHTML = ICONS[k];
				b.onclick = () => align(k);
				bar.append(b);
			});
			root.append(bar);
			// position, rotation, size
			const w0 = worldBound(el), m0 = mat(el);
			const angle = Math.round(Math.atan2(m0[1], m0[0]) * 180 / Math.PI * 100) / 100;
			let lock = false, ratio = w0.height ? w0.width / w0.height : 1;
			const xi = numInput(round2(w0.x), (v) => apply(() => moveBy(el, v - worldBound(el).x, 0)), { step: 1 });
			const yi = numInput(round2(w0.y), (v) => apply(() => moveBy(el, 0, v - worldBound(el).y)), { step: 1 });
			const ri = numInput(angle, (v) => apply(() => {
				const cur = Math.atan2(mat(el)[1], mat(el)[0]) * 180 / Math.PI;
				const d = (v - cur) * Math.PI / 180, c = Math.cos(d), s = Math.sin(d);
				aboutCenter(el, (cx, cy) => [c, s, -s, c, cx - cx * c + cy * s, cy - cx * s - cy * c]);
			}), { step: 1 });
			const wi = numInput(round2(el.bound.width), null, { min: 1 });
			const hi = numInput(round2(el.bound.height), null, { min: 1 });
			wi.oninput = () => { if (+wi.value > 0) { apply(() => { const b = el.bound; const w = +wi.value; const h = lock ? w / ratio : b.height; el.bound = { x: b.x, y: b.y, width: w, height: h }; hi.value = round2(h); }); } };
			hi.oninput = () => { if (+hi.value > 0) { apply(() => { const b = el.bound; const h = +hi.value; const w = lock ? h * ratio : b.width; el.bound = { x: b.x, y: b.y, width: w, height: h }; wi.value = round2(w); }); } };
			const lockBtn = _el('button', { className: 'ci-ico', type: 'button', title: T('ins.lock') });
			lockBtn.innerHTML = ICONS.lockOff;
			lockBtn.onclick = () => { lock = !lock; ratio = el.bound.height ? el.bound.width / el.bound.height : 1; lockBtn.classList.toggle('on', lock); lockBtn.innerHTML = lock ? ICONS.lockOn : ICONS.lockOff; };
			const flip = (h) => {
				const b = _el('button', { className: 'ci-ico', type: 'button', title: T(h ? 'ins.flip.h' : 'ins.flip.v') });
				b.innerHTML = h ? ICONS.flipH : ICONS.flipV;
				b.onclick = () => apply(() => aboutCenter(el, (cx, cy) => h ? [-1, 0, 0, 1, 2 * cx, 0] : [1, 0, 0, -1, 0, 2 * cy]));
				return b;
			};
			root.append(_el('div', { className: 'ci-grid' }, [
				field('X', xi), field('Y', yi), field('°', ri), _el('span'),
				field('W', wi), field('H', hi)]));
			root.append(_el('div', { className: 'ci-pair', style: 'justify-content:flex-end;margin:-4px 0 6px' }, [lockBtn, flip(true), flip(false)]));
		}
		if (typeof el.radius == 'number') {
			const b = hasBound(el) ? el.bound : { width: 200, height: 200 };
			root.append(sliderRow(T('ins.radius'), el.radius, 0, Math.max(10, Math.round(Math.min(b.width, b.height) / 2)), (v) => apply(() => { el.radius = v; })));
		}
		if (('opacity' in el) || ('blendingMode' in el)) {
			root.append(section('appearance', T('ins.appearance'), (body) => {
				if ('opacity' in el) {
					body.append(sliderRow(T('ins.opacity'), Math.round(el.opacity * 100), 0, 100, (v) => apply(() => { el.opacity = v / 100; })));
				}
				if ('blendingMode' in el) {
					const blends = Object.keys(_NS.DrawingElements.BLENDING || {});
					const sel = _el('select', {}, blends.map((n) => _el('option', { value: n, textContent: n, selected: n == el.blendingMode })));
					sel.onchange = () => apply(() => { el.blendingMode = sel.value; });
					body.append(_el('div', { className: 'ci-sub', textContent: T('ins.blending') }), sel);
				}
			}));
		}
		if (('fill' in el) || ('stroke' in el)) {
			root.append(section('style', T('ins.style'), (body) => {
				if ('fill' in el) {
					body.append(_el('div', { className: 'ci-sub', textContent: T('ins.fills') }), colorRow({
						get: () => el.fill, set: (v) => { el.fill = v; }, apply,
						getOpacity: ('fillOpacity' in el) ? () => (typeof el.fillOpacity == 'number' ? el.fillOpacity : 1) : null,
						setOpacity: ('fillOpacity' in el) ? (v) => { el.fillOpacity = v; } : null
					}));
				}
				if ('stroke' in el) {
					body.append(_el('div', { className: 'ci-sub', textContent: T('ins.borders') }), colorRow({
						get: () => el.stroke, set: (v) => { el.stroke = v; }, apply,
						getOpacity: ('strokeOpacity' in el) ? () => (typeof el.strokeOpacity == 'number' ? el.strokeOpacity : 1) : null,
						setOpacity: ('strokeOpacity' in el) ? (v) => { el.strokeOpacity = v; } : null
					}));
					if ('strokeWidth' in el) {
						body.append(_el('div', { className: 'ci-row' }, [_el('label', { textContent: T('ins.width') }),
							_el('div', { className: 'ci-field', style: 'width:90px' }, [numInput(el.strokeWidth, (v) => apply(() => { el.strokeWidth = v; }), { min: 0, step: 0.5 }), _el('span', { textContent: 'px' })])]));
					}
				}
			}));
		}
		if (el.getType() == 'htmlnode' && _NS.htmlEditor) {
			const b = _el('button', { textContent: T('prop.html.edit'), className: 'igk-btn' });
			b.style.marginTop = '12px';
			b.onclick = () => _NS.htmlEditor.showDialog(editor, el.html, (h) => { el.html = h; editor.refresh(); });
			root.append(b);
		}
		return root;
	}
	function documentPanel(editor, doc) {
		const root = _el('div', { className: 'ci-root' });
		const resize = () => editor.resizeCanvas(true);
		root.append(_el('div', { className: 'ci-title', textContent: T('ins.document') + ' #' + doc.id }));
		const title = _el('input', { type: 'text', value: doc.title || '', placeholder: T('doc.name') });
		title.onchange = () => { doc.title = title.value; editor.refresh(); };
		root.append(title);
		root.append(_el('div', { style: 'height:10px' }));
		const wi = numInput(doc.width, (v) => { doc.setSize(v, doc.height); resize(); }, { min: 1 });
		const hi = numInput(doc.height, (v) => { doc.setSize(doc.width, v); resize(); }, { min: 1 });
		root.append(_el('div', { className: 'ci-grid' }, [field('W', wi), field('H', hi)]));
		root.append(section('docstyle', T('ins.style'), (body) => {
			body.append(_el('div', { className: 'ci-sub', textContent: T('doc.background.color') }), colorRow({
				get: () => doc.fill, set: (v) => { doc.fill = v; }, apply: (fn) => { fn(); editor.refresh(); }
			}));
		}));
		return root;
	}
	/** build the inspector content for the current selection */
	function build(editor) {
		_css();
		const el = editor.element || (editor.tool && editor.tool.elem) || null;
		if (el && el['@container']) { return elementPanel(editor, el); }
		if (editor.document) { return documentPanel(editor, editor.document); }
		return _el('div', { className: 'ci-root' }, [_el('div', { className: 'ci-title', textContent: T('prop.nodoc') })]);
	}
	_NS.inspector = { build, openPicker, closePicker, parseColor, toHex };
})();
