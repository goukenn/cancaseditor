"use strict";
//---------------------------------------------------------------------------
// pageLayer
//---------------------------------------------------------------------------

(function(){
	
var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements",{});	
var LY = igk.system.createNS("igk.winui.cancasEditor.Layers",{});



var CoreMathOperation = igk.winui.cancasEditor.CoreMathOperation;
var ELEM  = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
var SERI  = igk.winui.cancasEditor.Serializer;
var Tools = igk.winui.cancasEditor.Tools;
var UTILS = igk.winui.cancasEditor.Utils;
var PATH  = igk.winui.cancasEditor.Utils.Path;
var ACTIONS = igk.winui.cancasEditor.Actions;


//clear window  selection
function clearSelection(){
	var sl = window.getSelection();	
	if(sl.rangeCount > 0) {
		 for(var i = 0; i < sl.rangeCount; i++) {
		  sl.removeRange(sl.getRangeAt(i));
		 }
	}
};


function LayerContextMenu(t){
	var visible = 0;
	igk.appendProperties(this, {
		setLocation: function(e){
			t.setCss({
				"left": e.x+"px",
				"top": e.y+"px"
			});
		},
		show: function(){
			t.rmClass("igk-hide")
			.setCss({
				"display":"initial"
			});
			visible = 1;
			igk.dom.body().on("click", __hide);
			t.on("transitionend", __transition);
		},
		hide: function(){			
			t.addClass("igk-hide");
			visible = 0;
			igk.dom.body().unreg_event("click", __hide);
			
		}
	});
	
	var q = this;
	function __hide(e){
		q.hide();
	};
	function __transition(e){
		if (e.target == t.o){
			t.unreg_event("transitionend", __transition);		
			t.setCss({
				"display":"none"
			});
		}
	};
};


igk.system.createClass(LY, {name:"pageLayer", parent: ELEM.drawing2DContainer}, function(a){
	
	var cibling;
	var layerContextMenu = 0; 
	
	
	igk.defineProperty(this, "cibling", {get: function(){
		return cibling;
	}});
	
	var MS_BTN = igk.winui.mouseButton;
	var p = $igk(a.canvas.o.parentNode).add("div").setCss(
	{
	"pointerEvents":"none", 
	"top":"0px", 
	"left":"0px", 
	"bottom":"0px", 
	"right":"0px",
	"overflow":"hidden",
	"zIindex":"20"})
	.addClass("page-host posab")
	.on("contextmenu", function(e){
		e.preventDefault();
		e.stopPropagation();
		
		// igk.winui.controls.toast.show("Context menu request");
		if (!layerContextMenu){
			//init layer context menu
			var dv = igk.createNode("div").addClass("pageLayer-contextMenu posab");
			dv.disablecontextmenu();
			
			//
			var tab = ACTIONS.getMenuActions("pageLayer-contextMenu");
			var nodes = {};
			var editor = a;
			//build menu
			var items = [];		
			for(var i in tab){
				items.push(i);
			};
		
			if (items.length>0){
				ACTIONS.initMenuList(items, dv.add('ul'), nodes, editor, ACTIONS.menuItem, closeContextMenu);			
			}			
			layerContextMenu = new LayerContextMenu(dv);
			igk.dom.body().add(dv);
			
		}
		layerContextMenu.setLocation({x:e.pageX, y: e.pageY});
		layerContextMenu.show();
		
	});
	
	function closeContextMenu (){
		// console.debug("close context menu");
		layerContextMenu.hide();
		
	};
	
	p.layer = this;
	// 
	
	this.unreg_event = function(n, func){
		p.unreg_event(n, func);
	};
	this.on = function(n, func){
		p.on(n, func);
	};
	
	
	cibling = p.add("div")
	// .editable('true')
	.selectable(false)
	.autocorrect(false)
	.setHtml(" ").setCss({
		"fontSize": "8em",
		"pointerEvents":"none"
	});
	
	
	var m_cibling = cibling;
	
				
	
	this.startEdition= function(){

	cibling = m_cibling;
	cibling.selectable(true).editable(true);		
	p.setCss({
			"pointerEvents": "auto"
		});
			m_cibling.setCss({
			"pointerEvents": "auto"
		});
		
		
	};
	this.stopEdition = function(){
		// console.debug("stop edition");
		p.setCss({
			"pointerEvents": "none"
		});
		m_cibling.setCss({
			"pointerEvents": "none"
		});
	};
	
	this.Edit = function(t){ // use this to start edition on layer
		if (cibling != t){
			
			if(cibling){
				// cibling.editable('false');				
				cibling.selectable(false).editable(false);
			}
			cibling = t;
			if(cibling){
				// cibling.editable('true');				
				cibling.setHtml("new Line ").setCss({
				// "fontSize": "8em",
				"pointerEvents":"auto"
				});

				// cibling.o.focus();
			}
		};
		
	};
	
	this.clear = function(){
		p.setHtml("");
		cibling = null;
	};

});





igk.system.createClass(Tools, {name:'OverlayMecanism', parent: Tools.fullname+".Rectangle"},
	function(){
			var layer = 0; // will store the current overlay layer
			var _self = 0;
			//console.debug(this.registerEvents);
			
			
			function endEdition(){				
				layer.Edit(null);						
				clearSelection();
				layer.stopEdition();
			};
			
			this.createElement = function(){ return null; };
			this.registerKeyAction =  function(actions){
				
				// actions[Key.D] = function(e){
					// if (e.type == "keyup"){
						// layer.Edit(null);						
						// clearSelection();
						// layer.stopEdition();
					// }
					
				// };
				
				
				actions[Key.Escape] = function(e){
					if (e.type == "keyup"){						
					
						if (layer.cibling )
						{
							endEdition();
						}
						this.goToDefaultMecanism();						
					}
					else 
						e.handle = 0;
					
				};
				
				actions[Key.Enter] = function(e){
	
					if (layer.cibling )
					{
						//add new div to parent node  - setup style - enable edition
						var d = layer.cibling.add("div");
						
						layer.Edit(d); 
						
					}else{
						e.handle = 0;
					}
				};
				
			};
			
		
			
			this.getPoints = function(){
				return null;
			};
			
			this.updateIndex = function(elem, index, endPos){};
			this.startUpdateIndex = function(elem, index, inf){
				console.debug(inf);
			};
			
			var _b = [];
			_b["reg"] = this.registerEvents ;
			this.registerEvents = function(){
				_b["reg"].apply(this);
				
				layer = $igk(this.host.canvas.o.parentNode).select(".page-host").first().layer;				
				//console.debug(layer);
				// if (layer.cibling){
					// layer.cibling.selectable(true).editable(true);
				// }else{
					layer.startEdition();
				//}
			};
			_b["unreg"] = this.unregisterEvents ;
			this.unregisterEvents = function(){
					_b["unreg"] .apply(this);
					if (layer){
						endEdition();
					}
			};
	}	
);



var ACTIONS = igk.winui.cancasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regMenuAction("tools.overlayLayer", {index:108, separatorBefore:1, callback:function(a){
	a.tool = new Tools.OverlayMecanism();
},
initialize:  function(a, key, menuHost){   
	menuHost.initialize=function(){		
		menuHost.enable = false; // comming soon
	};
	return true;
}
});



//register context menu action
ACTIONS.regMenuAction("pageLayer", {index:1,
 filter: "pageLayer-contextMenu",
 type: 'contextmenu',
 callback:function(a){
	
}});
ACTIONS.regMenuAction("pageLayer.cancel", {index:1, filter: "pageLayer-contextMenu",display:'cancel', callback:function(a){
	
}});
ACTIONS.regMenuAction("pageLayer.copy", {index:1, filter: "pageLayer-contextMenu", display:'copy', callback:function(a){
	//g = window.getSelection();
	document.execCommand('copy');
	
	
}});
ACTIONS.regMenuAction("pageLayer.cut", {index:1, filter: "pageLayer-contextMenu", display:'cut', callback:function(a){
	 document.execCommand('cut');
}});

var hidedPaste = 0;
ACTIONS.regMenuAction("pageLayer.paste", {index:1, filter: "pageLayer-contextMenu", display:'paste', callback:function(a){
	 // TODO: HANDLE PASTING DATA
	 // hidedPaste = igk.dom.body().add("textarea").setCss({
		 // "position":"absolute"
	 // });
	 // hidedPaste.o.select();
	 // hidedPaste.o.focus();
	 // if (document.execCommand('paste')){
		 // console.debug(hidedPaste.getHtml());
	 // }else {
		 // console.debug("failed to paste");
		 
		 
		 // console.debug(hidedPaste.o.value);
	 // }
	 // hidedPaste.remove();
}});

ACTIONS.regMenuAction("pageLayer.print", {index:1, filter: "pageLayer-contextMenu", display:'print', separatorBefore:true,  callback:function(a){
	document.execCommand('print');
}});



ACTIONS.regActions(Key.Alt | Key.Shift | Key.O, "editor.selectool.overlayLayer", function (a){a.tool = new Tools.OverlayMecanism(); });






})();