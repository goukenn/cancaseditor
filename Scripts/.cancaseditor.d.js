// author: C.A.D. BONDJE DOUE
// file: .cancaseditor.d.js
// @date: 20241228 12:29:59
// @desc: define type in cancas editor
'use strict';
/**
 * @typedef CEditorLinearGradient
 * @property {string|'solid'|'linear'|'radial'|'conic'} type
 */
/**
 * @typedef CEditorStrokeDefinition
 * @property {null|undefined|CEditorLinearGradient|'none'|string} [stroke]
 * @property {number|null|undefined|'none'} [strokeWith]
 * @property {number|undefined} [strokeOpacity]
 * @property {undefined|'round'|'nonzero'|'miter-clip'|'bevel'|'miter'|'arcs'} [strokeLineJoin]
 * @property {number|null|undefined|'none'} [strokeMiterLimit]
 * @property {'butt'|'round'|'square'} [strokeDashCap]
 * @property {Array|undefined} [strokeDashArray]  
 */