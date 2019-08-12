"use strict";
(function(){
	
	var H = igk.system.createNS("igk.winui.canvasEditor.history", {
		
	});
	
	var ACK = igk.winui.canvasEditor.Actions;
	var Key = ACK.Key;
	
	ACK.regActions(Key.Ctrl | Key.Z, "editor.undo", function(a){
		console.debug("undo");
	});
	ACK.regActions(Key.Ctrl | Key.R, "editor.redo", function(a){
		console.debug("redo");
	});
	
	
	// console.debug("history....");
})();