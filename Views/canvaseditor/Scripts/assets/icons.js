//assets
"use stricts";

(function(){
	
	igk.system.createNS("igk.winui.canvasEditor.assets",{});
	
	
	//load assets
	var uri = igk.system.io.baseUri()+"/assets";
	igk.ready(function(){
	igk.system.io.getData(uri, function(){
		
	}, "text/xml");
	
	});
	
	
})();