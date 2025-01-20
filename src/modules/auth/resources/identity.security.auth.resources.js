/**
 * @AuthIdentitySecurityResources 
 */
module.exports = class AuthIdentitySecurityResources {

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
          identity: model.identity,
          identifierVerification: model.identifierVerification,
          passwordReset: model.passwordReset,
          oauth: model.oauth,
          lastLogin: model.lastLogin,
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
          identifierVerification: model.identifierVerification,
          passwordReset: model.passwordReset,
          oauth: model.oauth,
          lastLogin: model.lastLogin,
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
          identifierVerification: model.identifierVerification,
          passwordReset: model.passwordReset,
          oauth: model.oauth,
          lastLogin: model.lastLogin,
        }


        resolve(schema);
      } catch (error) {

        reject(error);
      }
    })
  }

}