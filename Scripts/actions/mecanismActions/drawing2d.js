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

var maxStrokeWith = 100;

//definine mecanism action 
var M_ACT = igk.system.createNS("igk.winui.cancasEditor.actions.mecanismActions.drawin2D",{
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
,
	tensionPropertyUp : function(e){
		if (e.elem && (typeof(e.elem.tension)!='undefined')){
			if (e.type == "keyup"){
				return;
			}
			e.elem.tension = Math.min(10, e.elem.tension+0.1);
			e.elem.initialize();
			e.host.refresh();
		}else 
			e.handle = 0;
	},
	tensionPropertyDown: function(e){
		if (e.elem && (typeof(e.elem.tension)!='undefined')){
			if (e.type == "keyup"){
				return;
			}
			e.elem.tension = Math.max(-10, e.elem.tension-0.1);
			e.elem.initialize();
			e.host.refresh();
		}else{
			e.handle = 0;
		}
	}
	

	,strokeWidthPropertyUp : function(e){
		if (e.elem && (typeof(e.elem.strokeWidth)!='undefined')){
			if (e.type == "keyup"){
				return;
			}
			var step = 1;
			
			e.elem.strokeWidth = Math.min(maxStrokeWith, e.elem.strokeWidth+step);
			e.elem.initialize();
			e.host.refresh();
		}else 
			e.handle = 0;
	},
	strokeWidthPropertyDown: function(e){
		if (e.elem && (typeof(e.elem.strokeWidth)!='undefined')){
			if (e.type == "keyup"){
				return;
			}
			var step = 1;
			e.elem.strokeWidth = Math.max(1, e.elem.strokeWidth-step);
			e.elem.initialize();
			e.host.refresh();
		}else{
			e.handle = 0;
		}
	}
	, toogleFillMode : function(e){
		// console.debug("toggle fill mode");
		if (e.elem && (e.type != "keyup") && (typeof(e.elem.fillMode)!='undefined')){			
			if (e.elem.fillMode == ELEM.fillMode.evenodd)
				e.elem.fillMode =  ELEM.fillMode.nonzero;
			else 
				e.elem.fillMode =  ELEM.fillMode.evenodd;
			e.elem.initialize();
			e.host.refresh();
		}else{
			e.handle = 0;
		}
	}
	, editElement : function(e){
		if(e.type == "keyup"){
			if (e.elem){
				e.host.editElement(e.elem);
				return;
			}
			
		}else{
			if (e.elem){
				//disable default handle mecanism if element present on shortcut
				return;
			}
		}
		e.handle = 0;
	},
	moveElementOver: function(e){
		
		if(e.type != "keyup"){
			return;
		}
		var elem = e.elem  || e.host.element;
		if (!elem)
			return;
		var container = elem['@container'];
		if (container && container.moveOver(elem))
			e.host.refresh();
		
	},
	moveElementBelow: function(e){
		if(e.type != "keyup"){
			return;
		}
		var elem = e.elem  || e.host.element;
		if (!elem)
			return;
		var container = elem['@container'];
		if (container && container.moveBelow(elem));
		e.host.refresh();
	},
	moveElementTopOver: function(e){
		if(e.type != "keyup"){
			return;
		}
		var elem = e.elem  || e.host.element;
		if (!elem)
			return;
		var container = elem['@container'];
		if (container && container.moveTopOver(elem));
		e.host.refresh();
	},
	moveElementBottomBelow:function(e){
		if(e.type != "keyup"){
			return;
		}
		var elem = e.elem  || e.host.element;
		if (!elem)
			return;
		var container = elem['@container'];
		if (container && container.moveBottomBelow(elem));
		e.host.refresh();
	}
	
});








})();