"use strict";
/**
 * @typedef CancaEditorDocument
 * @property {string?} id identifer of document
 */
/**
 * @typedef IVisitorHandler
 * @property {boolean} childSupport after visiting this element check that element support child . default is false
 * @property {*} parent editor element parent
 */
/**
 * @interface ICancasEditorElement
 * 
 */
/**
 * @interface ICancasEditorDrawing2DFillableElement
 * @implements {ICancasEditorElement}
 * @property {*} fill
 * @property {*} fillOpacity
 * @property {*} fillMode
 */
/**
 * @interface ICancasEditorDrawing2DStrokableElement
 * @implements {ICancasEditorElement}
 * @property {*} stroke
 * @property {*} strokeWidth
 * @property {*} strokeDashCap
 * @property {*} strokeDashArray
 * @property {*} strokeLineJoin
 * @property {*} strokeOpacity
 * @property {*} strokeMiterLimit
 */
/**
 * @interface ICancasEditorDrawing2DStylableElement
 * @implements {ICancasEditorElement}
 * @property {*} style
 */
/**
 * @typedef ICancaEditorDrawing2DSVGRect
*  @extends {ICancasEditorElement|ICancasEditorDrawing2DStylableElement|ICancasEditorDrawing2DStrokableElement|ICancasEditorDrawing2DFillableElement}
 */
/**
 * @typedef ICancaEditorDrawing2DSVGCircle
 * @property {*} radius radius of the circle 
 * @property {{x:number, y:number}} [center] center of the circle
 */
(function () {
    // svg loader 
    const _NS = igk.system.createNS('igk.winui.cancasEditor');
    const { CoreMathOperation } = _NS;
    const { Error } = _NS.exceptions;
    var G = igk.system.createNS(_NS.fullname+".encoder", {
        "svg": function () {
            console.log("loading-data svg")
        }
    });
    function _getChildList(list){
        if ('filter' in list){
            return list.filter((o) => o.nodeType == 1) 
        }
        let p = [];
        list.forEach(o=>{
            if (o.nodeType==1){
                p.push(o);
            }
        });
        return p;
    }
    class CanvasEditorSvgDocumentConverterDecoderOption {
        defs;
        /**
         * @property {CancaEditorDocument?}
         */
        document;
        brushes;
        layers;
        currentLayer;
        /**
         * @var {*} of references 
         */
        references;
        /**
         * loading complete register 
         */
        onloadingComplete;
        constructor(editor, document) {
            if (!editor) throw new Error('missing editor'); 
            if (!document) throw new Error('missing document'); 
            /**
             * @property {CancaEditorDocument} editor
             */
            Object.defineProperty(this, 'editor', { get() { return editor; } })
            /**
             * @property {CancaEditorDocument} document
             */
            Object.defineProperty(this, 'document', { get() { return document; } })  
        }
    }
    class CancasEditorSvgDocumentConverter {
        /**
         * 
         * @param {*} svg svg element to decode 
         * @param {CanvasEditorSvgDocumentConverterDecoderOption} option 
         */
        decode(svg, option) {
            let p = [{ p: svg, parent: null }];
            const { document , editor} = option;
            option.layers = [];
            option.chain = p;
            option.references = {};
            this.references = option.references;
            this.option = option;
            let _mcomplete = null;
            option.onloadingComplete = function(fc){
                if (_mcomplete==null){
                    _mcomplete = fc;
                }else {
                    _mcomplete = ((_p)=>{
                        return function(){
                            _p.apply(this, arguments);
                            fc.apply(this, arguments);
                        }
                    })(_mcomplete)
                }
            };
            // + | get resolved funcs names
            const refNameFunc = (function (q) {
                let p = Object.getOwnPropertyNames(q);
                let g = {};
                for (let m = 0; m < p.length; m++) {
                    let i = p[m]
                    if (/^visit_/.test(i) && (typeof (q[i]) == 'function')) {
                        g[i.toLowerCase()] = q[i];
                    }
                }
                return g;
            })(Object.getPrototypeOf(this));
            while (p.length > 0) {
                let cp = p.shift();
                let _nodes = cp.p.childNodes;
                for (let i = 0; i < _nodes.length; i++) {
                    let o = _nodes[i];
                    if (!o.tagName) {
                        continue;
                    }
                    let tagName = o.tagName.toLowerCase(); 
                    let fc = 'visit_' + tagName;
                    if (fc in refNameFunc) {
                        let gfc = refNameFunc[fc];
                        /**
                         * @type IVisitorHandler
                         */
                        let handle = {};
                        handle.childSupport = false;
                        let v_g = gfc.apply(this, [o, option, cp.parent, handle]);
                        if (v_g){
                            this.append(v_g, cp.parent);
                        }
                        let v_childs = handle.childSupport && o.childNodes ? _getChildList(o.childNodes): [];
                        if (v_childs.length > 0) {
                            console.log('support childs ..... ');
                            option.chain.push({
                                p: { childNodes: v_childs},
                                parent: handle.parent
                            }); 
                        }
                    } else {
                        console.error('missing visit : ' + tagName);
                    }
                }
            } 
            if(_mcomplete)
                _mcomplete.apply(this, [option]);
        }
        append(o, parent) { 
            if (!parent){ 
                const {document, editor, currentLayer} = this.option;
                // register to definition 
                if (!parent) {
                    let l = currentLayer;
                    if (!l) {
                        // create a layer 
                        l = editor.add('layer');
                        l.id = 'mainLayer';
                        document.add(l);
                        this.option.currentLayer = l;
                    }
                    parent = l;
                }
            }
            parent.add(o);
        }
        initAttribute(g, o) {
            let _id = o.getAttribute('id'); 
            if (_id) {
                g.id = _id; 
                this.references[_id] = g; 
            }
            let desc = this.getDesc(o);
            if (desc) {
                g.description = desc; 
            } 
        }
        initTransform(g, o){
            let matrix = o.getAttribute('matrix');
            if (matrix){
                let [ex,cx, cy, ey, dx, dy] =  matrix.split(" ");
                [ex,cx, cy, ey, dx, dy].map(o=>{
                    if (undefined==o){
                        throw new Error('not a valid matrix definition');
                    }
                });
               // g.matrix.transform([ex,cx, cy, ey, dx, dy]);
            }
        }
        initOpacity(g,o){
            let p = o.getAttribute('opacity');
            if (p){
                g.opacity = parseFloat(p);
            }
        }   
        /**
         * init brush definitions 
         * @param {*} g item
         * @param {*} o svg node
         */
        initBrushDefinition(g, o) {
            let fill = o.getAttribute('fill') || 'none';
            let stroke = o.getAttribute('stroke') || 'none';
            let stroke_width = o.getAttribute('stroke-width');
            let stroke_dashcap = o.getAttribute('stroke-dashcap') || '1px';
            let stroke_dasharray = o.getAttribute('stroke-dasharray');
            let stroke_dashoffset = o.getAttribute('stroke-dashoffset') || '1px';
            let stroke_opacity = o.getAttribute('stroke-opacity') || '1';
            let stroke_linejoin = o.getAttribute('stroke-linejoin');
            let style = o.getAttribute('style');
            let fillOpacity = o.getAttribute('fill-opacity');
            //
            g.fill = fill == 'none'? null : fill;
            g.stroke = stroke=='none'? null: stroke;
            let matchURL = /url\(#(?<id>[a-zA-Z_][a-z_A-Z0-9]*)\)/;
            let p = null;
            if (fill && (p = matchURL.exec(fill))){
                this.option.onloadingComplete(function(){
                    let l = this.option.references[p['id']];
                    g.fill = l ? l : null;
                });
            }
            if (stroke && matchURL.exec(fill)){
                this.option.onloadingComplete(function(){
                    let l = this.option.references[p['id']];
                    g.stroke = l ? l : null;
                });
            }
            if (fillOpacity){
                let l = parseFloat(fillOpacity);
                g.fillOpacity = Math.min(1, Math.max(l, 0));
            }
            if (stroke_width){
                g.strokeWidth = parseFloat(stroke_width); 
            }
            if (stroke_linejoin){
                g.strokeLineJoin = stroke_linejoin;
            }
            if (stroke_dasharray){
                let t = [];
                stroke_dasharray.split(',').filter(s => s.trim().length>0 ).forEach(c=>{
                    t.push(parseInt(c));
                });
                g.strokeDashArray = t; 
            }
        }
        getViewBox(o) {
            let m = o.getAttribute('viewBox');
            if (m) {
                const [x, y, w, h] = m.split(' ');
                return { x, y, w, h };
            }
        }
        getDesc(o) {
            let aria_id = o.getAttribute('aria-describedby');
            if (!aria_id) {
                let desc = [];
                $igk(o).qselect('desc').each_all(function () {
                    desc.push(this.o.innerHTML);
                });
                return desc.join("\n");
            }
        }
        initViewBox(g, o) {
            let box = this.getViewBox(o);
            if (box) {
            }
        }
        visit_a() {
        }
        visit_animate() {
        }
        visit_animateMotion() {
        }
        visit_animateTransform() {
        }
        visit_circle(o, { editor, document }) {
            /**
             * @type ICancaEditorDrawing2DSVGCircle
             */
            let g = editor.createElement('circle');
            this.initAttribute(g, o);
            this.initBrushDefinition(g,o);
            let m = 'cx|cy|r'.split('|');
            let v = [];
            m.forEach(i=>{
                v.push(parseFloat(o.getAttribute(i) || 0)); 
            });
            const [cx, cy, r] = v;
            g.center = {x:cx, y:cy};
            g.radius = r;
            console.log(g, {cx, cy, r});
        }
        visit_clipPath() {
        }
        /**
    * 
    * @param {*} o 
    * @param {*} param1 
    * @param {*} parent
    * @param {IVisitorHandler} handler 
    */
        visit_defs(o, { editor, document, defs },parent, handler) {
            // console.log('load definitions', defs);
            if (defs==null){
                const p = arguments[1];
                p.defs = new CancasEditorSvgDocumentDefs(document); 
                defs = p.defs;
            }
            handler.childSupport = true;
            handler.parent = defs;
        }
        visit_desc() {
        }
        visit_ellipse(o, {editor}) {
            let e = editor.createElement('ellipse');
            if (!e){
                throw new Error('missing >ellipse< definition ');
            }
            const [x1, y1, x2, y2] = [
                parseFloat(o.getAttribute('cx') || 0),
                parseFloat(o.getAttribute('cy') || 0),
                parseFloat(o.getAttribute('rx') || 0),
                parseFloat(o.getAttribute('ry') || 0)];
            e.center = {x: x1, y:y1};
            e.radius = {x: x2, y:y2};
            this.initAttribute(e,o);
            this.initAttributeBrushAndTransform(e, o);
            this.initOpacity(e,o);
            e.initialize();
            return e;
        }
        visit_feBlend() {
        }
        visit_feColorMatrix() {
        }
        visit_feComponentTransfer() {
        }
        visit_feComposite() {
        }
        visit_feConvolveMatrix() {
        }
        visit_feDiffuseLighting() {
        }
        visit_feDisplacementMap() {
        }
        visit_feDistantLight() {
        }
        visit_feDropShadow() {
        }
        visit_feFlood() {
        }
        visit_feFuncA() {
        }
        visit_feFuncB() {
        }
        visit_feFuncG() {
        }
        visit_feFuncR() {
        }
        visit_feGaussianBlur() {
        }
        visit_feImage() {
        }
        visit_feMerge() {
        }
        visit_feMergeNode() {
        }
        visit_feMorphology() {
        }
        visit_feOffset() {
        }
        visit_fePointLight() {
        }
        visit_feSpecularLighting() {
        }
        visit_feSpotLight() {
        }
        visit_feTile() {
        }
        visit_feTurbulence() {
        }
        visit_filter() {
        }
        visit_foreignObject() {
        }
        /**
         * 
         * @param {*} o node element 
         * @param {*} param1 option 
         * @param {ICancasEditorElement?} parent 
         * @param {IVisitorHandler} handler 
         */
        visit_g(o, { editor }, parent, handler) {
            let g = null;
            if (parent == null) {
                g = editor.add('layer');
            }
            this.append(g);
            handler.parent = g;
            handler.childSupport = true;
            this.initAttribute(g, o);
            this.initAttributeBrushAndTransform(g, o);
        }
        visit_image() {
        }
        visit_line(o, {editor}) {
            let e = editor.createElement('line');
            if (!e){
                throw new Error('missing line');
            }
            const [x1, y1, x2, y2] = [
                parseFloat(o.getAttribute('x1') || 0),
                parseFloat(o.getAttribute('y1') || 0),
                parseFloat(o.getAttribute('x2') || 0),
                parseFloat(o.getAttribute('y2') || 0)];
            e.start = {x: x1, y:y1};
            e.end = {x: x2, y:y2};
            this.initAttribute(e,o);
            this.initAttributeBrushAndTransform(e, o);
            return e;
        }
        visit_linearGradient() {
        }
        visit_marker() {
        }
        visit_mask() {
        }
        visit_metadata() {
        }
        visit_mpath() {
        }
        visit_path(o, { editor, document }, parent) {
            let d = o.getAttribute('d');
            if (!d){
                throw new Error('missing path\'s definition');
            }
            let e = _NS.DrawingElements.path.CreateFrom(d);
            if (!e){
                throw new Error('failed to create path');
            }
            e = editor.initNewElement(e); 
            //e = editor.createElement('path');
            let r = o.getAttribute('pathLength')
            e.pathLength = r;
            // console.log('create path ', {e});
            // let de = new Path2D(d);
            // e.path = de; 
            //load definition 
            this.initAttributeBrushAndTransform(e, o);
            this.initOpacity(e,o);
            if (!e.matrix.isIdentity()){
                e.bound = CoreMathOperation.TransformBound(e.bound, e.matrix);
            }
            e.initialize();
            return e;
        }
        initAttributeBrushAndTransform(e, o){
            this.initAttribute(e, o);
            this.initBrushDefinition(e, o);
            this.initTransform(e,o);
        }
        visit_pattern() {
        }
        visit_polygon() {
        }
        visit_polyline() {
        }
        visit_radialGradient() {
        }
        visit_rect(o, option, parent) {
            /**
             * @type {ICancaEditorDrawing2DSVGRect}
             */
            let rect = option.editor.createElement('rectangle');  
            this.initAttribute(rect, o);
            let width = o.getAttribute('width');
            let height = o.getAttribute('height') || width;
            let x = o.getAttribute('x') || 0;
            let y = o.getAttribute('y') || 0;
            rect.bound = {
                x: parseFloat(x),
                y: parseFloat(y),
                width: parseFloat(width),
                height: parseFloat(height)
            };
            this.initBrushDefinition(rect, o);
            this.initOpacity(rect,o);
            const { editor, document } = option;
            this.append(rect, parent); 
        }
        visit_script() {
        }
        visit_set() {
        }
        visit_stop() {
        }
        visit_style() {
        }
        visit_svg() {
        }
        visit_switch() {
        }
        visit_symbol() {
        }
        visit_text(o, {editor}) {
            const txt = editor.createElement('text');
            if (!txt){
                throw new Error('failed to create a text element.')
            }
            this.initAttribute(txt, o);
            this.initAttributeBrushAndTransform(txt, o);
            txt.text = o.innerHTML.trim();
            return txt;
        }
        visit_textPath() {
        }
        visit_title() {
        }
        visit_tspan() {
        }
        visit_use(o, option, parent, handler){ 
            const {document, editor} = option;
            let g = editor.createElement('use'); 
            let href = o.getAttribute('href');
            this.initBrushDefinition(g, o);
            if (g && href){
                let id = href.substr(1);
                option.onloadingComplete(function(){ 
                    let pd = option.references[id];
                    if (pd){
                        g.target = pd;
                        pd.initialize();
                    }
                });
                this.append(g, parent);
            }
        }
        visit_view() {
        }
    }
    /**
     * svg defs element 
     */
    class CancasEditorSvgDocumentDefs{
        constructor(document){
            /**
             * @property {CancaEditorDocument} document store the base document 
             */
            this.document = document; 
        }
        add(i){
            console.log('add in defs');
        }
        toString(){
            return 'defs';
        }
    }
    G.CancasEditorSvgDocumentConverter = CancasEditorSvgDocumentConverter;
    /**
     * 
     * @param {*} svg 
     * @param {*} param1 
     */
    function _decodeSvgElement(svg, { editor, document }) {
        let W = svg.getAttribute("width");
        let H = svg.getAttribute("height");
        let viewBox = svg.getAttribute("viewBox");
        if (viewBox) {
            const [x, y, w, h] = viewBox.split(' ');
            W = W || w;
            H = H || h;
        }
        document.setSize(W, H);
        // console.log(`document ${W}x${H}`);
        let decoder = new G.CancasEditorSvgDocumentConverter();
        let option = new CanvasEditorSvgDocumentConverterDecoderOption(editor, document);
        decoder.decode(svg, option);
        return true;
    };
    igk.appendProperties(G.svg, {
        /**
         * 
         * @param {*} file_or_svg element 
         * @param {any|{editor: any, document: EditorDocument}} editor or poperties
         * @returns bool|Promise
         */
        decode(file, editor) {
            if (file instanceof SVGElement) {
                return _decodeSvgElement(file, editor);
            }
            const _P = igk.system.promiseCall;
            const P = new _P();
            var uri = URL.createObjectURL(file);
            igk.ajx.bindHeader({ "Content-Type": "image/svg+xml" });
            igk.ajx.get(uri, null, function (xhr) {
                if (this.isReady()) {
                    var q = igk.createNode("dummy");
                    q.setHtml(xhr.responseText);
                    let v_svg = q.select('svg').first();
                    if (v_svg) {
                        let q = $igk(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
                        q.setHtml(v_svg.o.innerHTML);
                        editor.clear();
                        let doc = editor.add('document');
                        _decodeSvgElement(q.o, { editor, document: doc });
                        editor.clear();
                        editor.document = doc;
                        editor.layer = doc.getLayers()[0];
                    }
                    editor.refresh();
                    P.resolve();
                }
            });
            return P;
        }
    });
    // convert svg to handle  
})();