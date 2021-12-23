const Router = require('koa-router');

const health = new Router();
health.get('/', async (ctx) => {
  ctx.body = 'ok';
});

module.exports = health;
