// author: C.A.D. BONDJE DOUE
// file: MobileMenu.js
// @desc: menu bar helpers.
//  - desktop: an arrow after every sub menu entry that opens a nested menu (not on the top level menus)
//  - small screens (<= 710px): the menus are grouped in a hamburger button that opens a drawer. A tap on an entry
//    with a sub menu (or a swipe to the left on it) slides its sub menu in; a swipe to the right goes back (and
//    closes the drawer from the first level). The entries are read from the menu bar, so every action, label,
//    language change and hidden / disabled entry is the one of the desktop menu.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const SWIPE = 50; // px
	const BURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
	const el = (tag, props, children) => { const e = document.createElement(tag); Object.assign(e, props || {}); (children || []).forEach((c) => e.append(c)); return e; };
	/** the entries of a ul (menu bar or sub menu): [{label, a, sub:[...]|null, off}] */
	function readMenu(ul) {
		const out = [];
		Array.prototype.forEach.call(ul.children, (li) => {
			if (li.tagName != 'LI' || li.classList.contains('igk-hide')) { return; }
			const a = li.querySelector(':scope > a');
			if (!a) { return; }
			const c = a.cloneNode(true);
			c.querySelectorAll('.shortcut').forEach((s) => s.remove());
			const sub = li.querySelector(':scope > ul.submenu');
			out.push({ label: c.textContent.trim(), a, sub: sub ? readMenu(sub) : null, off: li.classList.contains('igk-disable') });
		});
		return out.filter((x) => x.label);
	}
	function init(editor) {
		const host = editor.host.o;
		const burger = el('button', { type: 'button', className: 'ce-burger', title: 'Menu', innerHTML: BURGER });
		host.append(burger);
		const mq = window.matchMedia('(max-width:710px)');
		const apply = () => host.classList.toggle('ce-mobile', mq.matches);
		(mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply));
		apply();
		let drawer = null;
		const close = () => { if (drawer) { drawer.remove(); drawer = null; _NS.Actions.focusEditor(); } };
		function open() {
			close();
			const root = readMenu(host.querySelector('ul.menu'));
			drawer = el('div', { className: 'ce-drawer' });
			const panel = el('div', { className: 'ce-panel' });
			drawer.append(panel);
			drawer.addEventListener('pointerdown', (e) => { if (e.target === drawer) { close(); } });
			const stack = []; // the pages shown, the last one is on top
			const back = () => {
				if (stack.length <= 1) { close(); return; }
				const top = stack.pop();
				top.classList.add('ce-in');
				setTimeout(() => top.remove(), 230);
				stack[stack.length - 1].classList.remove('ce-under');
			};
			const push = (title, items) => {
				const page = el('div', { className: 'ce-page' });
				const head = el('div', { className: 'ce-head' }, [el('button', { type: 'button', textContent: stack.length ? '‹' : '×', onclick: back }), el('span', { textContent: title })]);
				page.append(head);
				items.forEach((it) => {
					const row = el('div', { className: 'ce-item' + (it.off ? ' ce-off' : '') }, [el('span', { className: 'ce-label', textContent: it.label })]);
					if (it.sub) { row.append(el('span', { className: 'ce-more', textContent: '›' })); }
					let sx = 0, sy = 0, swiped = false;
					row.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; swiped = false; });
					row.addEventListener('pointerup', (e) => {
						const dx = e.clientX - sx, dy = e.clientY - sy;
						if (Math.abs(dx) >= SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) {
							swiped = true;
							if (dx < 0 && it.sub) { push(it.label, it.sub); } else if (dx > 0) { back(); }
						}
					});
					row.addEventListener('click', () => {
						if (swiped) { swiped = false; return; }
						if (it.sub) { push(it.label, it.sub); return; }
						close();
						// the original entry runs its action (the menu handles click and touch)
						it.a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
					});
					page.append(row);
				});
				if (stack.length) {
					stack[stack.length - 1].classList.add('ce-under');
					page.classList.add('ce-in');
					panel.append(page);
					requestAnimationFrame(() => requestAnimationFrame(() => page.classList.remove('ce-in')));
				} else { panel.append(page); }
				stack.push(page);
			};
			// a swipe to the right on the header / empty area goes back
			let hx = 0;
			panel.addEventListener('pointerdown', (e) => { hx = e.clientX; });
			panel.addEventListener('pointerup', (e) => { if (e.target.closest('.ce-head') && e.clientX - hx >= SWIPE) { back(); } });
			push(_NS.R && _NS.R['menu.title'] || 'Menu', root);
			document.body.append(drawer);
		}
		burger.onclick = open;
	}
	_NS.whenEditor((editor) => setTimeout(() => init(editor), 0));
	_NS.mobileMenu = { readMenu };
})();
