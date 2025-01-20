/**
 * @AuthMFAConfigResources 
 */
module.exports = class AuthMFAConfigResources {

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
          deletedAt: model.deletedAt,
          method: model.method,
          actorType: model.actorType,
          actorId: model.actorId,
          isEnabled: model.isEnabled,
          phoneNumber: model.phoneNumber,
          emailAddress: model.emailAddress,
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
          deletedAt: model.deletedAt,
          method: model.method,
          actorType: model.actorType,
          actorId: model.actorId,
          isEnabled: model.isEnabled,
          phoneNumber: model.phoneNumber,
          emailAddress: model.emailAddress,
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
          deletedAt: model.deletedAt,
          method: model.method,
          actorType: model.actorType,
          actorId: model.actorId,
          isEnabled: model.isEnabled,
          phoneNumber: model.phoneNumber,
          emailAddress: model.emailAddress,
        }


        resolve(schema);
      } catch (error) {

        reject(error);
      }
    })
  }

}