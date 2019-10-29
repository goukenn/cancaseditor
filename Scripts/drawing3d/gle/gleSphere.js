"use strict";
//sphere
(function(){
	var _NS = igk.winui.cancasEditor;
	var ACTIONS = _NS.Actions;
	igk.system.createNS(_NS.fullname+".drawing3d.gle",{});
	
	//sphere
	ACTIONS.regMenuAction("tools.drawing3d.gleSphere", {index:8, callback:function(){
		ACTIONS.invoke("editor.selectool.gleSphere");
	}, initialize: function(a, key, menuHost){
		var _g = _NS.drawing3d.gle;		
		var _p = a.getService("publisher");
		if (_p){
			_p.on('gls://shaderloader', function(){
				_g.menuHostInitial(a, key, menuHost);
			});
		}
		menuHost.initialize = function(){
			_g.menuHostInitial(a, key, menuHost);
		};
		
		return true;
	}});
	
})();

