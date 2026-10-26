"use strict";
//---------------------------------------------------------------------------
// global menu
//---------------------------------------------------------------------------
(function(){
var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements",{});	
var LY = igk.system.createNS("igk.winui.cancasEditor.View",{
});
var ACTIONS = igk.winui.cancasEditor.Actions;
var Key = ACTIONS.Key;
var defDebugAction = ACTIONS.defDebugAction; //function used to create menuAction 
// undo/redo are enabled according to the history stack (tools/StorageTool.js)
function historyMenu(action, can, index){
	return {index: index, separatorAfter: index == 1, callback: function(){
		ACTIONS.invoke(action);
	}, initialize: function(a, key, menuHost){
		var fc = function(){
			menuHost.enable = !!igk.winui.cancasEditor.storage[can];
		};
		igk.winui.cancasEditor.storage.onChange.push(fc);
		menuHost.initialize = fc; // called once the menu item exists
		return true;
	}};
}
ACTIONS.regMenuAction("edit.undo", historyMenu("editor.undo", "canUndo", 0));
ACTIONS.regMenuAction("edit.redo", historyMenu("editor.redo", "canRedo", 1));
ACTIONS.regMenuAction("edit.copy", defDebugAction(function(){
	ACTIONS.invoke("editor.copy");
}));
ACTIONS.regMenuAction("edit.cut", defDebugAction(function(){
	ACTIONS.invoke("editor.cut");
}));
ACTIONS.regMenuAction("edit.paste", {index:10, separatorAfter:1, callback:function(){
	console.debug("paste invoke");
	ACTIONS.invoke("editor.paste");
}, initialize: function(a){
	return a.settings.isDebug;
}});
ACTIONS.regMenuAction('edit.selectall', defDebugAction(function(){
	ACTIONS.invoke("editor.selectall");
}, null, {
	initialize: function(a, key, menuHost){
		var fc = function(){
			menuHost.visible = !0;
			menuHost.enable = ((a.layer ? a.layer.Elements: null) || a.list).root!=null;
		}; 
		a.on("elementAdded", fc);
		a.on("elementRemoved", fc);
		menuHost.initialize = fc;
		menuHost.enable = !1;
		return !0;
	},
	enable(){
		return ((a.layer ? a.layer.Elements: null) || a.list).root!=null;
	}
}));
/**
 * call delete all 
 */
ACTIONS.regMenuAction("edit.delete", {index:70, callback:function(){
	ACTIONS.invoke("editor.delete");
}});
ACTIONS.regMenuAction("edit.deleteall", {index:71, callback:function(){
	ACTIONS.invoke("editor.deleteall");
}});
ACTIONS.regMenuAction("help.wiki", {index:2, callback:function(a){
	// console.debug("invoke");
	ACTIONS.invoke("editor.showwiki");
}});
ACTIONS.regActions(Key.None, "editor.showwiki", (function(){
	var helpwnd = 0;
	return function(a){
		if (!helpwnd || (helpwnd.parent==null)){
			// console.debug("show wikie");
			helpwnd = window.open( a.settings.appUri+'/wiki', 'cancaseditor-wiki'); // named: the wiki tab is reused
			helpwnd.onclose =  function(){
				helpwnd = 0;
			};
		}else{
			helpwnd.focus();
		}
	};
})());
})();