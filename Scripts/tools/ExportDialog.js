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

	/** every "file.export.<suffix>" menu action with a callback (this dialog's own entry excluded): picking
	 * one here just invokes that action's own callback, so the list can never go stale or miss a format —
	 * whatever File > Export to... offers, this offers too, including CSS and Sketch (their own dialogs). */
	function exportActions() {
		const tab = AC.getMenuActions();
		return Object.keys(tab)
			.filter((k) => k.indexOf('file.export.') === 0 && k !== 'file.export.dialog' && typeof tab[k].callback == 'function')
			.sort((a, b) => (tab[a].index || 0) - (tab[b].index || 0))
			.map((k) => ({ name: k, action: tab[k] }));
	}

	function showExportDialog(editor) {
		const row = (t, el) => {
			const r = document.createElement('label');
			r.className = 'ce-form-row';
			const s = document.createElement('span');
			s.textContent = t; s.className = 'ce-form-lbl ce-wide';
			r.append(s, el);
			return r;
		};
		const name = document.createElement('input');
		name.type = 'text';
		name.value = editor.title || '';
		name.placeholder = T('export.placeholder', 'Untitled project');
		name.className = 'ce-flex1';
		const entries = exportActions();
		const type = document.createElement('select');
		type.className = 'ce-flex1';
		entries.forEach((en, i) => { const o = document.createElement('option'); o.value = i; o.textContent = T(en.name, en.name); type.append(o); });

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
						const en = entries[+type.value];
						if (en) { en.action.callback(editor); }
					}
				}
			]
		});
	}

	AC.regMenuAction('file.export.dialog', { index: -10, callback: (a) => showExportDialog(a) });
})();
