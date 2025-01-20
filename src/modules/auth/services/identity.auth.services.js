/**
 * @AuthIdentityServices 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class AuthIdentityServices extends CoreServices {

  constructor() {
    super();
    this.Auth = require("../models/auth.model");
    this.AuthEnum = require("../enums/auth.enum");
    this.AuthResource = require("../resources/auth.resources");
    this.MFAConfig = require("../models/mfaconfig.auth.model");
    this.MFAConfigEnum = require("../enums/mfaconfig.auth.enum");
    this.AuthIdentity = require("../models/identity.auth.model");
    this.AuthIdentityEnum = require("../enums/identity.auth.enum");
    this.AuthIdentitySecurityEnum = require("../enums/identity.security.auth.enum");
    this.AuthIdentitySecurity = require("../models/identity.security.auth.model");
  }
  /**
   * @findIdentityByIdentifier
   */
  async findIdentityByIdentifier(identifier) {
    return new Promise(async (resolve, reject) => {
      try {

        const identity = await this.AuthIdentity.findOne({
          identifier: identifier
        })

        resolve(identity)

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @findIdentityById
   */
  async findIdentityById(id) {
    return new Promise(async (resolve, reject) => {
      try {

        const identity = await this.AuthIdentity.findOne({
          _id: id
        })

        resolve(identity)

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @create
   */
  async create(payload, session) {
    return new Promise(async (resolve, reject) => {
      try {
        const identityExist = await this.findIdentityByIdentifier(payload.identifier)
        if (identityExist) throw new this.ApiError(this.ERROR_MESSAGES.ALREADY_EXIST("this auth identity identifier"))

        const schema = {
          firstName: payload.firstName,
          lastName: payload.lastName,
          identifier: payload.identifier,
          identifierType: payload.identifierType,
          isActive: false

        }


        if (![this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY, this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY].includes(schema.identifierType)) {
          schema.isActive = true
        }

        const identity = new this.AuthIdentity(schema)
        await identity.save({
          session
        })

        if ([this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY, this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY].includes(schema.identifierType)) {
          await this.initIdentifierVerificationProcess({
            identity: identity._id,
            firstName: schema.firstName,
            lastName: schema.lastName,
            identifier: schema.identifier,
            identifierType: schema.identifierType,
            password: payload.password,

          }, session)
        }

        resolve(identity)

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @returnSecurityPasswordHash
   */
  async returnSecurityPasswordHash(password) {
    return await this.HelperMethods.generateBcryptHash(password)
  }
  /**
   * @initIdentifierVerificationProcess
   */
  async initIdentifierVerificationProcess(payload, session) {
    return new Promise(async (resolve, reject) => {
      try {

        const schema = {
          identity: payload.identity,
        }

        // check if security exist  
        const securityExist = await this.AuthIdentitySecurity.findOne({
          identity: schema.identity
        })


        if ([
            this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY,
            this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY,
          ].includes(payload.identifierType)) {
          // if create 
          if (!securityExist) {
            schema.password = await this.returnSecurityPasswordHash(payload.password)
          }


          const code = this.HelperMethods.generateId(4, false)
          const expiredOn = Date.now() + (1000 * 60 * 20)

          schema.identifierVerification = {
            code: await this.HelperMethods.generateBcryptHash(code),
            expiredOn,
            contactId: null
          }



          if (payload.identifierType == this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY) {
            const emailResponse = await this.sendIdentifierVerificationEmail(code, {
              fullName: `${payload.lastName} ${payload.firstName}`,
              email: payload.identifier,
              expiryMinutes: '20 minutes'
            })
            schema.identifierVerification.contactId = emailResponse.contactId
          }
          if (payload.identifierType == this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY) {
            const smsResponse = await this.sendIdentifierVerificationSms(code, {
              fullName: `${payload.lastName} ${payload.firstName}`,
              phoneNumber: payload.identifier,
              expiryMinutes: '20 minutes'
            })
            schema.identifierVerification.contactId = smsResponse.contactId
          }
        } else {
          throw new this.ApiError("invalid init identifier type on initIdentifierVerificationProcess")
        }


        let save
        if (securityExist) {
          await securityExist.updateOne(schema, {
            session
          })
          save = await this.AuthIdentitySecurity.findOne({
            _id: securityExist._id
          })
        } else {
          const security = new this.AuthIdentitySecurity(schema)
          save = await security.save({
            session
          })
        }


        resolve(save)

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @initIdentifierResetPasswordProcess
   */
  async initIdentifierResetPasswordProcess(payload, session) {
    return new Promise(async (resolve, reject) => {
      try {

        const schema = {
          identity: payload.identity,
        }

        // check if security exist  
        const securityExist = await this.AuthIdentitySecurity.findOne({
          identity: schema.identity
        })


        if ([
            this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY,
            this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY,
          ].includes(payload.identifierType)) {
          // if create 
          if (!securityExist) {
            schema.password = await this.returnSecurityPasswordHash(payload.password)
          }


          const code = this.HelperMethods.generateId(4, false)
          const expiredOn = Date.now() + (1000 * 60 * 20)

          schema.passwordReset = {
            code: await this.HelperMethods.generateBcryptHash(code),
            expiredOn,
            contactId: null
          }



          if (payload.identifierType == this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY) {
            const emailResponse = await this.sendIdentifierPasswordResetEmail(code, {
              fullName: `${payload.lastName} ${payload.firstName}`,
              email: payload.identifier,
              expiryMinutes: '20 minutes'
            })
            schema.passwordReset.contactId = emailResponse.contactId
          }
          if (payload.identifierType == this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY) {
            const smsResponse = await this.sendIdentifierPasswordResetSms(code, {
              fullName: `${payload.lastName} ${payload.firstName}`,
              phoneNumber: payload.identifier,
              expiryMinutes: '20 minutes'
            })
            schema.passwordReset.contactId = smsResponse.contactId
          }
        } else {
          throw new this.ApiError("invalid init identifier type on initIdentifierResetPasswordProcess")
        }


        let save
        if (securityExist) {
          await securityExist.updateOne(schema, {
            session
          })
          save = await this.AuthIdentitySecurity.findOne({
            _id: securityExist._id
          })
        } else {
          const security = new this.AuthIdentitySecurity(schema)
          save = await security.save({
            session
          })
        }


        resolve(save)

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @sendIdentifierVerificationEmail
   */
  sendIdentifierVerificationEmail(code, locals) {
    return new Promise(async (resolve, reject) => {
      try {

        locals.code = code
        const response = await this.Email.sendEmail(locals.email, locals, this.EMAIL_TEMPLATES.VERIFY_EMAIL)

        return resolve({
          sent: response.id ? true : false,
          contactId: response.id,
        })

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @sendIdentifierVerificationSms
   */
  sendIdentifierVerificationSms(code, locals) {
    return new Promise(async (resolve, reject) => {
      try {

        locals.code = code
        const response = await this.Sms.sendSMS(locals.phoneNumber, locals, this.SMS_TEMPLATES.VERIFY_SMS)

        return resolve({
          sent: response.id ? true : false,
          contactId: response.id,
        })

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @sendIdentifierPasswordResetEmail
   */
  sendIdentifierPasswordResetEmail(code, locals) {
    return new Promise(async (resolve, reject) => {
      try {

        locals.code = code
        const response = await this.Email.sendEmail(locals.email, locals, this.EMAIL_TEMPLATES.PASSWORD_RESTORATION_CODE)

        return resolve({
          sent: response.id ? true : false,
          contactId: response.id,
        })

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @sendIdentifierPasswordResetSms
   */
  sendIdentifierPasswordResetSms(code, locals) {
    return new Promise(async (resolve, reject) => {
      try {

        locals.code = code
        const response = await this.Sms.sendSMS(locals.phoneNumber, locals, this.SMS_TEMPLATES.PASSWORD_RESTORATION_CODE)

        return resolve({
          sent: response.id ? true : false,
          contactId: response.id,
        })

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @fetchOauthOrCreate
   */
  async fetchOauthOrCreate(payload, session) {
    return new Promise(async (resolve, reject) => {
      try {

        // find oauth id 
        const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
          "oauth.id": payload.oauth.id,

        }).populate({
          path: "identity"
        })


        if (authIdentitySecurityExist) {
          return resolve(authIdentitySecurityExist)
        }

        const identity = await this.create({
          identifierType: this.AuthIdentityEnum.IDENTIFIER_TYPES.OAUTH.KEY,
          identifier: payload.identifier,
          firstName: payload.firstName,
          lastName: payload.lastName,

        }, session)

        const schema = {
          identity: identity._id,
          oauth: {
            provider: payload.oauth.provider,
            id: payload.oauth.id,
          }
        }

        await this.AuthIdentitySecurity.create([schema], {
          session
        })



        resolve(identity)

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @findOrCreateGoogleUser
   */
  findOrCreateGoogleUser(code, session) {
    return new Promise(async (resolve, reject) => {

      try {

        const axios = require("axios")

        const {
          data
        } = await axios.post(`${process.env.GOOGLE_AUTH2_API_URL || 'https://oauth2.googleapis.com'}/token`, {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        });

        const {
          access_token,
          id_token
        } = data;

        // Use access_token or id_token to fetch user profile
        const {
          data: profile
        } = await axios.get(`${process.env.GOOGLE_WWW_API_URL || 'https://www.googleapis.com'}/oauth2/v1/userinfo>`, {
          headers: {
            Authorization: `Bearer ${access_token}`
          },
        });

        console.log("google detail", profile)
        // if google id exist return else create 
        // await this.create()
        const identity = await this.fetchOauthOrCreate({
          oauth: {
            provider: this.AuthIdentitySecurityEnum.OAUTH_PROVIDERS.GOOGLE.PROVIDER,
            id: profile.id,
          },
          identifier: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
        }, session)


        return resolve({
          identity: identity
        })

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @matchPassword
   */
  async matchPassword(security, password) {
    return await this.bcrypt.compare(
      password,
      security.password
    );
  }
  /**
   * @matchSecurityIdentifierVerificationCode
   */
  async matchSecurityIdentifierVerificationCode(security, code) {
    return await this.bcrypt.compare(
      code,
      security.identifierVerification.code
    );
  }
  /**
   * @matchSecurityPasswordResetCode
   */
  async matchSecurityPasswordResetCode(security, code) {
    return await this.bcrypt.compare(
      code,
      security.passwordReset.code
    );
  }
  /**
   * @identityVerificationCodeIsExpired
   */
  identityVerificationCodeIsExpired(security) {
    return Date.now() > security.identifierVerification.expiredOn.getTime()
  }
  /**
   * @identityPasswordResetCodeIsExpired
   */
  identityPasswordResetCodeIsExpired(security) {
    return Date.now() > security.passwordReset.expiredOn.getTime()
  }
  /**
   * @verifyIdentifier
   */
  verifyIdentifier(payload, session) {
    return new Promise(async (resolve, reject) => {
      try {

        // find oauth id 
        const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
          identity: payload.identity,

        }).populate({
          path: "identity"
        }).select("+identifierVerification.code")

        if (!authIdentitySecurityExist) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

        const schema = {
          identifierVerification: {
            contactId: authIdentitySecurityExist.identifierVerification.contactId,
            code: authIdentitySecurityExist.identifierVerification.code,
            expiredOn: authIdentitySecurityExist.identifierVerification.expiredOn,
            lastAttemptAt: Date.now(),
            attempts: (authIdentitySecurityExist.identifierVerification.attempts || 0) + 1,
          }
        }
        if (await this.matchSecurityIdentifierVerificationCode(authIdentitySecurityExist, payload.code)) {
          if (this.identityVerificationCodeIsExpired(authIdentitySecurityExist)) throw new this.ApiError(this.ERROR_MESSAGES.EXPIRED("identity verification code"))
          schema.identifierVerification.code = ''
          schema.identifierVerification.expiredOn = ''
          schema.identifierVerification.expiredOn = Date.now()

          await authIdentitySecurityExist.updateOne(schema, {
            session
          })
          await this.AuthIdentity.updateOne({
            _id: authIdentitySecurityExist.identity._id
          }, {
            $set: {
              isActive: true
            }
          }, {
            session
          });
          resolve({
            verify: true
          })
        } else {
          await authIdentitySecurityExist.updateOne(schema)

          if (schema.identifierVerification.attempts > 2) {

            schema.identifierVerification.expiredOn = Date.now()
            await tokenAuth.updateOne(schema)
            throw new this.ApiError(this.ERROR_MESSAGES.EXPIRED("identity verification code"))
          } else {
            throw new this.ApiError('invalid identity verification code')
          }
        }



      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @resendIdentifierVerificationCode
   */
  async resendIdentifierVerificationCode(payload, session) {
    return new Promise(async (resolve, reject) => {
      try {

        // find oauth id 
        const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
          identity: payload.identity,

        }).populate({
          path: "identity"
        })

        if (!authIdentitySecurityExist) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

        await this.initIdentifierVerificationProcess({
          identity: authIdentitySecurityExist.identity._id,
          firstName: authIdentitySecurityExist.identity.firstName,
          lastName: authIdentitySecurityExist.identity.lastName,
          identifier: authIdentitySecurityExist.identity.identifier,
          identifierType: authIdentitySecurityExist.identity.identifierType,
        }, session)


        resolve({
          verificationCodeSent: true
        })

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @getSigninLocals
   */
  getSigninLocals(identity) {
    const locals = {
      fullName: `${identity.lastName} ${identity.firstName} `,
      expiryMinutes: "15 minutes"
    }
    if (identity.identifierType == this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY) {
      locals.email = identity.identifier
    }
    if (identity.identifierType == this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY) {
      locals.phoneNumber = identity.identifier
    }
    return locals
  }
  /**
   * @signin
   */
  async signin(payload) {
    return new Promise(async (resolve, reject) => {
      try {

        // find oauth id 
        const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
          identity: payload.identity,

        }).populate({
          path: "identity"
        }).select("+password")

        if (!authIdentitySecurityExist) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

        const matchPassword = await this.matchPassword(authIdentitySecurityExist, payload.password)

        if (matchPassword) {

          const locals = this.getSigninLocals(authIdentitySecurityExist.identity)
          resolve({
            id: authIdentitySecurityExist.identity._id,
            actorType: payload.actorType,
            locals
          })
        } else {
          throw new this.ApiError(this.ERROR_MESSAGES.ACCESS_DENIED)
        }




      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @sendPasswordResetCode
   */
  async sendPasswordResetCode(payload, session) {
    return new Promise(async (resolve, reject) => {
      try {

        // find oauth id 
        const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
          identity: payload.identity,

        }).populate({
          path: "identity"
        })

        if (!authIdentitySecurityExist) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

        await this.initIdentifierResetPasswordProcess({
          identity: authIdentitySecurityExist.identity._id,
          firstName: authIdentitySecurityExist.identity.firstName,
          lastName: authIdentitySecurityExist.identity.lastName,
          identifier: authIdentitySecurityExist.identity.identifier,
          identifierType: authIdentitySecurityExist.identity.identifierType,
        }, session)


        resolve({
          resetCodeSent: true
        })

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @verifyPasswordResetCode
   */
  verifyPasswordResetCode(payload, session) {
    return new Promise(async (resolve, reject) => {
      try {

        // find oauth id 
        const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
          identity: payload.identity,

        }).populate({
          path: "identity"
        }).select("+passwordReset.code")

        if (!authIdentitySecurityExist) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

        const schema = {
          passwordReset: {
            contactId: authIdentitySecurityExist.passwordReset.contactId,
            code: authIdentitySecurityExist.passwordReset.code,
            expiredOn: authIdentitySecurityExist.passwordReset.expiredOn,
            lastAttemptAt: Date.now(),
            attempts: (authIdentitySecurityExist.passwordReset.attempts || 0) + 1,
          }
        }
        if (await this.matchSecurityPasswordResetCode(authIdentitySecurityExist, payload.code)) {
          if (this.identityPasswordResetCodeIsExpired(authIdentitySecurityExist)) throw new this.ApiError(this.ERROR_MESSAGES.EXPIRED("identity verification code"))
          schema.passwordReset.code = ''
          schema.passwordReset.expiredOn = ''
          schema.passwordReset.expiredOn = Date.now()

          await authIdentitySecurityExist.updateOne(schema, {
            session
          })
          await this.AuthIdentity.updateOne({
            _id: authIdentitySecurityExist.identity._id
          }, {
            $set: {
              isActive: true
            }
          }, {
            session
          });

          // generate token
          const temporaryToken = this.jwt.sign({
              _id: authIdentitySecurityExist.identity._id,
              purpose: 'password-reset'
            },
            process.env.SECRET_KEY + "password-reset", {
              expiresIn: '15m'
            }
          );

          resolve({
            verify: true,
            temporaryToken: temporaryToken
          })
        } else {
          await authIdentitySecurityExist.updateOne(schema)

          if (schema.passwordReset.attempts > 2) {

            schema.passwordReset.expiredOn = Date.now()
            await tokenAuth.updateOne(schema)
            throw new this.ApiError(this.ERROR_MESSAGES.EXPIRED("identity verification code"))
          } else {
            throw new this.ApiError('invalid identity verification code')
          }
        }



      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @resetPassword
   */
  resetPassword(token, password) {
    return new Promise(async (resolve, reject) => {
      try {
        // verify token
        const decoded = this.jwtVerify(token, process.env.SECRET_KEY + "password-reset");

        if (decoded.purpose != 'password-reset') throw new this.ApiError(this.ERROR_MESSAGES.INVALID_TOKEN)
        // find oauth id 
        const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
          identity: decoded._id,

        }).populate({
          path: "identity"
        })
        if (!authIdentitySecurityExist) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

        const schema = {
          password: await this.returnSecurityPasswordHash(password)
        }

        await authIdentitySecurityExist.updateOne(schema)

        resolve({
          reset: true,
        })

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @changePassword
   */
  changePassword(payload) {
    return new Promise(async (resolve, reject) => {
      try {

        const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
          identity: payload.id,

        }).populate({
          path: "identity"
        }).select("+password")
        if (!authIdentitySecurityExist) throw new this.ApiError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

        if (await this.matchPassword(authIdentitySecurityExist, payload.oldPassword)) {
          const schema = {
            password: await this.returnSecurityPasswordHash(payload.newPassword)
          }

          await authIdentitySecurityExist.updateOne(schema)

          resolve({
            success: true,
          })
        } else throw new this.ApiError(this.ERROR_MESSAGES.PASSWORD_NOT_MATCH)


      } catch (error) {
        reject(error)
      }
    })
  }

}