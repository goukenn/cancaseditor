"use strict";


(function(){
//filter Editor Tool
var _NS = igk.winui.cancasEditor; 
var AC = _NS.Actions;
var R = _NS.R; //.Actions;
var Key = AC.Key;
var CT = igk.system.convert;

var initc = 0;


AC.regMenuAction("window.filter", { callback: function(a)
{
		//filter expression 
		var prop = ['sepia','blur', 'contrast', 'brightness', 'grayscale','hue-rotate','invert','saturate', 'opacity'];
	
	
		var GUI =  igk.winui.cancasEditor.gui;
		var d = igk.createNode("div");
		var frm = d.add("form");
		var engine = igk.winui.engine.getEngine("bmc", frm, R); // get prefered engine 
		var v = {};
		var def = {
			brightness:50
		};
		function getdef(v){
			if (v in def){
				return def[v];
			}
			return 0;
		};
		
		function update_v(max, min, t, i, s){ // update input value
			var s = s || 1;
			if (i){
				t.value = Math.min(!t.value? min+1 :parseInt(t.value)+s, max); 
			}else{
				t.value = Math.max(!t.value? 0 :parseInt(t.value)-s, min); 
			}
			v[t.id] = CT.parseToInt(t.value);
		};
		
		if (engine){
		
			for(var i = 0 ; i< prop.length; i++){
				v[prop[i]] = getdef(prop[i]) || 0;
				engine
				.addGroup()
				.addControlLabel(prop[i], v[prop[i]],{
					 min: 0,
					 max: 100,
					 maxlength:3,
					 pattern: '^[0-9]{1,3}$'
				});
				
			}
		}
		frm.select("input")
		.on("mousewheel", function(e){
			// console.debug(e);
			var deltay = e.deltaY || e.wheelDelta; //wheel deleta
			var i = deltay ? deltay >= 0 : !1 ;
			if(e.deltaY)
				i = !i;
			var min = e.target.min || 0;
			var max = e.target.max || 100;
			var delta = 0; // Math.abs(e.deltaY);
			//console.debug('e: delta : '+e.deltaY);
			
			update_v(max, min, e.target, i, delta);
			updatevalue();
			e.preventDefault();
			e.stopPropagation();
		})
		.on("paste", function(e){
			// console.debug("try pasting :::::");
			//paste the selected value
			var clip = e.clipboardData || window.clipboardData;
			var data = null;
			if (!e.clipboardData){
				//for ie string data
					
				// console.debug("can't paste data");
				// console.debug(e);
				e.preventDefault();
				e.stopPropagation();
			
				if (!clip)
					return;
				// ie data transfert : text
				// console.debug(e.dataTransfer);
				// console.debug(s);
				// console.debug(clip);//.getData('text/plain'));
				data = clip.getData('text');//'text/plain'));
				// return;
			}
			else 
				data = clip.getData('text/plain');
			 // console.debug("paste on : "+data);
			var l = window.getSelection();
			var f = l.anchorNode || l.focusNode; 
			// console.debug(l);
			// if (e.target == f){
				
				// if (l.rangeCount > 0){
				// }
			// }
				
			if (data){
				var x = CT.parseToInt(data);				
				if (data == ""+x){					
					var min = e.target.min || 0;
					var max = e.target.max || 100;
					
					if ((x >= min) && (x<=max)){
						e.target.value = x;
					}		
				}
				e.preventDefault();
				e.stopPropagation();				
			}
		})
		.on("copy", function(e){
			// console.debug("try to copy ::::: ");
			if (!e.target.value){
				//cancel copy 
				e.preventDefault();
				e.stopPropagation();
			}
		})
		.on("keydown keyup", function(e){
			var h = 0;
			var min = e.target.min || 0;
			var max = e.target.max || 100;
			var ck = AC.getKeyFromEvent(e); 
		
			if (e.type == "keydown"){
								
				switch(ck)
				{
					case Key.Plus:
					
					e.target.value = Math.min(!e.target.value? 1 :parseInt(e.target.value)+1, max); 
					h=1;
					break;
					case Key.Minus:
					e.target.value = Math.max(!e.target.value? 0 :parseInt(e.target.value)-1, min); 
					h = 1;
					break;
					case Key.Ctrl:
					break;
					
					default:
					// e.target.value = parseInt(""+e.target.value);
					//console.debug("down : "+e.target.value);
					if (Key.IsNumber(ck)){
						var a = igk.system.convert.parseToInt(e.target.value+""+e.key);
						if (a > max){						
							e.preventDefault();
							e.stopPropagation();
							return;
						}
					}
					else {
						if (!Key.IsControl(ck)){
							
							if (!Key.IsModifier(ck))
							{
								console.debug("prevent1");
								e.preventDefault();
								e.stopPropagation();
							}
							return;
						}
					}
					break;
				}
			
						
			}else{
				h = 1;
			}
			// console.debug("esc "+h);
			if (h){
				//if (e.type == 'keyup'){
					// console.debug("Control :::: "+(Key.Ctrl|Key.C));
					// console.debug("??? cancel "+e.type + " "+Key.IsControlModifier(ck) + " "+ck + " ::: "+(ck==(Key.Ctrl|Key.C)));
					// console.debug(Key.IsControlModifier(ck) + " vs :: "+(( ck & Key.Ctrl) ==Key.Ctrl));
					// // console.debug(e);
					// return;
					
					if (Key.IsControlModifier(ck) || ((ck & Key.Escape)==Key.Escape)){
						//console.debug("is controllll - modifier");
						return;
					}
				
				//}
				v[e.target.id] = igk.system.convert.parseToInt(e.target.value);
				updatevalue();
				// console.debug("cancel "+e.type + " "+Key.IsControlModifier(ck) + " "+ck);
				e.preventDefault();
				e.stopPropagation();
			}
		}).each_all(function(){
			// return;
			var _i = this;
			var _t = igk.createNode('div');
			$igk(_i.o.parentNode).add(_t.o); // tracking value
			_t.addClass("input-field__track-value");
			// var p = 0;//Object.getOwnPropertyDescriptor(_i.o, 'value');
			//override the input property value for tracking the value
			// igk.defineProperty(_i.o, 'value', {get: function(){
				// // console.debug('get value '+p);
				// return _i.o.getAttribute('value');//p;//.get();				
			// }, set:function(v){
				// // console.debug('set value');
				// var p = _i.o.getAttribute('value');
				// if (p!=v){
					// p = v;
					// _i.setAttribute('value', p); //important to update value for the display
					// if(_i.o.dispatchEvent){
						// _i.o.dispatchEvent(new Event('change', {bubbles:!0}));
					// }
				// }// _i.o.innerHTML =(v);
				// // _i.o.change();
			// }}) 
			var _update_track = function (){
				var v = _i.val();
				var W = _i.o.max - _i.o.min;// igk.getNumber($igk(_t.o.parentNode).getComputedStyle("width"));
				if(W>0){
				_t.setCss({
					right : Math.ceil((1-(v/W))*100)+'%'
				})
				}
			};
			_i.on('input mousewheel', _update_track);
			_update_track();
		});
		
		engine.addGroup().addLabel(null, "",  {
			text: "",
			id: "result"
		});
		var _l = frm.select("#result").first();
		
		function reset(){
			for(var i = 0 ; i< prop.length; i++){
				v[prop[i]] = getdef(prop[i]) || 0;
			};
			
			frm.select("input").each_all(function(){
				if (this.o.id && (this.o.id in v)){
					this.o.value = v[this.o.id];
				}
			});
			updatevalue();
		};
	 
		function updatevalue(){
			var sfilter = {};

			sfilter.grayscale = v.grayscale + "%";//"0
			sfilter.huerotate = Math.ceil(v['hue-rotate']  * 360/100) + "deg";// ("
			sfilter.blur = v.blur + "px";// ("0x
			sfilter.sepia = v.sepia + "%";
			sfilter.saturate = (100 - v.saturate) + "%";
			sfilter.invert = v.invert + "%";
			sfilter.opacity = (100 - v.opacity) + "%";
			sfilter.brightness = (v.brightness * 2  ) + "%";// scale from 0 - 200  / default is 100
			sfilter.contrast = (100-v.contrast) + "%";
				
				
			// console.debug(igk.canvas.getFilterString(sfilter));
			if (_l){
				
				
				_l.setHtml(igk.canvas.toStringExpression(v));
				
				var s = a.selectedItem || a.layer || a.document;
				if (s){
					s.filter = igk.canvas.getFilterString(sfilter);
					a.refresh();
				}
			}
		}
		// frm.add("label").setHtml("Filter Value: ");
		// frm.add("input").setAttribute("value", "#ff00FF0CFF");
		// d.setHtml("Filter : ");
		updatevalue();
		
		var bar = frm.add("div").addClass("igk-action-bar");
		bar.add("input").setAttributes({
			"type":"button",
			"value": "Reset",
			"class":"igk-btn"
		}).on("click", function(){
			reset();
		});
		// bar.add("input").setAttributes({
			// "type":"button"
		// });
		
		
		
		GUI.dialog.showDialog(R.title_filter || "Filter", d);
	}, index:0});


})();