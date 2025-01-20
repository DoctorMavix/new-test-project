/**
 * @OwnerAuthServices 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class OwnerAuthServices extends CoreServices {

  constructor() {
    super();
    this.Owner = require('../models/owner.model')
    this.IdentifierAuthEnum = require("../../auth/enums/identity.auth.enum");
    this.AuthServices = new(require("../../auth/services/auth.services"))();
  }
  /**
   * @verifyAccount
   */
  verifyAccount = async (payload) => {
    return new Promise(async (resolve, reject) => {
      const session = await this.mongoose.startSession();
      session.startTransaction();
      try {

        const owner = await this.Owner.findOne({
          email: payload.email
        });

        if (!owner) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this account'));

        if (owner.isBlocked) throw new this.ApiError(this.ERROR_MESSAGES.ACCOUNT_BLOCKED);

        // verify identity 
        const identityVerificationMethod = await this.AuthServices.verifyIdentifier({
          identity: owner.identity,
          code: payload.code,
        }, session)
        if (identityVerificationMethod.verify) {

          await owner.updateOne({
            isActive: true,
          })
          await session.commitTransaction();

          return resolve(true)

        } else {
          throw new this.ApiError(this.ERROR_MESSAGES.INVALID_EMAIL_VERIFICATION_CODE)
        }

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
   * @resendAccountVerificationCode
   */
  resendAccountVerificationCode = async (payload) => {
    return new Promise(async (resolve, reject) => {
      const session = await this.mongoose.startSession();
      session.startTransaction();
      try {

        const owner = await this.Owner.findOne({
          email: payload.email
        });

        if (!owner) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this account'));

        if (owner.isBlocked) throw new this.ApiError(this.ERROR_MESSAGES.ACCOUNT_BLOCKED);
        if (owner.isActive) throw new this.ApiError(this.ERROR_MESSAGES.ACCOUNT_ACTIVE);

        // verify identity 
        const identityVerificationMethod = await this.AuthServices.resendIdentifierVerificationCode({
          identity: owner.identity,
        })
        if (identityVerificationMethod.verificationCodeSent) {

          await session.commitTransaction();

          return resolve(true)

        } else {
          throw new this.ApiError(this.ERROR_MESSAGES.FAILED_TO_SEND_CODE("verification code"))
        }

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
   * @signin
   */
  signin = async (payload) => {
    return new Promise(async (resolve, reject) => {

      try {

        const owner = await this.Owner.findOne({
          email: payload.email
        });

        if (!owner) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this account'));

        if (owner.isBlocked) throw new this.ApiError(this.ERROR_MESSAGES.ACCOUNT_BLOCKED);
        if (!owner.isActive) throw new this.ApiError(this.ERROR_MESSAGES.ACCOUNT_DISABLED);

        const response = await this.AuthServices.signin({
          identity: owner.identity,
          password: payload.password,
          actorType: 'owner'
        })

        resolve(response)

      } catch (error) {
        console.error('Transaction aborted:', error);
        reject(error);

      }
    })
  };
  /**
   * @activateMFAToken
   */
  activateMFAToken = async (accessToken, code) => {
    return new Promise(async (resolve, reject) => {

      try {

        const response = await this.AuthServices.activateMFAToken(accessToken, code)


        resolve(response)

      } catch (error) {
        console.error('Transaction aborted:', error);
        reject(error);

      }
    })
  };
  /**
   * @resendMFACode
   */
  resendMFACode = async (accessToken) => {
    return new Promise(async (resolve, reject) => {

      try {

        const response = await this.AuthServices.resendMFACode(accessToken)


        resolve(response)

      } catch (error) {
        console.error('Transaction aborted:', error);
        reject(error);

      }
    })
  };
  /**
   * @refreshToken
   */
  refreshToken = async (token) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.AuthServices.refreshToken(token)
        resolve(response)

      } catch (error) {
        console.error('Transaction aborted:', error);
        reject(error);
      }
    })
  };
  /**
   * @generatePasswordResetCode
   */
  generatePasswordResetCode = async (payload) => {
    return new Promise(async (resolve, reject) => {
      const session = await this.mongoose.startSession();
      session.startTransaction();
      try {

        const owner = await this.Owner.findOne({
          email: payload.email
        });

        if (!owner) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this account'));

        if (owner.isBlocked) throw new this.ApiError(this.ERROR_MESSAGES.ACCOUNT_BLOCKED);
        if (!owner.isActive) throw new this.ApiError(this.ERROR_MESSAGES.ACCOUNT_DISABLED);

        // verify identity 
        const identityVerificationMethod = await this.AuthServices.sendPasswordResetCode({
          identity: owner.identity,
        })
        if (identityVerificationMethod.resetCodeSent) {

          await session.commitTransaction();

          return resolve(true)

        } else {
          throw new this.ApiError(this.ERROR_MESSAGES.FAILED_TO_SEND_CODE("password reset code"))
        }

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
   * @verifyPasswordResetCode
   */
  verifyPasswordResetCode = async (payload) => {
    return new Promise(async (resolve, reject) => {
      const session = await this.mongoose.startSession();
      session.startTransaction();
      try {

        const owner = await this.Owner.findOne({
          email: payload.email
        });

        if (!owner) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND('this account'));

        if (owner.isBlocked) throw new this.ApiError(this.ERROR_MESSAGES.ACCOUNT_BLOCKED);

        // verify identity 
        const identityVerificationMethod = await this.AuthServices.verifyPasswordResetCode({
          identity: owner.identity,
          code: payload.code,
        }, session)
        if (identityVerificationMethod.verify) {


          await session.commitTransaction();

          return resolve({
            temporaryToken: identityVerificationMethod.temporaryToken
          })

        } else {
          throw new this.ApiError(this.ERROR_MESSAGES.INVALID_EMAIL_VERIFICATION_CODE)
        }

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
   * @resetPassword
   */
  resetPassword = async (token, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        const identityVerificationMethod = await this.AuthServices.resetPassword(token, password)
        if (identityVerificationMethod.reset) {
          return resolve({
            reset: true,
            message: this.SUCCESS_MESSAGES.RESET_SUCCESSFULLY("password")
          })

        } else {
          throw new this.ApiError(identityVerificationMethod.error || this.ERROR_MESSAGES.INVALID_TOKEN)
        }

      } catch (error) {
        reject(error);

      }
    })
  };
  /**
   * @changePassword
   */
  changePassword = async (payload) => {
    return new Promise(async (resolve, reject) => {
      try {
        const identityVerificationMethod = await this.AuthServices.changePassword(payload)
        if (identityVerificationMethod.success) {
          return resolve({
            success: true,
            message: this.SUCCESS_MESSAGES.OPERATION_SUCCESS
          })

        } else {
          throw new this.ApiError(identityVerificationMethod.error || this.ERROR_MESSAGES.FAILED_TO_CHANGE_PASSWORD)
        }

      } catch (error) {
        reject(error);

      }
    })
  };
  /**
   * @signout
   */
  signout = async (accessToken) => {
    return new Promise(async (resolve, reject) => {
      try {

        const response = await this.AuthServices.signout(accessToken)

        resolve(response)

      } catch (error) {
        reject(error);

      }
    })
  };
  /**
   * @implementGoogleAuth
   */
  implementGoogleAuth = async (code) => {
    return new Promise(async (resolve, reject) => {
      const session = await this.mongoose.startSession();
      session.startTransaction();
      try {
        // implement auth
        const response = await this.AuthServices.implementGoogleAuth(code, "owner", session)
        await session.commitTransaction();

        resolve(response)

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
   * @validateRole 
   */
  validateRole(roles, model, key = "roles") {
    if (roles.length == 0) roles = ['*']
    for (let i = 0; i < roles.length; i++) {
      if (roles[i] == "*") {
        return model;
      } else if (model[key].includes(roles[i])) {
        return model;
      }
    }
    return false
  }
  /**
   * @authorizeOwnerAuth
   */
  async authorizeOwnerAuth(options) {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * @ActorInstance
         */
        let {
          id,
          token,
          roles
        } = options

        if (!id) {
          const authenticateResponse = await this.AuthServices.authenticate(token)
          if (authenticateResponse.success == false) {
            return resolve({
              success: false,
              message: authenticateResponse.message,
              error: authenticateResponse.error
            })
          }
          id = authenticateResponse.data.id
        }


        const owner = await this.Owner.findOne({
          identity: id
        });
        if (!owner)
          return resolve({
            success: false,
            message: this.ERROR_MESSAGES.CAN_NOT_FIND('this owner'),
            error: this.ERROR_CODES.CAN_NOT_FIND
          })



        /**
         * @ValidateRole
         */


        if (!this.validateRole(roles, owner)) {
          return resolve({
            success: false,
            message: this.ERROR_MESSAGES.INVALID_ROLE,
            error: this.ERROR_CODES.INVALID_ROLE
          })
        }

        /**
         * @Action
         */

        if (owner) {
          if (owner.isBlocked) {
            return resolve({
              success: false,
              message: this.ERROR_MESSAGES.ACCOUNT_BLOCKED,
              error: this.ERROR_CODES.ACCOUNT_BLOCKED
            })

          }

          if (!owner.isActive) {
            return resolve({
              success: false,
              message: this.ERROR_MESSAGES.ACCOUNT_DISABLED,
              error: this.ERROR_CODES.ACCOUNT_DISABLED
            })

          }
        }

        resolve({
          success: true,
          data: owner,
        })


      } catch (error) {
        reject(error)
      }
    });
  }

}