// author: C.A.D. BONDJE DOUE
// file: DisableBrowserZoom.js
// @desc: the editor has its own zoom (the surface's wheel handler, drawing2d/selection.js); the browser's own
// "mouse navigator zoom" (ctrl+wheel, a trackpad pinch reported as wheel+ctrlKey, Safari's gesture events) must
// not also zoom the page itself. The surface already blocks this over the canvas; this covers the rest of the
// app (toolbar, panels, dialogs) so the whole page never zooms.
"use strict";
(function () {
	window.addEventListener('wheel', function (e) {
		if (e.ctrlKey) { e.preventDefault(); }
	}, { passive: false });
	// Safari (desktop and iPad with a trackpad/mouse) reports a pinch as gesture events, not a ctrl+wheel one
	['gesturestart', 'gesturechange', 'gestureend'].forEach(function (n) {
		document.addEventListener(n, function (e) { e.preventDefault(); }, { passive: false });
	});
})();
