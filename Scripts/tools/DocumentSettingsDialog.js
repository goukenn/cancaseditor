// author: C.A.D. BONDJE DOUE
// file: DocumentSettingsDialog.js
// @desc: settings of the current document: general (id, title, size, background) and layer compositing
// (visibility, blending mode, opacity of each layer).
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const R = () => _NS.R || {};
	const PRESETS = [
		['800x600', 800, 600], ['1024x768', 1024, 768], ['1280x720', 1280, 720],
		['1920x1080', 1920, 1080], ['A4 (96 dpi)', 794, 1123]
	];
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	}
	const row = (label, ...controls) => _el('div', { className: 'ce-row' }, [_el('label', { textContent: label }), ...controls]);
	/** any css color to #rrggbb (the color input only accepts this form) */
	function toHex(color) {
		const ctx = document.createElement('canvas').getContext('2d');
		ctx.fillStyle = '#000000';
		ctx.fillStyle = color;
		const v = ctx.fillStyle; // '#rrggbb' or 'rgba(...)'
		if (/^#[0-9a-f]{6}$/i.test(v)) { return v; }
		const m = /(\d+)\D+(\d+)\D+(\d+)/.exec(v);
		return m ? '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('') : '#ffffff';
	}
	/**
	 * show the document settings dialog
	 * @param {*} editor
	 * @param {string} [page] 'general' (default) or 'layers'
	 */
	function showDocumentSettings(editor, page) {
		const T = R();
		const doc = editor.document;
		if (!doc) {
			_NS.gui.notify.Show(editor, T['doc.nodoc']);
			return;
		}
		const transparent = doc.fill == 'transparent';
		const draft = {
			title: doc.title || '',
			width: doc.width,
			height: doc.height,
			background: !transparent,
			color: transparent ? '#ffffff' : toHex(doc.fill),
			layers: doc.getLayers().map((l) => ({
				layer: l, visible: l.visible, blendingMode: l.blendingMode, opacity: l.opacity
			}))
		};
		let current = editor.layer;
		const pages = {
			general() {
				const p = _el('div');
				const id = _el('input', { type: 'text', value: doc.id || '', disabled: true });
				const title = _el('input', { type: 'text', value: draft.title });
				title.onchange = () => { draft.title = title.value; };
				const w = _el('input', { type: 'number', min: 1, value: draft.width });
				const h = _el('input', { type: 'number', min: 1, value: draft.height });
				[w, h].forEach((i) => { i.style.width = '6em'; });
				const preset = _el('select', {}, [_el('option', { value: '', textContent: T['doc.preset.custom'] })]);
				PRESETS.forEach(([n, pw, ph]) => preset.append(_el('option', { value: pw + 'x' + ph, textContent: n })));
				const sync = () => {
					draft.width = Math.max(1, Math.floor(Number(w.value)) || draft.width);
					draft.height = Math.max(1, Math.floor(Number(h.value)) || draft.height);
					w.value = draft.width;
					h.value = draft.height;
					const k = draft.width + 'x' + draft.height;
					preset.value = PRESETS.some(([, pw, ph]) => pw + 'x' + ph == k) ? k : '';
				};
				w.onchange = h.onchange = sync;
				preset.onchange = () => {
					if (!preset.value) { return; }
					[w.value, h.value] = preset.value.split('x');
					sync();
				};
				sync();
				const bg = _el('input', { type: 'checkbox', checked: draft.background });
				const color = _el('input', { type: 'color', value: draft.color, disabled: !draft.background });
				bg.onchange = () => { draft.background = bg.checked; color.disabled = !bg.checked; };
				color.oninput = () => { draft.color = color.value; };
				p.append(
					row(T['doc.id'], id),
					row(T['doc.name'], title),
					row(T['doc.preset'], preset),
					row(T['doc.width'], w),
					row(T['doc.height'], h),
					row(T['doc.background.enable'], bg),
					row(T['doc.background.color'], color));
				return p;
			},
			layers() {
				const p = _el('div');
				if (draft.layers.length == 0) {
					p.append(_el('p', { textContent: T['doc.layer.none'] }));
					return p;
				}
				const blendings = Object.keys(_NS.DrawingElements.BLENDING);
				const heads = [];
				const mark = () => heads.forEach(([e, d]) => { e.textContent = d.layer.id + (d.layer === current ? ' \u2022 ' + T['doc.layer.current'] : ''); });
				// the top most layer first
				draft.layers.slice().reverse().forEach((d) => {
					const box = _el('div');
					box.style.cssText = 'border:1px solid var(--cm-line);border-radius:4px;padding:8px 12px;margin-bottom:10px';
					const title = _el('strong');
					heads.push([title, d]);
					const head = _el('div', {}, [title]);
					head.style.cursor = 'pointer';
					head.onclick = () => { current = d.layer; mark(); };
					const vis = _el('input', { type: 'checkbox', checked: d.visible });
					vis.onchange = () => { d.visible = vis.checked; };
					const blend = _el('select', {}, blendings.map((b) => _el('option', { value: b, textContent: b, selected: b == d.blendingMode })));
					blend.onchange = () => { d.blendingMode = blend.value; };
					const val = _el('span', { textContent: Math.round(d.opacity * 100) + '%' });
					val.style.width = '3em';
					const op = _el('input', { type: 'range', min: 0, max: 100, value: Math.round(d.opacity * 100) });
					op.oninput = () => { d.opacity = op.value / 100; val.textContent = op.value + '%'; };
					box.append(head, row(T['doc.layer.visible'], vis), row(T['doc.layer.blend'], blend), row(T['doc.layer.opacity'], op, val));
					p.append(box);
				});
				mark();
				return p;
			}
		};
		_NS.ui.sectionDialog({
			title: T['doc.title'],
			page: page,
			pages: [
				{ name: 'general', label: T['doc.general'], build: pages.general },
				{ name: 'layers', label: T['doc.layers'], build: pages.layers }],
			saveText: T['settings.save'],
			onSave(close) {
				doc.title = draft.title;
				doc.fill = draft.background ? draft.color : 'transparent';
				if (draft.width != doc.width || draft.height != doc.height) { doc.setSize(draft.width, draft.height); }
				draft.layers.forEach((d) => {
					d.layer.visible = d.visible;
					d.layer.blendingMode = d.blendingMode;
					d.layer.opacity = d.opacity;
				});
				if (current && current !== editor.layer) { editor.layer = current; }
				close();
				editor.resizeCanvas(true); // fits the document and redraws (the history records the change)
			}
		});
	}
	_NS.showDocumentSettings = showDocumentSettings;
})();
