#!/usr/bin/env node

const jsQR = require('jsqr');
const Jimp = require('jimp');
const QRCode = require('qrcode');

function crc16(str) {
  let c = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    c ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      c = (c & 0x8000) ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF;
    }
  }
  return c.toString(16).toUpperCase().padStart(4, '0');
}

function buildQrisString(amount, baseString) {
  if (!baseString) return null;
  try {
    const base = baseString.trim().toUpperCase();
    if (!base.startsWith('000201')) return null;
    const a = Math.floor(amount).toString();
    const field = '54' + String(a.length).padStart(2, '0') + a;
    const normalized = base.replace('010211', '010212');
    const stripped = normalized.replace(/6304.{4}$/, '');
    const parts = stripped.split('5802ID');
    if (parts.length < 2) return null;
    const raw = parts[0] + field + '5802ID' + parts[1] + '6304';
    return raw + crc16(raw);
  } catch {
    return null;
  }
}

function qrisImageUrl(str, baseUrl = '') {
  return `${baseUrl}/api/qris/image?data=${encodeURIComponent(str)}`;
}

const generateQrImage = async (data) => {
  return await QRCode.toBuffer(data, {
    errorCorrectionLevel: 'H',
    width: 500,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
};

const decodeQris = async (fileBuffer) => {
  const image = await Jimp.read(fileBuffer);
  const imageData = {
    data: new Uint8ClampedArray(image.bitmap.data),
    width: image.bitmap.width,
    height: image.bitmap.height,
  };
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });
  
  if (!code) throw new Error('QR tidak terdeteksi. Pastikan gambar jelas dan berisi QRIS valid.');
  return code.data;
};

module.exports = {
  crc16,
  buildQrisString,
  qrisImageUrl,
  generateQrImage,
  decodeQris,
};
