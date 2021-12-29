"use strict";

const fs = require('fs');

const crypto = require('crypto');

module.exports = buffer => {
  let fsHash = crypto.createHash('md5');
  fsHash.update(buffer);
  return fsHash.digest('hex');
};