// author: C.A.D. BONDJE DOUE
// file: BrushEditor.js
// @desc: fill type selector (solid, linear, radial, texture, brushes of the library) and the editor of a brush
// (color stops, geometry, texture) shown in the Fills row of the property inspector.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;
	const B = () => _NS.brushes;
	const I = () => _NS.inspector;
	const TEXTURE_SIDE = 96; // textures are downscaled: the options of the user are small
	const CSS = '.be-bar{position:relative;height:18px;border-radius:9px;margin:12px 6px 14px;cursor:copy;border:1px solid var(--ci-line,#4a4a4a)}' +
		'.be-stop{position:absolute;top:-4px;width:14px;height:24px;margin-left:-7px;border:2px solid #fff;border-radius:4px;padding:0;cursor:ew-resize;box-shadow:0 0 0 1px rgba(0,0,0,.6)}' +
		'.be-stop.on{border-color:var(--ci-accent,#a14fd0);box-shadow:0 0 0 2px var(--ci-accent,#a14fd0)}' +
		'.be-row{display:flex;gap:8px;align-items:center;margin:6px 0}.be-row>label{width:70px;flex:none}' +
		'.be-tag{font-size:10px;opacity:.6;margin-left:6px}.be-note{font-size:11px;color:#f0b429;margin:4px 0}' +
		'.be-tex{width:44px;height:44px;border:1px solid var(--ci-line,#4a4a4a);border-radius:5px;background-size:cover;flex:none}';
	const selectedStop = {}; // brush id => selected stop index
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	}
	function _css() {
		if (!document.getElementById('cancas-brush-css')) {
			document.head.append(_el('style', { id: 'cancas-brush-css', textContent: CSS }));
		}
	}
	const typeOf = (fill) => {
		if (B().isRef(fill)) { const d = B().get(B().idOf(fill)); return d ? d.type : 'solid'; }
		return 'solid';
	};
	const label = (d) => d.name || (T('brush.type.' + d.type) + ' ' + d.id.substr(1, 4));
	/** a downscaled data url of an image file */
	function toTexture(file) {
		return new Promise((res, rej) => {
			const img = new Image();
			img.onload = () => {
				const k = Math.min(1, TEXTURE_SIDE / Math.max(img.width, img.height));
				const c = document.createElement('canvas');
				c.width = Math.max(1, Math.round(img.width * k));
				c.height = Math.max(1, Math.round(img.height * k));
				c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
				res(file.type == 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.6));
			};
			img.onerror = rej;
			img.src = URL.createObjectURL(file);
		});
	}
	const cssStops = (def) => def.stops.map((s) => s.c + ' ' + Math.round(s.o * 100) + '%').join(', ');
	/** the editor of one brush */
	function brushPanel(editor, el, prop, id, apply, rebuild) {
		const def = B().get(id);
		const root = _el('div');
		const upd = (patch) => B().update(id, patch);
		const pct = (v) => Math.round(v * 1000) / 10;
		// ---- name and sharing
		const nm = _el('input', { type: 'text', value: def.name, placeholder: T('brush.name') });
		nm.onchange = () => upd({ name: nm.value.trim() });
		const detach = _el('button', { type: 'button', textContent: T('brush.detach'), title: T('brush.detach') });
		detach.onclick = () => { const n = B().copy(id); apply(() => { el[prop] = B().ref(n); }); rebuild(); };
		root.append(_el('div', { className: 'be-row' }, [_el('label', { textContent: T('brush.shared') }), nm]), _el('div', { className: 'be-row' }, [detach]));
		if (def.type == 'texture') {
			const prev = _el('div', { className: 'be-tex' });
			if (def.image) { prev.style.backgroundImage = 'url(' + def.image + ')'; }
			const file = _el('input', { type: 'file', accept: 'image/*' });
			file.style.display = 'none';
			const choose = _el('button', { type: 'button', textContent: T('brush.texture.choose') });
			choose.onclick = () => file.click();
			file.onchange = async () => {
				if (!file.files[0]) { return; }
				try { upd({ image: await toTexture(file.files[0]) }); rebuild(); } catch (e) { console.error(e); }
			};
			root.append(_el('div', { className: 'be-row' }, [prev, choose, file]));
			if (def.image && !B().fitsServer(B().get(id))) { root.append(_el('div', { className: 'be-note', textContent: T('brush.texture.toolarge') })); }
			const sc = I().numInput(def.scale, (v) => upd({ scale: v }), { step: 0.1, min: 0.05 });
			const rep = _el('select', {}, ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'].map((r) => _el('option', { value: r, textContent: T('brush.repeat.' + r), selected: r == def.repeat })));
			rep.onchange = () => upd({ repeat: rep.value });
			root.append(_el('div', { className: 'be-row' }, [_el('label', { textContent: T('brush.scale') }), sc]), _el('div', { className: 'be-row' }, [_el('label', { textContent: T('brush.repeat') }), rep]));
			return root;
		}
		// ---- color stops
		const bar = _el('div', { className: 'be-bar' });
		const paintBar = () => { bar.style.background = 'linear-gradient(90deg, ' + cssStops(B().get(id)) + ')'; };
		paintBar();
		let sel = Math.min(selectedStop[id] || 0, def.stops.length - 1);
		const detail = _el('div', { className: 'be-row' });
		const stops = () => B().get(id).stops.map((s) => Object.assign({}, s));
		const drawDetail = () => {
			detail.textContent = '';
			const st = stops()[sel];
			const sw = _el('button', { type: 'button', className: 'ci-swatch' });
			sw.append(_el('i'));
			sw.firstChild.style.background = st.c;
			sw.onclick = () => {
				I().openPicker(sw, I().parseColor(st.c), (n) => {
					const l = stops();
					l[sel].c = I().toCss(n);
					sw.firstChild.style.background = l[sel].c;
					upd({ stops: l });
					paintBar();
					rebuildMarkers();
				});
			};
			const off = I().numInput(pct(st.o), (v) => { const l = stops(); l[sel].o = Math.min(100, Math.max(0, v)) / 100; upd({ stops: l }); paintBar(); rebuildMarkers(); }, { min: 0, max: 100, step: 1 });
			const del = _el('button', { type: 'button', className: 'ci-ico', title: T('brush.stop.remove') });
			del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
			del.disabled = stops().length <= 2;
			del.onclick = () => { const l = stops(); l.splice(sel, 1); sel = 0; selectedStop[id] = 0; upd({ stops: l }); rebuild(); };
			detail.append(sw, I().field('%', off), del);
		};
		const rebuildMarkers = () => {
			bar.textContent = '';
			stops().forEach((s, i) => {
				const m = _el('button', { type: 'button', className: 'be-stop' + (i == sel ? ' on' : '') });
				m.style.left = (s.o * 100) + '%';
				m.style.background = s.c;
				m.onpointerdown = (e) => {
					e.preventDefault();
					e.stopPropagation();
					sel = i;
					selectedStop[id] = i;
					m.setPointerCapture(e.pointerId);
					const r = bar.getBoundingClientRect();
					const mv = (ev) => {
						const l = stops();
						l[i].o = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
						upd({ stops: l });
						m.style.left = (l[i].o * 100) + '%';
						paintBar();
					};
					const up = () => { m.removeEventListener('pointermove', mv); m.removeEventListener('pointerup', up); rebuild(); };
					m.addEventListener('pointermove', mv);
					m.addEventListener('pointerup', up);
				};
				bar.append(m);
			});
			drawDetail();
		};
		bar.title = T('brush.stop.add');
		bar.onpointerdown = (e) => {
			if (e.target !== bar) { return; }
			const r = bar.getBoundingClientRect();
			const o = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
			const l = stops();
			const near = l.reduce((a, s) => (Math.abs(s.o - o) < Math.abs(a.o - o) ? s : a), l[0]); // a new stop starts with the color next to it
			l.push({ o, c: near.c });
			l.sort((a, b) => a.o - b.o);
			sel = l.findIndex((s) => s.o == o);
			selectedStop[id] = sel;
			upd({ stops: l });
			rebuild();
		};
		root.append(bar, detail);
		rebuildMarkers();
		// ---- geometry (fractions of the bound, in %): also editable with the handles on the canvas
		const g = (title, v, f) => I().field(title, I().numInput(pct(v), (n) => upd(f(n / 100)), { step: 1 }));
		const grid = _el('div', { className: 'ci-grid', style: 'margin-top:10px' });
		if (def.type == 'radial') {
			grid.append(
				g('X', def.center.x, (n) => ({ center: { x: n, y: B().get(id).center.y } })),
				g('Y', def.center.y, (n) => ({ center: { x: B().get(id).center.x, y: n } })),
				g('r0', def.r0, (n) => ({ r0: n })),
				g('r1', def.r1, (n) => ({ r1: n })));
		} else {
			grid.append(
				g('x1', def.p1.x, (n) => ({ p1: { x: n, y: B().get(id).p1.y } })),
				g('y1', def.p1.y, (n) => ({ p1: { x: B().get(id).p1.x, y: n } })),
				g('x2', def.p2.x, (n) => ({ p2: { x: n, y: B().get(id).p2.y } })),
				g('y2', def.p2.y, (n) => ({ p2: { x: B().get(id).p2.x, y: n } })));
		}
		root.append(grid);
		return root;
	}
	/**
	 * fill type selector + brush editor of an element property
	 * @param {*} editor
	 * @param {*} el
	 * @param {string} prop 'fill'
	 * @param {Function} apply inspector apply(fn)
	 * @param {Function} rebuild redraw the inspector
	 * @returns {HTMLElement}
	 */
	function build(editor, el, prop, apply, rebuild) {
		_css();
		const root = _el('div');
		const cur = el[prop];
		const type = typeOf(cur);
		const sel = _el('select');
		['solid', 'linear', 'radial', 'texture'].forEach((t) => sel.append(_el('option', { value: t, textContent: T('brush.type.' + t), selected: t == type && !B().isRef(cur) || (B().isRef(cur) && false) })));
		const lib = B().list();
		if (lib.length > 0) {
			const og = _el('optgroup', { label: T('brush.library') });
			lib.forEach((d) => og.append(_el('option', { value: 'lib:' + d.id, textContent: label(d), selected: B().isRef(cur) && B().idOf(cur) == d.id })));
			sel.append(og);
		}
		// a brush of the library is shown as its entry in the library group
		if (B().isRef(cur) && B().get(B().idOf(cur))) { sel.value = 'lib:' + B().idOf(cur); }
		sel.onchange = () => {
			const v = sel.value;
			if (v.indexOf('lib:') == 0) { apply(() => { el[prop] = B().ref(v.substr(4)); }); rebuild(); return; }
			if (v == 'solid') {
				const d = B().isRef(cur) ? B().get(B().idOf(cur)) : null;
				apply(() => { el[prop] = d ? d.stops[0].c : (typeof cur == 'string' && cur ? cur : '#cccccc'); });
				rebuild();
				return;
			}
			if (B().isRef(cur)) {
				// the brush changes of type: it is shared, use "make a copy" first to keep the others as they are
				const d = B().get(B().idOf(cur));
				B().update(d.id, { type: v });
				rebuild();
				return;
			}
			const base = (typeof cur == 'string' && cur && cur != 'none' && cur != 'transparent') ? cur : '#ffffff';
			const id = B().create({ type: v, stops: [{ o: 0, c: base }, { o: 1, c: '#000000' }] });
			apply(() => { el[prop] = B().ref(id); });
			rebuild();
		};
		root.append(_el('div', { className: 'ci-row' }, [_el('label', { textContent: T('ins.filltype') }), sel]));
		if (B().isRef(cur) && B().get(B().idOf(cur))) {
			root.append(brushPanel(editor, el, prop, B().idOf(cur), apply, rebuild));
		}
		return root;
	}
	const NO_BRUSH = ['image', 'video', 'htmlnode', 'linearbrush', 'radialbrush', 'layer', 'use', 'document'];
	_NS.brushEditor = { build, canBrush: (el) => NO_BRUSH.indexOf(el.getType()) == -1 };
})();
