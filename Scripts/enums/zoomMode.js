// author: C.A.D. BONDJE DOUE
// file: zoomMode.js
// @date: 20241226 21:54:10
// @desc: zoom mode struct
'use strict';
(function () { 
	var L = igk.system.createNS("igk.winui.cancasEditor.enums", {
		zoomMode: null
	});
	const _e  = igk.defineEnum(null, {
		"center": 1,
		"normal": 3,
		"stretch": 2
	}); 
	Object.defineProperty(L, 'zoomMode', {get(){return _e;}}); 
})();