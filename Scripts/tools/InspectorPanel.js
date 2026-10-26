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
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
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
		resetMatrix: svg('<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>'),
		flipV: svg('<path d="M3 12h18" stroke-dasharray="2 2"/><path d="M7 9 17 9 12 3zM7 15h10l-5 6z"/>'),
		lockOn: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
		lockOff: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'),
		fitW: svg('<path d="M4 4v16M20 4v16"/><path d="m8 12h8M10 9l-3 3 3 3M14 9l3 3-3 3"/>'),
		close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
		fitBoth: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="8" y="8" width="8" height="8"/>'),
		pipette: svg('<path d="m15 4 5 5M13.5 5.5l5 5-8 8H5.5v-5z"/><path d="M5 21l1.5-1.5"/>'),
		fitH: svg('<path d="M4 4h16M4 20h16"/><path d="m12 8v8M9 10l3-3 3 3M9 14l3 3 3-3"/>'),
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
	/** #RRGGBB when opaque, rgba(r, g, b, a) otherwise: the alpha stays inside the color */
	const toCss = (c) => (c.a === undefined || c.a >= 1) ? toHex(c) : 'rgba(' + Math.round(c.r) + ', ' + Math.round(c.g) + ', ' + Math.round(c.b) + ', ' + (Math.round(c.a * 100) / 100) + ')';
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
		// eyedropper: the native EyeDropper (screen wide, Chromium) or the pixels of the editor canvas
		const pip = _el('button', { className: 'ci-ico', type: 'button', title: T('ins.eyedropper') });
		pip.innerHTML = ICONS.pipette;
		let sampling = false;
		const takeColor = (hexOrRgb) => {
			const c = typeof hexOrRgb == 'string' ? parseColor(hexOrRgb) : hexOrRgb;
			Object.assign(hsv, rgb2hsv(c));
			hue.value = Math.round(hsv.h);
			drawSV();
			sync();
		};
		pip.onclick = async () => {
			if (window.EyeDropper) {
				sampling = true;
				try { const r = await new window.EyeDropper().open(); takeColor(r.sRGBHex); } catch (e) { /* cancelled */ }
				sampling = false;
				return;
			}
			const app = _NS.app, cv = app && app.canvas && app.canvas.o;
			if (!cv) { return; }
			sampling = true;
			document.body.style.cursor = 'crosshair';
			const done = () => { sampling = false; document.body.style.cursor = ''; document.removeEventListener('pointerdown', pick, true); document.removeEventListener('keydown', cancel, true); };
			const pick = (e) => {
				if (box.contains(e.target)) { return; }
				e.preventDefault();
				e.stopPropagation();
				const r = cv.getBoundingClientRect();
				try {
					const d = cv.getContext('2d').getImageData(Math.floor(e.clientX - r.left), Math.floor(e.clientY - r.top), 1, 1).data;
					takeColor({ r: d[0], g: d[1], b: d[2], a: d[3] / 255 });
				} catch (x) { console.warn('[cancasEditor] eyedropper', x); }
				done();
			};
			const cancel = (e) => { if (e.key == 'Escape') { e.stopPropagation(); done(); } };
			document.addEventListener('pointerdown', pick, true);
			document.addEventListener('keydown', cancel, true);
		};
		const box = _el('div', { className: 'ci-pop ci-root' }, [
			_el('div', { className: 'ci-pop-head' }, [_el('h4', { textContent: T('ins.colorpicker', 'Color picker') }), pip]), sv,
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
		const outside = (e) => { if (!sampling && !box.contains(e.target) && !anchor.contains(e.target)) { closePicker(); } };
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
		// an empty field is the integer 0
		i.oninput = () => { const v = i.value === '' ? 0 : +i.value; if (!isNaN(v) && onchange) { onchange(v); } };
		i.addEventListener('change', () => { if (i.value === '') { i.value = 0; } });
		return i;
	}
	const round2 = (n) => Math.round(n * 100) / 100;
	/**
	 * color row: [enabled] [swatch] [hex] [opacity %]
	 * @param {{get:()=>string, set:(v:string)=>void, getOpacity?:()=>number, setOpacity?:(v:number)=>void, apply:Function}} a
	 */
	function colorRow(a) {
		let last = null; // color kept while the row is disabled
		const cur = () => { const v = a.get(); return (typeof v == 'string') ? v : ''; }; // gradients are not edited here
		const off = (v) => !v || v == 'none' || v == 'transparent';
		// the legacy opacity property (fillOpacity/strokeOpacity) multiplies the alpha of the color
		const legacy = () => (a.getOpacity ? a.getOpacity() : 1);
		const alpha = () => clamp(parseColor(cur()).a * legacy(), 0, 1);
		const on = _el('input', { type: 'checkbox', checked: !off(cur()) });
		const sw = _el('button', { className: 'ci-swatch', type: 'button' });
		const fillSw = _el('i');
		sw.append(fillSw);
		const hex = _el('input', { type: 'text', maxLength: 9, title: '#RRGGBB / #RRGGBBAA' });
		const op = _el('input', { type: 'number', min: 0, max: 100 });
		const paint = () => {
			const c = parseColor(cur());
			fillSw.style.background = off(cur()) ? 'transparent' : 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha() + ')';
			hex.value = off(cur()) ? '' : toHex(c).substr(1) + (alpha() < 1 ? Math.round(alpha() * 255).toString(16).padStart(2, '0').toUpperCase() : '');
			op.value = Math.round(alpha() * 100);
			on.checked = !off(cur());
		};
		// the alpha is stored in the color: the legacy opacity is folded into it (and reset to 1)
		const setColor = (c, al) => a.apply(() => {
			a.set(toCss(Object.assign({}, c, { a: clamp(al, 0, 1) })));
			if (a.setOpacity && legacy() != 1) { a.setOpacity(1); }
		});
		on.onchange = () => {
			if (on.checked) {
				const c = parseColor(last || a.defaultColor || '#000000');
				setColor(c, (last || a.defaultColor) ? c.a : 1);
			} else { last = toCss(Object.assign(parseColor(cur()), { a: alpha() })); a.apply(() => a.set('transparent')); }
			paint();
			a.afterToggle && a.afterToggle(on.checked);
		};
		sw.onclick = () => {
			const c = parseColor(off(cur()) ? (last || '#000000') : cur());
			c.a = off(cur()) ? c.a : alpha();
			openPicker(sw, c, (n) => { setColor(n, n.a); paint(); });
		};
		hex.onchange = () => {
			const m = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex.value.trim());
			if (m) { setColor(parseColor('#' + m[1]), m[2] ? parseInt(m[2], 16) / 255 : alpha()); }
			paint();
		};
		op.oninput = () => {
			const v = clamp(op.value === '' ? 0 : +op.value, 0, 100) / 100; // empty = 0
			if (!off(cur())) { setColor(parseColor(cur()), v); }
		};
		op.addEventListener('change', () => paint());
		paint();
		const pct = _el('div', { className: 'ci-field' }, [op, _el('span', { textContent: '%' })]);
		return _el('div', { className: 'ci-fill' + (a.noToggle ? ' ci-notoggle' : '') }, a.noToggle ? [sw, hex, pct] : [on, sw, hex, pct]); // noToggle: the color is always on, the caller owns the switch
	}
	function sliderRow(label, value, min, max, onchange, suffix) {
		const r = _el('input', { type: 'range', min, max, value });
		const t = _el('input', { type: 'number', min, max, value });
		r.oninput = () => { t.value = r.value; onchange(+r.value); };
		t.oninput = () => { const v = t.value === '' ? 0 : +t.value; r.value = v; onchange(v); };
		t.addEventListener('change', () => { if (t.value === '') { t.value = 0; } });
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
	// ---------------------------------------------------------------- shape specific properties
	/**
	 * The properties an element adds to the old property form (Edit(engine, host) chains: the star adds count,
	 * tension, angle...) are shown in an extra block. The generic properties handled by the panel are skipped.
	 */
	function extraSection(editor, el, apply, skip) {
		let engine, fields;
		try {
			const form = igk.createNode('div').add('form');
			engine = igk.winui.engine.getEngine('bmc', form, _NS.R);
			el.Edit(engine, editor);
			fields = form.engine.getFields();
		} catch (e) {
			console.warn('[cancasEditor] extra properties of ' + el.getType() + ' not available', e);
			return null;
		}
		const names = Object.keys(fields).filter((n) => skip.indexOf(n) == -1);
		if (names.length == 0) { return null; }
		return section('extra', T('ins.extra'), (body) => {
			names.forEach((n) => {
				const dom = fields[n].o, cur = el[n];
				let ctl;
				if (dom.tagName == 'SELECT') {
					ctl = _el('select', {}, Array.from(dom.options).map((o) => _el('option', { value: o.value, textContent: o.textContent, selected: o.value == String(cur) })));
					ctl.onchange = () => apply(() => { el[n] = ctl.value; });
				} else if (dom.type == 'checkbox') {
					ctl = _el('input', { type: 'checkbox', checked: !!cur });
					ctl.onchange = () => apply(() => { el[n] = ctl.checked; });
				} else if (typeof cur == 'number') {
					ctl = numInput(round2(cur), (v) => apply(() => { el[n] = v; }), { step: 'any' }); // empty = 0
				} else {
					ctl = _el('input', { type: 'text', value: cur == null ? '' : cur });
					ctl.onchange = () => apply(() => { el[n] = ctl.value; });
				}
				const lab = _el('label', { textContent: T('ins.prop.' + n, n), title: n });
				lab.className = 'ci-propl';
				body.append(_el('div', { className: 'ci-row' }, [lab, ctl]));
			});
		});
	}
	// ---------------------------------------------------------------- css filter
	// function => [neutral value, max, unit]
	const FILTERS = {
		blur: [0, 20, 'px'], brightness: [100, 200, '%'], contrast: [100, 200, '%'], grayscale: [0, 100, '%'],
		'hue-rotate': [0, 360, 'deg'], invert: [0, 100, '%'], opacity: [100, 100, '%'], saturate: [100, 200, '%'], sepia: [0, 100, '%']
	};
	function filterSupported() {
		try {
			return typeof CanvasRenderingContext2D != 'undefined' && ('filter' in CanvasRenderingContext2D.prototype) &&
				(typeof CSS == 'undefined' || !CSS.supports || CSS.supports('filter', 'blur(1px)'));
		} catch (e) { return false; }
	}
	function parseFilter(str) {
		const vals = {};
		let rest = typeof str == 'string' ? str : '';
		rest = rest.replace(/([a-z-]+)\(\s*(-?[\d.]+)[a-z%]*\s*\)/gi, (m, n, v) => {
			if (n in FILTERS) { vals[n] = +v; return ''; }
			return m;
		});
		return { vals, extra: rest.trim() }; // extra: functions without a control (drop-shadow, url...) are kept
	}
	function buildFilter(body, el, apply) {
		const st = parseFilter(el.filter);
		const write = () => {
			const parts = Object.keys(FILTERS).filter((n) => n in st.vals && st.vals[n] != FILTERS[n][0]).map((n) => n + '(' + st.vals[n] + FILTERS[n][2] + ')');
			if (st.extra) { parts.push(st.extra); }
			apply(() => { el.filter = parts.length ? parts.join(' ') : 0; });
		};
		Object.keys(FILTERS).forEach((n) => {
			const [neutral, max] = FILTERS[n];
			body.append(sliderRow(T('ins.filter.' + n, n), n in st.vals ? st.vals[n] : neutral, 0, max, (v) => { st.vals[n] = v; write(); }));
		});
		const reset = _el('button', { type: 'button', className: 'igk-btn', textContent: T('ins.filter.reset') });
		reset.onclick = () => apply(() => { el.filter = 0; });
		body.append(reset);
	}
	// ---------------------------------------------------------------- panels
	const cornerRadius0 = (el) => el.getType() == 'roundrect' && typeof el.radius == 'number';
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
			const wi = numInput(round2(el.bound.width), null, { min: 0 });
			const hi = numInput(round2(el.bound.height), null, { min: 0 });
			// an empty field is 0 (the size is never negative)
			const num = (i) => Math.max(0, i.value === '' ? 0 : (+i.value || 0));
			wi.oninput = () => apply(() => { const b = el.bound; const w = num(wi); const h = lock ? w / ratio : b.height; el.bound = { x: b.x, y: b.y, width: w, height: h }; hi.value = round2(h); });
			hi.oninput = () => apply(() => { const b = el.bound; const h = num(hi); const w = lock ? h * ratio : b.width; el.bound = { x: b.x, y: b.y, width: w, height: h }; wi.value = round2(w); });
			const lockBtn = _el('button', { className: 'ci-ico', type: 'button', title: T('ins.lock') });
			lockBtn.innerHTML = ICONS.lockOff;
			lockBtn.onclick = () => { lock = !lock; ratio = (el.bound.height && el.bound.width) ? el.bound.width / el.bound.height : 1; lockBtn.classList.toggle('on', lock); lockBtn.innerHTML = lock ? ICONS.lockOn : ICONS.lockOff; };
			const flip = (h) => {
				const b = _el('button', { className: 'ci-ico', type: 'button', title: T(h ? 'ins.flip.h' : 'ins.flip.v') });
				b.innerHTML = h ? ICONS.flipH : ICONS.flipV;
				b.onclick = () => apply(() => aboutCenter(el, (cx, cy) => h ? [-1, 0, 0, 1, 2 * cx, 0] : [1, 0, 0, -1, 0, 2 * cy]));
				return b;
			};
			root.append(_el('div', { className: 'ci-grid' }, [
				field('X', xi), field('Y', yi), field('°', ri), _el('span'),
				field('W', wi), field('H', hi)]));
			const fitBtn = (dir) => {
				const b = _el('button', { className: 'ci-ico', type: 'button', title: T(dir == 'width' ? 'ins.fit.width' : dir == 'height' ? 'ins.fit.height' : 'ins.fit.both') });
				b.innerHTML = dir == 'width' ? ICONS.fitW : dir == 'height' ? ICONS.fitH : ICONS.fitBoth;
				b.onclick = () => _NS.fit.fit(editor, el, dir);
				return b;
			};
			// fit actions only make sense for an element placed on a layer attached to a document
			const fits = (_NS.fit && _NS.fit.canFit(el)) ? [fitBtn('width'), fitBtn('height'), fitBtn('both')] : [];
			// back to the identity matrix: rotation, scale, skew and translation made by the handles / flips are dropped
			const resetBtn = _el('button', { className: 'ci-ico', type: 'button', title: T('ins.matrix.reset') });
			resetBtn.innerHTML = ICONS.resetMatrix;
			resetBtn.onclick = () => {
				if (!el.matrix) { return; }
				apply(() => { el.matrix.reset(); });
				// the handles and the fields of the inspector follow the new position
				if (editor.tool && editor.tool.selectElement) { editor.tool.selectElement(el); }
			};
			root.append(_el('div', { className: 'ci-pair ci-pair-end' }, [...fits, lockBtn, flip(true), flip(false), resetBtn]));
		}
		if (cornerRadius0(el)) {
			const b = hasBound(el) ? el.bound : { width: 200, height: 200 };
			root.append(sliderRow(T('ins.radius'), el.radius, 0, Math.max(10, Math.round(Math.min(b.width, b.height) / 2), Math.round(el.radius)), (v) => apply(() => { el.radius = v; })));
		}
		const skip = ['id', 'fill', 'stroke', 'strokeWidth', 'opacity', 'blendingMode', 'filter', 'clip', 'mask', 'maskMode'];
		const cornerRadius = el.getType() == 'roundrect' && typeof el.radius == 'number'; // other shapes edit their radius in the extra block
		if (cornerRadius) { skip.push('radius'); }
		const extra = extraSection(editor, el, apply, skip);
		if (extra) { root.append(extra); }
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
		// css filter (layers and groups), when the browser supports it on a canvas
		if (('filter' in el) && filterSupported()) {
			root.append(section('filter', T('ins.filter'), (body) => buildFilter(body, el, apply)));
		}
		// clip (hard path) and mask (luminance / alpha) of the element: another element of the same container
		if (('clip' in el) && el['@container']) {
			const sibs = Array.prototype.filter.call(el['@container'].Elements, (e) => e !== el);
			const shapes = sibs.filter((e) => ('path' in e));
			if (sibs.length > 0 || el.clip || el.mask) {
				root.append(section('clip', T('ins.clip'), (body) => {
					const pick = (label, list, get, set) => {
						const opts = [_el('option', { value: '', textContent: '-' })].concat(list.map((e) => _el('option', { value: e.id, textContent: e.getType() + ' #' + e.id, selected: get() === e })));
						const sel = _el('select', {}, opts);
						sel.onchange = () => apply(() => { set(list.find((e) => e.id == sel.value) || null); });
						body.append(_el('div', { className: 'ci-sub', textContent: label }), sel);
					};
					pick(T('ins.clip.shape'), shapes, () => el.clip, (v) => { el.clip = v; });
					pick(T('ins.mask.element'), sibs, () => el.mask, (v) => { el.mask = v; });
					if (el.mask) {
						const mode = _el('select', {}, ['luminance', 'alpha'].map((n) => _el('option', { value: n, textContent: T('ins.mask.' + n), selected: el.maskMode == n })));
						mode.onchange = () => apply(() => { el.maskMode = mode.value; });
						body.append(_el('div', { className: 'ci-sub', textContent: T('ins.mask.mode') }), mode);
					}
				}));
			}
		}
		if (('fill' in el) || ('stroke' in el)) {
			root.append(section('style', T('ins.style'), (body) => {
				if ('fill' in el) {
					body.append(_el('div', { className: 'ci-sub', textContent: T('ins.fills') }));
					// brush styles (solid, gradients, texture, library): see tools/BrushEditor.js
					const brushable = !!_NS.brushEditor && !!_NS.brushes && _NS.brushEditor.canBrush(el);
					if (brushable) {
						body.append(_NS.brushEditor.build(editor, el, 'fill', apply, () => editor.raiseEvent('selectChanged', { items: [el] })));
					}
					if (!(brushable && _NS.brushes.isRef(el.fill))) {
						body.append(colorRow({
							get: () => el.fill, set: (v) => { el.fill = v; }, apply,
							getOpacity: ('fillOpacity' in el) ? () => (typeof el.fillOpacity == 'number' ? el.fillOpacity : 1) : null,
							setOpacity: ('fillOpacity' in el) ? (v) => { el.fillOpacity = v; } : null
						}));
					}
				}
				if ('stroke' in el) {
					body.append(_el('div', { className: 'ci-sub', textContent: T('ins.borders') }), colorRow({
						get: () => el.stroke, set: (v) => { el.stroke = v; }, apply,
						getOpacity: ('strokeOpacity' in el) ? () => (typeof el.strokeOpacity == 'number' ? el.strokeOpacity : 1) : null,
						setOpacity: ('strokeOpacity' in el) ? (v) => { el.strokeOpacity = v; } : null
					}));
					if ('strokeWidth' in el) {
						body.append(_el('div', { className: 'ci-row' }, [_el('label', { textContent: T('ins.width') }),
							_el('div', { className: 'ci-field ci-w90' }, [numInput(el.strokeWidth, (v) => apply(() => { el.strokeWidth = v; }), { min: 0, step: 0.5 }), _el('span', { textContent: 'px' })])]));
					}
				}
			}));
		}
		if ('shadows' in el) {
			root.append(section('shadow', T('ins.shadow'), (body) => {
				const rebuild = () => editor.raiseEvent('selectChanged', { items: [el] }); // the list shows the new shadows
				const DEFAULT = { color: 'rgba(0, 0, 0, 0.35)', blur: 8, x: 4, y: 4 };
				el.shadows.forEach((sh, i) => {
					const head = _el('div', { className: 'ci-sub' }, [_el('span', { textContent: T('ins.shadow.n') + ' ' + (i + 1) })]);
					const del = _el('button', { type: 'button', className: 'ci-ico', title: T('ins.shadow.remove') });
					del.innerHTML = ICONS.close;
					del.onclick = () => { apply(() => { el.shadows = el.shadows.filter((_, k) => k != i); }); rebuild(); };
					head.append(del);
					body.append(head, colorRow({
						get: () => sh.color || '', set: (v) => { sh.color = v; }, apply,
						defaultColor: DEFAULT.color,
						afterToggle: (enabled) => {
							// a shadow without offset and blur would be invisible: start with a visible one
							if (enabled && !(sh.blur > 0 || sh.x || sh.y)) { apply(() => { sh.blur = DEFAULT.blur; sh.x = DEFAULT.x; sh.y = DEFAULT.y; }); }
							rebuild();
						}
					}));
					body.append(_el('div', { className: 'ci-grid ci-mt8' }, [
						field('X', numInput(round2(sh.x), (v) => apply(() => { sh.x = v; }), { step: 1 })),
						field('Y', numInput(round2(sh.y), (v) => apply(() => { sh.y = v; }), { step: 1 })),
						field(T('ins.shadow.blur'), numInput(round2(sh.blur), (v) => apply(() => { sh.blur = Math.max(0, v); }), { min: 0, step: 1 }))]));
				});
				const add = _el('button', { type: 'button', textContent: '+ ' + T('ins.shadow.add') });
				add.className = 'ci-mt6';
				add.onclick = () => { apply(() => { el.shadows = el.shadows.concat([Object.assign({}, DEFAULT)]); }); rebuild(); };
				body.append(add);
			}));
		}
		if (el.getType() == 'htmlnode' && _NS.htmlEditor) {
			const b = _el('button', { textContent: T('prop.html.edit'), className: 'igk-btn' });
			b.classList.add('ci-mt12');
			b.onclick = () => _NS.htmlEditor.showDialog(editor, el.html, (h) => { el.html = h; editor.refresh(); });
			root.append(b);
		}
		return root;
	}
	// ---------------------------------------------------------------- several elements
	const COMMON = ['fill', 'fillOpacity', 'stroke', 'strokeOpacity', 'strokeWidth', 'opacity', 'blendingMode'];
	/**
	 * the inspector of a multi selection: only the properties every element has are shown; a change is applied to all
	 * of them. A proxy object reads the first element and writes to every one, so the single element controls
	 * (color rows, sliders...) are reused as they are.
	 */
	function multiPanel(editor, items) {
		const root = _el('div', { className: 'ci-root' });
		const names = COMMON.filter((n) => items.every((i) => n in i));
		const proxy = {};
		names.forEach((n) => Object.defineProperty(proxy, n, {
			get: () => items[0][n],
			set: (v) => items.forEach((i) => { i[n] = v; }),
			enumerable: true
		}));
		const apply = (fn) => { fn(); items.forEach((i) => i.initialize && i.initialize()); editor.refresh(); };
		root.append(_el('div', { className: 'ci-title', textContent: items.length + ' ' + T('ins.selection', 'elements') }));
		if (names.length == 0) {
			root.append(_el('div', { className: 'ci-sub', textContent: T('ins.nocommon', 'No common property') }));
			return root;
		}
		if (names.some((n) => items.some((i) => String(i[n]) != String(items[0][n])))) {
			root.append(_el('div', { className: 'ci-sub', textContent: T('ins.mixed', 'Different values: the first element is shown') }));
		}
		if ('opacity' in proxy) {
			root.append(section('appearance', T('ins.appearance'), (body) => {
				body.append(sliderRow(T('ins.opacity'), Math.round(proxy.opacity * 100), 0, 100, (v) => apply(() => { proxy.opacity = v / 100; })));
				if ('blendingMode' in proxy) {
					const blends = Object.keys(_NS.DrawingElements.BLENDING || {});
					const sel = _el('select', {}, blends.map((n) => _el('option', { value: n, textContent: n, selected: n == proxy.blendingMode })));
					sel.onchange = () => apply(() => { proxy.blendingMode = sel.value; });
					body.append(_el('div', { className: 'ci-sub', textContent: T('ins.blending') }), sel);
				}
			}));
		}
		if (('fill' in proxy) || ('stroke' in proxy)) {
			root.append(section('style', T('ins.style'), (body) => {
				if ('fill' in proxy) {
					body.append(_el('div', { className: 'ci-sub', textContent: T('ins.fills') }), colorRow({
						get: () => proxy.fill, set: (v) => { proxy.fill = v; }, apply,
						getOpacity: ('fillOpacity' in proxy) ? () => (typeof proxy.fillOpacity == 'number' ? proxy.fillOpacity : 1) : null,
						setOpacity: ('fillOpacity' in proxy) ? (v) => { proxy.fillOpacity = v; } : null
					}));
				}
				if ('stroke' in proxy) {
					body.append(_el('div', { className: 'ci-sub', textContent: T('ins.borders') }), colorRow({
						get: () => proxy.stroke, set: (v) => { proxy.stroke = v; }, apply,
						getOpacity: ('strokeOpacity' in proxy) ? () => (typeof proxy.strokeOpacity == 'number' ? proxy.strokeOpacity : 1) : null,
						setOpacity: ('strokeOpacity' in proxy) ? (v) => { proxy.strokeOpacity = v; } : null
					}));
					if ('strokeWidth' in proxy) {
						body.append(_el('div', { className: 'ci-row' }, [_el('label', { textContent: T('ins.width') }),
							_el('div', { className: 'ci-field ci-w90' }, [numInput(proxy.strokeWidth, (v) => apply(() => { proxy.strokeWidth = v; }), { min: 0, step: 0.5 }), _el('span', { textContent: 'px' })])]));
					}
				}
			}));
		}
		return root;
	}
	/** a document identifier: a name not used by another document of the scene */
	function validDocumentId(editor, doc, id) {
		return /^[A-Za-z_][\w.\-]*$/.test(id) && !editor.documents.some((d) => d !== doc && d.id == id);
	}
	function documentPanel(editor, doc) {
		const root = _el('div', { className: 'ci-root' });
		const resize = () => editor.resizeCanvas(true);
		root.append(_el('div', { className: 'ci-title', textContent: T('ins.document') }));
		const idInput = _el('input', { type: 'text', value: doc.id || '', title: T('doc.id') });
		idInput.onchange = () => {
			const v = idInput.value.trim();
			if (v == doc.id) { return; }
			if (!validDocumentId(editor, doc, v)) {
				_NS.gui.notify.Show(editor, T('doc.id.invalid'));
				idInput.value = doc.id;
				return;
			}
			doc.id = v;
			editor.refresh();
			editor.raiseEvent('currentDocumentChanged', { old: doc, current: doc }); // the status bar and the explorer show the new id
		};
		root.append(idInput, _el('div', { className: 'ci-sp6' }));
		const title = _el('input', { type: 'text', value: doc.title || '', placeholder: T('doc.name') });
		title.onchange = () => { doc.title = title.value; editor.refresh(); };
		root.append(title);
		root.append(_el('div', { className: 'ci-sp10' }));
		// the size of a document is at least 1: 0 keeps the current size
		const wi = numInput(doc.width, (v) => { doc.setSize(v, doc.height); resize(); }, { min: 1 });
		const hi = numInput(doc.height, (v) => { doc.setSize(doc.width, v); resize(); }, { min: 1 });
		wi.addEventListener('change', () => { wi.value = doc.width; });
		hi.addEventListener('change', () => { hi.value = doc.height; });
		root.append(_el('div', { className: 'ci-grid' }, [field('W', wi), field('H', hi)]));
		// background color of the document (the first color row), then the column guides with their own color row
		root.append(_el('div', { className: 'ci-sp6' }), _el('div', { className: 'ci-sub', textContent: T('doc.background.color') }), colorRow({
			get: () => doc.fill, set: (v) => { doc.fill = v; }, apply: (fn) => { fn(); editor.refresh(); }
		}));
		// column guides (1 - 12 equal columns, like igk-col-12-N)
		const ci = numInput(doc.columns, (v) => { doc.columns = v; editor.refresh(); }, { min: 1, max: 12 });
		ci.addEventListener('change', () => { ci.value = doc.columns; });
		const gi = numInput(doc.columnGap, (v) => { doc.columnGap = v; editor.refresh(); }, { min: 0, max: 200 });
		gi.addEventListener('change', () => { gi.value = doc.columnGap; });
		if (!doc.columnColor || doc.columnColor == 'none' || doc.columnColor == 'transparent') { doc.columnColor = 'rgba(161, 79, 208, 0.15)'; } // the row has no own switch any more
		// one switch for the grid: it also enables the color, columns and gutter
		const colors = colorRow({ noToggle: true, get: () => doc.columnColor, set: (v) => { doc.columnColor = v; }, defaultColor: 'rgba(161, 79, 208, 0.15)', apply: (fn) => { fn(); editor.refresh(); } });
		const grid = _el('div', { className: 'ci-grid' }, [field(T('ins.columns'), ci), field(T('ins.gap'), gi)]);
		const cs = _el('input', { type: 'checkbox', checked: doc.showColumns, title: T('doc.columns.show') });
		const syncGrid = () => {
			[colors, grid].forEach((r) => {
				r.classList.toggle('ci-off', !cs.checked);
				r.querySelectorAll('input,button').forEach((e) => { e.disabled = !cs.checked; });
			});
		};
		cs.onchange = () => { doc.showColumns = cs.checked; syncGrid(); editor.refresh(); };
		syncGrid();
		// the grid options together: switch, color, then columns and gutter
		root.append(_el('div', { className: 'ci-sp6' }),
			_el('label', { className: 'ci-chk' }, [cs, _el('span', { textContent: T('doc.columns.show') })]),
			_el('div', { className: 'ci-sub', textContent: T('doc.columns.color') }),
			colors,
			grid);
		if (doc.kind == 'page' && _NS.pageDesigner) { root.append(_NS.pageDesigner.build(editor, doc)); } // web page design mode
		return root;
	}
	/** build the inspector content for the current selection */
	function build(editor) {
		const el = editor.element || (editor.tool && editor.tool.elem) || null;
		// several elements selected (selection tool): the properties they have in common
		if (el && el.type === 2 && el.items && el.items.length > 1) { return multiPanel(editor, Array.prototype.slice.call(el.items)); }
		if (el && el['@container']) { return elementPanel(editor, el); }
		if (editor.document) { return documentPanel(editor, editor.document); }
		return _el('div', { className: 'ci-root' }, [_el('div', { className: 'ci-title', textContent: T('prop.nodoc') })]);
	}
	_NS.inspector = { colorRow, build, openPicker, closePicker, parseColor, toHex, toCss, validDocumentId, numInput, field };
})();
