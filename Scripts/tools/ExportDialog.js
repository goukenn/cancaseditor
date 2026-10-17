// author: C.A.D. BONDJE DOUE
// file: ExportDialog.js
// @desc: File > Export to... > Export...: one dialog to pick the project name and the export file type,
// instead of hunting through the individual Export to... entries (those stay as they are, for quick access).
// The project name typed here is saved as editor.title (see .cancaseditor.js getProjectName/exportTo, and
// Present mode's title bar, tools/PresentMode.js) and used to name every export, including this one.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;

	// value: either a visitors[] key for editor.exportTo(type), or a function(editor) for a custom exporter
	const TYPES = [
		{ value: 'xml', label: () => T('file.export.toXml', 'Xml') },
		{ value: 'svg', label: () => T('file.export.toSvg', 'Svg') },
		{ value: 'png', label: () => T('file.export.toPng', 'Png') },
		{ value: 'jpeg', label: () => T('file.export.toJPeg', 'Jpeg') },
		{ value: 'html', label: () => T('file.export.toHtml', 'Html') },
		{ value: 'phtml', label: () => T('file.export.toPhtml', 'Balafon view (.phtml)') },
		{ value: 'bview', label: () => T('file.export.toBview', 'Balafon view (.bview)') },
		{ value: 'canvas', label: () => T('file.export.toCancasExpression', 'Javascript canvas expression') },
		{ value: 'pptx', label: () => T('file.export.toPptx', 'PowerPoint (.pptx)') }
	];

	function showExportDialog(editor) {
		const row = (t, el) => {
			const r = document.createElement('label');
			r.style.cssText = 'display:flex;gap:8px;align-items:center;margin:8px 0';
			const s = document.createElement('span');
			s.textContent = t; s.style.cssText = 'min-width:110px';
			r.append(s, el);
			return r;
		};
		const name = document.createElement('input');
		name.type = 'text';
		name.value = editor.title || '';
		name.placeholder = T('export.placeholder', 'Untitled project');
		name.style.cssText = 'flex:1';
		const type = document.createElement('select');
		type.style.cssText = 'flex:1';
		TYPES.forEach((t) => { const o = document.createElement('option'); o.value = t.value; o.textContent = t.label(); type.append(o); });

		const body = document.createElement('div');
		body.append(row(T('export.projectName', 'Project name'), name), row(T('export.type', 'File type'), type));

		_NS.ui.modal({
			title: T('export.title', 'Export'), content: body,
			buttons: [
				{ text: T('lay.cancel', 'Cancel'), onclick: (close) => close() },
				{
					text: T('export.go', 'Export'), primary: true, onclick: (close) => {
						close();
						editor.title = name.value.trim(); // persists the project name regardless of the chosen type
						if (type.value == 'pptx') {
							if (_NS.pptxExport) { _NS.pptxExport.exportPptx(editor); }
						} else if (type.value == 'xml') {
							editor.saveToXML(); // the xml visitor doesn't name/extension itself (see File > Export to... > Xml)
						} else {
							editor.exportTo(type.value);
						}
					}
				}
			]
		});
	}

	AC.regMenuAction('file.export.dialog', { index: -10, callback: (a) => showExportDialog(a) });
})();
