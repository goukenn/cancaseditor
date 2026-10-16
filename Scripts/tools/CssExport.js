// author: C.A.D. BONDJE DOUE
// file: CssExport.js
// @desc: File > Export to > CSS...: the styling of the selected element as a CSS rule, with an optional transition,
// a hover state and a @keyframes animation of some properties (opacity, transform, filter). The CSS is shown live in
// the dialog; it can be copied or downloaded.
//   target "html": the element as a box (width / height, background, border, border-radius, box-shadow, ...)
//   target "svg" : the properties of an SVG shape (fill, stroke, stroke-width, filter drop-shadow, ...)
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;
	const EASINGS = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'steps(4)'];
	const num = (v) => { v = Number(v); return isNaN(v) ? 0 : v; };
	const n2 = (v) => String(Math.round(num(v) * 100) / 100);
	const px = (v) => n2(v) + 'px';
	const ident = (id) => String(id || 'element').replace(/[^A-Za-z0-9_-]/g, '-').replace(/^(\d)/, '_$1');
	const isTransparent = (c) => !c || c == 'none' || c == 'transparent' || c == 'rgba(0, 0, 0, 0)';
	/** the single selected element */
	function selected(editor) {
		const t = editor.tool, e = t && t.elem;
		if (e && e.type !== 2) { return e; }
		return editor.element && editor.element['@container'] ? editor.element : null;
	}
	/** css value of a fill (colour, gradient or texture of a brush) */
	function paint(v, b, notes) {
		const B = _NS.brushes;
		if (!(B && B.isRef(v))) { return v; }
		const def = B.get(B.idOf(v));
		if (!def) { return null; }
		const stops = (def.stops || []).map((s) => s.c + ' ' + n2(s.o * 100) + '%').join(', ');
		if (def.type == 'radial') {
			return 'radial-gradient(circle at ' + n2(def.center.x * 100) + '% ' + n2(def.center.y * 100) + '%, ' + stops + ')';
		}
		if (def.type == 'texture') {
			const src = B.textureSource(def);
			notes.push('texture: repeat ' + def.repeat + (def.mode == 'bound' ? ', stretched to the box' : ''));
			return 'url(' + src + ')';
		}
		const dx = (def.p2.x - def.p1.x) * b.width, dy = (def.p2.y - def.p1.y) * b.height;
		return 'linear-gradient(' + n2(Math.atan2(dy, dx) * 180 / Math.PI + 90) + 'deg, ' + stops + ')';
	}
	/** the linear part of the matrix (the position is not exported) */
	function matrixCss(el) {
		const m = el.matrix && el.matrix.element;
		if (!m || (m[0] == 1 && m[1] == 0 && m[2] == 0 && m[3] == 1)) { return ''; }
		return 'matrix(' + [m[0], m[1], m[2], m[3], 0, 0].map((x) => String(Math.round(x * 10000) / 10000)).join(', ') + ')';
	}
	/** the rule of the element: [[property, value]] and notes */
	function declarations(el, target) {
		const d = [], notes = [];
		const t = el.getType();
		let b = el.bound;
		if (Array.isArray(b)) { b = b[0]; }
		if (!b || typeof b.width != 'number') { b = { x: 0, y: 0, width: 100, height: 100 }; }
		const shadows = (el.activeShadows ? el.activeShadows() : []).map((s) => ({ x: s.x, y: s.y, blur: s.blur, color: s.color }));
		const fill = el.fill, stroke = el.stroke, sw = num(el.strokeWidth);
		let w = b.width, h = b.height;
		if (t == 'circle' && typeof el.radius == 'number') { w = h = el.radius * 2; }
		if (t == 'ellipse' && el.radius && typeof el.radius.x == 'number') { w = el.radius.x * 2; h = el.radius.y * 2; }
		if (target == 'html') {
			d.push(['width', px(w)], ['height', px(h)], ['box-sizing', 'border-box']);
			if (t == 'circle' || t == 'ellipse') { d.push(['border-radius', '50%']); }
			else if (t == 'roundrect' && typeof el.radius == 'number') { d.push(['border-radius', px(el.radius)]); }
			else if (t != 'rectangle' && t != 'image' && t != 'text') { notes.push(t + ': only the box is exported'); }
			if (!isTransparent(fill)) {
				const p = paint(fill, b, notes);
				if (p) {
					d.push([/gradient|url\(/.test(p) ?
						'background' : 'background-color', p]
					);
				}
			}
			if (!isTransparent(stroke) && sw > 0) { d.push(['border', px(sw) + ' solid ' + stroke]); }
			if (shadows.length) { d.push(['box-shadow', shadows.map((s) => px(s.x) + ' ' + px(s.y) + ' ' + px(s.blur) + ' ' + s.color).join(', ')]); }
			if (el.filter) { d.push(['filter', el.filter]); }
		} else {
			if (!isTransparent(fill)) {
				const p = paint(fill, b, notes);
				if (p && /gradient|url\(/.test(p)) { notes.push('gradient / texture fill: define it as an SVG <linearGradient> or <pattern>'); } else if (p) { d.push(['fill', p]); }
			} else { d.push(['fill', 'none']); }
			if (!isTransparent(stroke)) { d.push(['stroke', stroke], ['stroke-width', n2(sw)]); }
			const f = [el.filter && String(el.filter)].concat(shadows.map((s) => 'drop-shadow(' + px(s.x) + ' ' + px(s.y) + ' ' + px(s.blur) + ' ' + s.color + ')')).filter(Boolean);
			if (f.length) { d.push(['filter', f.join(' ')]); }
		}
		if (typeof el.opacity == 'number' && el.opacity < 1) { d.push(['opacity', n2(el.opacity)]); }
		if (el.blendingMode && el.blendingMode != 'source-over' && target == 'html') { d.push(['mix-blend-mode', el.blendingMode.replace('source-over', 'normal')]); }
		const mx = matrixCss(el);
		if (mx) { d.push(['transform', mx]); }
		return { d, notes };
	}
	/** a state (hover / keyframe) from its fields: {opacity, scale, rotate, tx, ty, filter}, empty fields are ignored */
	function stateCss(base, s) {
		const out = [];
		if (s.opacity !== '' && s.opacity != null) { out.push(['opacity', n2(Math.max(0, Math.min(1, num(s.opacity))))]); }
		const tr = [];
		if (s.tx !== '' || s.ty !== '') { tr.push('translate(' + px(s.tx) + ', ' + px(s.ty) + ')'); }
		if (s.rotate !== '') { tr.push('rotate(' + n2(s.rotate) + 'deg)'); }
		if (s.scale !== '') { tr.push('scale(' + n2(s.scale) + ')'); }
		if (tr.length) { out.push(['transform', (base ? base + ' ' : '') + tr.join(' ')]); }
		if (s.filter) { out.push(['filter', s.filter]); }
		return out;
	}
	const block = (sel, decls, indent) => {
		const i = indent || '';
		return i + sel + ' {\n' + decls.map(([p, v]) => i + '  ' + p + ': ' + v + ';').join('\n') + '\n' + i + '}';
	};
	/** the whole CSS text for the options of the dialog */
	function buildCss(el, o) {
		const sel = '.' + ident(o.selector);
		const { d, notes } = declarations(el, o.target);
		const base = (d.find((x) => x[0] == 'transform') || [])[1] || '';
		const parts = [];
		const all = d.slice();
		if (o.transition.on && o.transition.props.length) {
			all.push(['transition', o.transition.props.map((p) => p + ' ' + n2(o.transition.duration) + 's ' + o.transition.easing + ' ' + n2(o.transition.delay) + 's').join(', ')]);
		}
		if (o.anim.on) {
			all.push(['animation', ident(o.anim.name) + ' ' + n2(o.anim.duration) + 's ' + o.anim.easing + ' ' + n2(o.anim.delay) + 's ' + (o.anim.iterations || 'infinite') + ' ' + o.anim.direction]);
		}
		if (o.target == 'svg' && base) { all.push(['transform-box', 'fill-box'], ['transform-origin', 'center']); }
		parts.push((notes.length ? notes.map((n) => '/* ' + n + ' */').join('\n') + '\n' : '') + block(sel, all));
		if (o.hover.on) {
			const st = stateCss(base, o.hover);
			if (st.length) { parts.push(block(sel + ':hover', st)); }
		}
		if (o.anim.on) {
			// the start of the animation is the element itself for the properties the "from" fields leave empty
			const from = stateCss(base, o.anim.from), to = stateCss(base, o.anim.to);
			d.filter((x) => ['opacity', 'transform', 'filter'].indexOf(x[0]) != -1).forEach((x) => { if (!from.some((y) => y[0] == x[0])) { from.push(x); } });
			parts.push('@keyframes ' + ident(o.anim.name) + ' {\n' + block('from', from.length ? from : [['opacity', '1']], '  ') + '\n' + block('to', to.length ? to : [['opacity', '1']], '  ') + '\n}');
		}
		return parts.join('\n\n') + '\n';
	}
	const el = (tag, props, children) => { const e = document.createElement(tag); Object.assign(e, props || {}); (children || []).forEach((c) => e.append(c)); return e; };
	const CSS = '.cancas-modal.cx-wide>div{width:min(1000px,96vw)}.cx-grid{display:flex;gap:14px;flex-wrap:wrap}.cx-form{flex:1 1 280px;min-width:0}.cx-out{flex:1 1 300px;min-width:0}' +
		'.cx-out textarea{width:100%;height:320px;box-sizing:border-box;font:12px/1.4 ui-monospace,Menlo,monospace;background:var(--cm-input,#111);color:var(--cm-fg,#eee);border:1px solid var(--cm-line,#444);border-radius:4px;padding:8px;resize:vertical}' +
		'.cx-sec{border:1px solid var(--cm-line,#444);border-radius:4px;padding:6px 8px;margin:0 0 8px}.cx-sec>legend{padding:0 4px;font-weight:bold}' +
		'.cx-row{display:flex;align-items:center;gap:6px;margin:4px 0}.cx-row>label{width:90px;flex:none;font-size:12px}.cx-row input[type=number]{width:64px}.cx-row input[type=text]{flex:1}' +
		'.cx-chk{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px}.cx-chk label{display:flex;align-items:center;gap:3px}';
	function showDialog(editor) {
		const target = selected(editor);
		if (!target) { _NS.gui.notify.Show(editor, T('msg.css.select')); return; }
		if (!document.getElementById('cancas-cssx-css')) { document.head.append(el('style', { id: 'cancas-cssx-css', textContent: CSS })); }
		const o = {
			selector: target.id, target: 'html',
			transition: { on: false, props: ['opacity', 'transform'], duration: 0.3, easing: 'ease', delay: 0 },
			hover: { on: false, opacity: '', scale: '1.1', rotate: '', tx: '', ty: '', filter: '' },
			anim: {
				on: false, name: 'anim-' + ident(target.id), duration: 1, easing: 'ease-in-out', delay: 0, iterations: 'infinite', direction: 'alternate',
				from: { opacity: '', scale: '', rotate: '', tx: '', ty: '', filter: '' }, to: { opacity: '0.4', scale: '1.2', rotate: '', tx: '', ty: '', filter: '' }
			}
		};
		const out = el('textarea', { readOnly: true, spellcheck: false });
		const refresh = () => { out.value = buildCss(target, o); };
		const input = (obj, key, type, extra) => {
			const i = el('input', Object.assign({ type: type || 'text', value: obj[key] }, extra || {}));
			i.oninput = () => { obj[key] = type == 'number' ? (i.value === '' ? 0 : Number(i.value)) : i.value; refresh(); };
			return i;
		};
		const select = (obj, key, values, label) => {
			const s = el('select', {}, values.map((v) => el('option', { value: v, textContent: label ? label(v) : v, selected: v == obj[key] })));
			s.onchange = () => { obj[key] = s.value; refresh(); };
			return s;
		};
		const check = (obj, key, text) => {
			const c = el('input', { type: 'checkbox', checked: !!obj[key] });
			c.onchange = () => { obj[key] = c.checked; refresh(); };
			return el('label', {}, [c, el('span', { textContent: text })]);
		};
		const row = (label, ...ctl) => el('div', { className: 'cx-row' }, [el('label', { textContent: label })].concat(ctl));
		const state = (obj) => [
			row(T('css.opacity'), input(obj, 'opacity', 'text', { placeholder: '0..1' })),
			row(T('css.scale'), input(obj, 'scale', 'text', { placeholder: '1' })),
			row(T('css.rotate'), input(obj, 'rotate', 'text', { placeholder: 'deg' })),
			row(T('css.translate'), input(obj, 'tx', 'text', { placeholder: 'x px' }), input(obj, 'ty', 'text', { placeholder: 'y px' })),
			row(T('css.filter'), input(obj, 'filter', 'text', { placeholder: 'blur(2px)' }))
		];
		const fs = (title, ...kids) => el('fieldset', { className: 'cx-sec' }, [el('legend', { textContent: title })].concat(kids));
		const tprops = el('div', { className: 'cx-chk' });
		const drawProps = () => {
			tprops.textContent = '';
			(o.target == 'html' ? ['opacity', 'transform', 'filter', 'background-color', 'border-color', 'box-shadow'] : ['opacity', 'transform', 'filter', 'fill', 'stroke']).forEach((p) => {
				const c = el('input', { type: 'checkbox', checked: o.transition.props.indexOf(p) != -1 });
				c.onchange = () => { o.transition.props = o.transition.props.filter((x) => x != p).concat(c.checked ? [p] : []); refresh(); };
				tprops.append(el('label', {}, [c, el('span', { textContent: p })]));
			});
		};
		const tg = select(o, 'target', ['html', 'svg'], (v) => T('css.target.' + v));
		const tgOld = tg.onchange;
		tg.onchange = () => { tgOld(); o.transition.props = o.transition.props.filter((p) => ['opacity', 'transform', 'filter'].indexOf(p) != -1); drawProps(); refresh(); };
		drawProps();
		const form = el('div', { className: 'cx-form' }, [
			fs(T('css.rule'), row(T('css.selector'), el('span', { textContent: '.' }), input(o, 'selector')), row(T('css.target'), tg)),
			fs(T('css.transition'), check(o.transition, 'on', T('css.enable')), tprops,
				row(T('css.duration'), input(o.transition, 'duration', 'number', { min: 0, step: 0.1 }), el('span', { textContent: 's' })),
				row(T('css.easing'), select(o.transition, 'easing', EASINGS)), row(T('css.delay'), input(o.transition, 'delay', 'number', { min: 0, step: 0.1 }), el('span', { textContent: 's' }))),
			fs(T('css.hover'), check(o.hover, 'on', T('css.enable')), ...state(o.hover)),
			fs(T('css.animation'), check(o.anim, 'on', T('css.enable')), row(T('css.name'), input(o.anim, 'name')),
				row(T('css.duration'), input(o.anim, 'duration', 'number', { min: 0.1, step: 0.1 }), el('span', { textContent: 's' })),
				row(T('css.easing'), select(o.anim, 'easing', EASINGS)),
				row(T('css.iterations'), input(o.anim, 'iterations', 'text', { placeholder: 'infinite' })),
				row(T('css.direction'), select(o.anim, 'direction', ['normal', 'alternate', 'reverse', 'alternate-reverse'])),
				el('div', { className: 'cx-sec', style: 'border:0;padding:0', innerHTML: '' }),
				el('b', { textContent: T('css.from') }), ...state(o.anim.from), el('b', { textContent: T('css.to') }), ...state(o.anim.to))
		]);
		const copy = el('button', { type: 'button', textContent: T('css.copy'), className: 'primary' });
		copy.onclick = async () => {
			try { await navigator.clipboard.writeText(out.value); } catch (e) { out.select(); document.execCommand('copy'); }
			_NS.gui.notify.Show(editor, T('css.copied'));
		};
		const save = el('button', { type: 'button', textContent: T('css.download') });
		save.onclick = () => igk.io.file.download('text/css', ident(o.selector) + '.css', out.value);
		refresh();
		_NS.ui.modal({ className: 'cx-wide', title: T('file.export.toCss').replace(/\.\.\.$/, ''), content: el('div', { className: 'cx-grid' }, [form, el('div', { className: 'cx-out' }, [out, el('div', { className: 'cx-row', style: 'margin-top:8px' }, [copy, save])])]) });
	}
	AC.regMenuAction('file.export.toCss', { index: 24, callback: (a) => showDialog(a) });
	_NS.cssExport = { buildCss, declarations };
})();