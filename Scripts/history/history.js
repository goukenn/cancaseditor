"use strict";
// undo/redo: the stack of snapshots is managed by tools/StorageTool.js (igk.winui.cancasEditor.storage)
(function(){
	var H = igk.system.createNS("igk.winui.cancasEditor.history", {		
	});
	var ACK = igk.winui.cancasEditor.Actions;
	var Key = ACK.Key;
	function inField(e){
		// let the text fields handle their own undo
		return e && e.target && /^(input|textarea|select)$/i.test(e.target.tagName || '');
	}
	function run(name){
		return function(a, e){
			if (inField(e)){
				e.handle = 0;
				return;
			}
			igk.winui.cancasEditor.storage[name](a);
		};
	}
	ACK.regActions(Key.Ctrl | Key.Z, "editor.undo", run('undo'));
	ACK.regActions(Key.Ctrl | Key.Shift | Key.Z, "editor.redo", run('redo'));
	ACK.regActions(Key.Ctrl | Key.Y, "editor.redo.alt", run('redo'));
})();