/**
 * @ProductServices 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class ProductServices extends CoreServices {

  constructor() {
    super();
    this.Product = require("../../product/models/product.model");
  }
  /**
   * @instanceAlreadyExist
   */
  instanceAlreadyExist = async (payload, session = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        const productExist = await this.executeQueryHookWithSession(this.Product.findOne({
          // your condition
          name: payload.name,
        }), session)
        resolve(productExist)



      } catch (error) {

        reject(error);

      }
    })
  };
  /**
   * @findOrCreate
   */
  findOrCreate = async (payload, profile, session = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        const productExist = await this.instanceAlreadyExist(payload, session)

        let save
        if (productExist) {
          save = productExist
        } else {
          save = await this.create(payload, profile, session)
        }

        resolve(save)

      } catch (error) {

        reject(error);

      }
    })
  };
  /**
   * @create
   */
  create = async (payload, profile, session = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        const options = session ? {
          session
        } : {}

        const schema = {}
        if (this.HelperMethods.issetData(payload.name)) {
          schema.name = this.HelperMethods.getValidTrimData(payload.name);
        }
        if (this.HelperMethods.issetData(payload.description)) {
          schema.description = this.HelperMethods.getValidTrimData(payload.description);
        }

        schema.createdBy = profile._id;
        schema.updatedBy = profile._id;

        const product = new this.Product(schema);
        const save = await product.save(options);

        resolve(save)


      } catch (error) {
        reject(error);
      }
    })
  };
  /**
   * @update
   */
  update = async (query, payload, profile, session = null) => {
    return new Promise(async (resolve, reject) => {
      try {

        const options = session ? {
          session
        } : {
          new: true
        };

        const product = await this.executeQueryHookWithSession(this.Product.findOne(query), session);

        if (!product) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this product'))

        const schema = {}
        if (this.HelperMethods.issetData(payload.name)) {
          schema.name = this.HelperMethods.getValidTrimData(payload.name);
        }
        if (this.HelperMethods.issetData(payload.description)) {
          schema.description = this.HelperMethods.getValidTrimData(payload.description);
        }

        schema.updatedBy = profile._id;

        const data = await this.Product.findOneAndUpdate({
            _id: product._id
          },
          schema, options
        );





        resolve(data)


      } catch (error) {

        reject(error);

      }
    })
  };
  /**
   * @delete
   */
  delete = async (query, profile, session = null) => {
    return new Promise(async (resolve, reject) => {
      try {

        const product = await this.executeQueryHookWithSession(this.Product.findOne(query), session);
        if (!product) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this product'))

        await product.softDelete(profile._id, session);

        resolve(product)

      } catch (error) {

        reject(error);

      }
    })
  };
  /**
   * @findById
   */
  findById = async (id, session = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        const product = await this.executeQueryHookWithSession(this.Product.findOne({
          _id: id
        }), session)

        if (!product) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this product'))

        resolve(product)


      } catch (error) {
        reject(error);

      }
    })
  };
  /**
   * @getList
   */
  getList = async (querySchema, match = {
    matchCreatedBy: {},
    matchUpdatedBy: {},
    matchDeletedBy: {}
  }, session = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          matchCreatedBy,
          matchUpdatedBy,
          matchDeletedBy,
        } = match
        const data = []
        const productFindData = await this.executeQueryHookWithSession(this.Product.find(querySchema).populate({
          path: "createdBy",
          match: matchCreatedBy
        }).populate({
          path: "updatedBy",
          match: matchUpdatedBy
        }).populate({
          path: "deletedBy",
          match: matchDeletedBy
        }), session)

        for (const item of productFindData) {
          if (item
            //&&item.createdBy
            //&&item.updatedBy
            //&&item.deletedBy
          ) {
            data.push(item)
          }
        }

        resolve(data)

      } catch (error) {
        reject(error);

      }
    })
  };
  /**
   * @findOne
   */
  findOne = async (querySchema, session = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        let data = null
        const productFindOneData = await this.executeQueryHookWithSession(this.Product.findOne(querySchema).populate({
          path: "createdBy",
        }).populate({
          path: "updatedBy",
        }).populate({
          path: "deletedBy",
        }), session)

        if (productFindOneData) {
          data = productFindOneData
        }

        resolve(data)

      } catch (error) {
        reject(error);

      }
    })
  };
  /**
   * @getPaginatedList
   */
  getPaginatedList = async (inputPipeline, options) => {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          perPage,
          page,
          route,
          query
        } = options

        const servicePipeline = [{
            $lookup: {
              from: "owners",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy"
            }
          },

          {
            $addFields: {
              createdBy: {
                $ifNull: [{
                  $arrayElemAt: ['$createdBy', 0]
                }, null]
              }
            }
          },
          {
            $unwind: {
              path: '$createdBy',
              preserveNullAndEmptyArrays: true
            }
          },

          {
            $lookup: {
              from: "owners",
              localField: "updatedBy",
              foreignField: "_id",
              as: "updatedBy"
            }
          },

          {
            $addFields: {
              updatedBy: {
                $ifNull: [{
                  $arrayElemAt: ['$updatedBy', 0]
                }, null]
              }
            }
          },
          {
            $unwind: {
              path: '$updatedBy',
              preserveNullAndEmptyArrays: true
            }
          },

          {
            $lookup: {
              from: "owners",
              localField: "deletedBy",
              foreignField: "_id",
              as: "deletedBy"
            }
          },

          {
            $addFields: {
              deletedBy: {
                $ifNull: [{
                  $arrayElemAt: ['$deletedBy', 0]
                }, null]
              }
            }
          },
          {
            $unwind: {
              path: '$deletedBy',
              preserveNullAndEmptyArrays: true
            }
          },

        ];
        const paginationResponse = await this.getPaginateAggregateDataService({
          Model: this.Product,
          perPage: perPage,
          page: page,
          query: query,
          route: route,
          pipeline: servicePipeline.concat(inputPipeline)

        })

        const response = paginationResponse.data


        const data = response.map(item => item)



        resolve({
          "page": page,
          "totalPages": paginationResponse.totalPages,
          "totalItems": paginationResponse.totalItems,
          "perPage": perPage,
          "nextLink": paginationResponse.nextLink,
          "prevLink": paginationResponse.prevLink,
          "data": data
        })


      } catch (error) {
        reject(error);

      }
    })
  };

}