// author: C.A.D. BONDJE DOUE
// file: MenuKeyboardNav.js
// @desc: adds arrow-key navigation inside whichever submenu is currently visible (opened by hover or a click/tap,
// see .cancaseditor.js's menuItem): Down/Up move a highlight (scrolled into view as needed), Right opens the
// highlighted item's own submenu, Left closes back to the parent level, Enter/Space activates the highlighted
// item, Escape clears the highlight.
"use strict";
(function () {
	const CSS = '.menu .kbd-sel > a{background-color:#4c448f;color:#eee}' +
		'[data-theme="light"] .menu .kbd-sel > a{color:#fff}' +
		// a submenu opened by ArrowRight (desktop only shows .submenu on :hover / .touchable-device li.igk-show)
		'.menu li.kbd-open > .submenu{display:block !important;opacity:1 !important}';
	if (!document.getElementById('cancas-menu-kbd-css')) {
		const st = document.createElement('style');
		st.id = 'cancas-menu-kbd-css';
		st.textContent = CSS;
		document.head.append(st);
	}

	let current = null; // the <li> currently highlighted by the keyboard, if any

	function visible(el) {
		if (!el) { return false; }
		const cs = getComputedStyle(el);
		return cs.display !== 'none' && cs.visibility !== 'hidden' && el.offsetParent !== null;
	}
	function depthOf(sub) {
		let d = 0;
		for (let p = sub.parentElement; p; p = p.parentElement) { if (p.matches('.submenu')) { d++; } }
		return d;
	}
	/** the deepest visible .submenu (nested inside the most other submenus): where arrow keys act */
	function deepestOpenSubmenu() {
		let best = null, depth = -1;
		document.querySelectorAll('.menu .submenu').forEach((sub) => {
			if (!visible(sub)) { return; }
			const d = depthOf(sub);
			if (d > depth) { depth = d; best = sub; }
		});
		return best;
	}
	function items(sub) {
		return [...sub.children].filter((li) => li.tagName == 'LI' && getComputedStyle(li).display !== 'none' && li.querySelector(':scope > a'));
	}
	function clearHighlight() { if (current) { current.classList.remove('kbd-sel'); current = null; } }
	function closeAll() {
		clearHighlight();
		document.querySelectorAll('.menu .kbd-open').forEach((li) => li.classList.remove('kbd-open'));
	}
	function highlight(li) {
		clearHighlight();
		current = li;
		if (current) {
			current.classList.add('kbd-sel');
			current.scrollIntoView({ block: 'nearest' });
		}
	}
	function onKey(e) {
		const sub = deepestOpenSubmenu();
		if (!sub) { clearHighlight(); return; }
		const list = items(sub);
		if (!list.length) { return; }
		const idx = current ? list.indexOf(current) : -1;
		switch (e.key) {
			case 'ArrowDown':
				highlight(list[(idx + 1 + list.length) % list.length]);
				e.preventDefault(); e.stopPropagation();
				break;
			case 'ArrowUp':
				highlight(list[(idx - 1 + list.length) % list.length]);
				e.preventDefault(); e.stopPropagation();
				break;
			case 'ArrowRight': {
				const child = current && current.querySelector(':scope > .submenu > li');
				if (child) {
					current.classList.add('kbd-open');
					highlight(child);
					e.preventDefault(); e.stopPropagation();
				}
				break;
			}
			case 'ArrowLeft': {
				if (depthOf(sub) === 0) { break; } // already at the top level, nothing to back out of
				const parentLi = sub.parentElement && sub.parentElement.closest('li');
				if (parentLi) {
					parentLi.classList.remove('kbd-open');
					highlight(parentLi);
					e.preventDefault(); e.stopPropagation();
				}
				break;
			}
			case 'Enter':
			case ' ': {
				const a = current && current.querySelector(':scope > a');
				if (a) { a.click(); e.preventDefault(); e.stopPropagation(); }
				break;
			}
			case 'Escape':
				closeAll();
				break;
		}
	}
	document.addEventListener('keydown', onKey, true);
	// the keyboard highlight (and anything it force-opened) must not survive the menu closing: a click
	// elsewhere, the mouse taking over, ...
	document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.menu .submenu, .menu > li')) { closeAll(); } }, true);
})();
