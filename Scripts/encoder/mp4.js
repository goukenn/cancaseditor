"use strict";

(function(){
//mp4 decoder
// console.debug("encoder....");
var G = igk.system.createNS("igk.winui.cancasEditor.encoder", {
"mp4":function(){

}
});
var _P = igk.system.promiseCall; 

G.mp4.decode = function(file, a){
	var P = new _P();
	var vid = igk.createNode('video');
	var created = 0;
	vid.on("loadedmetadata", function(){
			// console.debug("load meta data");
			// console.debug("load video : "+vid.o.src);
			// console.debug("duration : "+vid.o.duration);
			var b = a.createElement("video");
			b.src = vid.o;
			vid.o.currentTime  = 195;			
			a.clear();							
			a.addImageDocument(b);
			a.resetFitAreaZoom();
			a.refresh();
			created =1;
	}).
	on("progress", function(e){
		//console.debug("progress");
		if (created){
		//console.debug(e);
		//a.refresh();
		}
	}).
	on("canplay", function(){
		// console.debug("can play video");
		a.refresh();
		P.resolv();
	}).
	on("load", function(){
		
		// console.debug("try to open a video file");
			
			a.refresh();
			
	}).on("error", function(){
		console.error("[ce] - faile to decode video file");
		P.error();
	});
	
	if (URL && typeof(URL.createObjectURL)=='function')
	{
		a.addAsset(vid.o);
		vid.o.src = URL.createObjectURL(file);
	
	}

	return P;
};



})();