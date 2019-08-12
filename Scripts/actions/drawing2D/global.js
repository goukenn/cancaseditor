"use strict";
(function(){

//drawing2d mecanism actions base
var CoreMathOperation = igk.winui.canvasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.canvasEditor.DrawingElements", {});
var SERI = igk.winui.canvasEditor.Serializer;
var Tools = igk.winui.canvasEditor.Tools;
var UTILS = igk.winui.canvasEditor.Utils;
var PATH  = igk.winui.canvasEditor.Utils.Path;
var ACTIONS = igk.winui.canvasEditor.Actions;
var Key = ACTIONS.Key;

//definine mecanism action 
var M_ACT = igk.system.createNS("igk.winui.canvasEditor.mecanismActions.drawin2D",{
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