/**
 * @ProductController 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class ProductController extends CoreServices {

  constructor() {
    super()

    this.ProductServices = new(require("../../product/services/product.services"))();
    this.ProductValidations = require("../../product/validations/product.validations");
  }
  /**
   * Product Create
   * ******************
   * @name create
   * @route  POST /product
   * @type 
   * @description 
   * ******************
   * 
   */
  create = async (req, res) => {
    // Validate data
    const {
      error
    } = this.ProductValidations.CreateValidation(req.body);
    if (error) throw new this.ApiError(error.details[0].message);

    const profile = req.owner;


    const payload = {
      ...req.body
    }

    const save = await this.ProductServices.create(payload, profile);

    res.json({
      data: save,
      success: true,
      message: this.SUCCESS_MESSAGES.CREATED_SUCCESSFULLY('Product')
    })
  };
  /**
   * Product Update
   * ******************
   * @name update
   * @route  PUT /product/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  update = async (req, res) => {
    // Validate data
    const {
      error
    } = this.ProductValidations.UpdateValidation(req.body);
    if (error) throw new this.ApiError(error.details[0].message);
    const query = {
      _id: req.params.id,

    }

    const profile = req.owner;


    const payload = {
      ...req.body
    }

    const product = await this.ProductServices.update(query, payload, profile);

    res.json({
      data: product,
      success: true,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY('Product')
    })
  };
  /**
   * Product Delete
   * ******************
   * @route  DELETE /product/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  delete = async (req, res) => {
    const profile = req.owner;

    const query = {
      _id: req.params.id,

    }

    const data = await this.ProductServices.delete(query, profile)

    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Product')
    })
  };
  /**
   * Product GetList
   * ******************
   * @name findAll
   * @route  GET /product
   * @type 
   * @description 
   * ******************
   * 
   */
  findAll = async (req, res) => {
    const query = req.query

    const options = {
      perPage: process.env.PAGINATION_TOTAL_PER_PAGE || 10,
      page: 1,
      route: "/product",
      query: query,
      withOutDeletedRestriction: query.withOutDeletedRestriction,
      onlyDeletedData: query.onlyDeletedData,
    }

    if (query.page) {
      options.page = query.page
    }
    if (query.perPage) {
      options.perPage = query.perPage
    }

    const querySchema = []
    if (query.createdBy) {
      querySchema.push({
        ["createdBy._id"]: this.HelperMethods.generateObjectId(query.createdBy)
      })
    }
    if (query.updatedBy) {
      querySchema.push({
        ["updatedBy._id"]: this.HelperMethods.generateObjectId(query.updatedBy)
      })
    }
    if (query.deletedBy) {
      querySchema.push({
        ["deletedBy._id"]: this.HelperMethods.generateObjectId(query.deletedBy)
      })
    }
    if (query.name) {
      querySchema.push({
        name: {
          $regex: ".*" + query.name + ".*",
          $options: "i",
        }
      })

    }
    if (query.description) {
      querySchema.push({
        description: {
          $regex: ".*" + query.description + ".*",
          $options: "i",
        }
      })

    }


    const pipeline = []
    if (querySchema.length > 0) {
      pipeline.push({
        $match: {
          $or: [{
            $and: querySchema
          }]
        }
      })
    }


    const output = await this.ProductServices.getPaginatedList(pipeline, options)

    res.json({
      page: output.page,
      totalPages: output.totalPages,
      totalItems: output.totalItems,
      perPage: output.perPage,
      data: output.data,
      nextLink: output.nextLink,
      prevLink: output.prevLink,
      success: true,
    })
  };
  /**
   * Product FindOne
   * ******************
   * @name findOne
   * @route  GET /product/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  findOne = async (req, res) => {
    const querySchema = {
      _id: req.params.id,
    }

    const data = await this.ProductServices.findOne(querySchema)
    if (!data) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this product'), this.ERROR_CODES.CAN_NOT_FIND, this.STATUS_CODES.NOT_FOUND)
    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.RETRIEVED_SUCCESSFULLY('Product')
    })
  };

}