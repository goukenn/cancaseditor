// author: C.A.D. BONDJE DOUE
// file: StatusBarTool.js
// @desc: status bar (bottom bar of the editor): document, size, current tool, zoom, selection,
// cursor position, save state and language.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const R = () => _NS.R || {};
	function StatusBarTool() {
		_NS.Editor.Tool.apply(this);
		this.attachTo = function (host, editor) {
			this.host = host;
			this.editor = editor;
			const bar = document.createElement('span');
			bar.className = 'sb no-wrap';
			const seg = {};
			// name, label key, optional (hidden on small screens)
			[['doc', 'status.document', 0], ['size', 'status.size', 0], ['tool', 'status.tool', 0],
			['zoom', 'status.zoom', 0], ['sel', 'status.selection', 1], ['cursor', 'status.cursor', 1],
			['save', null, 1], ['lang', 'status.lang', 1]].forEach(([n, key, opt]) => {
				const e = document.createElement('span');
				e.className = 'sb-seg no-wrap sb-' + n + (opt ? ' sb-opt' : '');
				e.dataset.key = key || '';
				bar.append(e);
				seg[n] = e;
			});
			host.o.append(bar);
			const label = (seg_, value) => {
				const k = seg_.dataset.key;
				seg_.textContent = (k ? (R()[k] || k) + ': ' : '') + value;
			};
			const toolLabel = () => {
				const t = editor.tool;
				if (!t) { return R()['status.none']; }
				const key = String(t.name).toLowerCase().replace(/mecanism$/, '');
				const T = R();
				const full = Object.keys(T).find((k) => k.toLowerCase() == 'editor.selectool.' + key || k.toLowerCase() == 'tools.' + key);
				return full ? T[full] : t.name;
			};
			const update = () => {
				const T = R();
				const doc = editor.document;
				const size = editor.getDocumentSize();
				label(seg.doc, doc ? editor.getDocumentName() : T['status.none']);
				label(seg.size, doc ? size.w + ' × ' + size.h : T['status.none']);
				label(seg.tool, toolLabel());
				const m = editor.matrix;
				label(seg.zoom, Math.round(((m && m.d && m.d.zoom) || 1) * 100) + '%');
				const el = editor.element;
				label(seg.sel, el && el['@container'] ? el.getType() + ' #' + el.id : T['status.none']);
				const st = _NS.storage;
				seg.save.textContent = !st ? '' : (st.dirty ? T['status.unsaved'] :
					(st.lastSaved ? T['status.saved'] + ' ' + st.lastSaved.toLocaleTimeString() : ''));
				seg.save.classList.toggle('sb-warn', !!(st && st.dirty));
				label(seg.lang, ((_NS.lang && _NS.lang.current) || '').toUpperCase());
			};
			let scheduled = 0;
			const schedule = () => { if (!scheduled) { scheduled = requestAnimationFrame(() => { scheduled = 0; update(); }); } };
			['toolChanged', 'zoomChanged', 'zoomTypeChanged', 'currentDocumentChanged', 'itemStartEdition',
				'itemEndEdition', 'selectChanged', 'elementAdded', 'elementRemoved', 'titleChanged', 'onLangChanged'].forEach((n) => editor.on(n, schedule));
			// cursor position in document coordinates (zoom matrix: [a b c d tx ty])
			const canvas = editor.canvas.o;
			canvas.addEventListener('mousemove', (e) => {
				const m = editor.matrix && editor.matrix.element;
				if (!m || !m[0] || !m[3]) { return; }
				const r = canvas.getBoundingClientRect();
				const x = Math.round((e.clientX - r.left - m[4]) / m[0]);
				const y = Math.round((e.clientY - r.top - m[5]) / m[3]);
				label(seg.cursor, x + ', ' + y);
			});
			canvas.addEventListener('mouseleave', () => { seg.cursor.textContent = ''; });
			// storage and language are created by other tools: bind once everything is loaded
			// resources are loaded asynchronously
			_NS.lang && _NS.lang.listeners.push(schedule);
			setTimeout(() => {
				_NS.storage && _NS.storage.onChange.push(schedule);
				update();
			}, 0);
			update();
		};
	}
	_NS.Editor.regTool("Bottom", new StatusBarTool(), 3);
})();
