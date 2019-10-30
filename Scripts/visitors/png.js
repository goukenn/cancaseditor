"use strict";

(function(){



var visitor ={
	
	'document': function(name, e){
		var W = this.width;
		var H = this.height;
		e.setAttribute("viewBox", "0 0 "+W+" "+H);
		e.setAttribute("width", W);
		e.setAttribute("height", H);
		e.setAttribute("id", this.id);
	}
	
	
};

function storeView(inf, list, t){
	// add it offscreen for chrome in other to render.
	var canvas = igk.createNode("canvas");
	var ctx = canvas.o.getContext("2d");
	var W = inf.width || 420;
	var H = inf.height || 320;
	
	// console.debug(inf);
	// return;

	canvas.o.width = W;
	canvas.o.height = H;
	
	
	
	canvas.setCss({
		display:"block", 
		lineHeight:0,
		width: W+"px",
		height: H+"px",
		backgroundColor:'transparent'
	});
	//if (igk.navigator.isSafari()){
		//must add to document
		igk.dom.body().appendChild(canvas.o);
	//}
	
	var o = new igk.winui.cancasEditor.primitive(ctx);
	
	o.getDocumentSize = function(){
		return {
			w: W,
			h: H
		};
	};
	
	o.clearScene();
	o.transparentBg = (t=='image/png');
	for(var i= 0; i < list.length; i++){
		list[i].render(o);
	}
	inf.mimetype= t;//"image/png";
	var ext = (t=='image/jpeg'? ".jpg": " .png");
	if (canvas.o.msToBlob){ //presensce of ms blop image
		//edge workaround
		 window.navigator.msSaveBlob(canvas.o.msToBlob(), inf.name+ext);
		 canvas.remove();
		 return null;
	}
	var data = canvas.o.toDataURL(t);
	// window.open(data);
	canvas.remove();
	
	inf.mimetype= t;//"image/png";
	
	
	var a = igk.createNode("a");
	igk.dom.body().appendChild(a.o); // not require in IE 
	// console.debug(n);
	a.o.download = inf.name+ext;// "project.png";
	a.o.href = data;
	a.o.type = t;
	// console.debug(a.o.href);
	//alert(data);
	a.o.click();
	a.remove(); //click to download
	return null;
};

igk.system.createNS("igk.winui.cancasEditor.visitors", {
	png: function(list, inf){
		return storeView(inf, list, 'image/png');		
	},
	jpeg: function(list, inf){
		return storeView(inf, list, 'image/jpeg');		
	}
});


	
var AC =  igk.winui.cancasEditor.Actions;
AC.regMenuAction("file.export.toPng", {callback: function(a){
	a.exportTo("png");
}, index:20});	

AC.regMenuAction("file.export.toJPeg", {callback: function(a){
	a.exportTo("jpeg");
}, index:21});

})();

