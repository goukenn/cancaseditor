"use strict";

(function(){

var ACTIONS = igk.winui.cancasEditor.Actions;
	ACTIONS.regMenuAction("file.test", {index:3, 
		initialize: function(a, k, host){
			return 1 && a.settings.isDebug;
		},
		callback:function(a){
	// ACTIONS.invoke("editor.selectool.rectangle");
	console.debug(a.canvas.o.toDataURL());
}});


})();