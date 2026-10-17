"use strict";
(function(){
//dialog control
var AC = igk.winui.cancasEditor.Actions;
var Key = AC.Key;
var initc = 0;
var MS_BTN = igk.winui.mouseButton;
//filter expression 
var GUI = igk.system.createNS("igk.winui.cancasEditor.gui", {
	dialog: function(){
		var _loctimeout=0;
		function __updatelocation(){
			// console.debug("update size");
			if (_loctimeout){
				clearTimeout(_loctimeout);
			}
			_loctimeout = setTimeout(function(){
				// console.debug("location ize");
				if (box.getComputedStyle("position")=="absolute"){
					__updatepos(box.getLocation());
				}
			}, 500);
		};
		function __updatepos(l){
			var s = box.getSize(); 
			var dx = Math.max(0, Math.min(window.innerWidth-s.w, l.x ));
			var dy = Math.max(0, Math.min(window.innerHeight-s.h, l.y ));
			var border = igk.getNumber(box.getComputedStyle("borderWidth"));
			box.setCss({left:(dx-border)+'px', top:(dy-border)+'px','position':'absolute'});
			d.raiseEvent('locationChanged', {data:{
				x: (dx-border),
				y:(dy-border)
			}
			});
		};
		var q  = this;		
		var d = igk.createNode("div");
		d.addClass("canvas-editor-gui_dialog dialog igk-hide").setAttributes({
			draggable: false
		});
		var box = d.add("div").addClass("box");
		box.setAttributes({
			draggable: false
		});
		var b = box.add("div").addClass("title-bar svg-16");
		var title = b.add('div').addClass("title dispib");
		var btn = b.add('a').addClass("floatr close").add("div").on("click", function(){
			q.close();
		});
		btn.add("div").addClass("igk-svg-lst-i") .setAttribute("igk:svg-name", "drop");
		// var title = b.addClass("title");
		var content = box.add("div").addClass("content igk-winui-panel-box");
		// event
		d.addEvent("close", {});
		d.addEvent("locationChanged", {});
		igk.dom.body().add(d);
		igk.defineProperty(this, "control", {get: function(){ return d; }});
		igk.defineProperty(this, "title", {get: function(){ return title.getHtml(); }, set: function(v){ title.setHtml(v); }});
		this.add = function(o){
			content.setHtml('');
			content.add(o);
		};
		//move box according to title bar
		var mv = {b:0};
		// pointer events cover mouse, touch and pen; touch-action:none stops the browser panning during the drag
		var tb = b.o;
		tb.style.touchAction = 'none';
		tb.addEventListener('pointerdown', function(e){
			if (e.button !== 0 || (e.target.closest && e.target.closest('.close'))) return;
			mv.b = 1;
			mv.id = e.pointerId;
			mv.start = {x:e.clientX, y:e.clientY};
			//save size and location
			mv.boxsize = box.getSize();
			mv.location = box.getLocation();
			e.preventDefault();
			e.stopPropagation();
			try { tb.setPointerCapture(e.pointerId); } catch (x) { }
		});
		tb.addEventListener('pointermove', function(e){
			if (!mv.b || e.pointerId !== mv.id) return;
			e.preventDefault();
			e.stopPropagation();
			__updatepos({x: mv.location.x + e.clientX - mv.start.x, y: mv.location.y + e.clientY - mv.start.y});
		});
		function endMove(e){
			if (!mv.b || e.pointerId !== mv.id) return;
			mv.b = 0;
			e.preventDefault();
			e.stopPropagation();
			try { tb.releasePointerCapture(e.pointerId); } catch (x) { }
		}
		tb.addEventListener('pointerup', endMove);
		tb.addEventListener('pointercancel', endMove);
		igk.winui.reg_event(window, 'resize', __updatelocation);
		function __close(){
			if (_loctimeout){
				clearTimeout(_loctimeout);
				_loctimeout = 0;
			}
			igk.winui.unreg_event(window, 'resize',__updatelocation);
			d.unreg_event('close', __close);
		};
		d.on("close",__close);
		//
		this.setLocation=function(p){
			__updatepos(p);
		};
	}
});
igk.appendProperties(GUI.dialog.prototype , {
	show: function(){
		this.control.init();
		this.control.rmClass("igk-hide");
	},
	close: function(){		
		this.control.remove();
		this.control.raiseEvent("close");
	},
	on: function(n, p){
		this.control.on(n, p);
	},
	unreg_event:function(n, p){
		this.control.unreg_event(n, p);
	}
});
GUI.dialog.showDialog = function(title, content, options){
	var d = new GUI.dialog();
	if (options && options.settings && ('location' in options.settings)){
		d.setLocation(options.settings.location);
	}
	d.title = title;
	d.add(content);
	d.show();
	igk.winui.dialogs.register(d);
	return d;
};
})();
