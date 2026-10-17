// author: C.A.D. BONDJE DOUE
// file: PptxExport.js
// @desc: export the prototype (several documents linked for presentation, see tools/PresentMode.js and
// drawing2d/hotspot.js) as a PowerPoint file: one slide per document, each document rendered to a PNG
// (same technique as visitors/png.js) and placed full-bleed, centered and letterboxed, on a 16:9 slide.
// The slide order follows the prototype links starting at the current document (tools/PresentMode.js's
// own order), and any document the links never reach is appended at the end so nothing is left out.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;

	// widescreen 16:9, in EMU (914400 EMU = 1 inch): 13.333in x 7.5in, the PowerPoint default
	const SLIDE_CX = 12192000, SLIDE_CY = 6858000;

	function presentationOrder(editor) {
		const docs = editor.documents || [];
		if (!docs.length) { return []; }
		const start = (editor.document && docs.indexOf(editor.document) !== -1) ? editor.document : docs[0];
		const seen = new Set();
		const order = [];
		const queue = [start];
		while (queue.length) {
			const d = queue.shift();
			if (seen.has(d)) { continue; }
			seen.add(d);
			order.push(d);
			(editor.links || []).filter((l) => l.from === d).forEach((l) => { if (!seen.has(l.to)) { queue.push(l.to); } });
		}
		docs.forEach((d) => { if (!seen.has(d)) { seen.add(d); order.push(d); } }); // documents no link ever reaches
		return order;
	}

	/** render a single document at its own pixel size, like visitors/png.js / tools/PresentMode.js */
	function renderDocPngBase64(doc) {
		const canvas = document.createElement('canvas');
		canvas.width = doc.width;
		canvas.height = doc.height;
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, doc.width, doc.height); // a transparent document still gets a white slide background
		const o = new _NS.primitive(ctx);
		o.getDocumentSize = () => ({ w: doc.width, h: doc.height });
		doc.render(o);
		return canvas.toDataURL('image/png').split(',')[1];
	}

	const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

	const CONTENT_TYPES_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
		'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
		'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
		'<Default Extension="xml" ContentType="application/xml"/>' +
		'<Default Extension="png" ContentType="image/png"/>' +
		'<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>' +
		'<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>' +
		'<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>' +
		'<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>' +
		'<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
		'<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>';

	const ROOT_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
		'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>' +
		'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
		'<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
		'</Relationships>';

	function coreXml(title) {
		const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
		return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
			'<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
			'<dc:title>' + esc(title) + '</dc:title><dc:creator>CancasEditor</dc:creator><cp:lastModifiedBy>CancasEditor</cp:lastModifiedBy>' +
			'<dcterms:created xsi:type="dcterms:W3CDTF">' + now + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + now + '</dcterms:modified>' +
			'</cp:coreProperties>';
	}
	function appXml(count) {
		return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
			'<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
			'<Application>CancasEditor</Application><Slides>' + count + '</Slides><Company></Company></Properties>';
	}
	function themeXml() {
		return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
			'<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements>' +
			'<a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>' +
			'<a:dk2><a:srgbClr val="1F497D"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2>' +
			'<a:accent1><a:srgbClr val="4F81BD"/></a:accent1><a:accent2><a:srgbClr val="C0504D"/></a:accent2><a:accent3><a:srgbClr val="9BBB59"/></a:accent3>' +
			'<a:accent4><a:srgbClr val="8064A2"/></a:accent4><a:accent5><a:srgbClr val="4BACC6"/></a:accent5><a:accent6><a:srgbClr val="F79646"/></a:accent6>' +
			'<a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme>' +
			'<a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>' +
			'<a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>' +
			'<a:fmtScheme name="Office">' +
			'<a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>' +
			'<a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="25400"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="38100"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>' +
			'<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>' +
			'<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>' +
			'</a:fmtScheme></a:themeElements></a:theme>';
	}
	const SLIDE_MASTER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
		'<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
		'<p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg>' +
		'<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>' +
		'<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>' +
		'<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>';
	const SLIDE_MASTER_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
		'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>' +
		'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>';
	const SLIDE_LAYOUT = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
		'<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">' +
		'<p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>' +
		'<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>';
	const SLIDE_LAYOUT_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
		'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>';

	function presentationXml(count) {
		let ids = '';
		for (let i = 0; i < count; i++) { ids += '<p:sldId id="' + (256 + i) + '" r:id="rId' + (2 + i) + '"/>'; }
		return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
			'<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
			'<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>' +
			'<p:sldIdLst>' + ids + '</p:sldIdLst>' +
			'<p:sldSz cx="' + SLIDE_CX + '" cy="' + SLIDE_CY + '"/><p:notesSz cx="' + SLIDE_CY + '" cy="' + SLIDE_CX + '"/></p:presentation>';
	}
	function presentationRels(count) {
		let r = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>';
		for (let i = 0; i < count; i++) { r += '<Relationship Id="rId' + (2 + i) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide' + (i + 1) + '.xml"/>'; }
		return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + r + '</Relationships>';
	}
	function slideXml(doc, title) {
		const scale = Math.min(SLIDE_CX / doc.width, SLIDE_CY / doc.height);
		const cx = Math.round(doc.width * scale), cy = Math.round(doc.height * scale);
		const x = Math.round((SLIDE_CX - cx) / 2), y = Math.round((SLIDE_CY - cy) / 2);
		return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
			'<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
			'<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>' +
			'<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>' +
			'<p:pic><p:nvPicPr><p:cNvPr id="2" name="' + esc(title) + '"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>' +
			'<p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>' +
			'<p:spPr><a:xfrm><a:off x="' + x + '" y="' + y + '"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>' +
			'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>';
	}
	const SLIDE_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
		'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/IMG"/>' +
		'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>';


	// ---- minimal store-only ZIP writer (no external dependency: JSZip isn't actually loaded by this app)
	function crc32(bytes) {
		let c, crc = 0 ^ -1;
		for (let i = 0; i < bytes.length; i++) {
			c = (crc ^ bytes[i]) & 0xFF;
			for (let k = 0; k < 8; k++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); }
			crc = (crc >>> 8) ^ c;
		}
		return (crc ^ -1) >>> 0;
	}
	function toBytes(data) { return (typeof data == 'string') ? new TextEncoder().encode(data) : data; }
	function base64ToBytes(b64) {
		const bin = atob(b64);
		const out = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) { out[i] = bin.charCodeAt(i); }
		return out;
	}
	/** @param {Array<{name:string, data:(string|Uint8Array)}>} files */
	function buildZip(files) {
		const DOS_DATE = 0x21; // 1980-01-01: any valid DOS date works, the exact value doesn't matter here
		const localParts = [], centralParts = [];
		let offset = 0;
		files.forEach((f) => {
			const nameBytes = new TextEncoder().encode(f.name);
			const data = toBytes(f.data);
			const crc = crc32(data), size = data.length;
			const local = new Uint8Array(30 + nameBytes.length);
			const lv = new DataView(local.buffer);
			lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0, true); lv.setUint16(8, 0, true);
			lv.setUint16(10, 0, true); lv.setUint16(12, DOS_DATE, true);
			lv.setUint32(14, crc, true); lv.setUint32(18, size, true); lv.setUint32(22, size, true);
			lv.setUint16(26, nameBytes.length, true); lv.setUint16(28, 0, true);
			local.set(nameBytes, 30);
			localParts.push(local, data);
			const central = new Uint8Array(46 + nameBytes.length);
			const cv = new DataView(central.buffer);
			cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0, true); cv.setUint16(10, 0, true);
			cv.setUint16(12, 0, true); cv.setUint16(14, DOS_DATE, true);
			cv.setUint32(16, crc, true); cv.setUint32(20, size, true); cv.setUint32(24, size, true);
			cv.setUint16(28, nameBytes.length, true); cv.setUint16(30, 0, true); cv.setUint16(32, 0, true);
			cv.setUint16(34, 0, true); cv.setUint16(36, 0, true); cv.setUint32(38, 0, true);
			cv.setUint32(42, offset, true);
			central.set(nameBytes, 46);
			centralParts.push(central);
			offset += local.length + data.length;
		});
		const centralSize = centralParts.reduce((s, p) => s + p.length, 0);
		const centralOffset = offset;
		const end = new Uint8Array(22);
		const ev = new DataView(end.buffer);
		ev.setUint32(0, 0x06054b50, true); ev.setUint16(4, 0, true); ev.setUint16(6, 0, true);
		ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
		ev.setUint32(12, centralSize, true); ev.setUint32(16, centralOffset, true); ev.setUint16(20, 0, true);
		return new Blob([...localParts, ...centralParts, end], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
	}

	function exportPptx(editor) {
		const docs = presentationOrder(editor);
		if (!docs.length) { return; }
		let ct = CONTENT_TYPES_HEAD;
		for (let i = 0; i < docs.length; i++) { ct += '<Override PartName="/ppt/slides/slide' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'; }
		ct += '</Types>';

		const files = [
			{ name: '[Content_Types].xml', data: ct },
			{ name: '_rels/.rels', data: ROOT_RELS },
			{ name: 'docProps/core.xml', data: coreXml(editor.getProjectName ? editor.getProjectName() : 'Presentation') },
			{ name: 'docProps/app.xml', data: appXml(docs.length) },
			{ name: 'ppt/presentation.xml', data: presentationXml(docs.length) },
			{ name: 'ppt/_rels/presentation.xml.rels', data: presentationRels(docs.length) },
			{ name: 'ppt/theme/theme1.xml', data: themeXml() },
			{ name: 'ppt/slideMasters/slideMaster1.xml', data: SLIDE_MASTER },
			{ name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels', data: SLIDE_MASTER_RELS },
			{ name: 'ppt/slideLayouts/slideLayout1.xml', data: SLIDE_LAYOUT },
			{ name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels', data: SLIDE_LAYOUT_RELS }
		];
		docs.forEach((doc, i) => {
			const n = i + 1;
			const img = 'image' + n + '.png';
			files.push({ name: 'ppt/slides/slide' + n + '.xml', data: slideXml(doc, doc.title || doc.id) });
			files.push({ name: 'ppt/slides/_rels/slide' + n + '.xml.rels', data: SLIDE_RELS.replace('IMG', img) });
			files.push({ name: 'ppt/media/' + img, data: base64ToBytes(renderDocPngBase64(doc)) });
		});

		const blob = buildZip(files);
		const a = document.createElement('a');
		a.download = (editor.getProjectName ? editor.getProjectName() : 'project') + '.pptx';
		a.href = URL.createObjectURL(blob);
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 10000);
	}

	AC.regMenuAction("file.export.toPptx", { callback: (a) => exportPptx(a), index: 31 });
	_NS.pptxExport = { exportPptx, buildZip, presentationOrder }; // exposed for debugging/automation
})();
