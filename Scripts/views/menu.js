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



ACTIONS.regMenuAction("edit.undo", defDebugAction(function(){
	ACTIONS.invoke("editor.undo");
}));


ACTIONS.regMenuAction("edit.redo", defDebugAction(function(){
	ACTIONS.invoke("editor.redo");
}));



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

ACTIONS.regMenuAction("edit.selectall", defDebugAction(function(){
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
		return !0;
	}
}));

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
			helpwnd = window.open( a.settings.appUri+'/wiki', '_blank');
			helpwnd.onclose =  function(){
				helpwnd = 0;
			};
		}else{
			helpwnd.focus();
		}
	};
})());

})();