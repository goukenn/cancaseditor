"use strict";

(function(){

var _NS = igk.winui.cancasEditor;
var AC = _NS.Actions;
var R = _NS.R; //.Actions;
var Key = AC.Key;
var CT = igk.system.convert;

function tabButton(){
	var _btns = [];
	var _q = igk.createNode("div");
	var _active = 0;
	//exposed event
	_q.addEvent("clickButton", {});
	
	_q.addClass("igk-tab-button");
	this.addBtn = function(id, text){
		var r = _q.add("div");
		r.addClass("igk-btn");
		r.setHtml(text);
		r.on("click", function(){
			_q.raiseEvent("clickButton", {
				target: r,
				id:id,
				text:text
			});
		});
		_btns.push(r);
		_btns[id] = r;
	};
	this.on=function(n, callback){
		_q.on(n, callback);
		return this;
	};
	this.select=function(n){
		if (n in _btns){
			_btns[n].addClass("igk-active");
			if (_active)
				_btns[_active].rmClass("igk-active");
			_active = n;
		};
	};
	igk.defineProperty(this, "o", {
		get:function(){
			return _q.o;
		}
	});
};


function colorValueLabel(){
	var _q = igk.createNode("div").addClass("posr dispib igk-color-value-label");
	var _i = _q.add("input").setAttributes({type:'text'}).on("change", function(){
		
	});
	igk.defineProperty(this, "o", {
		get:function(){
			return _q.o;
		}
	});	
	
	this.setValue = function(v){
		_i.o.value = v; //setHtml(v);
	};
	
	this.setValue("#000");
}


function tabColorPicker(){
	var _q = igk.createNode("div");
	igk.defineProperty(this, "o", {
		get:function(){
			return _q.o;
		}
	});	
	_q.addEvent("valuechanged", {});
	igk.appendProperties(this, {
		on: function(n,p){
			_q.on(n,p);
			return this;
		}
	});
};


function rgbColorPicker(engine){
	tabColorPicker.apply(this);
	var MS_BTN = igk.winui.mouseButton;
	var CoreMathOperation = _NS.CoreMathOperation;
	var m_update = 0, _q = $igk(this.o);
	var _cur = null;
	var _self = this;
	var _cl = 0;
	var m_defcl = 0;
	_q.addEvent("colorchanged", {});
	var m_capture=0;
	igk.defineProperty(this, "color", {
		get:function(){
			return _cl;
		},
	set: function(v){
		if (_cl != v){
			_cl = v;
			_q.raiseEvent("colorchanged", {
				color:v
			});
		}
	}
	});
	var _s = _q.add('div');
	_s.addClass("rgb-color-picker");
	_s.add("img").setAttributes({
		width:'100px',
		height:'100px',
		border:'1px solid black',
		draggable: false,
		src: // igk.system.io.rootUri()+'/Projects/igk_default/Views/cancaseditor/Scripts/assets/Img/circle.png'
			_NS.assetManager.getUri("Img/circle.png")
	}).setCss({
		"display":"inline-block",
		"userSelect":"none",
		width:'100px',
		height:'100px',
		border:'1px solid black',
		backgroundColor:'#444'
	}).on('mousemove', function(e){ 
		if (!m_capture)
			return;
		e.ms_btn = MS_BTN(e);
		switch(e.ms_btn){
			case MS_BTN.Left:
				var loc = _q.getScreenLocation();
				// console.debug("color change: "+e.button);
				var W = _cur.getWidth();
				var H = _cur.getHeight();
				var center = {x:50, y:50};
				var nloc  = {
					x:(e.clientX-loc.x),
					y:(e.clientY-loc.y)
				};
				var D = _NS.CoreMathOperation.GetDistance(center, nloc);
				var d = 50;
				if(D>d){
					// console.debug("D "+D);
					nloc.x = center.x + ((+nloc.x-center.x)  *( d / D));//center.x;
					nloc.y = center.y + ((+nloc.y-center.y)  *( d / D));//center.x;
					D = d;
				}
				_cur.setCss({
					left: Math.ceil(nloc.x)+"px",
					top: Math.ceil(nloc.y)+"px"
				});
				
				var v_angle = CoreMathOperation.GetAngle(center, nloc);
				// console.debug("angle : "+v_angle);
				m_defcl = igk.system.hsl2rgb(v_angle * CoreMathOperation.ConvRdToDEGREE, 100, 50 + (Math.round(((-D+d)/d) * 50)));
				m_update = 1;
				_self.color = m_defcl.toHtml();// fcolorFromArcPoint(
				m_update = 0;
				break;
		}
		
	}).on('mousedown', function(e){
		m_capture = 1;
		e.preventDefault();
		e.stopPropagation();
		igk.winui.mouseCapture.setCapture(e.target);
	}).on('mouseup', function(e){ 
		igk.winui.mouseCapture.releaseCapture();
		m_capture = 0;
		e.handle = 1; //to bubbling
		e.preventDefault();
		e.stopPropagation();
		// console.debug("ex");
	});
	
	_cur =_s.add("div").addClass("btn-cur no-selection");//, func
	_cur.on("mousedown", function(e){
		e.preventDefault();
		e.stopPropagation();
	});
	
	
	function __update_circle_loc(){
		if (m_update)return;
		
		 var hsl, dist, angle, loc, c, cl=m_defcl; 
		 hsl  = igk.system.rgb2hsl(cl.r, cl.g, cl.b);
		 //update cursor location
		 angle = ((hsl.h * 2 * Math.PI) / 360.0);
		 if (hsl.l == 100){
			dist  = (hsl.s / 100.0) * 50;
		 }else
			dist  = (hsl.l / 100.0) * 50;
		 dist = Math.min(dist, 50);
         c = {x:50,y:50};
		   loc = {x:c.x + dist * Math.cos(angle),
				  y:c.y + dist * Math.sin(angle)
		   };
		   _cur.setCss({
			   left: loc.x+'px',
			   top: loc.y+'px'
		   });
	}
	function __update_track_def(d, cl, ex){
		 cl =  cl || m_defcl;
		 var i,k,lum,b;
		 for(i = 0; i < d.length; i++){
			k = d[i];
			if (ex && ex.test(k))
				continue;
			if (k=='l'){
				//update color luminance
				lum = Math.round(cl.getLuminance() * 100);
				d.data[k].input.val(lum);
				d.data[k].track.val(lum);
				continue;
			}
			if (k=='a'){
				b = Math.round(cl[k] * 100);
				d.data[k].input.val(b);
				d.data[k].track.val(b);
			}else{
				d.data[k].input.val(cl[k]);
				d.data[k].track.val(cl[k]);
			}
			// _d.data[k].input.val(cl[i]);
		 }
	};
	//
	// input event !!!!!
	//
	function __update_def_cl(){
	 if (m_defcl.a != 1){
			_self.color = m_defcl.toString();
		 }else 
			_self.color = m_defcl.toHtml();//[e.target.id];
	};
	
	
	
	 _s = _q.add('div');
	 var _rx = /a|l/, _d = ['r', 'g', 'b', 'a', 'l'];
	 _d.data = {};
	 // var r = _s.add('div').add('input');
	 // var g = _s.add('div').add('input');
	 for(var i = 0; i < _d.length; i++){
			 var b = _s.add('div');
			 b.addClass("no-wrap ce-color-track");
			 b.add('span')
			 .setCss({
				 display:'inline-block',
				 width: '1.5em'
			 })
			 .setHtml(_d[i].toUpperCase());
			 
			 var _max = _rx.test(_d[i])?100: 255;
			 var _val = 0;
			 if (_rx.test(_d[i])){
				_val =  m_defcl ? m_defcl[_d[i]] * 100 : 100
			 }else 
				 _val =  m_defcl ? m_defcl[_d[i]]: 0;
			 
			 var _trackinput = b.add('input')
			  .addClass("igk-winui-trackbar").setAttributes(
			 {
				 'id': _d[i],
				 'type':'range',
				 'min':0, 'max': _max, 'value': _val
			 }).on('input', function(e){
				 if (_d.data.update){
					 // console.debug("update input");
					 return;
				 }
				 var id = e.target.id;
				 var v = parseInt(e.target.value);
				 
				 if(!m_defcl)
					 m_defcl = igk.system.colorFromString('');//.from.empty(); //{r:0, g:0, b:0, a:0, l: 0};
				 _d.data.update = 1;
				 switch(id){
					 case 'a':
						m_defcl['a'] = Math.ceil((v / 100)*1000)/1000;
						_d.data[id].input.val(v);
						break;
					case 'l':
						var l = Math.round(Math.ceil(v * 100)/100);
						m_defcl[id] = l;
						_d.data[id].input.val(v);
						
						var _s, _sl, _g;
						
						if(!m_defcl.basecl)
						{m_defcl.basecl = {
							r: m_defcl.r,
							g: m_defcl.g,
							b: m_defcl.b,
							l: Math.round(m_defcl.getLuminance()*100)
							
						};
						}
						_sl = m_defcl.basecl.l;
						// calculate lumiance difference
						_s = Math.round((-_sl+ l) *(255/100));
					
						
						m_defcl.r = Math.round(Math.max(0, Math.min(255, m_defcl.basecl.r + (_s / 0.299))));
						m_defcl.g = Math.round(Math.max(0, Math.min(255, m_defcl.basecl.g + (_s / 0.587))));
						m_defcl.b = Math.round(Math.max(0, Math.min(255, m_defcl.basecl.b + (_s / 0.114))));
						
						//update track value
						__update_track_def(_d, m_defcl, /a|l/);
						break;
					default:
						m_defcl[id] = v; //e.target.value;
						_d.data[id].input.val(v);
						//update luminance
						delete(m_defcl.basecl);
						var l = m_defcl.getLuminance();
						m_defcl['l'] = l;
						l = Math.round(l*100);
						_d.data['l'].track.val(l);
						_d.data['l'].input.val(l);
						break;
				 }
				 __update_circle_loc();
				 __update_def_cl();		
				  _d.data.update = 0;
			 });//.init();
			 
			 
			 var bhost = engine.host;
			 
			 
			 var _txtinput = b.add('span').addClass("igk-round-input").add('input').setAttributes({
				type:'text',
				maxLength:'3',
				pattern:'^[0-9]{0,3}$',
				'for':_d[i],
				value: _val
			 }).on('input', function(e){
				 if (_d.data.update)
					 return;
				 
				 
				 var id =  $igk(e.target).getAttribute('for');
				 var t = $igk(e.target).val(); 
				 var v = parseInt(t);
				 if (Number.isNaN(v))
					 return;
				 _d.data.update = 1;
				 switch(id){
					 case 'a':
						if ((v >=0)&&(v<=100)){
							m_defcl[id] = v/100;
							_d.data[id].track.val(v);
							__update_def_cl();	
						}
					 break;
					 case 'l':
						// update color from luminance setup
						console.debug("update from luminance "+v);
						if (!m_defcl.baseColor){
							m_defcl.baseColor = {
								r:m_defcl.r,
								g:m_defcl.g,
								b:m_defcl.b
							};							 
						}
						// base data
						
					 
					 break;
					 default:
						if ((v >=0)&&(v<=255)){
							m_defcl[id] = v;
							_d.data[id].track.val(v);
							__update_def_cl();	
						}
					 break;
				 }
				 __update_circle_loc();
				 _d.data.update = 0;
				 // console.debug(id+ " = "+v);
				 
			 });
			 
			 
			 
			 _d.data[_d[i]] = {
				 track: _trackinput,
				 input : _txtinput
			 };
	 }
	 
	 _q.on("colorchanged", function(){
		 if (_d.data.update)return;
		 
		 _d.data.update = 1;
		 var k, hsl, angle, dist,loc, center, cl = igk.system.colorFromString(_self.color);
		 
		 // console.debug("color changed "+cl);
		 m_defcl = cl;
		 __update_circle_loc();		 
		 __update_track_def(_d, cl);
		   
		 
		
		 
		 _d.data.update = 0;
	 });
	 engine.host = bhost;
	 // engine.add(b);
};


// function rgbTrackList(){
	// var q = igk.createNode('div').addClass("igk-winui-track");
	// var r = q.add('div').addClass('track r');
	// var g = q.add('div').addClass('track g');
	// var b = q.add('div').addClass('track b');
	// var a = q.add('div').addClass('track a');
	
	
	// igk.defineProperty(this, 'o', {get: function(){return q.o; }});
	
	
	
// };

var m_tool=0;
var m_mode = 'f';// select "f|s" fill or stroke
var _ENGINE = igk.winui.engine;

function __showdialog(a){
	var d = m_tool;
	var GUI = _NS.gui;
	if (!d){
		
	 
	d = igk.createNode("div");
	var frm = d.add("form");
	var engine = _ENGINE.getEngine("bmc", frm, R);
	var mode = 'rgb';
	
	
	var c = frm.add("div");
	c.addClass("igk-panel");
	engine.host = c;
	
	var btn = new tabButton();
	
	btn.addBtn("rgb", "RGB");
	btn.addBtn("ycm", "YCM");
	btn.addBtn("hvs", "HVS");
	btn.addBtn("gray", "GRAY");
	
	btn.select(mode);
	
	btn.on("clickButton", function(e){
		// console.debug(e.id);
		if (e.id == mode)
			return;		
		mode = e.id;
		btn.select(mode);
	});
	//tabengine
	engine.add(btn);
	
	
	c = frm.add("div");
	c.addClass("igk-panel");
	engine.host = c;
	
	
	var clPicker = new rgbColorPicker(engine);
	var clVlab = new colorValueLabel(engine);
	
	var dv = igk.createNode("div").addClass("igk-row");
	dv.add(clPicker);
	// dv.add(new rgbTrackList());
	engine.add(dv);
	c = frm.add("div");
	c.addClass("igk-panel");
	engine.host = c;
	
	engine.add(clVlab);
	
	
	clPicker.on("colorchanged", function(e){
		clVlab.setValue(e.color);
		var el = a && a.element ? a.element:null;
		if (el){
			if(m_mode == 'f'){
				if('fill' in el){
					el.fill = e.color;
					a.refresh();
				}
			}else {
				if('stroke' in el){
					el.stroke = e.color;
					a.refresh();
				}
			}
		}
	});
	
	m_tool = d;
	}
	
	var dialog = GUI.dialog.showDialog(R.color_title || "Colors", d,
		{id:'color', 
		settingKey:'dialog/color',
		settings: _NS.settings.getSetting('dialog/color') 
		});
	var loc_change = function(){
		var timeout = 0;
		
		return function(e){ 
			if (timeout)
				clearTimeout(timeout);
			timeout = setTimeout(function(){
				var prop = _NS.settings.getSetting('dialog/color') || {} ;
				prop.location = e.data; 
				_NS.settings.storeSetting('dialog/color', prop);
			}, 500);
			
		};
	};
		dialog.control.addClass("color");
		dialog.on("locationChanged", loc_change());
};


AC.regMenuAction("view.colors", { 
initialize: function(a, key, menuHost){
	menuHost.initialize = function(){
		// if (a.settings.isDebug)
			// __showdialog(a);
	};
	return !0;
},
callback: function(a){
	__showdialog(a); 
	
}});

})();