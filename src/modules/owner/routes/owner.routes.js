/**
 * @Owner 
 */


const ParentRoute = require("../../../routes/route.parent")
const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class OwnerRoutes extends ParentRoute {

  constructor() {
    super()


    // Controller initialization 
    const ownercontroller = new(require("../../owner/controllers/owner.controller"))();

    // Initialize the express router
    const router = this.express.Router();

    /**
     * @swagger
     * tags:
     *   name: Owner
     *   description: Owner management 
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Owner');

    // Route: Create Owner
    swaggerBuilder.addRoute('/api/v1/owner', 'post', 'Create a new owner', ['Owner'])
      .addRequestBody('#/components/schemas/CreateOwnerPayload', 'Create Owner')
      .addResponse(201, 'Created successfully', '#/components/schemas/CreateOwnerResponse')
      .addResponse(400, 'Bad request');

    router.route("/").post(
      this.use(ownercontroller.create));

    // Route: Get List of Owner
    swaggerBuilder.addRoute('/api/v1/owner', 'get', 'Get list of owner', ['Owner'])
      .addQueryParam('perPage', 'string', 'the perPage of owner', false)
      .addQueryParam('page', 'string', 'the page of owner', false)
      .addQueryParam('firstName', 'string', 'the firstName of owner', false)
      .addQueryParam('lastName', 'string', 'the lastName of owner', false)
      .addQueryParam('email', 'string', 'the email of owner', false)
      .addQueryParam('identity', 'string', 'the identity of owner', false)
      .addResponse(200, 'A list of owner', '#/components/schemas/OwnerPaginationResponse');

    router.route("/").get(
      this.use(ownercontroller.findAll));

    // Route: Update Owner
    swaggerBuilder.addRoute('/api/v1/owner/{id}', 'put', 'Update a owner by ID', ['Owner'])
      .addPathParam('id', 'string', 'owner id', true)
      .addRequestBody('#/components/schemas/UpdateOwnerPayload', 'Update Owner')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateOwnerResponse');

    // Route: Get Owner Profile
    swaggerBuilder.addRoute('/api/v1/owner/profile', 'get', 'Get current profile', ['Owner'])
      .addResponse(200, 'One Owner', '#/components/schemas/GetOwnerProfileResponse');

    router.route("/profile").get(this.auth.authenticate(), this.use(ownercontroller.getProfile));

    // Route: Update Owner Profile
    swaggerBuilder.addRoute('/api/v1/owner/profile', 'put', 'Update a current profile', ['Owner'])
      .addRequestBody('#/components/schemas/UpdateOwnerPayload', 'Update Owner')
      .addResponse(200, 'Updated successfully', '#/components/schemas/UpdateOwnerProfileResponse');

    router.route("/profile").put(this.auth.authenticate(), this.use(ownercontroller.updateProfile));

    // Route: Delete Owner Profile
    swaggerBuilder.addRoute('/api/v1/owner/profile', 'delete', 'Delete a current profile', ['Owner'])
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteOwnerProfileResponse');

    router.route("/profile").delete(this.auth.authenticate(), this.use(ownercontroller.deleteProfile));

    router.route("/:id").put(
      this.use(ownercontroller.update));

    // Route: Delete Owner by ID
    swaggerBuilder.addRoute('/api/v1/owner/{id}', 'delete', 'Delete a owner by ID', ['Owner'])
      .addPathParam('id', 'string', 'owner id', true)
      .addResponse(200, 'Deleted successfully', '#/components/schemas/DeleteOwnerResponse');

    router.route("/:id").delete(
      this.use(ownercontroller.delete));

    // Route: Get Owner by ID
    swaggerBuilder.addRoute('/api/v1/owner/{id}', 'get', 'Get one owner by ID', ['Owner'])
      .addPathParam('id', 'string', 'owner id', true)
      .addResponse(200, 'One Owner', '#/components/schemas/FindOwnerResponse');

    router.route("/:id").get(
      this.use(ownercontroller.findOne));

    // Save Swagger routes to module spec folder

    swaggerBuilder.saveToModuleSpecFolder('owner', 'crud.owner')


    return router
  }
}