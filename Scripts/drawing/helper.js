// author: C.A.D. BONDJE DOUE
// file: helper.js
// @date: 20250101 11:50:59
// @desc: helper function to calculate quadric definition 
'use strict';
(function (_NS) { 
    function CleanPointDefinition(def) {
        def = def.replaceAll(',', ' ');
        def = def.replace(/([a-zA-Z])/g, " $1 ");
        def = def.replace(/\s+/g, " ", def);
        return def.trim();
    }
    function QuadricToBezierControlPoint(pos, x1, y1, x2, y2) {
        let c1 = 0, c2 = 0;
        c1 = [
            pos[0] + ((2.0 / 3.0) * (x1 - pos[0])),
            pos[1] + ((2.0 / 3.0) * (y1 - pos[1]))
        ];
        c2 = [
            x2 + ((2.0 / 3.0) * (x1 - x2)),
            y2 + ((2.0 / 3.0) * (y1 - y2))
        ];
        return { c1, c2 };
    }
    /**
    * convert path definition to segment
    * @return mixed
    * @param {string} def
    */
    function PathDefinitionToSegment(defs) {
        defs = CleanPointDefinition(defs).split(' ');
        /**
         * @var mixed 
         */
        let segments = null;
        let pos = [0, 0];
        let cmd = null;
        let quadric_point = null;
        let c1 = 0, c2 = 0, x = 0, y = 0;
        let q = null;
        let cmode = null;
        while (defs.length > 0) {
            q = defs.shift();
            if (!q) continue;
            if (/[mqchvlastz]/i.test(q)) {
                cmode = q;
            } else {
                if (cmode) {
                    // continue preview mode
                    defs.unshift(q);
                    q = cmode;
                }
            }
            switch (q) {
                case 'm': // dx dy
                case 'M': // move to x y 
                    x = _NextPoint(defs);
                    y = _NextPoint(defs);
                    if (q == 'm') {
                        x += pos[0];
                        y += pos[1];
                    }
                    pos[0] = x;
                    pos[1] = y;
                    if (!segments) {
                        segments = [];
                    }
                    break;
                case 'q': // dx dy
                case 'Q': // quadratic curve
                    x1 = _NextPoint(defs);
                    y1 = _NextPoint(defs);
                    x2 = _NextPoint(defs);
                    y2 = _NextPoint(defs);
                    if (q == 'q') {
                        x1 += pos[0];
                        y1 += pos[1];
                        x2 += pos[0];
                        y2 += pos[1];
                    }
                    // + | convert ti bezier control point 
                    ({ c1, c2 } = QuadricToBezierControlPoint(pos, x1, y1, x2, y2));
                    segments.push({
                        "type": "curve", "points":
                            [pos, c1, c2, [x2, y2]]
                    });
                    pos[0] = x2;
                    pos[1] = y2;
                    quadric_point = [x1, y1];
                    cmd = q;
                    break;
                case 's': // dx dy
                case 'S': // shortcut bezier append connected curve
                    x1 = _NextPoint(defs);
                    y1 = _NextPoint(defs);
                    x2 = _NextPoint(defs);
                    y2 = _NextPoint(defs);
                    if (q == 's') {
                        x1 += pos[0];
                        y1 += pos[1];
                        x2 += pos[0];
                        y2 += pos[1];
                    }
                    pos[0] = x2;
                    pos[1] = y2;
                    last = segments[segments.length - 1];
                    (last['type'] != 'curve') && igk_die('not a valid type');
                    p = last['points'];
                    offset = p.length - 2;
                    refpointx = p[offset + 1][0] + (-p[offset][0] + p[offset + 1][0]);
                    refpointy = p[offset + 1][1] + (-p[offset][1] + p[offset + 1][1]);
                    p.push([refpointx, refpointy]);
                    p.push([x1, y1]);
                    p.push([x2, y2]);
                    cmd = q;
                    break;
                case 't': // dx dy
                case 'T': // shortcut bezier to x y 
                    x = _NextPoint(defs);
                    y = _NextPoint(defs);
                    if (q == 't') {
                        x += pos[0];
                        y += pos[1];
                    }
                    last = segments[segments.length - 1];
                    refpointx = 0;
                    refpointx = 0;
                    p = null;
                    if (cmd && !preg_match('/\b(Q|T)\b/i', cmd)) {
                        refpointx = pos[0];
                        refpointy = pos[1];
                        p = [];
                        p.push([refpointx, refpointy]);
                        segments.push({ 'type': 'curve', 'points': p });
                    } else {
                        if (last['type'] != 'curve')
                            throw new Error('not a valid type');
                        p = last['points'];
                        offset = p.length - 1;
                        // refpointx = p[offset + 1][0] + (-p[offset][0] + p[offset + 1][0]);
                        // refpointy = p[offset + 1][1] + (-p[offset][1] + p[offset + 1][1]);
                        refpointx = p[offset][0] + (p[offset][0] - quadric_point[0]);
                        refpointy = p[offset][1] + (p[offset][1] - quadric_point[1]);
                    }
                    ({ c1, c2 } = QuadricToBezierControlPoint(pos, refpointx, refpointy, x, y));
                    p.push(c1);
                    p.push(c2);
                    // + | calculate new bezier point 
                    // p[] = [refpointx, refpointy];
                    // p[] = [refpointx, refpointy];
                    p.push([x, y]);
                    p = null;
                    cmd = q;
                    pos[0] = x;
                    pos[1] = y;
                    quadric_point = [refpointx, refpointy];
                    break;
                case 'l':
                case 'L':
                    x = _NextPoint(defs);
                    y = _NextPoint(defs);
                    if (q == 'l') {
                        x += pos[0];
                        y += pos[1];
                    }
                    segments.push({ "type": "line", "from": pos, "to": [x, y] });
                    pos = [0, 0];
                    pos[0] = x;
                    pos[1] = y;
                    break;
                case 'h':
                case 'H':
                    x = _NextPoint(defs);
                    y = pos[1];
                    if (q == 'h') {
                        x += pos[0];
                    }
                    segments.push({ "type": "line", "from": pos, "to": [x, y] });
                    pos = [0, 0];
                    pos[0] = x;
                    pos[1] = y;
                    break;
                case 'v':
                case 'V':
                    y = _NextPoint(defs);
                    x = pos[0];
                    if (q == 'v') {
                        y += pos[1];
                    }
                    segments.push({ "type": "line", "from": pos, "to": [x, y] });
                    pos = [0, 0];
                    pos[0] = x;
                    pos[1] = y;
                    break;
                case 'a':
                case 'A':
                    let p = [];
                    while (p.length < 7) {
                        let x = _NextPoint(defs);
                        if (x != null) {
                            p.push(x);
                        } else
                            igk_die('invalid number');
                    }
                    x = p[5];
                    y = p[6];
                    if (q == 'a') {
                        let [rx, ry] = pos;
                        x += rx;
                        y += ry;
                        p[5] = x;
                        p[6] = y;
                    }
                    segments.push({ "type": "arc", "points": p, 'from': pos });
                    pos = [0, 0];
                    pos[0] = x;
                    pos[1] = y;
                    break;
                case 'c': // curve definition 
                case 'C':
                    let c1x = 0, c1y = 0, c2x = 0, c2y = 0;
                    c1x = _NextPoint(defs);
                    c1y = _NextPoint(defs);
                    c2x = _NextPoint(defs);
                    c2y = _NextPoint(defs);
                    x = _NextPoint(defs);
                    y = _NextPoint(defs);
                    [c1x, c1y, c2x, c2y, x, y].map(o => { if (undefined == o) throw new Error("invalid curve definition") });
                    if (q == 'c') {
                        let [rx, ry] = pos;
                        c1x += rx;
                        c1y += ry;
                        c2x += rx;
                        c2y += ry;
                        x += rx;
                        y += ry;
                    }
                    segments.push({ "type": "curve", "points": [pos, [c1x, c1y], [c2x, c2y], [x, y]] });
                    pos = [0, 0];
                    pos[0] = x;
                    pos[1] = y;
                    break;
                case 'z': // close path
                case 'Z':
                    // alert('"close segement"'); // console.log("closes segment.");
                    if (segments)
                        segments[segments.length - 1]["close"] = true;
                    quadric_point = null;
                    break;
                default:
                    break;
            }
        }
        return segments;
    }
    function _NextPoint(defs) {
        while (defs.length > 0) {
            let q = defs.shift().trim();
            if (q)
                return parseFloat(q);
        }
    }
    /**
     * 
     * @param {*} segments 
     * @returns 
     */
    function GetPoints(segments) {
        let start = 0;
        let points = [];
        let pointTypes = [];
        let oldtype = null;
        while (segments.length > 0) {
            let q = segments.shift();
            switch (q.type) {
                case 'line':
                    const { from, to } = q;
                    if (!start) {
                        start = from;
                    }
                    if (!oldtype || (oldtype != 'line')) {
                        points.push(from);
                        pointTypes.push(1);
                    }
                    points.push(to);
                    pointTypes.push(1);
                    break;
                case 'curve':
                    const { xpoints } = q.points;
                    throw new Error("curve not implement");
                case 'arc':
                    const [rx, ry, angle, larc, sweep, dx, dy] = q.points;
                    if (!start) {
                        start = q.from;
                        points.push(start);
                    }
                    points.push({ rx, ry, angle, larc, sweep, dx, dy });
                    pointTypes.push(2);
                    break;
            }
            if (('close' in q) && q.close) {
                pointTypes[pointTypes.length - 1] = pointTypes[pointTypes.length - 1] + 4;
                start = 0;
            }
            oldtype = q.type;
        }
        return { points, pointTypes };
    };
    function PathFromSegment(segment) {
        const path = Path2D;
        segments.map(l => {
            switch (l.type) {
                case 'line':
                    break;
                default:
                    break;
            }
        });
        return path;
    }
    const _N = igk.system.createNS(_NS, {
        PathDefinitionToSegment,
        PathFromSegment
    });
})('igk.winui.cancasEditor.drawing.helper');