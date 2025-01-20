/**
 * @ProductRoutes 
 */


const ParentRoute = require("../../../routes/route.parent")

const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class ProductRoutes extends ParentRoute {

  constructor() {
    super()

    // OwnerAuthMiddlewares Middleware initialization 
    const ownerauthmiddlewares = new(require("../../owner/middlewares/auth.owner.middlewares"))();

    // Controller initialization 
    const productcontroller = new(require("../../product/controllers/product.controllers"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: Product
     *   description: Product management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Product');

    // Route: Create Product
    swaggerBuilder.addRoute('/api/v1/product', 'post', 'Create a new product', ['Product'])
      .addRequestBody('#/components/schemas/CreateProductPayload', 'Create Product')
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateProductResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      ownerauthmiddlewares.authorizeOwnerAuth('*'),
      this.use(productcontroller.create));

    // Route: Get List of Product
    swaggerBuilder.addRoute('/api/v1/product', 'get', 'Get list of product', ['Product'])
      .addQueryParam('perPage', 'string', 'the perPage of product', false)
      .addQueryParam('page', 'string', 'the page of product', false)
      .addQueryParam('createdBy', 'string', 'the createdBy of product', false)
      .addQueryParam('updatedBy', 'string', 'the updatedBy of product', false)
      .addQueryParam('deletedBy', 'string', 'the deletedBy of product', false)
      .addQueryParam('name', 'string', 'the name of product', false)
      .addQueryParam('description', 'string', 'the description of product', false)
      .addResponse(200, 'A list of product', '#/components/schemas/ProductPaginationResponse');

    router.route("/").get(
      this.use(productcontroller.findAll));

    // Route: Update Product
    swaggerBuilder.addRoute('/api/v1/product/{id}', 'put', 'Update a product by ID', ['Product'])
      .addPathParam('id', 'string', 'product id', true)
      .addRequestBody('#/components/schemas/UpdateProductPayload', 'Update Product')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateProductResponse');

    router.route("/:id").put(
      ownerauthmiddlewares.authorizeOwnerAuth('*'),
      this.use(productcontroller.update));

    // Route: Delete Product by ID
    swaggerBuilder.addRoute('/api/v1/product/{id}', 'delete', 'Delete a product by ID', ['Product'])
      .addPathParam('id', 'string', 'product id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteProductResponse');

    router.route("/:id").delete(
      ownerauthmiddlewares.authorizeOwnerAuth('*'),
      this.use(productcontroller.delete));

    // Route: Get Product by ID
    swaggerBuilder.addRoute('/api/v1/product/{id}', 'get', 'Get one product by ID', ['Product'])
      .addPathParam('id', 'string', 'product id', true)
      .addResponse(200, 'One Product', '#/components/schemas/FindProductResponse');

    router.route("/:id").get(
      this.use(productcontroller.findOne));


    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('product', 'crud.product')


    return router
  }
}