"use strict";
(function(){

//zoom menu

var ACTIONS = igk.winui.canvasEditor.Actions;

ACTIONS.regMenuAction("view.anchor", {index:20, callback:function(){
	 
	 
}, initialize: function(a, key, menuHost){ 
	a.on("itemStartEdition", function(e){		
		menuHost.enable = (a.element != null);
	}).on("itemEndEdition", function(e){
		menuHost.enable = (a.element != null);
	});
	menuHost.initialize=function(){		
		menuHost.enable = false;
	};
	return true;
}});



})();