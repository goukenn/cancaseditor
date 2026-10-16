'use strict';
(function () {
    // console log ellipse
    const _NS = igk.system.createNS("igk.winui.cancasEditor", {});
    const { CoreMathOperation, Tools, Serializer } = _NS;
    var ELEM = igk.system.createNS(_NS.fullname + ".DrawingElements", {});
    var SERI = Serializer;
    const _TN_ = 'ellipse';
    const _MECANIMS_ = 'EllipseDrawingMecanism';
    igk.system.createClass(ELEM, { name: _TN_, parent: ELEM.rectangle }, function () {
        this.stroke = "#000";
        this.strokeWidth = 1;
        this.center = { x: 0, y: 0 };
        this.radius = { x: 0, y: 0 };
        this.buildPath = function (_path_) {
            // _path_.ellipse
            const _2PI = Math.PI * 2;
            _path_.ellipse(this.center.x, this.center.y, this.radius.x, this.radius.y, 0, 0, _2PI, false);
            return _path_;
        };
        this.initialize = function () {
            this.path = this.buildPath(new Path2D);
            this.bound = CoreMathOperation.GetVectorBounds([
                {
                    x: this.center.x - this.radius.x,
                    y: this.center.y - this.radius.y
                },
                {
                    x: this.center.x + (this.radius.x),
                    y: this.center.y + (this.radius.y)
                }
            ]);
        }
    }); 
    // + | just to edit points 
    igk.system.createClass(Tools, { name: _MECANIMS_, parent: Tools.RectangleMecanism }, function () {
        //M.Rectangle.apply(this);
        this.createElement = function () {
            return this.host.createElement(_TN_);
        };
        this.getPoints = function (elem) {
            const tab = [];
            tab.push(elem.center);
            tab.push({ x: elem.center.x + elem.radius.x, y: elem.center.y + elem.radius.y });
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
            switch (index) {
                case 0:
                    elem.center = endPos;
                    break;
                case 1:
                    elem.radius = {
                        x: Math.abs(elem.center.x - endPos.x),
                        y: Math.abs(elem.center.y - endPos.y)
                    };
                    console.log(elem.radius)
                    break;
            }
            elem.initialize();
        }
    });
    // + | register mecanism attached to path Mecanism
    Tools.registerEditorAttribute(_TN_, _MECANIMS_);
})();