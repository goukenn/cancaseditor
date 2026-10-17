// author: C.A.D. BONDJE DOUE
// file: ZipWriter.js
// @desc: a minimal store-only (no compression) ZIP writer with no external dependency. Some export code
// (the Sketch stub in .cancaseditor.js, PptxExport.js) used to reference igk.lib.JSZip, which this app never
// actually loads (there is no vendored JSZip anywhere in the codebase) - every file format built on a zip
// container (gkds-as-zip-less formats aside) shares this instead.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
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
	/**
	 * @param {Array<{name:string, data:(string|Uint8Array)}>} files a folder entry is a name ending in '/' with empty data
	 * @param {string} [mimeType] of the resulting Blob, e.g. 'application/zip'
	 */
	function buildZip(files, mimeType) {
		const DOS_DATE = 0x21; // 1980-01-01: any valid DOS date works, the exact value doesn't matter here
		const localParts = [], centralParts = [];
		let offset = 0;
		files.forEach((f) => {
			const nameBytes = new TextEncoder().encode(f.name);
			const data = toBytes(f.data || '');
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
		return new Blob([...localParts, ...centralParts, end], { type: mimeType || 'application/zip' });
	}
	_NS.zipWriter = { buildZip, crc32, base64ToBytes };
})();
