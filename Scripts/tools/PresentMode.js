// author: C.A.D. BONDJE DOUE
// file: PresentMode.js
// @desc: Present (prototyping): a fullscreen dialog that renders the current document and lets the user
// navigate from document to document following the prototype links (drawing2d/hotspot.js, document.js links
// drawn by tools/DocumentLinks.js). Two ways to move to another document:
//  - a hotspot element placed on the document: click / tap it to jump to its target
//  - a document-level link: a colored button for each outgoing link
// Touch, mouse and pen all work (pointer events); Escape closes, Left/Right arrows go back/forward.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;

	function hotspotsOf(doc) {
		const out = [];
		(function walk(c) {
			(c.Elements || []).forEach((el) => {
				if (el.getType && el.getType() == 'hotspot' && el.target) { out.push(el); }
				else if (igk.system.isInherit(el, _NS.DrawingElements.drawing2DContainer)) { walk(el); }
			});
		})(doc);
		return out;
	}
	const linksFrom = (editor, doc) => (editor.links || []).filter((l) => l.from === doc);

	/** render a single document at its own pixel size into a canvas (same technique as PNG export / print) */
	function renderDoc(doc, canvas) {
		const W = doc.width, H = doc.height;
		canvas.width = W; canvas.height = H;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, W, H);
		const o = new _NS.primitive(ctx);
		o.getDocumentSize = () => ({ w: W, h: H });
		doc.render(o);
	}

	function present(editor) {
		const start = editor.document;
		if (!start) { return; }
		const history = [start];
		let doc = start;

		const root = document.createElement('div');
		root.className = 'cancas-present';
				const canvas = document.createElement('canvas');
		canvas.className = 'cp-canvas';
		const stage = document.createElement('div');
		stage.className = 'cp-stage';
		const hotlayer = document.createElement('div');
		hotlayer.className = 'cp-hotlayer';
		stage.append(canvas, hotlayer);
		root.append(stage);

		// header bar: back (left) | project name, click to rename (center) | close (right)
		const header = document.createElement('div');
		header.className = 'cp-header';
		const closeBtn = document.createElement('button');
		closeBtn.type = 'button'; closeBtn.textContent = '✕';
		closeBtn.title = T('present.close', 'Close (Esc)');
		closeBtn.className = 'cp-btn';
		const backBtn = document.createElement('button');
		backBtn.type = 'button'; backBtn.textContent = '←';
		backBtn.title = T('present.back', 'Back');
		backBtn.className = 'cp-btn';
		backBtn.style.visibility = 'hidden'; // shown once there is a history
		const title = document.createElement('span');
		title.textContent = editor.getProjectName ? editor.getProjectName() : (editor.title || '');
		title.title = T('present.rename', 'Click to rename');
		title.className = 'cp-title';
		title.addEventListener('pointerup', (e) => { e.stopPropagation(); renameProject(); });
		header.append(backBtn, title, closeBtn);
		root.append(header);

		function renameProject() {
			const inp = document.createElement('input');
			inp.type = 'text';
			inp.value = editor.title || '';
			inp.placeholder = T('export.placeholder', 'Untitled project');
			inp.className = 'cp-title-edit';
			title.replaceWith(inp);
			// deferred: a native 'click' still follows this 'pointerup' and would otherwise collapse the selection
			setTimeout(() => { inp.focus(); inp.select(); }, 0);
			const commit = () => { editor.title = inp.value.trim(); inp.replaceWith(title); title.textContent = editor.getProjectName ? editor.getProjectName() : (editor.title || ''); };
			inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key == 'Enter') { inp.blur(); } else if (e.key == 'Escape') { inp.value = editor.title || ''; inp.blur(); } });
			inp.addEventListener('blur', commit, { once: true });
		}
		function updateBack() { backBtn.style.visibility = history.length > 1 ? 'visible' : 'hidden'; }
		function go(target, push) {
			if (!target) { return; }
			doc = target;
			if (push) { history.push(doc); }
			updateBack();
			renderDoc(doc, canvas);
			buildHotspots();
		}
		function back() { if (history.length > 1) { history.pop(); go(history[history.length - 1], false); } }
		function navigateTo(id) { go(editor.documents.find((d) => d.id == id), true); }

		function buildHotspots() {
			hotlayer.innerHTML = '';
			const W = doc.width, H = doc.height;
			hotspotsOf(doc).forEach((el) => {
				const b = el.bound;
				if (!b || !b.width || !b.height) { return; }
				const h = document.createElement('div');
				h.className = 'cp-hot';
				h.style.cssText = 'left:' + (b.x / W * 100) + '%;top:' + (b.y / H * 100) + '%;width:' + (b.width / W * 100) + '%;height:' + (b.height / H * 100) + '%';
				h.addEventListener('pointerup', (e) => { e.stopPropagation(); navigateTo(el.target); });
				hotlayer.append(h);
			});
			linksFrom(editor, doc).forEach((l, i) => {
				const btn = document.createElement('button');
				btn.type = 'button';
				btn.textContent = l.label || ('→ ' + l.to.id);
				btn.className = 'cp-link';
				btn.style.cssText = 'bottom:' + (16 + i * 44) + 'px;background:' + l.color; // position and color depend on the link
				btn.addEventListener('pointerup', (e) => { e.stopPropagation(); go(l.to, true); });
				hotlayer.append(btn);
			});
		}
		function onKey(e) {
			if (e.key == 'Escape') { close(); }
			else if (e.key == 'ArrowLeft') { back(); }
			else if (e.key == 'ArrowRight') { const l = linksFrom(editor, doc)[0]; if (l) { go(l.to, true); } }
		}
		function close() {
			document.removeEventListener('keydown', onKey);
			root.remove();
		}
		closeBtn.addEventListener('pointerup', close);
		backBtn.addEventListener('pointerup', back);
		document.addEventListener('keydown', onKey);
		document.body.append(root);
		go(start, false);
	}

	AC.regMenuAction('document.present', {
		index: 5, separatorBefore: 1,
		callback: (a) => present(a)
	});
})();
