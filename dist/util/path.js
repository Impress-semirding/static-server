"use strict";

const path = require("path");

const process = require('process');

function getAbsolutePath(p) {
  const isRoot = path.isAbsolute(p);
  if (isRoot) return p;
  return path.resolve(process.cwd(), p);
}

module.exports = {
  getAbsolutePath
};