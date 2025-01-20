/**
 * @OwnerServices 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class OwnerServices extends CoreServices {

  constructor() {
    super();
    this.Owner = require("../models/owner.model");
    this.OwnerResource = require("../resources/owner.resources");
    this.AuthIdentityEnum = require("../../auth/enums/identity.auth.enum");
    this.AuthServices = new(require("../../auth/services/auth.services"))();
  }
  /**
   * @instanceAlreadyExist
   */
  instanceAlreadyExist = async (payload) => {
    return new Promise(async (resolve, reject) => {
      try {
        const ownerExist = await this.Owner.findOne({
            // your condition
            name: payload.name,
          })
          .populate({
            path: "identity"
          })
          .includeDeleted()

        resolve(ownerExist)



      } catch (error) {

        reject(error);

      }
    })
  };
  /**
   * @findOrCreate
   */
  findOrCreate = async (payload) => {
    return new Promise(async (resolve, reject) => {
      try {
        const ownerExist = await this.instanceAlreadyExist(payload)

        let save
        if (ownerExist) {
          save = ownerExist
        } else {
          save = await this.create(payload)
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
  create = async (payload) => {
    return new Promise(async (resolve, reject) => {
      const session = await this.mongoose.startSession();
      session.startTransaction();
      try {

        const identity = await this.AuthServices.createIdentity({
          firstName: payload.firstName,
          lastName: payload.lastName,
          password: payload.password,
          identifier: payload.email,
          identifierType: this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY,
        }, session)


        const schema = {}
        if (this.HelperMethods.issetData(payload.firstName)) {
          schema.firstName = this.HelperMethods.getValidTrimData(payload.firstName);
        }
        if (this.HelperMethods.issetData(payload.lastName)) {
          schema.lastName = this.HelperMethods.getValidTrimData(payload.lastName);
        }
        if (this.HelperMethods.issetData(payload.email)) {
          const emailExistForOwner = await this.executeQueryHookWithSession(this.Owner.findOne({
            email: {
              $regex: payload.email,
              $options: "i",
            }
          }), session)
          if (emailExistForOwner) throw new this.ApiError("this email already exists")

          schema.email = this.HelperMethods.getValidTrimData(payload.email);
        }


        schema.identity = identity._id
        schema.isActive = identity.isActive
        const owner = new this.Owner(schema);
        const save = await owner.save();



        await session.commitTransaction();

        resolve(save)

      } catch (error) {
        await session.abortTransaction();
        console.error('Transaction aborted:', error);
        reject(error);

      } finally {
        session.endSession();

      }
    })
  };
  /**
   * @update
   */
  update = async (query, payload) => {
    return new Promise(async (resolve, reject) => {
      try {

        const owner = await this.Owner.findOne(query);

        if (!owner) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this owner'))

        const schema = {}
        if (this.HelperMethods.issetData(payload.firstName)) {
          schema.firstName = this.HelperMethods.getValidTrimData(payload.firstName);
        }
        if (this.HelperMethods.issetData(payload.lastName)) {
          schema.lastName = this.HelperMethods.getValidTrimData(payload.lastName);
        }
        if (this.HelperMethods.issetData(payload.email)) {
          const emailExistForOwner = await this.executeQueryHookWithSession(this.Owner.findOne({
            email: {
              $regex: payload.email,
              $options: "i",
            }
          }), session)
          if (emailExistForOwner) throw new this.ApiError("this email already exists")

          schema.email = this.HelperMethods.getValidTrimData(payload.email);
        }


        const data = await this.Owner.findOneAndUpdate({
            _id: owner._id
          },
          schema, {
            new: true
          }
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
  delete = async (query) => {
    return new Promise(async (resolve, reject) => {
      try {

        const owner = await this.Owner.findOne(query);

        if (!owner) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this owner'))

        await owner.softDelete();

        resolve(owner)

      } catch (error) {

        reject(error);

      }
    })
  };
  /**
   * @findById
   */
  findById = async (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const owner = await this.Owner.findOne({
          _id: id
        })

        if (!owner) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this owner'))

        resolve(owner)


      } catch (error) {
        reject(error);

      }
    })
  };
  /**
   * @getList
   */
  getList = async (querySchema, match = {
    matchIdentity: {}
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          matchIdentity,
        } = match
        const data = []
        const ownerFindData = await this.Owner.find(querySchema)
          .populate({
            path: "identity",
            match: matchIdentity
          })

        for (const item of ownerFindData) {
          if (item
            //&&item.identity
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
  findOne = async (querySchema) => {
    return new Promise(async (resolve, reject) => {
      try {
        let data = null
        const ownerFindOneData = await this.Owner.findOne(querySchema)
          .populate({
            path: "identity",
          })

        if (ownerFindOneData) {
          data = ownerFindOneData
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
              from: "authidentitys",
              localField: "identity",
              foreignField: "_id",
              as: "identity"
            }
          },

          {
            $addFields: {
              identity: {
                $ifNull: [{
                  $arrayElemAt: ['$identity', 0]
                }, null]
              }
            }
          },
          {
            $unwind: {
              path: '$identity',
              preserveNullAndEmptyArrays: true
            }
          },

        ];
        const paginationResponse = await this.getPaginateAggregateDataService({
          Model: this.Owner,
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