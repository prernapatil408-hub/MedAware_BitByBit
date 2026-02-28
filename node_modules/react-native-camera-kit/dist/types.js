export var CameraType;
(function (CameraType) {
    CameraType["Front"] = "front";
    CameraType["Back"] = "back";
})(CameraType || (CameraType = {}));
const codeFormatAndroid = [
    'code-128',
    'code-39',
    'code-93',
    'codabar',
    'ean-13',
    'ean-8',
    'itf',
    'upc-a',
    'upc-e',
    'qr',
    'pdf-417',
    'aztec',
    'data-matrix',
    'unknown',
];
const codeFormatIOS = [
    'code-128',
    'code-39',
    'code-93',
    'codabar',
    'ean-13',
    'ean-8',
    'itf-14',
    'upc-e',
    'qr',
    'pdf-417',
    'aztec',
    'data-matrix',
    'code-39-mod-43',
    'interleaved-2of5',
];
export const supportedCodeFormats = Array.from(new Set([...codeFormatAndroid, ...codeFormatIOS]));
//# sourceMappingURL=types.js.map