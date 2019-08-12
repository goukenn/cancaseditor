//linear brush edition
// author: C.A.D. BONDJE DOUE
// 26/11/2018
// part of igk.winui.cancasEditor apps
// desc: definition of round rectangle mecanism


"use strict";

(function(){
	var _NS = igk.system.require('igk.winui.cancasEditor');
	if (_NS.NotAvailable){
		
		console.debug(" bleObject - is not available");		
		return;
	}
	if (igk.system.getNS('_NS.DrawingElements.gleObject'))
	{
		//already define
		return;
	}
	
	
	var GLE = igk.system.createNS(_NS.fullname+".drawing3d.gle",{});
	
	// console.debug("----------------------------------init gleObject------------------------- "+igk.getScriptLocation().location);

	
	// gle context that will be shared on device context
	var gleContext = 0;
	var designer = 0;
	var initGlobal = 0;	
	var _shaderLoaded = 0;
	
	var _spriteBatch = null;
	 
	var CoreMathOperation = _NS.CoreMathOperation;
	var ELEM = igk.system.require(_NS.fullname+".DrawingElements", {});
	var SERI  = _NS.Serializer;
	var Tools = _NS.Tools;
	var UTILS = _NS.Utils;
	var PATH  = _NS.Utils.Path;

	function createGLContext(canvas){
		var e = {
			alpha: true, // important to render overloay image
		enableDebug:false,
		antialias:true
		};
		return canvas.getContext("webgl", e) || canvas.getContext('experimental-webgl',e );
	};
	
	 function die(msg){
		 throw new Error(msg);
	 };
	 
	 // object used to render 3d object
	 function gleDrawingItem(item){
		 
		igk.defineProperty(this, "id", {get: function(){
			return item.id;
		}, set: function(v){
			item.id = value;
		}});
		var data = [];
		item.vertices.forEach(function(e){
			data = data.concat(e); 
		});
		data = data.toFloatArray();
		var _indices = [];
		item.indices.forEach(function(e){
			_indices = _indices.concat(e); 
		});
		_indices = _indices.toFloatArray();
		
		// console.debug("data");
		// console.debug(data);
		// console.debug("indinces");
		// console.debug(_indices);
		
		this.render= function(gl, a, program){
			 // console.debug("render : "+item.id);
			 // var g = program.buffers.inPosition;
			 // program.buffers.inPosition =null;
			 program.setAttribute('inPosition',  data, 3, 3, 0);
			 program.setAttribute('inColor', null);
			 if (!program.buffers.indiceBuffer)
				 program.buffers.indiceBuffer = gl.createBuffer();
			 
			 
			gl.bindBuffer(gl.ARRAY_BUFFER, program.buffers.inPosition);
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program.buffers.indiceBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(_indices), gl.STATIC_DRAW);
			gl.drawElements(gl.TRIANGLES,
			_indices.length,//count point indice to draw
			gl.UNSIGNED_SHORT, //type of transfered data
			0);
		};
		 
	 };
	// for round rectangle
	igk.system.createClass(ELEM, {name: "gleObject",  parent:ELEM.rectangle  }, function(){
		var m_childs = [];
		
		
		igk.defineProperty(this , "gl", {
			get: function(){
				return gleContext;
			}
		});
		igk.defineProperty(this , "childs", {
			get: function(){
				return m_childs;
			}
		});
		this.clear = function(){
			m_childs = [];
		};
		
		this.initialize = function(){
			
		};
		this.render = function(a){	
			if (!gleContext || !_shaderLoaded){
				console.debug("gle context not created or shader not loaded");
				return;
			}
			
			var gl = gleContext;
			var program = 0;
			
			
			if (!initGlobal){
			 // console.debug("init global gleObject");
				initGlobal = 1;
				_spriteBatch = new  igk.bge.shaderContainer(); // singleton service initialize
				_spriteBatch.loadProgram(gl, 
					[_NS.bge.shaders.spritebatchVS],
					[_NS.bge.shaders.spritebatchFS]
				);

					program =  _spriteBatch.program;
					
					program.useIt(gl);
							program.initAttribLocation(gl, ['inPosition']);

				// console.debug("program :::: "+program);
				var math = igk.bge.math;
				
				var mat = math.mat4.createIdentity();

				// console.debug(program);
				// //pass identity matrix to all uniform mat4
				program.setUniform("uGlobalView", mat);
				program.setUniform("uProjection", mat);
				program.setUniform("uModelView", mat);
				
				

				
			}else{
				program =  _spriteBatch.program;
			}
			
			
			var s  = a.getDocumentSize();
			var W  = s.w;
			var H  = s.h; 
			if((W<=0)||(S<=0))
				return;
			
			designer.setAttributes({
				width: W,
				height: H
			}).setCss({
				width:W+'px',
				height:H+'px'
			});
			
			gl.viewport(0,0, W, H);
			
			//rvba
			//make scene background transparent
			gl.clearColor(0.0, 0.0, 0.0, 0.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			
			_spriteBatch.program.useIt(gl);
			
			var data = [];
			var _indices = []; // 0, 1, 2];//.toFloatArray();
			//centeer
			data.push(0);
			data.push(0);
			data.push(1);
			data.push(1);
			data.push(1);
			_indices.push(0);
			var pointCount = 50;
			for(var i = 0; i <= pointCount; i++){
				
				
				data.push(Math.sin( (90+(i * (360/pointCount))) * (Math.PI / 180.0)));
				data.push(Math.cos( (90+(i * (360/pointCount))) * (Math.PI / 180.0)));
				
				var r = igk.system.hsl2rgb(i * (360/pointCount), 100, 50);
				data.push(r.r/255.0);
				data.push(r.g/255.0);
				data.push(r.b/255.0);
				_indices.push(i+1);
				
			}
			// _indices.push(i);
			data = data.toFloatArray();
			// console.debug(data);
			//draw - rectangle
			// data =  [
			// 0, 0.5, 1.0, 0.0, 0.0, 
			// 0.5, -0.5, 0.0, 1.0, 0.0,
			// -0.5, -0.5, 1.0,0.0, 1.0
			// ].toFloatArray();
			// //set inPosition attribute value and enable the vertex buffer
			program.setAttribute('inPosition', data, 2, 5);		
			program.setAttribute('inColor', data, 3, 5, 2);		
			// gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
			
			 if (!program.buffers.indiceBuffer)
				 program.buffers.indiceBuffer = gl.createBuffer();
			 
			 

			 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program.buffers.indiceBuffer);
			 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(_indices), gl.STATIC_DRAW);
			 
			 
			gl.drawElements(gl.TRIANGLE_FAN, 
				_indices.length,//count point indice to draw
				gl.UNSIGNED_SHORT, //type of transfered data
				0);
			//render child scene
			for(var i = 0; i < m_childs.length; i++){
				m_childs[i].render(gl, a, _spriteBatch.program);
			}
			
		
			
			gl.finish();
			gl.flush();
			// - draw gle 
			a.save();
			a.setGlobalCompositeOperation("source-over");
			a.drawImage(designer.o, 0, 0, W, H);			
			a.restore();
		};
	});
	
	
function __isAvailable(){	
	return (gleContext && _shaderLoaded);
};


GLE.menuHostInitial = function(a, key, menuHost){
var v = __isAvailable();
menuHost.visible = v;
menuHost.enable = v;
};
	
igk.system.createClass(Tools, {name:'gleObjectMecanism', parent: Tools.RectangleMecanism},
	function(){		
		this.createElement = function(){
			if (__isAvailable())
			return this.host.add("gleObject");
		};
		
		this.loadObjFile=function(obj){
			var e = this.elem;
			if (!e){
				e = this.createElement();
			}
			obj.objects.forEach(function(j){
				e.childs.push(new gleDrawingItem(j));
			});
			 
		};
		// igk.appendChain(this, "registerEvents", function(){
			// LoadDemo(this.host);
		// });
	});
	
	
// safari 537 not support '`' caracter
// function LoadDemo(a){
		// //demo open file 
		// var txt=`
// # Blender v2.79 (sub 0) OBJ File: 'def.blend'
// # www.blender.org
// mtllib plane_out.mtl
// o Cube.005
// v 1.000000 0.000000 0.000000
// v 1.000000 1.000000 0.000000
// v 0.000000 1.000000 0.000000
// v 0.000000 0.000000 0.000000
// vn 0.0000 -1.0000 -0.0000
// usemtl Material.005
// s 1
// f 2//1 4//1 1//1
// f 2//1 3//1 4//1
// `;
		// var o = igk.blender.utils.openObjFile(txt);
			
		// if(o && o.objects.length>0){
			// if (a.tool.loadObjFile)
				// a.tool.loadObjFile(o);
			// else{
				
			// }
			// a.refresh();
			
		// }
		// console.debug("r");
		// console.debug(o);
// };
	
	
	
	var EXPORTS = _NS.Exports;
	
	EXPORTS.register("gleObject", function(){
	
	var c = EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport()).concat([
		{name:'center', serializer: SERI.vector2Serializer , unserialize : SERI.vector2Unserializer},
		{name:'renderMode', 'default':'fill'}
		]);			
return c;
});

	//--------------------------------------------------------------------------------
	// action
	//--------------------------------------------------------------------------------
	
	
	var ACTIONS = _NS.Actions;
	var Key = ACTIONS.Key;
	ACTIONS.regActions(Key.Alt | Key.Shift | Key.K, "editor.selectool.gleobject", function (a){
		if (__isAvailable()){
			a.tool = new Tools.gleObjectMecanism(); 
		}
	});

	// igk.publisher.register("ce://shaderloaded", function(){
		// console.debug("shader loaded ::::::");
	// });

	ACTIONS.regMenuAction("tools.drawing3d.gleObject", {index:8, callback:function(){
		ACTIONS.invoke("editor.selectool.gleobject");
	}, initialize: function(a, key, menuHost){
		// console.debug("initialze menu .................................");
		var _p = a.getService("publisher");
		if (_p){
			_p.on('gls://shaderloader', function(){
				// console.debug("shader loaded-----------------------------------------");
				var v = __isAvailable();
				menuHost.visible = v;
				menuHost.enable = v;
			});
		}
		menuHost.initialize = function(){
			var v = __isAvailable();
			menuHost.visible = v;
			menuHost.enable = v;
		};
		return true;
	}});
	
	function _gleinitExtraTool(){
		return __isAvailable();
	};
	//append extra menu
	// ACTIONS.regMenuAction("gleObject", {initialize:_gleinitExtraTool});
	
	ACTIONS.regMenuAction("file.import.importWaveFront", {
		index:10, 
		callback:function(){
			igk.system.io.pickfile(null, {
				"accept":".obj",
				"complete": function(file){
				
			}});
		}, 
		initialize: _gleinitExtraTool});

	ACTIONS.regMenuAction("file.import.importCollada", {index:11, 
		initialize: _gleinitExtraTool,
		callback:function(){
			igk.system.io.pickfile(null, {
				"accept":".dae",
				"complete": function(file){				
			}});
	}
	});
	
	
	var SHADERS = igk.system.createNS(_NS.fullname+'.bge.shaders', {});
	
	
	
	//------------------------------------------------------------------------
	//initialize gle to an application context. gle is for webgl embeded
	//------------------------------------------------------------------------
	_NS.initApplication(function(a){
		//console.debug("initialize application - gleObject");
		
		// console.debug(igk.system.getType('igk.bge'));		
		
		var tc = igk.createNode('canvas')
				.setAttribute("id", "webgl")
				.setAttribute("igk-no-contextmenu", "1")
				.addClass("fitw posab loc_a no-selection").setCss({zIndex: 5, visibility: 'hidden'});
		var _p = a.getService("publisher");
		
				 
				
				try{
					//get uri to load shaders
					var uri = eval(igk.scripts["@injectlocation"]);
					if (!uri || uri.length==0)
						return; 
					
					// console.debug("the uri "+uri);
					gleContext =  createGLContext(tc.o) || die("failed to created gl");
										
					 
				
					if (window.caches  && (window.location.protocol=="https:")){
						// can cache shader only for https 
						window.caches.open(a.settings.appCacheName).then(function(cache){
							cache.match(uri+"/cacheslist").then(function(rep){
								if (!rep){
									igk.bge.shaders.loadShaders(uri+"/shaders",SHADERS.fullname).then(function(e){
										_shaderLoaded = 1;
										// console.debug(uri+"/cacheslist");
										// console.debug("store cachelist : "+e.data);
										// console.debug("cahe name : "+a.settings.appCacheName);
										if (_p)
										 _p.publish('gls://shaderloader',{});
										if (e && e.data){
											cache.put("/igkdev/Projects/igk_default/Views/cancaseditor/Scripts/cacheslist", new Response(new Blob([e.data], {
												type:'text/javascript'
											})));
										}
										a.refresh();
									});
								}else{
									//laad entry on shader
									// console.debug("/!\\\ response found ");
									// console.debug(rep);
									var gc = igk.createNode("script");
								
									rep.text().then(function(d){ 
										// if (document.head)
											// $igk(document.head).add(gc);
										// gc.setHtml(d);
										try{
											eval(d);
											_shaderLoaded = 1;
											// console.debug("script loaded---------------------");
										}catch(ex){
											console.error("error :::::::"+ex);
										}
									}); 
									
									// console.debug(gc.o); 
									
								}
							}).catch(function(e){
								console.debug("failed to load from cache" + e);
							});
						});
					}else{
					
					if (uri){					 
					
						var p = igk.bge.shaders.loadShaders(uri+"/shaders", SHADERS.fullname);
						if (p)
							p.then(function(){
							 _shaderLoaded = 1;
							 // console.debug("shader loaded......................;;");
							 a.refresh();
							});
							
						}else{
							console.error("p: failed to load shaders: "+p);
						}
					
					}
					
					
					
				}
				catch(ex){
					gleContext = 0;
					console.error("[ce] - failed to create webgl context: "+ex);
				}
				
				a.canvasObjects = {
					webgl: tc,
					context: gleContext
				};
				tc.init();
				
				//initialize shaders
				
				designer =  tc;				
				var gl = gleContext;
				 if (a.settings.isDebug && gl.getParameter ){				
					console.debug(gl.getParameter(gl.VERSION));
					console.debug(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
					console.debug(gl.getParameter(gl.VENDOR));
				 }		
				
	});
	
	

})();
