/**
 * @ProductResources 
 */
module.exports = class ProductResources {

  constructor() {

  }
  /**
   * @collection
   */
  static collection(model, filter = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!model) return resolve(model)
        const {} = filter

        const schema = {
          _id: model._id,
          createdBy: model.createdBy,
          updatedBy: model.updatedBy,
          deletedBy: model.deletedBy,
          name: model.name,
          description: model.description,
        }

        resolve(schema);
      } catch (error) {

        reject(error);
      }
    })
  }
  /**
   * @ref 
   */
  static ref(model, filter = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!model) return resolve(model)

        const schema = {
          _id: model._id,
          name: model.name,
          description: model.description,
        }


        resolve(schema);
      } catch (error) {

        reject(error);
      }
    })
  }

}