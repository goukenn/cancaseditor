"use strict";
(function(){

//drawing2d mecanism actions base
var CoreMathOperation = igk.winui.cancasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
var SERI = igk.winui.cancasEditor.Serializer;
var Tools = igk.winui.cancasEditor.Tools;
var UTILS = igk.winui.cancasEditor.Utils;
var PATH  = igk.winui.cancasEditor.Utils.Path;
var ACTIONS = igk.winui.cancasEditor.Actions;
var Key = ACTIONS.Key;

//definine mecanism action 
var M_ACT = igk.system.createNS("igk.winui.cancasEditor.mecanismActions.drawin2D",{
	countPropertyUp : function(e){
		if (e.elem){
			if (e.type == "keyup"){
				return;
			}
			e.elem.count = Math.min(360, e.elem.count+1);
			e.elem.initialize();
			e.host.refresh();
		}else 
			e.handle = 0;
	},
	countPropertyDown: function(e){
		if (e.elem){
			if (e.type == "keyup"){
				return;
			}
			e.elem.count = Math.max(3, e.elem.count-1);
			e.elem.initialize();
			e.host.refresh();
		}else{
			e.handle = 0;
		}
	}

});








})();