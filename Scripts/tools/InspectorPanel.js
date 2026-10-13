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
		'.ci-root button:not(.ci-ico):not(.ci-swatch):not(.be-stop){background:var(--ci-input);color:var(--ci-fg);border:1px solid var(--ci-line);border-radius:5px;padding:5px 10px;cursor:pointer;font:inherit}' +
		'.ci-root button:not(.ci-ico):not(.ci-swatch):not(.be-stop):hover{border-color:var(--ci-accent)}' +
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
		'.ci-pop-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.ci-pop-head .ci-ico{width:24px;height:24px}' +
		'.ci-pop h4{margin:0;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--ci-dim)}' +
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
		return _el('div', { className: 'ci-fill' }, [on, sw, hex, _el('div', { className: 'ci-field' }, [op, _el('span', { textContent: '%' })])]);
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
				lab.style.width = '100px';
				body.append(_el('div', { className: 'ci-row' }, [lab, ctl]));
			});
		});
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
			root.append(_el('div', { className: 'ci-pair', style: 'justify-content:flex-end;margin:-4px 0 6px' }, [...fits, lockBtn, flip(true), flip(false)]));
		}
		if (cornerRadius0(el)) {
			const b = hasBound(el) ? el.bound : { width: 200, height: 200 };
			root.append(sliderRow(T('ins.radius'), el.radius, 0, Math.max(10, Math.round(Math.min(b.width, b.height) / 2), Math.round(el.radius)), (v) => apply(() => { el.radius = v; })));
		}
		const skip = ['id', 'fill', 'stroke', 'strokeWidth', 'opacity', 'blendingMode'];
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
							_el('div', { className: 'ci-field', style: 'width:90px' }, [numInput(el.strokeWidth, (v) => apply(() => { el.strokeWidth = v; }), { min: 0, step: 0.5 }), _el('span', { textContent: 'px' })])]));
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
					body.append(_el('div', { className: 'ci-grid', style: 'margin-top:8px' }, [
						field('X', numInput(round2(sh.x), (v) => apply(() => { sh.x = v; }), { step: 1 })),
						field('Y', numInput(round2(sh.y), (v) => apply(() => { sh.y = v; }), { step: 1 })),
						field(T('ins.shadow.blur'), numInput(round2(sh.blur), (v) => apply(() => { sh.blur = Math.max(0, v); }), { min: 0, step: 1 }))]));
				});
				const add = _el('button', { type: 'button', textContent: '+ ' + T('ins.shadow.add') });
				add.style.marginTop = '6px';
				add.onclick = () => { apply(() => { el.shadows = el.shadows.concat([Object.assign({}, DEFAULT)]); }); rebuild(); };
				body.append(add);
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
		root.append(idInput, _el('div', { style: 'height:6px' }));
		const title = _el('input', { type: 'text', value: doc.title || '', placeholder: T('doc.name') });
		title.onchange = () => { doc.title = title.value; editor.refresh(); };
		root.append(title);
		root.append(_el('div', { style: 'height:10px' }));
		// the size of a document is at least 1: 0 keeps the current size
		const wi = numInput(doc.width, (v) => { doc.setSize(v, doc.height); resize(); }, { min: 1 });
		const hi = numInput(doc.height, (v) => { doc.setSize(doc.width, v); resize(); }, { min: 1 });
		wi.addEventListener('change', () => { wi.value = doc.width; });
		hi.addEventListener('change', () => { hi.value = doc.height; });
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
	_NS.inspector = { build, openPicker, closePicker, parseColor, toHex, toCss, validDocumentId, numInput, field };
})();
