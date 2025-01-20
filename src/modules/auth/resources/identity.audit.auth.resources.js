/**
 * @AuthIdentityAuditResources 
 */
module.exports = class AuthIdentityAuditResources {

  constructor() {

  }
  /**
   * @Default collection
   */
  static collection(model, filter = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!model) return resolve(model)

        const {} = filter


        const schema = {
          _id: model._id,
          createdAt: model.createdAt,
          updatedAt: model.updatedAt,
          action: model.action,
          identity: model.identity,
          details: model.details,
          performBy: model.performBy,
        }


        resolve(schema);
      } catch (error) {

        reject(error);
      }
    })
  }
  /**
   * @statistical collection
   */
  static statistical(model, filter = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!model) return resolve(model)

        const {} = filter


        const schema = {
          createdAt: model.createdAt,
          updatedAt: model.updatedAt,
          action: model.action,
          details: model.details,
        }


        resolve(schema);
      } catch (error) {

        reject(error);
      }
    })
  }
  /**
   * @ref collection
   */
  static ref(model, filter = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!model) return resolve(model)

        const schema = {
          _id: model._id,
          createdAt: model.createdAt,
          updatedAt: model.updatedAt,
          action: model.action,
          details: model.details,
        }


        resolve(schema);
      } catch (error) {

        reject(error);
      }
    })
  }

}