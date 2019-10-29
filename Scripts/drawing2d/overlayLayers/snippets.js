"use strict";
//---------------------------------------------------------------------------
// Overlay layers
//---------------------------------------------------------------------------

(function(){
	
var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements",{});	
var LY = igk.system.createNS("igk.winui.cancasEditor.Layers",{
	
});


igk.system.createClass(LY, {name:"snippets", parent: ELEM.drawing2DContainer}, function(a){
	
	var MS_BTN = igk.winui.mouseButton;
	var p = $igk(a.canvas.o.parentNode).add("div").setCss({"pointerEvents":"none"}).addClass("snippet-host posab loc_a");
	var startPos = 0;
	var self = this;
	var snippets = [];
	
	function updateSnippetLocation(mecanism, element){
		var points = mecanism.tool.getPoints(element);
		if (!points){
			p.setHtml('');
			return;
		}
		var pts = 0;
		var srcpts = 0;
		var G = mecanism.host;
		if (points.length != snippets.length){
			p.setHtml('');		
			snippets = [];
			for(var i = 0; i < points.length; i++){
				pts = points[i];
				srcpts = G.getScreenLocation(pts.x, pts.y);
				
				//calculate the point according to screen location
				
				snippets.push(self.createSnippet(i,mecanism, element, pts).setCss({
					left: srcpts.x+"px",
					top: srcpts.y+"px"
				}));
			}
		}else{
			for(var i = 0; i < points.length; i++){
				var pts = points[i];
					srcpts = G.getScreenLocation(pts.x, pts.y);
				//calculate the point according to screen location
				snippets[i].update(mecanism, element, pts).setCss({
					left: srcpts.x+"px",
					top: srcpts.y+"px"
				});
			}
		}
	};
	
	a.on("itemStartEdition", function(evt){
		// console.debug('start edition');
		updateSnippetLocation(evt.mecanism, evt.element);
		
	}).on("itemEndEdition toolChanged", function(){
		p.setHtml("");
		snippets = [];
	}).on("zoomChanged", function(){
		if (a.tool.elem){
			 // console.debug("update");
			 // console.debug(a.tool.elem.getType());
			updateSnippetLocation(a.tool, a.tool.elem);
		}else{
			// console.debug("zoomChange no elem");
		}
	});
	
	//create a snippet
	this.createSnippet = function(index,mecanism,  element, pts){
		var dom = p.add("div");
		var cl = "snippet";
		if (pts.type){
			cl += " "+pts.type;
		}else{
			cl+= " round";
		}
		
		dom.on("contextmenu", function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		function _startupdate(e){
			//start snippet update
			a.tool.startUpdateIndex(element, index, e);
		};
		function _update(e){
				var loc = $igk(a.canvas).getScreenLocation();				
				var _gloc = {
					x : e.clientX - loc.x,
					y : e.clientY - loc.y					
				};	
				// console.debug(startPos);			
				dom.setCss({
					left: (_gloc.x - startPos.x)+"px",
					top:  (_gloc.y - startPos.y) +"px"
				});
				var _endpos = a.getDeviceLocation(e.clientX, e.clientY);
				a.tool.updateIndex(element, index, _endpos);
				a.refresh();
		};
		
		dom.update = function(e, elt, p){
			mecanism = e;
			element = elt;
			pts = p;
			return dom;
		};
		if (dom.istouchable()){
			
			dom.on("touchstart", function(e){
				// console.debug("snippet touch start");
				if(igk.winui.cancasEditor.isCapturing())
					return;			
				_startCapture();
			
				var th = e.touches;
				if (th.length == 1){ 
					var e = th[0]; 
					e.loc = mecanism.host.getDeviceLocation(e.clientX, e.clientY);
			
			
			var locs = $igk(this).getScreenLocation();		
					var _endpos = {
						x : (e.clientX - locs.x),
						y : (e.clientY - locs.y)
					};	
					startPos = _endpos;
					_startupdate(
					{startPos:startPos,
					isShift: e.shiftKey, 
					isCtrl: e.ctrlKey}
					);
				}
			},{passive:1});
			dom.on("touchmove", function(e){
				var th = e.touches;
				if ((igk.winui.cancasEditor.getCapture() != this) || (th.length!=1)){
					return;
				}
				var c = th[0]; 
				c.loc = mecanism.host.getDeviceLocation(e.clientX, e.clientY);
				// console.debug("snippet touch move");
				
				e.handle = true;
				e.cancelBubble = !0;
				e.returnValue = !1;
				_update(c);
				
			},{passive:1});
			dom.on("touchend", function(e){
				// console.debug("snippet touch end");
				_freeCapture();
				var th = e.touches;
				if (th.length==1){
					var c = th[0]; 
					c.loc = mecanism.host.getDeviceLocation(e.clientX, e.clientY);
					_update(c);
				}
				e.returnValue = !1;			
				updateSnippetLocation(mecanism, element);
					
			},{passive:1});
		}
		
		function _startCapture(){
			igk.winui.mouseCapture.setCapture(dom.o);
			igk.winui.cancasEditor.setCapture(dom.o);
		};
		function _freeCapture(){
			igk.winui.mouseCapture.releaseCapture();
			igk.winui.cancasEditor.releaseCapture();
		}
		return dom.addClass(cl).on("click", function(){
			//alert("click ok");
		}).setCss({"pointerEvents":"all"}).on("mousedown", function(e){
			if(igk.winui.cancasEditor.isCapturing())
				return;
			
			_startCapture();
			
			var locs = $igk(this).getScreenLocation();				
			//var loc = $igk(a.canvas).getScreenLocation();				
			var _endpos = {
				x : (e.clientX - locs.x),
				y : (e.clientY - locs.y)
			};	
			startPos = _endpos;
			_startupdate(
			{startPos:startPos,
			isShift: e.shiftKey, 
			isCtrl: e.ctrlKey}
			);
			e.stopPropagation();
			e.preventDefault();
		})
		.on("mousemove", function(e){
				
			switch(MS_BTN(e)){
				case MS_BTN.Left:
				
				if (igk.winui.cancasEditor.getCapture() == this){
					e.handle = true;
					_update(e);
					e.stopPropagation();
					e.preventDefault();
				}
				break;
			}
		})
		.on("mouseup", function(e){
			
			switch(MS_BTN(e)){
				case MS_BTN.Left:	
				if (igk.winui.cancasEditor.getCapture() == this){				
					_freeCapture();
					_update(e);
					e.stopPropagation();
					e.preventDefault();			
					updateSnippetLocation(mecanism, element);
			
				}
				break;
			}
		
		});
	};
	
	this.render = function(a){
		// no rendering
	};
});
	
})();