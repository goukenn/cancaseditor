"use strict";
// console.debug("::::::::::::::::::::");
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
		var _notHost = p.select(".igk-canvas-editor_notifyhost").first() || (function(){
			return p.add("div").addClass("igk-canvas-editor_notifyhost");				
		})();
		
		var q = igk.createNode("div");
		q.addClass("igk-canvas-editor_notify");
		// safari not allow to add properties twice
		//demonstration
		var s = {		
			"fontSize":"12pt","maxWidth":"100px","lineHeight":"15pt"
		};
		
		
		// s["lineHeight"] = "15pt"; 
		q.add("div").setCss(s).setHtml(msg || "Balafon Cancas editor edition notify node demonstration. New package  available <a href='#'>version 1.0</a>");
		
		q.on("click", function(){
			_self.close();
		});
		this.show = function(){};
		this.close = function(){
			
			q.addClass("igk-hide").on("transitionend", function(e){
				
				if (e.target == q.o){
					q.remove();
					
					_notifylist.splice(_index,1);
					
					for(var i = _index; i < _notifylist.length; i++){
						_notifylist[i].setIndex(i);
					}
					 
				}
			});
			
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