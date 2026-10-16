// author: C.A.D. BONDJE DOUE
// file: use.js
// @date: 20241227 19:03:29
// @desc:  define svg use element 
"use strict";
(function(){
    const _ELEM = igk.system.createNS('igk.winui.cancasEditor.DrawingElements', {});
    const _NONE_ = 'none';
    function _useElement(){ 
        this.href = null;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.href= _NONE_;
        this.xlink = _NONE_;
        this.target = null;
        /**
         * @property {{x:number, y:number, width: number, height: number}} bound
         */
        Object.defineProperty(this, 'bound', {get(){
            if (this.target){
                return this.target.bound;
            }
            return [0,0,0,0];
        }});
        igk.appendProperties(this,{
            loadDefinition(d){ 
            },
            /**
             * 
             * @param {*} o editor context  
             * @returns 
             */
            render(o){
                // console.log("render use element |||||||||||||||||||||| ");
                if (typeof(o.bindBrushStyle) == 'undefined'){
                    console.error('not used '+o);
                    return;
                }
                const t = this.target;
                if (!t){
                    return;
                }
                o.save();   
                // console.log("fill", this.fill);
                // let br = o.createLinearGradient(0,0, 100,100);
                // br.addColorStop(0, "lightblue");
                // br.addColorStop(1, "darkblue");
				// o.fill = br.brush;
				// o.stroke = "";
				// o.strokeWidth = 1; 
                // //strokeWidth;
				o.setTransform(this.matrix);
                o.bindBrushStyle(this);
                t.render(o); 
				o.restore();
            }
        });
        Object.defineProperty(this, 'hostedElements', {get(){
            if (this.target)
            return [this.target];
        }});
    } 
    igk.system.createClass(_ELEM, {name:"use", parent: _ELEM.rectangle }, _useElement); 
})();