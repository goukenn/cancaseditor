// author: C.A.D. BONDJE DOUE
// file: MenuViewportFit.js
// @desc: two problems with a submenu, now both fixed:
//  1. a submenu taller than the screen scrolls (Styles/default.pcss: max-height + overflow-y:auto) - but that
//     same overflow:auto also clips a NESTED submenu (left:100% flyout) opened from one of its items, since
//     CSS overflow clips a positioned descendant regardless of its own position. That nested submenu is
//     "shown" (display/opacity) by the browser just fine, just invisible - genuinely unreachable, not a
//     scrolling problem. Fixed by moving ("portaling") it to be a direct child of <ul class="menu"> (still
//     matched by every "{$editor} ... .menu .submenu" style rule, since those only require .submenu to be a
//     descendant of .menu, not a direct child - so its look is unchanged) with position:fixed, which escapes
//     the clipping ancestor (.menu itself has no overflow set). It's moved back to its exact original place
//     when it closes, so :hover / .igk-show / .kbd-open keep working exactly as before the rest of the time.
//  2. whatever is on screen can still open partly off the edge of the window (bottom or right): nudged back
//     on screen with a transform (layout untouched) whenever that happens, for every submenu, portaled or not.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const MARGIN = 6;
	const CLOSE_DELAY = 200; // ms grace period: moving the pointer from the trigger item to its flyout

	function menuRoot() { return document.querySelector('div.tool.t .menu'); }

	function clamp(sub) {
		if (!sub || !sub.classList || !sub.classList.contains('submenu')) { return; }
		const base = sub._fixedPos || { x: 0, y: 0 };
		sub.style.transform = 'translate(' + base.x + 'px,' + base.y + 'px)'; // start from the base position every time
		const r = sub.getBoundingClientRect();
		if (!r.width || !r.height) { return; } // not actually visible yet
		const vw = window.innerWidth, vh = window.innerHeight;
		let dx = base.x, dy = base.y;
		if (r.right > vw - MARGIN) { dx += (vw - MARGIN) - r.right; }
		if (r.left + (dx - base.x) < MARGIN) { dx += MARGIN - r.left; }
		if (r.bottom > vh - MARGIN) { dy += (vh - MARGIN) - r.bottom; }
		if (r.top + (dy - base.y) < MARGIN) { dy += MARGIN - r.top; }
		sub.style.transform = 'translate(' + Math.round(dx) + 'px,' + Math.round(dy) + 'px)';
	}

	// ---- nesting depth: cached once per submenu, from its DOM position before it is ever portaled (portaling
	// only changes WHERE under .menu it renders, not its logical place in the menu), so code elsewhere
	// (deepestOpenSubmenu in MenuKeyboardNav.js) can tell which submenu is logically "inside" which without
	// walking a live DOM chain that portaling has since changed.
	function depthOf(sub) {
		if (sub.dataset.menuDepth === undefined) {
			let d = 0, p = sub._homeParent || sub.parentElement;
			while (p) { if (p.matches && p.matches('.submenu')) { d++; } p = p.parentElement; }
			sub.dataset.menuDepth = d;
		}
		return +sub.dataset.menuDepth;
	}
	// ---- portal: a submenu nested inside another submenu is moved to be a direct child of .menu while open,
	// so the ancestor's own overflow:auto (needed for ITS scrolling) cannot clip it
	let closeTimer = 0;
	function openPortal(li) {
		const sub = li.querySelector(':scope > .submenu');
		const root = menuRoot();
		if (!sub || !root || sub._portaled) { return; }
		if (depthOf(sub) === 0) { return; } // a top-level submenu is never clipped, nothing to portal
		const r = li.getBoundingClientRect();
		sub._homeParent = sub.parentNode;
		sub._homeNext = sub.nextSibling;
		sub._portaled = true;
		sub._fixedPos = { x: Math.round(r.right), y: Math.round(r.top) };
		sub.style.position = 'fixed';
		sub.style.left = '0px';
		sub.style.top = '0px';
		sub.style.display = 'block';
		sub.style.opacity = '1';
		root.appendChild(sub);
		clamp(sub);
	}
	function closePortal(sub) {
		if (!sub._portaled) { return; }
		sub.style.position = '';
		sub.style.left = '';
		sub.style.top = '';
		sub.style.display = '';
		sub.style.opacity = '';
		sub.style.transform = '';
		sub._portaled = false;
		sub._fixedPos = null;
		if (sub._homeParent) { sub._homeParent.insertBefore(sub, sub._homeNext); }
	}
	function closeAllPortals() {
		document.querySelectorAll('.menu .submenu').forEach((sub) => { if (sub._portaled) { closePortal(sub); } });
	}
	function scheduleClose() {
		clearTimeout(closeTimer);
		closeTimer = setTimeout(closeAllPortals, CLOSE_DELAY);
	}
	function cancelClose() { clearTimeout(closeTimer); }

	function onPointerMove(e) {
		const onMenuChrome = e.target.closest && e.target.closest('.menu li, .menu .submenu');
		if (onMenuChrome) { cancelClose(); } else { scheduleClose(); return; }
		const li = e.target.closest('.menu li');
		if (li) { openPortal(li); requestAnimationFrame(() => clamp(li.querySelector(':scope > .submenu'))); }
	}
	document.addEventListener('mouseover', onPointerMove, true);
	document.addEventListener('click', onPointerMove, true); // touch / keyboard-triggered opens (igk-show, kbd-open)
	window.addEventListener('resize', closeAllPortals);
	_NS.menuFit = { clamp, openPortal, closePortal, closeAllPortals, depthOf };
})();
