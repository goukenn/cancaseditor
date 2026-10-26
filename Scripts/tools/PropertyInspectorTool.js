// author: C.A.D. BONDJE DOUE
// file: PropertyInspectorTool.js
// @desc: property inspector. Docked on the right of the canvas on wide screens,
// opened in a modal dialog (floating button) on small screens.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const SMALL_SCREEN = '(max-width: 710px)'; // IGK_CSS_SM_SCREEN of the core
	const PANEL_WIDTH = 280;
	const R = () => _NS.R || {};
	const mq = window.matchMedia(SMALL_SCREEN);
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	}
	function _selected(editor) {
		return editor.element || (editor.tool && editor.tool.elem) || null;
	}
	/** form of the document properties */
	function documentForm(editor, doc) {
		const T = R();
		const form = _el('div');
		const field = (label, value, type, apply) => {
			const input = _el('input', { type, value: value == null ? '' : value });
			input.className = 'ce-flex1';
			input.onchange = () => { apply(input.value); editor.resizeCanvas(true); };
			const row = _el('label', {}, [_el('span', { textContent: label }), input]);
			row.className = 'ce-pi-row';
			form.append(row);
		};
		field('id', doc.id, 'text', () => { }); // read only in practice
		form.querySelector('input').disabled = true;
		field(T['status.document'], doc.title, 'text', (v) => { doc.title = v; });
		const size = () => doc.setSize(
			Number(form.querySelectorAll('input')[2].value) || doc.width,
			Number(form.querySelectorAll('input')[3].value) || doc.height);
		field('width', doc.width, 'number', size);
		field('height', doc.height, 'number', size);
		return form;
	}
	/** design mode content (tools/InspectorPanel.js), the generic form when it fails */
	function buildContent(editor) {
		try {
			return _NS.inspector.build(editor);
		} catch (e) {
			console.error('inspector panel', e);
			return legacyContent(editor);
		}
	}
	/** generic property form of the selection */
	function legacyContent(editor) {
		const T = R();
		const root = _el('div');
		const el = _selected(editor);
		try {
			if (el && el['@container']) {
				root.append(_el('div', { textContent: el.getType() + ' #' + el.id, className: 'ci-title' }));
				root.append((new _NS.tools.EditElementSettingDialog(editor, el, T)).control.o);
				if (el.getType() == 'htmlnode' && _NS.htmlEditor) {
					const b = _el('button', { textContent: T['prop.html.edit'], className: 'igk-btn' });
					b.onclick = () => _NS.htmlEditor.showDialog(editor, el.html, (h) => { el.html = h; editor.refresh(); });
					root.append(b);
				}
			} else if (editor.document) {
				root.append(_el('div', { textContent: T['prop.noselection'], className: 'ci-title' }));
				root.append(documentForm(editor, editor.document));
			} else {
				root.append(_el('div', { textContent: T['prop.nodoc'], className: 'ci-title' }));
			}
		} catch (e) {
			console.error('property inspector', e);
		}
		return root;
	}
	let m_toggle = null;
	let m_isOpen = () => false; // the property panel is shown (docked, or in the modal on small screens)
	let m_showLayers = null;
	let m_tab = 'properties'; // 'properties' | 'layers'
	/** tab bar + the content of the current tab (properties of the selection | explorer of the scene) */
	function panelContent(editor, rerender) {
		const tabs = _el('div', { className: 'ci-tabs' });
		[['properties', 'ins.tab.properties'], ['layers', 'ins.tab.layers']].forEach(([n, k]) => {
			const b = _el('button', { type: 'button', textContent: R()[k] || k, className: m_tab == n ? 'on' : '' });
			b.onclick = () => { m_tab = n; rerender(); };
			tabs.append(b);
		});
		const root = _el('div');
		root.append(tabs, m_tab == 'layers' && _NS.layerExplorer ? _NS.layerExplorer.build(editor) : buildContent(editor));
		return root;
	}
	// the menu is built when the editor initializes: register at load time
	AC.regMenuAction("view.propertybox", { index: 0, checked: () => m_isOpen(), callback: () => m_toggle && m_toggle() });
	AC.regMenuAction("window.layers", { index: 5, callback: () => m_showLayers && m_showLayers() });
	function init(editor) {
		const host = editor.host.o;
		const panel = _el('div', { className: 'tool r ci-panel' });
		const head = _el('div', { className: 'ci-head' });
		const title = _el('span', { className: 'ci-head-title' });
		const closeBtn = _el('button', { textContent: '×', className: 'ci-close' });
		head.append(title, closeBtn);
		const body = _el('div', { className: 'ci-body' });
		panel.append(head, body);
		host.append(panel);
		// floating button for small screens
		const fab = _el('button', { className: 'ci-fab' });
		host.append(fab);
		const prefs = _NS.prefs;
		const isOpen = () => prefs ? prefs.get('panelOpen', true) : panel._open !== false;
		const setOpen = (v) => { if (prefs) { prefs.set('panelOpen', v); } else { panel._open = v; } layout(); };
		let scheduled = 0;
		let modalOpen = null;
		const render = () => {
			scheduled = 0;
			title.textContent = R()['prop.title'];
			fab.textContent = R()['prop.show'];
			if (panel.classList.contains('ci-visible')) {
				body.textContent = '';
				body.append(panelContent(editor, render));
			}
		};
		const schedule = () => { if (!scheduled) { scheduled = requestAnimationFrame(render); } };
		function layout(initial) {
			const small = mq.matches;
			const open = !small && isOpen();
			host.classList.toggle('ci-docked', open);
			panel.classList.toggle('ci-visible', open);
			fab.style.display = small ? '' : 'none';
			render();
			// at startup the restored view (zoom/pan of the document) must be kept
			editor.resizeCanvas(!initial);
		}
		function showModal() {
			if (modalOpen) { return; }
			const box = _el('div');
			const mount = () => { box.textContent = ''; box.append(panelContent(editor, mount)); };
			mount();
			modalOpen = _NS.ui.modal({
				title: R()['prop.title'], content: box,
				onclose: () => { modalOpen = null; }
			});
		}
		closeBtn.onclick = () => setOpen(false);
		fab.onclick = showModal;
		(mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(() => layout());
		['itemStartEdition', 'itemEndEdition', 'selectChanged', 'currentDocumentChanged', 'currentLayerChanged', 'elementAdded', 'elementRemoved', 'onLangChanged'].forEach((n) => {
			editor.regEvent(n, schedule);
		});
		_NS.lang && _NS.lang.listeners.push(schedule);
		prefs && prefs.onChange((what, name) => { if (what == 'server' || name == 'panelOpen') { layout(what == 'server'); } });
		m_isOpen = () => (mq.matches ? !!modalOpen : isOpen());
		m_toggle = () => { mq.matches ? showModal() : setOpen(!isOpen()); };
		m_showLayers = () => {
			m_tab = 'layers';
			if (mq.matches) { showModal(); } else if (!isOpen()) { setOpen(true); } else { render(); }
		};
		layout(true);
	}
	// let every tool script register before the editor is initialized
	_NS.whenEditor((editor) => setTimeout(() => init(editor), 0));
})();
