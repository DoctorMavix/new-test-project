/**
 * @AuthServices 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class AuthServices extends CoreServices {

  constructor() {
    super();
    this.Auth = require("../../auth/models/auth.model");
    this.AuthEnum = require("../enums/auth.enum");
    this.AuthResource = require("../../auth/resources/auth.resources");
    this.MFAService = new(require("./mfa.auth.services"))();
    this.AuthIdentityService = new(require("./identity.auth.services"))();
  }
  /**
   * @accessTokenIsExpired
   */
  accessTokenIsExpired(auth) {
    return Date.now() > auth.accessTokenExpiresAt.getTime()
  }
  /**
   * @refreshTokenIsExpired
   */
  refreshTokenIsExpired(auth) {
    return Date.now() > auth.refreshTokenExpiresAt.getTime()
  }
  /**
   * @create
   */
  create(payload) {
    return new Promise(async (resolve, reject) => {
      try {

        const schema = {
          actorType: payload.actorType,
          accessToken: payload.accessToken,
          accessTokenExpiresAt: payload.accessTokenExpiresAt,
          refreshToken: payload.refreshToken,
          refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
          mfa: payload.mfa,
        }


        const tokenExists = await this.Auth.find({
          accessToken: schema.accessToken,
          accessTokenExpiresAt: {
            $gte: Date.now()
          },
          deletedAt: {
            $exists: false
          }
        })
        if (tokenExists.length > 0) {
          for (const tokenExist of tokenExists) {
            await tokenExist.updateOne({
              accessTokenExpiresAt: Date.now(),
              deletedAt: Date.now(),
            })
          }

        }

        const auth = await this.Auth.create(schema)

        resolve(auth)

      } catch (error) {

        reject(error);

      }
    })
  }
  /**
   * @verifyAccessToken 
   */
  verifyAccessToken(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {


        let {
          error,
          valid,
          data
        } = await this.validateAccessToken(accessToken)

        if (valid) {
          if (data.mfa.isEnabled) {
            if (!data.mfa.codeVerifiedAt) {
              error = "MFA code not verify"
            }
          }

        }
        resolve({
          error,
          verify: error ? false : true,
          data: data
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  /**
   * @validateAccessToken 
   */
  validateAccessToken(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {


        const tokenAuth = await this.Auth.findOne({
          accessToken,
        }).select("+mfa.code");

        let valid = true
        let error
        const data = tokenAuth
        if (tokenAuth) {
          if (this.accessTokenIsExpired(tokenAuth)) {
            error = this.ERROR_MESSAGES.EXPIRED("Token")
            valid = false
          }
        } else {
          error = this.ERROR_MESSAGES.ACCESS_DENIED
          valid = false

        }


        resolve({
          error,
          valid,
          data
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  /**
   * @validateRefreshToken 
   */
  validateRefreshToken(refreshToken) {
    return new Promise(async (resolve, reject) => {
      try {


        const tokenAuth = await this.Auth.findOne({
          refreshToken,
        }).select("+mfa.code");

        let valid = true
        let error
        const data = tokenAuth
        if (tokenAuth) {
          if (this.refreshTokenIsExpired(tokenAuth)) {
            error = this.ERROR_MESSAGES.EXPIRED("Token")
            valid = false
          }
        } else {
          error = this.ERROR_MESSAGES.ACCESS_DENIED
          valid = false

        }


        resolve({
          error,
          valid,
          data
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  /**
   * @activateMFAToken 
   */
  activateMFAToken(accessToken, code) {
    return new Promise(async (resolve, reject) => {
      try {


        const accessTokenValidationResponse = await this.validateAccessToken(accessToken)

        if (accessTokenValidationResponse.valid != true) {
          throw new this.ApiError(accessTokenValidationResponse.error)
        }

        const activateMFATokenResponse = await this.MFAService.activateMFAToken(accessTokenValidationResponse.data, code)

        resolve({
          tokenIsActivated: activateMFATokenResponse.tokenIsActivated
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  /**
   * @resendMFACode 
   */
  resendMFACode(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {

        // fetch data 

        const accessTokenValidationResponse = await this.validateAccessToken(accessToken)

        if (accessTokenValidationResponse.valid != true) {
          throw new this.ApiError(accessTokenValidationResponse.error)
        }

        const auth = accessTokenValidationResponse.data

        if (auth.mfa.isEnabled != true) throw new this.ApiError("this access token don't have mfa enable")
        const decodeId = this.jwtVerify(auth.accessToken)
        const id = decodeId._id

        const identity = await this.AuthIdentityService.findIdentityById(id)
        if (!identity) throw new this.ApiError(this.ERROR_CODES.INVALID_TOKEN)

        const locals = this.AuthIdentityService.getSigninLocals(identity)
        const schema = {
          accessToken: auth.accessToken,
          accessTokenExpiresAt: auth.accessTokenExpiresAt,
          refreshToken: auth.refreshToken,
          refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
          actorType: auth.actorType,
          mfa: await this.MFAService.getSchema(auth.actorType, id, locals),
        }

        await this.create(schema)



        resolve({
          accessTokenExpiresAt: schema.accessTokenExpiresAt
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  /**
   * @refreshToken 
   */
  refreshToken(refreshToken) {
    return new Promise(async (resolve, reject) => {
      try {

        // fetch data 

        const refreshTokenValidationResponse = await this.validateRefreshToken(refreshToken)

        if (refreshTokenValidationResponse.valid != true) {
          throw new this.ApiError(refreshTokenValidationResponse.error)
        }

        const auth = refreshTokenValidationResponse.data

        const decodeId = this.jwtVerify(auth.accessToken, process.env.SECRET_KEY + "refresh-token")
        const id = decodeId._id


        const {
          accessTokenExpiresAt,
          accessToken
        } = this.generateAccessToken(id)

        const schema = {
          accessToken: accessToken,
          accessTokenExpiresAt: accessTokenExpiresAt,
        }

        await auth.updateOne(schema)

        resolve(schema)
      } catch (err) {
        reject(err)
      }
    })
  }
  /**
   * @createIdentity
   */
  async createIdentity(payload, session) {
    return await this.AuthIdentityService.create(payload, session)
  }
  /**
   * @verifyIdentifier
   */
  async verifyIdentifier(payload, session) {
    return await this.AuthIdentityService.verifyIdentifier(payload, session)
  }
  /**
   * @verifyPasswordResetCode
   */
  async verifyPasswordResetCode(payload, session) {
    return await this.AuthIdentityService.verifyPasswordResetCode(payload, session)
  }
  /**
   * @resetPassword
   */
  async resetPassword(token, password) {
    return await this.AuthIdentityService.resetPassword(token, password)
  }
  /**
   * @changePassword
   */
  async changePassword(payload) {
    return await this.AuthIdentityService.changePassword(payload)
  }
  /**
   * @resendIdentifierVerificationCode
   */
  async resendIdentifierVerificationCode(payload, session) {
    return await this.AuthIdentityService.resendIdentifierVerificationCode(payload, session)
  }
  /**
   * @sendPasswordResetCode
   */
  async sendPasswordResetCode(payload, session) {
    return await this.AuthIdentityService.sendPasswordResetCode(payload, session)
  }
  /**
   * @generateAccessToken
   */
  generateAccessToken(id) {
    const today = new Date();
    const accessTokenExpiresAt = today.getTime() + this.TIME_SETTINGS.ACCESS_TOKEN_EXPIRED_TIME;

    const accessToken = this.jwt.sign({
      _id: id
    }, process.env.SECRET_KEY);

    return {
      accessToken,
      accessTokenExpiresAt
    }
  }
  /**
   * @generateRefreshToken
   */
  generateRefreshToken(id) {
    const today = new Date();

    const refreshToken = this.jwt.sign({
      _id: id
    }, process.env.SECRET_KEY + "refresh-token");

    const refreshTokenExpiresAt = today.getTime() + this.TIME_SETTINGS.REFRESH_TOKEN_EXPIRED_TIME;

    return {
      refreshToken,
      refreshTokenExpiresAt
    }
  }
  /**
   * @GenerateAuthSchema
   */
  generateAuthSchema(id, actorType, locals) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          accessTokenExpiresAt,
          accessToken
        } = this.generateAccessToken(id)
        const {
          refreshToken,
          refreshTokenExpiresAt
        } = this.generateRefreshToken(id)

        const authSchema = {
          accessToken,
          accessTokenExpiresAt,
          refreshToken,
          refreshTokenExpiresAt,
          actorType,
          mfa: await this.MFAService.getSchema(actorType, id, locals),

        }




        resolve(authSchema)
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @Signin
   */
  implementGoogleAuth(code, actorType, session) {
    return new Promise(async (resolve, reject) => {
      try {

        const {
          identity
        } = await this.AuthIdentityService.findOrCreateGoogleUser(code, session)

        const authSchema = await this.generateAuthSchema(identity._id, actorType)

        await this.create(authSchema)

        resolve({
          success: true,
          accessToken: authSchema.accessToken,
          accessTokenExpiresAt: authSchema.accessTokenExpiresAt,
          refreshToken: authSchema.refreshToken,
          refreshTokenExpiresAt: authSchema.refreshTokenExpiresAt,
          mfaIsEnabled: authSchema.mfa.isEnabled,
          mfaMessage: authSchema.mfa.isCodeSent ? `MFA ${authSchema.mfa.method} sent successfully` : null
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @Signin
   */
  signin(payload) {
    return new Promise(async (resolve, reject) => {
      try {

        const {
          id,
          actorType,
          locals
        } = await this.AuthIdentityService.signin(payload)

        const authSchema = await this.generateAuthSchema(id, actorType, locals)

        await this.create(authSchema)

        resolve({
          success: true,
          accessToken: authSchema.accessToken,
          accessTokenExpiresAt: authSchema.accessTokenExpiresAt,
          refreshToken: authSchema.refreshToken,
          refreshTokenExpiresAt: authSchema.refreshTokenExpiresAt,
          mfaIsEnabled: authSchema.mfa.isEnabled,
          mfaMessage: authSchema.mfa.isCodeSent ? `MFA ${authSchema.mfa.method} sent successfully` : null
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @Signout
   */
  signout(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {


        const accessTokenValidationResponse = await this.validateAccessToken(accessToken)

        if (accessTokenValidationResponse.valid != true) {
          throw new this.ApiError(accessTokenValidationResponse.error)
        }

        const auth = accessTokenValidationResponse.data

        const schema = {
          accessTokenExpiresAt: Date.now(),
          refreshTokenExpiresAt: Date.now(),
        }

        await auth.updateOne(schema)
        resolve({
          message: this.SUCCESS_MESSAGES.OPERATION_SUCCESS,
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @authenticate
   */
  authenticate(token, accessLevels) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token)
          return resolve({
            success: false,
            message: this.ERROR_MESSAGES.UNDEFINED_TOKEN,
            error: this.ERROR_CODES.UNDEFINED_TOKEN
          })


        const {
          error
        } = await this.verifyAccessToken(token)
        if (error)
          return resolve({
            success: false,
            message: error,
            error: this.ERROR_CODES.INVALID_TOKEN
          })
        token = this.jwtVerify(token);


        /**
         * @ActorInstance
         */


        const identity = await this.AuthIdentityService.findIdentityById(token._id);
        if (!identity)
          return resolve({
            success: false,
            message: this.ERROR_MESSAGES.CAN_NOT_FIND('this actor'),
            error: this.ERROR_CODES.CAN_NOT_FIND
          })

        /**
         * @ValidateAccessLevel
         */

        if (!this.validateAccessLevel(accessLevels, identity)) {

          return resolve({
            success: false,
            message: this.ERROR_MESSAGES.ACCESS_DENIED,
            error: this.ERROR_CODES.ACCESS_DENIED
          })
        }



        if (!identity.isActive) {
          return resolve({
            success: false,
            message: this.ERROR_MESSAGES.ACCOUNT_DISABLED,
            error: this.ERROR_CODES.ACCOUNT_DISABLED
          })

        }

        if (identity.isBlocked) {
          return resolve({
            success: false,
            message: this.ERROR_MESSAGES.ACCOUNT_BLOCKED,
            error: this.ERROR_CODES.ACCOUNT_BLOCKED
          })
        }


        resolve({
          success: true,
          data: identity,
        })


      } catch (error) {

        reject(error);

      }
    })
  }
  /**
   * @validateAccessLevel 
   */
  validateAccessLevel(accessLevels, model, key = "actorType") {
    if (!accessLevels) return model
    if (accessLevels.length == 0) return model


    return false
  }

}