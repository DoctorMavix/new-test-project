/**
 * @Owner 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class OwnerController extends CoreServices {

  constructor() {
    super()
    this.OwnerServices = new(require("../../owner/services/owner.services"))();
    this.OwnerValidations = require("../../owner/validations/owner.validations");
    this.OwnerResource = require("../resources/owner.resources");
  }
  /**
   * Owner Create
   * ******************
   * @name create
   * @route  POST /owner
   * @type create
   * @description
   * ******************
   * 
   */
  create = async (req, res) => {
    // Validate data
    const {
      error
    } = this.OwnerValidations.CreateValidation(req.body);

    if (error) throw new this.ApiError(error.details[0].message);


    const payload = {
      ...req.body
    }

    const save = await this.OwnerServices.findOrCreate(payload)


    res.json({
      data: save,
      message: this.SUCCESS_MESSAGES.CREATED_SUCCESSFULLY("owner"),
      success: true,
    })
  };
  /**
   * Owner Update
   * ******************
   * @name update
   * @route  PUT /owner/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  update = async (req, res) => {
    // Validate data
    const {
      error
    } = this.OwnerValidations.UpdateValidation(req.body);
    if (error) throw new this.ApiError(error.details[0].message);
    const query = {
      _id: req.params.id,
    }




    const payload = {
      ...req.body
    }

    const owner = await this.OwnerServices.update(query, payload);


    res.json({
      data: owner,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY("owner"),
      success: true,
    })
  };
  /**
   * Owner Delete
   * ******************
   * @route  DELETE /owner/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  delete = async (req, res) => {
    const query = {
      _id: req.params.id,
    }

    const data = await this.OwnerServices.delete(query)

    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Owner')
    })
  };
  /**
   * Owner GetList
   * ******************
   * @name findAll
   * @route  GET /owner
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
      route: "/owner",
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
    if (query.firstName) {
      querySchema.push({
        firstName: {
          $regex: ".*" + query.firstName + ".*",
          $options: "i",
        }
      })

    }
    if (query.lastName) {
      querySchema.push({
        lastName: {
          $regex: ".*" + query.lastName + ".*",
          $options: "i",
        }
      })

    }
    if (query.email) {
      querySchema.push({
        email: {
          $regex: ".*" + query.email + ".*",
          $options: "i",
        }
      })

    }
    if (query.identity) {
      querySchema.push({
        ["identity._id"]: this.HelperMethods.generateObjectId(query.identity)
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


    const output = await this.OwnerServices.getPaginatedList(pipeline, options)

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
   * Owner FindOne
   * ******************
   * @name findOne
   * @route  GET /owner/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  findOne = async (req, res) => {
    const querySchema = {
      _id: req.params.id,
    }

    const data = await this.OwnerServices.findOne(querySchema)
    if (!data) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this owner'), this.ERROR_CODES.CAN_NOT_FIND, this.STATUS_CODES.NOT_FOUND)
    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.RETRIEVED_SUCCESSFULLY('Owner')
    })
  };
  /**
   * Owner GetProfile
   * ******************
   * @name getProfile
   * @route  GET /owner/profile
   * @type 
   * @description 
   * ******************
   * 
   */
  getProfile = async (req, res) => {
    let data = await this.OwnerResource.collection(req.owner || req.actor)

    res.json({
      success: true,
      data: data
    })
  };
  /**
   * Owner UpdateProfile
   * ******************
   * @name updateProfile
   * @route  PUT /owner/profile
   * @type 
   * @description 
   * ******************
   * 
   */
  updateProfile = async (req, res) => {
    const profile = req.actor;

    // Validate data
    const {
      error
    } = this.OwnerValidations.UpdateValidation(req.body);
    if (error) throw new this.ApiError(error.details[0].message);
    const query = {
      _id: profile._id,
    }


    const payload = {
      ...req.body
    }

    const owner = await this.OwnerServices.update(query, payload, profile);


    res.json({
      data: owner,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY("owner"),
      success: true,
    })
  };
  /**
   * Owner DeleteProfile
   * ******************
   * @route  DELETE /owner/profile
   * @type 
   * @description 
   * ******************
   * 
   */
  deleteProfile = async (req, res) => {
    const profile = req.actor;
    const query = {
      _id: profile._id,
    }
    const data = await this.OwnerServices.delete(query, profile)

    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Owner')
    })
  };

}