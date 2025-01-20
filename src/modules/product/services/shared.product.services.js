module.exports = class SharedProductServices {

  constructor() {

  }
  /**
   * @createProduct
   */
  createProduct = async (payload, profile, session = null) => {
    const ProductServices = new(require("./product.services"))();
    return await ProductServices.create(payload, profile, session);
  };
  /**
   * @updateProduct
   */
  updateProduct = async (query, payload, profile, session = null) => {
    const ProductServices = new(require("./product.services"))();
    return await ProductServices.update(query, payload, profile, session);
  };
  /**
   * @deleteProduct
   */
  deleteProduct = async (query, profile, session = null) => {
    const ProductServices = new(require("./product.services"))();
    return await ProductServices.delete(query, profile, session);
  };
  /**
   * @findProductById
   */
  findProductById = async (id, session = null) => {
    const ProductServices = new(require("./product.services"))();
    return await ProductServices.findById(id, session);
  };
  /**
   * @getProductList
   */
  getProductList = async (querySchema, match = {
    matchCreatedBy: {},
    matchUpdatedBy: {},
    matchDeletedBy: {}
  }, session = null) => {
    const ProductServices = new(require("./product.services"))();
    return await ProductServices.getList(querySchema, match, session);
  };

}