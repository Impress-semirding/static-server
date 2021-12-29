#!/usr/bin/env node

const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const chalk = require('chalk');
const process = require('process');
const Router = require('koa-router');
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const proxy = require('koa2-proxy-middleware');
const { getAbsolutePath } = require("./util/path");
const health = require('./routes');

const root = process.cwd();
const deployrcPath = path.resolve(root, './.deployrc');
const packagePath = path.resolve(root, './package.json');
let staticPath;
let proxyConfig = {};

try {
  const stat = fs.statSync(packagePath);
  if (stat.isFile()) {
    const serverConfig = JSON.parse(fs.readFileSync(packagePath))["static-server"] || {};
    const { static: statics, proxy } = serverConfig;
    staticPath = statics || staticPath;
    proxyConfig = proxy || proxyConfig;
  }
} catch (err) {
  console.error(chalk.red('no access package.json'));
}

try {
  const stat = fs.statSync(deployrcPath);
  if (stat.isFile()) {
    const { proxy, static: statics } = JSON.parse(fs.readFileSync(deployrcPath, '')) || {};
    staticPath = statics || staticPath;
    proxyConfig = proxy || proxyConfig;
  }
} catch (err) {
  console.error(chalk.red('no access .deployrc'));
}

staticPath  = getAbsolutePath(staticPath);
const template = fs.readFileSync(path.resolve(staticPath, './index.html'));

process.on('uncaughtException', (err) => {
  console.log(err, 'process error');
});

const app = new Koa();
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
});

if (!!Object.keys(proxyConfig).length) {
  app.use(proxy(proxyConfig));
}

if (staticPath) {
  app.use(koaStatic(staticPath, { maxAge: 30 * 24 * 60 * 60 * 1000 }));
}

app.use(bodyParser(['json', 'form', 'text']));
const router = new Router();
router.use('/health', health.routes(), health.allowedMethods());
app.use(async (ctx) => {
  ctx.set('Content-Type', 'text/html');
  ctx.set("Cache-control", "no-cache ");
  ctx.body = template;
});


// http.createServer(app.callback()).listen(8080);
app.listen(8080, () => {
  console.log(chalk.green('server in 8080'))
});
