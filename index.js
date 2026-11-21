#!/usr/bin/env node

const cors = require('cors');
const path = require('path');
const express = require('express');

const PORT = 3000;
const apirouter = require('./routes/api.js');

const app = express();

app.enable('trust proxy');
app.set('json spaces', 2);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apirouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
