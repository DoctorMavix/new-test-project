/**
 * @AuthResources 
 */
module.exports = class AuthResources {

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
          actorType: model.actorType,
          accessToken: model.accessToken,
          accessTokenExpiresAt: model.accessTokenExpiresAt,
          refreshToken: model.refreshToken,
          refreshTokenExpiresAt: model.refreshTokenExpiresAt,
          mfa: model.mfa,
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
          actorType: model.actorType,
          accessToken: model.accessToken,
          accessTokenExpiresAt: model.accessTokenExpiresAt,
          refreshToken: model.refreshToken,
          refreshTokenExpiresAt: model.refreshTokenExpiresAt,
          mfa: model.mfa,
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
          actorType: model.actorType,
          accessToken: model.accessToken,
          accessTokenExpiresAt: model.accessTokenExpiresAt,
          refreshToken: model.refreshToken,
          refreshTokenExpiresAt: model.refreshTokenExpiresAt,
          mfa: model.mfa,
        }


        resolve(schema);
      } catch (error) {

        reject(error);
      }
    })
  }

}