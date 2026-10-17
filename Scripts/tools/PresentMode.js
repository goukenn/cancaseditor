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
		root.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#111;display:flex;align-items:center;justify-content:center;touch-action:none';
		const canvas = document.createElement('canvas');
		canvas.style.cssText = 'display:block;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);width:auto;height:auto;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.6)';
		const stage = document.createElement('div');
		stage.style.cssText = 'position:relative;line-height:0';
		const hotlayer = document.createElement('div');
		hotlayer.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0';
		stage.append(canvas, hotlayer);
		root.append(stage);

		const closeBtn = document.createElement('button');
		closeBtn.type = 'button'; closeBtn.textContent = '✕';
		closeBtn.title = T('present.close', 'Close (Esc)');
		closeBtn.style.cssText = 'position:fixed;top:16px;right:16px;width:36px;height:36px;border-radius:18px;border:0;background:rgba(255,255,255,.15);color:#fff;font-size:16px;cursor:pointer;z-index:1';
		const backBtn = document.createElement('button');
		backBtn.type = 'button'; backBtn.textContent = '←';
		backBtn.title = T('present.back', 'Back');
		backBtn.style.cssText = 'position:fixed;top:16px;left:16px;width:36px;height:36px;border-radius:18px;border:0;background:rgba(255,255,255,.15);color:#fff;font-size:16px;cursor:pointer;z-index:1;display:none';
		root.append(closeBtn, backBtn);

		function updateBack() { backBtn.style.display = history.length > 1 ? '' : 'none'; }
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
				h.style.cssText = 'position:absolute;cursor:pointer;touch-action:manipulation;' +
					'left:' + (b.x / W * 100) + '%;top:' + (b.y / H * 100) + '%;width:' + (b.width / W * 100) + '%;height:' + (b.height / H * 100) + '%';
				h.addEventListener('pointerup', (e) => { e.stopPropagation(); navigateTo(el.target); });
				hotlayer.append(h);
			});
			linksFrom(editor, doc).forEach((l, i) => {
				const btn = document.createElement('button');
				btn.type = 'button';
				btn.textContent = l.label || ('→ ' + l.to.id);
				btn.style.cssText = 'position:absolute;right:16px;bottom:' + (16 + i * 44) + 'px;padding:8px 16px;border-radius:20px;border:0;' +
					'background:' + l.color + ';color:#fff;font:13px sans-serif;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 6px rgba(0,0,0,.4)';
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
