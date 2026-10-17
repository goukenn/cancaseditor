"use strict";
(function(){
	if (igk.winui.cancasEditor.NotAvailable)
	return;
//notification
var _notifylist = [];
var _NS = igk.winui.cancasEditor;
var GUI = igk.system.createNS("igk.winui.cancasEditor.gui", {
	notify: function(a, msg){
		_notifylist.push(this);
		var _index = _notifylist.length-1;
		var _self = this;
		var p =  $igk(a.canvas.o.parentNode);
		var _notHost = p.select(".igk-cancas-editor_notifyhost").first() || (function(){
			return p.add("div").addClass("igk-cancas-editor_notifyhost");				
		})();
		// the tips stay inside the editor surface: below the menu bar (the canvas runs under it) and the rulers
		var _mn = document.querySelector("ul.menu");
		var _top = _mn ? _mn.getBoundingClientRect().bottom - p.o.getBoundingClientRect().top : 0;
		if (_NS.rulers && _NS.rulers.visible()) {
			_top += _NS.rulers.SIZE;
		}
		_notHost.o.style.top = Math.max(0, _top) + 8 + "px";
		_notHost.o.style.right = 8 + "px";
		_notHost.o.style.maxWidth = "min(300px, calc(100% - 16px))";
		var q = igk.createNode("div");
		q.addClass("igk-cancas-editor_notify");
		// safari not allow to add properties twice
		//demonstration
		var s = {		
			"fontSize":"12pt","maxWidth":"280px","lineHeight":"15pt"
		};
		// s["lineHeight"] = "15pt"; 
		q.add("div").setCss(s).setHtml(msg || "Balafon Cancas editor edition notify node demonstration. New package  available <a href='#'>version 1.0</a>");
		// tap (touch/pen) or click closes the tip; touch-action:none keeps the tap from being taken as a pan
		q.o.style.touchAction = "none";
		q.o.addEventListener("pointerup", function(e){
			e.stopPropagation();
			_self.close();
		});
		q.on("click", function(){
			_self.close();
		});
		this.show = function(){};
		var _closed = false;
		this.close = function(){
			if (_closed) return;
			_closed = true;
			var done = function(){
				if (!q.o.parentNode) return;
				q.remove();
				_notifylist.splice(_index,1);
				for(var i = _index; i < _notifylist.length; i++){
					_notifylist[i].setIndex(i);
				}
			};
			q.addClass("igk-hide").on("transitionend", function(e){
				if (e.target == q.o){
					done();
				}
			});
			setTimeout(done, 500); // transitionend may not fire
		};
		this.setIndex = function(v){//update index list
			//change the index attache to node list
			//console.debug("change index "+v + " vs "+ _index);
			_index = v;
		};
		// update_dialog ();
		_notHost.add(q);
	}
});
GUI.notify.Show = function($a , $msg){
	var box = new GUI.notify($a, $msg);
	box.show();
};
// var update_dialog = function(){
	// for(var i = 0; i < _notifylist.length; i++){
	// }
// };
var ACTION = _NS.Actions;
ACTION.regMenuAction("file.testNotify", {
	initialize: function(a, k, host){
		return 1 && a.settings.isDebug;
	},
	callback:function(a){
	//show notify
	var not = new GUI.notify(a);	
	not.show();
}});
})();