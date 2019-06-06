(function(){


if (igk.winui.canvasEditor.NotAvailable)
	return;



var CoreMathOperation = igk.winui.canvasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.canvasEditor.DrawingElements", {});
var SERI = igk.winui.canvasEditor.Serializer;
var Tools = igk.winui.canvasEditor.Tools;
var UTILS = igk.winui.canvasEditor.Utils;
var PATH = igk.winui.canvasEditor.Utils.Path;
var distance = CoreMathOperation.GetDistance;



igk.system.createClass(ELEM, {name:"spline", parent:ELEM.rectangle }, function(){
	// ELEM.rectangle.apply(this);
	
	// console.debug(this);
	
	
var points = [];
var tension= 0;
var _path_ = new Path2D();
var close = 1;
var fillmode = ELEM.fillMode.evenodd;
igk.defineProperty(this, "fillMode", {get:function(){return fillmode; } , set: function(v){
	if (v in ELEM.fillMode){
		if (v != fillmode){
			fillmode = v;
			// raiseEvent("propertyChanged", {target: this, "name":"fillmode"} ); 
		}
	}
}});

igk.defineProperty(this, "close", {get:function(){return close; } , set: function(v){	
	if (v != close){
		close = v;
		// raiseEvent("propertyChanged", {target: this, "name":"close"} ); 
	}
}});
igk.defineProperty(this, "tension", {get:function(){return tension; } , set: function(v){	
	if (v != tension){
		tension = v;
		// raiseEvent("propertyChanged", {target: this, "name":"tension"} ); 
	}
}});

igk.defineProperty(this, "points", {get:function(){
	return points;
}, set: function(v){
	if (!v || UTILS.IsArray(v)){
		points = v;
	// raiseEvent("propertyChanged", {target:this, "name" : "points" }}
	}
}});




this.render = function(a){
	a.save();	
	a.setTransform(this.matrix);
	a.fill  = this.fill;
	a.stroke = this.stroke;
	a.strokeWidth = this.strokeWidth;
	a.fillPath(_path_, fillmode);
	a.drawPath(_path_, fillmode);
	
	a.restore();
};

this.initialize = function(){
	_path_ = new Path2D();
	PATH.BuildPath(_path_, points, points.length, false, tension);
	if (this.close)
		_path_.closePath();
	this.bound = CoreMathOperation.GetVectorBounds(points);
};

this.contains = function(x, y, a){
			if (_path_){
				a.save();
				a.setTransform(this.matrix);
				var v =  a.isPointInPath(_path_, x, y);
				a.restore();
				return v;
			}
			return !1;
};
		

});

//mecanism properties
igk.system.createClass(Tools, {name:'SplineMecanism', parent: Tools.RectangleMecanism},
	function(){
		//.ctr
		Tools.RectangleMecanism.apply(this);
		
		var points = [];
		
		this.getPoints = function(){
			return null;
		};
		this.updateIndex = function(elem,index, endPos){
			
		};
		this.update = function(elem, endPos){
			var pts = elem.points;
			if ((pts.length==0) || distance(pts[pts.length-1], endPos) > 16){
				elem.points.push(endPos);
				elem.initialize();
			}
		};
		this.endDrawing = function(elem){
			var pts = elem.points;
			//simplify point
			
			elem.points = pts;
		};
		this.createElement = function(a){
			return this.host.add("spline");
		};
		
	}
);


Tools.registerEditorAttribute("spline", Tools.SplineMecanism);

//export properties
var EXPORTS = igk.winui.canvasEditor.Exports;
EXPORTS.register("spline", function(){
var c = EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport()).concat([
		{name:"points",	serializer: SERI.vector2Serializer}, 
		{name:"fillMode", 'default': ELEM.fillMode.evenodd },		
		{name:"close", 'default': 1 },		
		{name:"tension", 'default': 0.5 }		
		]).concat(EXPORTS.matrixExport());		
return c;
});



//register actions
var ACTIONS = igk.winui.canvasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regActions(Key.Alt | Key.Shift | Key.M, "editor.selectool.spline", function (a){a.tool = new Tools.SplineMecanism(); });


ACTIONS.regMenuAction("tools.spline", {index:8, callback:function(){
	ACTIONS.invoke("editor.selectool.spline");
}});




})();




// var p = {
	// run: function(){
		// name = 'data';
	// }
// };


// var e = p;
// p = {};

// j =

// delete(p);


// e.run();
// console.debug("NAME :::: e :"+e.name);
// console.debug("NAME :::: p :"+p);


// igk.ready(function(){

// igk.dom.body().setHtml('');
// for(let i = 0; i  < 10; i++){
	
	// var o = igk.createNode("div").on("click", function(){		
		// alert(i);
	// }).setHtml("click "+i).o;
	
	// igk.dom.body().add(o);
	
// }

// });