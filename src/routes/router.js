const versionOne = (routeName) => `/api/v1/${routeName}`;
const authRoutes = require('../modules/auth/routes/auth.routes.js');
const OwnerAuthRoutes = require('../modules/owner/routes/auth.owner.routes.js');
const ownerRoutes = require('../modules/owner/routes/owner.routes.js');
const productRoutes = require('../modules/product/routes/product.routes.js');

module.exports = (app) => {
  app.use(versionOne('auth'), new authRoutes());
  app.use(versionOne('owner/auth'), new OwnerAuthRoutes());
  app.use(versionOne('owner'), new ownerRoutes());
  app.use(versionOne('product'), new productRoutes());
};