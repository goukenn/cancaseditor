// author: C.A.D. BONDJE DOUE
// file: HtmlEditorTool.js
// @desc: visual (design mode) and source editing of html elements + insert menu.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const ELEM = _NS.DrawingElements;
	const R = () => _NS.R;
	let m_selected = null; // last selected htmlnode
	// remember the selected htmlnode
	const _bind = AC.bindEditor;
	AC.bindEditor = function (e) {
		_bind.apply(this, arguments);
		ELEM.htmlnode.editor = e;
		e.regEvent('selectChanged', function (ev) {
			const items = (ev && ev.items) || [];
			const n = items.filter((i) => i.getType && i.getType() == 'htmlnode').pop();
			if (n) {
				m_selected = n;
			}
		});
	};
	function _findHtmlNodes(editor) {
		const found = [];
		const q = [editor.list];
		let c;
		while ((c = q.pop())) {
			for (let i = 0; i < c.length; i++) {
				const e = c[i];
				if (e.getType && e.getType() == 'htmlnode') {
					found.push(e);
				}
				if (e.Elements && e.Elements.length > 0) {
					q.push(e.Elements);
				}
			}
		}
		return found;
	}
	function _target(editor) {
		if (m_selected && m_selected['@container']) {
			return m_selected;
		}
		return _findHtmlNodes(editor).pop() || null;
	}
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	}
	/**
	 * show the editor dialog
	 * @param {*} editor
	 * @param {string} html initial html
	 * @param {Function} onApply called with the new html
	 */
	function showDialog(editor, html, onApply) {
		const T = R();
		const frame = _el('iframe', { sandbox: 'allow-same-origin' }); // no script execution
		const area = _el('textarea', { spellcheck: false, value: html });
		const tabs = {};
		let mode = 'visual';
		const bodyHtml = () => frame.contentDocument ? frame.contentDocument.body.innerHTML : area.value;
		const loadFrame = (h) => {
			frame.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' + h + '</body></html>';
			frame.onload = () => { frame.contentDocument.designMode = 'on'; };
		};
		const sel = _el('input', { placeholder: T['html.prop.tag'] + ' / ' + T['html.prop.style'], title: T['html.prop.style'] });
		const show = (m) => {
			if (m == mode) { return; }
			if (m == 'source') { area.value = bodyHtml(); } else { loadFrame(area.value); }
			mode = m;
			frame.style.display = m == 'visual' ? '' : 'none';
			area.style.display = m == 'source' ? '' : 'none';
			props.style.display = m == 'visual' ? '' : 'none';
			Object.keys(tabs).forEach((k) => tabs[k].classList.toggle('on', k == m));
		};
		tabs.visual = _el('button', { textContent: T['editor.selectool.html'] || 'Visual', onclick: () => show('visual') });
		tabs.source = _el('button', { textContent: T['window.htmlSource'], onclick: () => show('source') });
		const close = () => { dlg.remove(); _NS.Actions.focusEditor(); };
		const apply = _el('button', {
			textContent: T['html.source.apply'], onclick: () => {
				const h = mode == 'visual' ? bodyHtml() : area.value;
				const r = ELEM.htmlnode.sanitize(h);
				onApply(r.html);
				close();
			}
		});
		const cancel = _el('button', { textContent: T['pageLayer.cancel'], onclick: close });
		// style of the selected element in visual mode (selection element = the node under the caret)
		sel.onchange = () => {
			const d = frame.contentDocument;
			const s = d && d.getSelection();
			let n = s && s.anchorNode;
			n = n && (n.nodeType == 3 ? n.parentElement : n);
			if (n && n != d.documentElement) { n.setAttribute('style', sel.value); }
		};
		const props = _el('div', { className: 'props' }, [_el('span', { textContent: T['html.prop.style'] }), sel]);
		const dlg = _el('div', { className: 'cancas-html-dlg' }, [_el('div', {}, [
			_el('div', { className: 'bar' }, [tabs.visual, tabs.source, _el('span', { className: 'sp' }), apply, cancel]),
			props, frame, area])]);
		document.body.append(dlg);
		tabs.visual.classList.add('on');
		area.style.display = 'none';
		loadFrame(html);
		frame.contentDocument; // keep reference alive
	}
	function _edit(editor) {
		ELEM.htmlnode.editor = editor;
		const n = _target(editor);
		if (!n) { return; }
		showDialog(editor, n.html, (h) => { n.html = h; editor.refresh(); });
	}
	function _insert(editor, snippet) {
		ELEM.htmlnode.editor = editor;
		let n = _target(editor);
		if (!n) {
			// no html document yet: start one
			_NS.encoder.html.openSource(editor, '');
			n = _target(editor);
		}
		n.html = n.html + snippet;
		m_selected = n;
		editor.refresh();
	}
	const SNIPPETS = {
		div: '<div style="padding:8px">...</div>',
		p: '<p>...</p>',
		img: '<img alt="" width="200" height="120" src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'120\'%3E%3Crect width=\'200\' height=\'120\' fill=\'%23ccc\'/%3E%3C/svg%3E"/>',
		a: '<a href="#">link</a>'
	};
	AC.regMenuAction("tools.html", { index: 50 });
	AC.regMenuAction("tools.html.select", { index: 0, callback: (a) => _edit(a) });
	let idx = 1;
	Object.keys(SNIPPETS).forEach((k) => {
		AC.regMenuAction("tools.html." + k, { index: idx++, callback: (a) => _insert(a, SNIPPETS[k]) });
	});
	AC.regMenuAction("window.htmlSource", { index: 10, callback: (a) => _edit(a) });
	AC.regMenuAction("file.newHtml", {
		index: 1, callback: (a) => {
			_NS.encoder.html.openSource(a, '<h1>...</h1>');
		}
	});
	_NS.htmlEditor = { showDialog };
})();
