module.exports = class SharedOwnerServices {

  constructor() {

  }
  /**
   * @createOwner
   */
  createOwner = async (payload) => {
    const OwnerServices = new(require("./owner.services"))();
    return await OwnerServices.create(payload);
  };
  /**
   * @updateOwner
   */
  updateOwner = async (query, payload) => {
    const OwnerServices = new(require("./owner.services"))();
    return await OwnerServices.update(query, payload);
  };
  /**
   * @deleteOwner
   */
  deleteOwner = async (query) => {
    const OwnerServices = new(require("./owner.services"))();
    return await OwnerServices.delete(query);
  };
  /**
   * @findOwnerById
   */
  findOwnerById = async (id) => {
    const OwnerServices = new(require("./owner.services"))();
    return await OwnerServices.findById(id);
  };
  /**
   * @getOwnerList
   */
  getOwnerList = async (querySchema, match = {
    matchIdentity: {}
  }) => {
    const OwnerServices = new(require("./owner.services"))();
    return await OwnerServices.getList(querySchema, match);
  };

}