module.exports = (app) => {
  app.get('/', (req, res) => {
    res.json({ message: 'Hello World!'});
  });

  app.use('/api', require('./users')); // 在所有users路由前加/api
  app.use('/admin',require('./admin'));// 在所有admin路由前加/admin
  app.use('/admin/product',require('./product'));// 在所有admin路由前加/admin
  app.use('/message',require('./message'));
  app.use('/order',require('./order'));
  app.use('/inform',require('./inform'));
};
