"use strict";
(function () {
    const _NS = igk.system.createNS('igk.winui.cancasEditor');
    const { CoreMathOperation, Tools } = _NS;
    const _ELEM = igk.system.createNS(_NS.fullname + ".DrawingElements", {});
    const _TN_ = 'path';
    const _START_POINT = 0;
    const _LINE_POINT = 1;
    const _CURVE_POINT = 2;
    const _CLOSE_FLAG_POINT = 4;
    const _ARC_POINT = 8;
    const _MECANIMS_ = 'PathMecanism';
    /**
     * @class
     */
    function _pathElement() {
        let m_d = null;
        this.pathLength = null;
        this.sourceDefinition = null;
        Object.defineProperty(this, 'd', {
            get() {
                return m_d
            },
            /**
             * 
             * @param {Array} v 
             */
            set(v) {
                m_d = v;
            }
        });
        let _prender = this.render;
        let m_bound = null;
        const q = this;
        this.pointTypes = [];
        this.points = [];
        Object.defineProperty(this, 'type', { value: _TN_, readonly: true, configurable: true });
        Object.defineProperty(this, 'bound', { get(){ return m_bound; }});
        igk.prependChain(this, 'updateTransformElement', function () {
            // update transformed element 
            const tq = this.points.slice(0);
            CoreMathOperation.TransformPoints(tq, this.matrix);
            const nbound = CoreMathOperation.GetVectorBounds(tq);
            this.points = tq;
        });
        igk.appendProperties(this, {
            buildPath(_path_) {  
                const path = _path_;
                const tq = this.points.slice(0);
                const _tr = this.pointTypes;
                const _t = 0;
                let _i = 0;
                let _s = 0;
                let _closed = false;
                while (tq.length) {
                    let q = tq.shift();
                    let _t = _tr[_i];
                    _i++; 
                    if (_closed) {
                        // just move to current position 
                        if (_t != 0) {
                            _s = q;
                            path.moveTo(_s.x, _s.y);
                        }
                        _closed = false;
                    }
                    switch (_t) {
                        case 0:
                            _s = q;
                            path.moveTo(_s.x, _s.y);
                            break;
                        default:
                            let is_line = (_t & _LINE_POINT) == _LINE_POINT;
                            let is_curve = (_t & _CURVE_POINT) == _CURVE_POINT;
                            let is_arc = (_t & _ARC_POINT) == _CURVE_POINT;
                            _s = q;
                            if (is_line){
                                path.lineTo(_s.x, _s.y);
                            }
                            else if (is_curve) {
                                let c1 = tq.shift();
                                let c2 = tq.shift();
                                _i+=2;
                                _t = _tr[_i-1];
                                path.bezierCurveTo(
                                    _s.x, _s.y,
                                    c1.x, c1.y,
                                    c2.x, c2.y
                                );
                                _s = c2;
                            } else if (is_arc) {
                                console.log("arc");
                            }
                            break;
                    }
                    if ((_t & _CLOSE_FLAG_POINT)) {
                        path.closePath();
                        _closed = true; 
                    }
                }
                return path;
            },
            initialize() {
                const tq = this.points.slice(0);
                const nbound = CoreMathOperation.GetVectorBounds(tq); 
                this.path = this.buildPath(new Path2D()); 
                m_bound = nbound; 
            }
        });
    }
    const MP = igk.system.createClass(_ELEM, { name: _TN_, parent: _ELEM.rectangle }, _pathElement);
    /**
     * lo
     * @param {string} defs 
     * @returns 
     */
    MP.CreateFrom = function (defs) {
        const _helper = igk.winui.cancasEditor.drawing.helper;
        const { CoreMathOperation } = igk.winui.cancasEditor;
        let cdef = _helper.PathDefinitionToSegment(defs);
        if (!cdef || (cdef.length == 0)) {
            return null;
        }
        let points = [];
        let pointTypes = [];
        let path = new Path2D;
        let index = 0;
        const _pushPoint = function ([x, y]) { 
            points.push({ x, y });
        }; 
        cdef.map(
            /**
             * build definiiont 
             * @param {{close:undefined|true, type:string, points:Array}} f 
             */
            f => {
                switch (f.type) {
                    case 'line':
                        if (index == 0) {
                            path.moveTo(f.from[0], f.from[1]);
                            _pushPoint(f.from);
                            pointTypes.push(0);
                        }
                        path.lineTo(f.to[0], f.to[1]);
                        _pushPoint(f.to);
                        pointTypes.push(1);
                        index = 1;
                        break;
                    case 'curve':
                        let [s, c1, c2, e] = f.points;
                        if (index == 0) {
                            path.moveTo(s[0], s[1]);
                            _pushPoint(s);
                            pointTypes.push(0);
                        }
                        _pushPoint(c1);
                        pointTypes.push(_CURVE_POINT);
                        _pushPoint(c2);
                        pointTypes.push(_CURVE_POINT);
                        _pushPoint(e);
                        pointTypes.push(_CURVE_POINT);
                        path.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e[0], e[1]);
                        index = 1;
                        break;
                    case 'arc':
                        break;
                    default:
                        console.error('not handled : ' + f.type);
                        break;
                }
                if (f.close) {
                    index = 0;
                    path.closePath();
                    pointTypes[pointTypes.length - 1] = pointTypes[pointTypes.length - 1] | _CLOSE_FLAG_POINT;
                }
            });
        let el = new _ELEM.path();
        el.d = defs;
        el.path = path;
        el.points = points;
        el.pointTypes = pointTypes;
        el.bound = CoreMathOperation.GetVectorBounds(points); 
        return el;
    };
    // + | just to edit points 
    igk.system.createClass(Tools, { name: _MECANIMS_, parent: Tools.RectangleMecanism }, function () {
		//M.Rectangle.apply(this);
		this.createElement = function () {
			return null;
		}; 
		this.getPoints = function (elem) {
			var tab = [];
            let tq = elem.points.slice(0);
            while(tq.length>0){
                let p = tq.shift();
                tab.push(p);
            }
			return tab;
		};
		this.getRadiusPointIndex = function () {
			return 1;
		};
		this.startUpdateIndex = function (elem, index, inf) {
		};
        /**
         * just update index position 
         * @param {*} elem 
         * @param {*} index 
         * @param {*} endPos 
         */
		this.updateIndex = function (elem, index, endPos) {
            elem.points[index] = endPos;
            elem.initialize(); 
		}
	});
    // + | register mecanism attached to path Mecanism
    Tools.registerEditorAttribute(_TN_, _MECANIMS_);
})();