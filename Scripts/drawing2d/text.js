(function(){


var CoreMathOperation = igk.winui.canvasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.canvasEditor.DrawingElements", {});
var SERI = igk.winui.canvasEditor.Serializer;
var Matrix = igk.winui.canvasEditor.Matrix;

function getFontDefinition(o){
	var s = null;
	var q = $igk(o);
	//move to parent node 
	while(q && (q.o.nodeType == 3)){
		q = $igk(q.o.parentNode);
	}
	if (q.o.nodeType == 1){
		
		s = "";
		s += q.getComputedStyle("fontStyle")+" ";
		s += q.getComputedStyle("fontVariant")+" ";
		s += q.getComputedStyle("fontWeight")+" ";
		s += q.getComputedStyle("fontSize")+"/"+q.getComputedStyle("lineHeight")+" ";
		s += q.getComputedStyle("fontFamily");
		
	}
	
	return s;
};

function calcMeasure(measures, bound, m_model, a, height){
	var childs = m_model.o.childNodes;
			var q = m_model;	
			var sft = "";
			var defsft = getFontDefinition(q);//.getComputedStyle("fontSize")+" "+q.getComputedStyle("fontFamily");
			var txt = "";
			var tq = [{c:childs,i:0}];
			var rq = null;
			var offsetx = 0;
			var offsety = 0;
			var posy = bound.y;
			var cfont = "";
			
			while(rq = tq.pop()){
				for(var i = rq.i; i < rq.c.length; i++){
					q = $igk(rq.c[i]);						
					if (q.o.childNodes.length==0){
						sft = getFontDefinition(q) || defsft; 
						a.setFont(sft);
						
						txt = q.o.textContent || q.getHtml();
						var haveLine = txt.indexOf("\n") != -1;
						var e = {
							text: txt
						};
						var lines = txt.split("\n");
						var posy = 0;
						var width = 0;
						for(var line=0; line < lines.length; line++){
							txt = lines[line];
							if (line>0){
								posy+= height;
								offsetx = 0;
							}
							if (txt.trim().length>0){
								// a.fillText(txt, posx+offsetx, posy , b.width-offsetx);		
								// a.drawText(txt, posx+offsetx, posy , b.width-offsetx);
								offsetx += a.measureText(txt).width;
								width = Math.max(offsetx, width);
							}
						}
						e.width = width; 
						e.height = posy;
						if((measures.length == 0)|| (sft!=cfont)){
							e.font = sft;
							cfont = sft;
						}
						measures.push(e);
						// if (haveLine)
						// posy+= height;
						
					}else{
						tq.push({c:rq.c, 'i': i+1});
						tq.push({c:q.o.childNodes, 'i': 0});						
						break;
					}
				}
			}
			
			
			//console.debug(measures);
			
}


igk.system.createClass(ELEM, {name:"text", parent: ELEM.rectangle }, function(){
	// ELEM.rectangle.apply(this);
	// var text= "Welcome to igkdev's\n<b><i>Cancas</i> data Editor\n</b> BAE      INFO";
	var text= "Text";
	var font = "50px Arial";
	var textAlign="left";
	var fontStyle='regular';
	var mode = "text";
	var m_blending = "source-over";
	var m_opacity = 1;
	
	var matrix = new Matrix();
	
	igk.defineProperty(this, "text", {get:function(){return text; }, set: function(v){ text = v; m_model = 0; }});
	igk.defineProperty(this, "mode", {get:function(){return mode; }, set: function(v){ mode = v;}});
	igk.defineProperty(this, "font", {get:function(){return font; }, set: function(v){ font = v;}});
	igk.defineProperty(this, "textAlign", {get:function(){return textAlign; }, set: function(v){ textAlign = v;}});
	igk.defineProperty(this, "fontStyle", {get:function(){return fontStyle; }, set: function(v){ fontStyle = v;}});
	igk.defineProperty(this, "blendingMode", {get:function(){return m_blending; },
	set:function(v){
		if (v in BLENDING){
			this.m_blending = v;
		}
	}});
	igk.defineProperty(this, "opacity", {get:function(){return m_opacity; } ,set:function(v){
		if (v<0)
			v = 0;
		if (v>1)
			v = 1;
		m_opacity = v;
	}});
	
	
	
	mode = "html";
	var m_model = 0;
	
	//igk.defineProperty(this, "font", {get:function(){return font; }, set: function(v){ font = v;}});	
	// this.textAlign = "right";
	var measures = []; // measure all 
	this.render = function (a){
		var b = this.bound;
		if (!b)
			return;
		
		a.save();	
		a.setTransform(this.matrix);
		a.setGlobalCompositeOperation(this.blendingMode);
		a.setAlpha(this.opacity);
		a.fill = this.fill;
		a.stroke = this.stroke;
		a.setFont(font);
		a.setTextAlign(textAlign);
		

		var height = a.measureText(text).height;
		var cmatrix = new Matrix();
		
		cmatrix.translate(0, height);
		//cmatrix.multiply(matrix);
		
		a.transform(cmatrix);
		
		var lines = text.split("\n");
		var posy = b.y;
		var posx = b.x;
		switch(textAlign){
			case 'center':
				posx = Math.ceil( b.x + (b.width/2));
			break;
			case 'right':
				posx = Math.ceil( b.x + (b.width));
				break;
		}
		
		if (mode == "html"){
			// a.save();
			// a.fill = "black";
			// a.fillRect(b.x, b.y, b.width, b.height);
			// a.restore();
			
			
			if (!m_model){
				// init model
				var c = igk.createNode("div");
				c.setCss({
					"font":font
				});
				//remove multi line space
				c.setHtml(text.replace(/( )+/g, " "));
				m_model = c;
				
			
			
			}
			
			if ((!measures.bound ) || (measures.bound != b)){
				measures = [];
				calcMeasure(measures, b, m_model, a, height);
				measures.bound = b;
			}
				
			var childs = m_model.o.childNodes;
			var q = m_model;	
			var sft = "";
			var defsft = getFontDefinition(q);//.getComputedStyle("fontSize")+" "+q.getComputedStyle("fontFamily");
			var txt = "";
			var tq = [{c:childs,i:0}];
			var rq = null;
			var offsetx = 0;
			while(rq = tq.pop()){
				for(i = rq.i; i < rq.c.length; i++){
					q = $igk(rq.c[i]);	
			
		
					
					if (q.o.childNodes.length==0){
						sft = getFontDefinition(q) || defsft; //.getComputedStyle("font") || m_model.getComputedStyle("font") ;
						// console.debug("data : "+sft);
						a.setFont(sft);
						
						txt = q.o.textContent || q.getHtml();
						var haveLine = txt.indexOf("\n") != -1;
						
						var lines = txt.split("\n");
						for(var line=0; line < lines.length; line++){
							txt = lines[line];
							if (line>0){
								posy+= height;
								offsetx = 0;
							}
							if (txt.trim().length>0){
								a.fillText(txt, posx+offsetx, posy , b.width-offsetx);		
								a.drawText(txt, posx+offsetx, posy , b.width-offsetx);
							}
						}
						offsetx += a.measureText(txt).width
						// if (haveLine)
						// posy+= height;
						
					}else{
						tq.push({c:rq.c, 'i': i+1});
						tq.push({c:q.o.childNodes, 'i': 0});						
						break;
					}
				}
			}
			
		}
		else{
		
		
		for(var i= 0 ; i <lines.length; i++){
			var s = lines[i];
			if (s.trim().length == 0){
				posy+= height; continue;
			}
			
			a.fillText(s, posx, posy , b.width);		
			a.drawText(s, posx, posy, b.width);	
			posy+= height;
		}
		
		 }
		// a.fillText(text, b.x, b.y , b.width);		
		// a.drawText(text, b.x, b.y, b.width);		
		a.restore();
	};
	
	
	igk.appendChain(this, "Edit", function(engine){
			engine.addGroup()
			.addControlLabel("text", this.text);
			
	});
});




// exports
var EXPORTS = igk.winui.canvasEditor.Exports;
 EXPORTS.register("text", function(){
	var c = EXPORTS.initExport().concat([
	{name:"opacity", "default": 1}, 
	{name:"blendingMode", 'default':'source-over'},			
	{name:"font", 'default':'12px console'},
	{name:"textAlign", 'default':'left'},
	{name:"fontStyle", 'default':'regular'},
	{name:"text", 'type':'string', 'serializeAs': 'element' },
	
	]).concat(EXPORTS.matrixExport());	
	c.unserialize = function(t, a){
		//unserialize text node
		// console.debug("unserialize text node");
		this.text = $igk(t).getHtml();
	};//
	return c;
});


//mecanism
var Tools = igk.winui.canvasEditor.Tools;
// text mecanism
igk.system.createClass(Tools, {name:'TextMecanism', parent: Tools.RectangleMecanism }, function(){
	var overlay = -1;
	 this.createElement = function(){
		return this.host.add("text"); 
	 };
	 
	  igk.appendChain(this, "registerEvents", function(){
		var self=  this;		
		var s = this.host;
		this.host.overlayLayer.push(this);
		overlay = this.host.overlayLayer.length-1;
		
	});
	 igk.appendChain(this, "unregisterEvents", function(){
		var self=  this;		
		this.host.removeOverlay(this, overlay);
		overlay = -1;
		m_toedit = null;
	});
	
	 this.update = function(e, endP){		 
		 e.bound = 	CoreMathOperation.GetBound(this.startPos, endP);	 
	 };
	 this.getPoints = function(e){
		 var b = e.bound;
		 return [
			{x:b.x, y:b.y},
			{x:b.x+b.width, y:b.y},
			{x:b.x+b.width, y:b.y + b.height},
			{x:b.x, y:b.y + b.height}
			];
	 };
	 
	 this.render = function(a){
		 var e = this.elem;
		 if(!e)
			 return;
		var b = e.bound;
		var m =  a.getTransform();
		var dx = m.element[4];
		var dy = m.element[5];
		var ex = m.element[0];
		var ey = m.element[3];
	
		 a.save();
		a.stroke = "#ddd";
		a.strokeWidth = 1;
		a.drawRect((b.x*ex)+dx, (b.y*ex)+dy, b.width * ex, b.height*ey);
		a.restore();
		
	 }
});



Tools.registerEditorAttribute("text", Tools.TextMecanism);

//actions
//register actions
var ACTIONS = igk.winui.canvasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regActions(Key.Alt | Key.Shift | Key.T, "editor.selectool.text", function (a){a.tool = new Tools.TextMecanism(); });




//menu

ACTIONS.regMenuAction("tools.text", {index:10, callback:function(){
	ACTIONS.invoke("editor.selectool.text");
}});

ACTIONS.regMenuAction("tools.selection", {index:1, callback:function(){
	ACTIONS.invoke("editor.selectool.selection");
}});







})();