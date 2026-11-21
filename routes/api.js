#!/usr/bin/env node

const multer = require('multer');
const express = require('express');
const qris = require('../lib/qris.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/qris/image', async (req, res) => {
  const { data } = req.query;
  if (!data) return res.status(400).json({ success: false, message: 'data param required!' });
  try {
    const buf = await qris.generateQrImage(data);
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Gagal generate QR.' });
  }
});

router.post('/qris/decode', upload.single('file'), async (req, res) => {
  if (!req.file) return res.json({ success: false, message: 'File gambar wajib diupload!' });
  try {
    const result = await qris.decodeQris(req.file.buffer);
    res.json({ success: true, qris_string: result });
  } catch (e) {
    res.json({ success: false, message: `Decode error: ${e.message}` });
  }
});

router.post('/qris/generate', (req, res) => {
  const { amount, static_qr } = req.body;
  if (!amount || !static_qr) return res.json({ success: false, message: 'amount dan static_qr wajib diisi!' });
  const qrisString = qris.buildQrisString(amount, static_qr);
  if (!qrisString) return res.json({ success: false, message: 'Gagal generate QRIS. Pastikan format QRIS string valid.' });
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({
    success: true,
    amount: Math.floor(amount),
    qris_string: qrisString,
    qr_url: qris.qrisImageUrl(qrisString, baseUrl),
  });
});

module.exports = router;
