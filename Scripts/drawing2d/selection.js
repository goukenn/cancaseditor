"use strict";
//section mecanism
(function(){
	var _NS = igk.winui.cancasEditor;
	var Matrix = _NS.Matrix; //igk.winui.cancasEditor;
	
	var AC = _NS.Actions;
	var Key = AC.Key;
	var Tools = _NS.Tools;
	var MS_BTN = igk.winui.mouseButton;
	var POINTS = {
		TopLeft : 1,
		TopMiddle : 2, 
		TopRight  : 3,
		BottomLeft : 4,
		BottomMiddle : 5, 
		BottomRight  : 6,
		CenterLeft: 7,
		Center: 8,
		CenterRight: 9
	};

	var SELECTION_DASH = [10,2,10];
	var SELECTION_M_DASH = [4,2];
	
	
//selection mecanism : used for selections
igk.system.createClass(Tools, {name:'Selection', parent: Tools.RectangleMecanism }, function(){
	var CoreMathOperation= _NS.CoreMathOperation;
	
	var self = this;
	var m_toedit= null;  // store element to edit
	var m_tp  = 0;
	var sx = 0;
	var sy = 0;
	var dx = 0;
	var dy = 0;
	var mode = null; //selection mode t|ms| (translate|multiselect view)
	var obound = null;
	var _tempMatrix = null;
	var __applyMatrix = null;
	var _renderBound; // bound to render
	var overlay = -1; // 
	var ms_bound = 0;

	//override the wait to edit element
	igk.defineProperty(this, "elem", {
		get:function(){
			return m_toedit;
		}
	});
	 this.createElement  = function(){
		 return m_toedit;
	 };
	 this.selectPoint = function(point){	
		//select element from point location
		var items = this.host.select(point); 
		// console.debug(items);
		if (items.length > 0){
			this.host.Edit(items[items.length-1], this);
			m_toedit = items[items.length-1];
			//this.elem = items[0];
		}else{
			this.host.Edit(null, this);
			m_toedit = null;
		}
		this.host.refresh();
	 };
	 this.selectBound =  function(bound){
		 //select element from bound
		var items =  [];
		ms_bound = bound;			
				 
		var g = createSelectionMaskLayer();
		items = g.select(bound, this.host);//, this.host.layer? this.host.layer.Elements : this.host.list);
		
		this.host.Edit(null, this);
		// console.debug(items);
		if (items.length > 0){
			if (items.length==1){
				this.host.Edit(items[0], this);
				m_toedit = items[0];
				// this.host.Reload(m_toedit, this);
				// this.reaload(m_toedit, this
			}else
				m_toedit = multiSelection(items, this.host);
		}else{
			m_toedit = null;
		}
		this.host.refresh();
	 };
	 this.handleMouseUp = function(e){
		  // console.debug("selection mouse up "+ mode);
		 
		 switch(mode){
			case 'ms':
				this.endPos = e.loc;
				var g = _NS.CoreMathOperation.GetBound(this.startPos, this.endPos);
				var d = _NS.CoreMathOperation.GetDistance(this.startPos, this.endPos);
				this.host.Edit(null, this);
				ms_bound = 0;
				
				if ((m_toedit==null) && (d<5)){
					this.selectPoint(e.loc);
				}
				else{					
					this.selectBound(g);					
				}				
				mode = null;
				this.host.refresh();
			break;
			case 't'://translation complete
				if(m_toedit)
				{
					var _e = m_toedit;
					if (_e.type == 2)
						_e.update();
					else{
						this.host.Reload(_e, this);
						m_toedit =_e;
					}
					this.host.refresh();
				}
				mode= null;
			break;
			 default:
			  m_tp = 1;
			 if (!this.elem){
				 this.selectPoint(e.loc);
				
			 }else{
				 if (!this.elem.contains(e.loc.x, e.loc.y, this.host)){
					 // console.debug("no contains");
					 m_toedit = null;
					 this.host.Edit(null, this);
					  this.selectPoint(e.loc); 
				 }else{
					 //force reload edit on element
					
					 this.host.Reload(m_toedit, this);
					 
				 }
			 }
			 m_tp = 0;
			 break;
		 }
	 };
	 
	this.handleMouseDown = function(e){
				
		switch(e.ms_btn){
			case MS_BTN.Left:  			
				this.startPos = e.loc;
				this.endPos = e.loc;					
				if (m_toedit && m_toedit.contains(e.loc.x, e.loc.y, this.host)){
					if(!_tempMatrix)
						_tempMatrix = new Matrix();
					var v = m_toedit.matrix;
					if(v){
						//store old translation
						_tempMatrix.copytransform(v.element);
					}
					mode = 't';
				
				}
				else{
					mode = 'ms';
				}
				this.startCapture();
			break;
			case MS_BTN.Right:				
			break;
		}
	};
			
	this.handleMouseMove = function(e){ 
		if (mode =="ms"){
			//multiselection mode
			
			this.endPos = e.loc;
			this.host.refresh();
			return;
		}
		
		
		if (!m_toedit)
			return;
		
		var v = m_toedit.matrix;
		if(!v)
			return;
		
		switch(e.ms_btn){
			case MS_BTN.Left:
				if(mode == 't' && _tempMatrix){
					this.endPos = e.loc;
					dx = (-this.startPos.x + this.endPos.x);
					dy = (-this.startPos.y + this.endPos.y);
					//translate
					var g = _tempMatrix.element.concat();
					_tempMatrix.translate(dx , dy);
					m_toedit.matrix.copytransform(_tempMatrix.element);
					_tempMatrix.transform(g);
					m_toedit.initialize();
					this.host.refresh();
				}
			break;
		}
	};
	 
	 this.getPoints = function(elem){
		 // reset  definition on getting points
		mode=null;
		_tempMatrix = null;
		this.freeCapture();
		
		if (elem && ('bound' in elem)){			
			var b = _NS.CoreMathOperation.GetElemBound(elem); //.bound;
			
			
			return [
					{x: b.x, y: b.y},
					{x: b.x + b.width, y: b.y},
					{x: b.x + b.width, y: b.y+b.height},
					{x: b.x, y: b.y+b.height}
				];
			
		}
		return [];
	 };
	 this.getHandle = function(){return !0;};
	 this.onDblClick = function(e){ 
		 if (this.elem){
			 var _te = this.elem;
			 if (this.elem.contains(e.loc.x, e.loc.y, this.host)){
				 var g  = Tools.getEditorAttribute(_te.getType());
				 if (g){
					 this.host.tool = new g();
					 this.host.tool.startEdition(_te);
					 m_toedit = null;
					 // _te.
					 // console.debug("start edition");
					 // this.host.refresh();
				 }
			 }
		 }
	 };
	 this.onStart = function(){
		 
	 };
	 this.updateIndex = function(elem, index, endPos){
		 var m = 0;
		 if (elem){
			 m = elem.matrix;
			
		 }
		 if(!m)
			 return;
		 if (mode == null){
			 // console.debug("start scale mode");
			 mode='s'; //scale mode
			 obound = CoreMathOperation.GetElemBound(this.elem);
			 // console.debug(obound);
			 if (!_tempMatrix)
			 _tempMatrix = new Matrix();
			 _tempMatrix.copytransform(this.elem.matrix.element);
			 
			 if (this.isShift()){
				 mode='r'; //rotate mode
				 this.startPoint = endPos;
			 }
			 return;
		 } 
		 var ex = 1.0;
		 var ey = 1.0;
		 var sqewx = 0.0;
		 var sqewy = 0.0;
		 var dx = 0;
		 var dy = 0;
		 var mat = __applyMatrix || (function(){
			 __applyMatrix = new  Matrix();
			 return __applyMatrix;
		 })();
		 
		 mat.copytransform(_tempMatrix.element);
		 if (obound==null)
		 {
		 	console.debug("bound is null");
		 	return;
		 }
		 if (mode=='r'){
			 var cx = obound.x + (obound.width/2);
			 var cy = obound.y + (obound.height/2);
			 var c = {x:cx, y:cy};
			 var _sAngle = _NS.CoreMathOperation.GetAngle(c, this.startPos);
			 var g = ((_NS.CoreMathOperation.GetAngle(c, endPos) - _sAngle) * 180/Math.PI);
			 // console.debug("angle "+ g);
			 
			 mat.translate(-obound.x - (obound.width/2), -obound.y - (obound.height/2));
			 mat.rotate(g );
			 mat.translate(obound.x +(obound.width/2), obound.y+(obound.height/2));
		 }
		 else {
		 switch(index){
			 case 0:
				 mat.translate(-obound.x, -obound.y);				 
				 ex = (-(obound.x + obound.width) + endPos.x)/ obound.width;
				 ey = (-(obound.y + obound.height) + endPos.y)/ obound.height;				 
				 mat.scale(-ex, -ey);				 
				 mat.translate(endPos.x , endPos.y);	
				 
					 
			 
			 break;
			 case 1:
				 mat.translate(-obound.x, -obound.y);				 
				 ex = (-obound.x + endPos.x)/ obound.width;
				 ey = (-(obound.y + obound.height) + endPos.y)/ obound.height;				 
				 mat.scale(ex, -ey);				 
				 mat.translate(obound.x, endPos.y);				 
			 break;
			 case 2:
			
					
					
				// var _tempMatrix.element; 
		
				 // var oex = mat.element[0]; // old factor by default is 1.0
				 // var oey = mat.element[3];
				 mat.translate(-obound.x, -obound.y);
				 
				 ex = (-obound.x + endPos.x)/ obound.width;
				 ey = (-obound.y + endPos.y)/ obound.height;
				 
				 mat.scale(ex, ey);
				 
				 mat.translate(obound.x, obound.y);
				
				
			 break;
			 case 3:
			 
				 // console.debug("d");
				 mat.translate(-obound.x, -obound.y);				 
				 ex = (-(obound.x + obound.width) + endPos.x)/ obound.width;
				 ey = (-(obound.y) + endPos.y)/ obound.height;				 
				 mat.scale(-ex, ey);				 
				 mat.translate(endPos.x, obound.y);		
				 
			 break;
		 }
		
		 
		 }
		 this.host.setDebug(
		 [
		 "dx :"+dx,
		 "ex :"+ex,
		 "ey :"+ey
		 ]);
		
		 
		 // set scale
		 // mat.element[0] = ex; 
		 // mat.element[1] = 0;
		 // mat.element[2] = 0;
		 // mat.element[3] = ey;
		 // mat.element[4] = 0; 
		 // mat.element[5] = 0; 
		 
		 
		 //console.debug(mat.element);
		 //elem.matrix.reset();
		 // console.debug("reset transform")
		 // elem.matrix.reset();
		 // elem.matrix.rotate(4);
		 elem.matrix.copytransform(mat.element);
		 
		 elem.initialize();
		 this.host.refresh();
	 };
	
	 this.update = function(e, endP){
		 // console.debug("update selected " + endP.x + " x "+ endP.y);
		 
		 
		 if (this.elem){
			 var m = this.elem.matrix;
			 if (m){
				 if (mode==null){
					 mode = 't';
					 sx = m.element[4];
					 sy = m.element[5];
				 }
				dx = endP.x - this.startPoint.x; 
				dy = endP.y - this.startPoint.y; 
				m.translate(dx-sx, dy-sx);
				this.elem.initialize();
				this.host.refresh();
			 };
		 }
	 };
	 
	 igk.appendChain(this, 'onEndEdition', function(){
		 if (m_tp)
			 return;
		 m_toedit = null;
	 });
	
	//---------------------------------------------------------
	// selection actions
	//---------------------------------------------------------
	function _zoomIn(a){
		 if (a.type=="keydown")
		this.host.zoomIn(); 
	 };
	 function _zoomOut(a){
		  if (a.type=="keydown")
		 this.host.zoomOut();
	 };
	 
	 function _panLeft(a){
		  if (a.type=="keydown")
		 this.host.panLeft();
	 };
	
	function _panRight(a){
		  if (a.type=="keydown")
		 this.host.panRight();
	 };
	 
	 function _panUp(a){
		   if (a.type=="keydown")
		 this.host.panUp();
	 };
	
	function _panDown(a){
		  if (a.type=="keydown")
		 this.host.panDown();
	 };
	
	function _resetZoom(a){
		  if (a.type=="keyup")
		 this.host.resetZoom();
	 };
	 
	 function _resetFitAreaZoom(a){
		 if (a.type=="keyup")
			this.host.resetFitAreaZoom();
	 };
	 
	 function _delete(a){
		 if (a.type!="keyup")
			 return;
		var e = this.host.element ;
		// console.debug("delete element");
		if (e){
			var c = e["@container"];
			if (c){
				c.remove(e);
			}
			this.host.Edit(null, this);
			this.host.refresh();
		}else{
			if (m_toedit){
				if (m_toedit.type ==2){
					m_toedit.deleteAll();
				
				}else{
					this.host.removeAll([m_toedit]);
				}
				this.host.Edit(null, this);
				m_toedit = null;
				this.host.refresh();
					
			}
		}
	 };
	 	
	igk.appendChain(this, "registerKeyAction", function(actions){
		var self=  this;
		var M_ACT = igk.system.getNS("igk.winui.cancasEditor.actions.mecanismActions.drawin2D");
		actions[Key.Ctrl | Key.NumPad0] =  _resetZoom;
		actions[Key.Ctrl | Key.Alt | Key.NumPad0] =  _resetFitAreaZoom;
		actions[Key.Ctrl | Key.Plus] =  _zoomIn;
		actions[Key.Ctrl | Key.Minus] =  _zoomOut;
		actions[Key.Ctrl | Key.Left] =  _panLeft;
		actions[Key.Ctrl | Key.Right] =  _panRight;
		actions[Key.Ctrl | Key.Up] =  _panUp;
		actions[Key.Ctrl | Key.Down] =  _panDown;
		actions[Key.Delete] =  _delete;
		
		if (M_ACT){
			actions[Key.Alt | Key.Up] = M_ACT.moveElementOver;
			actions[Key.Alt | Key.Down] = M_ACT.moveElementBelow;
			actions[Key.Shift | Key.Alt | Key.Up] = M_ACT.moveElementTopOver;
			actions[Key.Shift | Key.Alt | Key.Down] = M_ACT.moveElementBottomBelow;
		}
	});
	
 
	 
	 function updateWheel(e){
		 	var s = self.host;
			// console.debug("mouse well ");
			// console.debug(e);
			var i = e.deltaY >= 0;
			
			if (i){
				s.zoomOut(); 
			}else{
				s.zoomIn(); 
			}
			
			// e.preventDefault();
			// e.stopPropagation();
	 };
	

	 igk.appendChain(this, "registerEvents", function(){
		var self=  this;
		
		var s = this.host;
		
		// var rc = s.add("rectangle");
		// rc.bound = {
			// x: 100,
			// y: 50,
			// width: 100,
			// height: 100
			
		// };
		// rc.initialize();
		
		s.on("mousewheel", updateWheel, {passive: 1});
		
		
		this.host.overlayLayer.push(this);
		overlay = this.host.overlayLayer.length-1;
		m_toedit = null;
		
		// s.refresh();
	});
	
	 igk.appendChain(this, "unregisterEvents", function(){
		var self=  this;
		self.host.unreg_event("mousewheel", updateWheel);
		
		this.host.removeOverlay(this, overlay);
		overlay = -1;
		m_toedit = null;
	
	});
	var maskLayer = 0;
	function createMaskLayer(){
		var o = igk.createNode("canvas");
		var p = o.o.getContext("2d");
		var _ri = 0;
		var _masklayer = 'xor';
		// igk.system.createNS("masklayer",{
			// type: 'xor'
		// });
		
		var _self = (new function(){
			var _w = 0;
			var _h = 0;
			var m_transform=0;
			_NS.primitive.apply(this, [p]);
			igk.appendProperties(this, {
				setSize: function(w,h){
					_w = w;
					_h = h;
					o.setAttributes({
						width: _w,
						height: _h
					}).setCss({
						width:_w+'px',
						height:_h+'px'
					});
				},
				setGlobalCompositeOperation: function(v){
					//ignore compositing mode
				},
				getDocumentSize:function(){
					return {w:_w, h:_h};
				},
				bindTransform: function(f){
					m_transform = f;
				},
				render: function(items){
					this.fill = "#000";
					this.fillRect(0,0,_w, _h);
					var s = o.o.toDataURL();
					
					if (items){
						var q = items.root;
						this.save();
						p.globalCompositeOperation = _masklayer || 'xor';
						this.fill = '#FFF';
						this.stroke = '#000';
						if (m_transform)							
						this.setTransform(m_transform);
					
						_ri = 1;
						while(q){
							if (q.visible)
							q.render(this);
							q = q.next;
						}
						
						_ri = 0;
						// console.debug("p.globalCompositeOperation "+ p.globalCompositeOperation);
						this.restore();
					}
					
					
					var g = o.o.toDataURL();
					console.debug("Changed ? "+(s != g));
					
					
				},
				toString: function(){
					return 'masklayer'
				}
			});
			
			var _q = this;
		
			igk.extendProperty(this, 'fill', {
				get: function(b){
					return b.apply(this);
				},
				set: function(v,b){
					if (!_ri)
						b.apply(this,[v]);
				}
			});
			
			igk.extendProperty(this, 'stroke', {
				get: function(b){
					return b.apply(this);
				},
				set: function(v,b){ 
					if (!_ri)
						b.apply(this, [v]);
				}
			});
	
			igk.defineProperty(this, 'o',  {get:function(){ return o.o; }});
		
		});
		
		return _self;
	};
	
	
	var selectionMask = 0;
	
	function createSelectionMaskLayer(){
		if (selectionMask){
			return selectionMask;
		}
		
		var o = igk.createNode("canvas");
		var p = o.o.getContext("2d");
		var _ri = 0;
		var _masklayer = 'xor';
		
		var _self = (new function(){
			var _w = 0;
			var _h = 0;
			var m_transform=0;
			var _mitems = [];
			_NS.primitive.apply(this, [p]);
			igk.appendProperties(this, {
				select: function(bound, host,  items){
					items = items || (host.layer ? host.layer.Elements : host.list);					
					var m =  host.getTransform();
					var dx = m.element[4];
					var dy = m.element[5];
					var ex = m.element[0];
					var ey = m.element[3];
					var b = bound;
			
					var tmp = m.element.concat();
					if (m.isIdentity()){
						m.translate(-b.x, -b.y);
					}else{
						m.translate(-((b.x*ex)+dx),-((b.y*ex)+dy));
					}					
					this.bindTransform(m.element.concat());
					m.transform(tmp);
							
			
					_mitems = [];
					this.setSize(bound.width, bound.height);
					if(items)
					this.render(items, host);
					return _mitems;
				},
				setSize: function(w,h){
					_w = w;
					_h = h;
					o.setAttributes({
						width: _w,
						height: _h
					}).setCss({
						width:_w+'px',
						height:_h+'px'
					});
				},
				setGlobalCompositeOperation: function(v){
					//ignore compositing mode
				},
				getDocumentSize:function(){
					return {w:_w, h:_h};
				},
				bindTransform: function(f){
					m_transform = f;
				},
				render: function(items, host){ 
					// var _debug = host.settings.isDebug;
					// if (_debug){
						// var cp = $igk(host.canvas.o.parentNode).select('.opl').first() ;
						// if (cp)
						 // cp.setHtml("");
					// }
					this.fill = "#000";
					this.fillRect(0,0,_w, _h);
					var s = o.o.toDataURL(); //backup canvas data
					var g = 0;
					if (items){
						var q = items.root;
				
						p.globalCompositeOperation = _masklayer || 'xor';
					
				
					
						
						while(q){
							if (q.visible){
								// console.debug("render "+q.getType());
								p.globalCompositeOperation = "source-over";
								this.fill = "#000";
								this.fillRect(0,0,_w, _h);
								
								// p.globalCompositeOperation = _masklayer || 'xor';
								this.save();
								this.fill = '#FFF';
								this.stroke = '#000';
								_ri = 1;
								if (m_transform)							
									this.setTransform(m_transform);
								 q.render(this);
								
								 g = o.o.toDataURL();
								 if (s!=g){
									  _mitems.push(q);
									 // console.debug("select ::: "+q.getType());
								 }
								// if ( _debug){
								 // var gp =  host.canvas.o.parentNode;
								 // var cp = $igk(gp).select('.opl').first() || $igk(gp).add("div").setCss({marginLeft:'4px'}).addClass("opl posab dispib loc_t loc_r");
								 // cp.add("img").o.src = g;
								// }
								 _ri = 0;
								 this.restore();
							}
							q = q.next;
						}
						 
					}
					
					 
					
					
				},
				toString: function(){
					return 'selectionMaskLayer'
				}
			});
			
			var _q = this;
		
			igk.extendProperty(this, 'fill', {
				get: function(b){
					return b.apply(this);
				},
				set: function(v,b){
					if (!_ri)
						b.apply(this,[v]);
				}
			});
			
			igk.extendProperty(this, 'stroke', {
				get: function(b){
					return b.apply(this);
				},
				set: function(v,b){ 
					if (!_ri)
						b.apply(this, [v]);
				}
			});
	
			igk.defineProperty(this, 'o',  {get:function(){ return o.o; }});
		
		});
		
		selectionMask = _self;
		return _self;
	}
	
	
	var multiselectionListener = 0;
	function multiSelection(items, host){
		if (multiselectionListener){
			multiselectionListener.setDef(items, host);
			return multiselectionListener;
		}
		function _multiSelectionListener(items, host){
			//console.debug("create ::: "+items);
			var items = items;
			var host = host;
			var m_matrix = new _NS.Matrix();
			igk.appendProperties(this, {
				setDef: function(i, h){
					items = i;
					host = h;
					m_matrix.reset();
				},
				contains: function(x, y){
				//	console.debug("contains :::: "+items.length);
					for(var j = 0; j < items.length; j++){
						if (items[j].contains(x,y, host)){ 
							return !0; 
						}
					}
					return !1;
				},
				renderSelection: function(a, dx, dy, ex, ey){
					if (!items)
						return;
					var b = 0;
					for(var j = 0; j < items.length; j++){
					
						b = _NS.CoreMathOperation.GetElemBound(items[j]); //TransformBound(
						if ((b.width<=0) || (b.height<=0))continue;
						a.save();								
						a.stroke = "indigo";		
						a.setDashoffset(SELECTION_DASH);
						a.strokeWidth = 1;
						var temp = m_matrix.element.slice();
						temp[4] *= ex;
						temp[5] *= ey;
						a.setTransform(temp);
						a.drawRect((b.x*ex)+dx, (b.y*ex)+dy, b.width * ex, b.height*ey);
						a.restore();
					}
				},
				initialize: function(){
					// initialize nothing
				},
				update: function(){
					if(m_matrix.isIdentity())return;
					var t = m_matrix.element.concat();
					for(var j=0; j < items.length; j++){
						items[j].matrix.mult(t, 1);
						items[j].initialize();
					}
					m_matrix.reset();
				},
				deleteAll:function(){
					host.removeAll(items);					
					items = null;
				}
			});
			
			igk.defineProperty(this, 'matrix', {get: function(){ return m_matrix; }});
			igk.defineProperty(this, 'type', {get: function(){ return 2; }}); //multiselection type
			igk.defineProperty(this, 'items', {get: function(){ return items; }}); //multiselection type
		};
		
		multiselectionListener = new _multiSelectionListener(items, host);
		return multiselectionListener;
	}
	this.render = function(a){
		var m =  a.getTransform();
		var dx = m.element[4];
		var dy = m.element[5];
		var ex = m.element[0];
		var ey = m.element[3];
		var b = 0;
		
		if (mode =="ms"){
			a.save();
			a.stroke = _NS.colors.black;	
			b = _NS.CoreMathOperation.GetBound(this.startPos, this.endPos);
			a.setDashoffset(SELECTION_M_DASH);			
			a.drawRect((b.x*ex)+dx, (b.y*ex)+dy, b.width * ex, b.height*ey);
			a.restore();
			return;
		
		}
		
		if (ms_bound){
			// a.save();
			// b = ms_bound;
			// a.fill = "#444";
			// var w = b.width * ex, h=b.height*ey;
			// var x = (b.x*ex)+dx, y=(b.y*ex)+dy;
			// //masking layer
			// maskLayer = maskLayer || createMaskLayer();
			// maskLayer.setGlobalCompositeOperation('difference');
			// var tmp = m.element.concat();
			// maskLayer.setSize( w,h);
			// if (m.isIdentity()){
				// m.translate(-b.x, -b.y);
			// }else{
				// m.translate(-((b.x*ex)+dx),-((b.y*ex)+dy));
			// }
			// maskLayer.bindTransform(m.element.concat());
			// //restore transfor reference
			// m.transform(tmp);
			
			// //maskLayer.translate(-b.x, -b.y);
			// maskLayer.render(a.layer? a.layer.Elements : a.list);
			
			
			// //a.drawRect(x,y,w,h);			
			// a.drawImage(maskLayer.o, x,y, w,h);
			// a.restore();
		}
		
		if (m_toedit && ('renderSelection' in m_toedit)){
			//render selection
			m_toedit.renderSelection(a,dx, dy, ex, ey);
		}
		
		if (!this.elem)
			return;
		b = this.elem.bound;
		if(!b)
			return;
		b = _NS.CoreMathOperation.GetElemBound(this.elem); //TransformBound(
		a.save();
				
		a.stroke = "indigo";		
		a.setDashoffset(SELECTION_DASH);
		a.strokeWidth = 1;
		a.drawRect((b.x*ex)+dx, (b.y*ex)+dy, b.width * ex, b.height*ey);
		a.restore();
		
		if (_renderBound && _renderBound.show){
			a.save();
			a.setTransform(m);
			a.stroke = 'yellow';
			
			b = _renderBound;
			a.drawRect(b.x, b.y, b.width, b.height);		
			a.stroke = 'red';
			b = obound;
			a.drawRect(b.x, b.y, b.width, b.height);			
			a.restore();
		}
	}
	
	
});


	
	AC.regActions(Key.Alt | Key.Shift  | Key.S, "editor.selectool.selection",  function(a){			
		a.tool = new igk.winui.cancasEditor.Tools.Selection();
	});
	
})();