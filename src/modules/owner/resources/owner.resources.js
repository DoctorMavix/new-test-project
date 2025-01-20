/**
 * @OwnerResource 
 */
module.exports = class OwnerResources {

  constructor() {

  }
  /**
   * @Default collection
   */
  static collection(model, filter = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!model)
          return resolve(model)
        const {} = filter

        const schema = {
          _id: model._id,
          firstName: model.firstName,
          lastName: model.lastName,
          email: model.email,
          identity: model.identity,
          roles: model.roles,
          isActive: model.isActive,
          isBlocked: model.isBlocked,
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
        if (!model)
          return resolve(model)

        const schema = {
          _id: model._id,
          firstName: model.firstName,
          lastName: model.lastName,
          email: model.email,
          roles: model.roles,
          isActive: model.isActive,
          isBlocked: model.isBlocked,
        }
        resolve(schema);
      } catch (error) {
        reject(error);
      }
    })
  }

}