/**
 * @MFAServices 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class MFAServices extends CoreServices {

  constructor() {
    super();
    this.Auth = require("../models/auth.model");
    this.AuthEnum = require("../enums/auth.enum");
    this.AuthResource = require("../resources/auth.resources");
    this.MFAConfig = require("../models/mfaconfig.auth.model");
    this.MFAConfigEnum = require("../enums/mfaconfig.auth.enum");
  }
  /**
   * @matchMFACode
   */
  async matchMFACode(auth, code) {
    return await this.bcrypt.compare(
      code,
      auth.mfa.code
    );
  }
  /**
   * @mfaCodeIsExipired
   */
  mfaCodeIsExipired(auth) {
    return Date.now() > auth.mfa.codeExpiresAt.getTime()
  }
  /**
   * @activateMFAToken
   */
  activateMFAToken(auth, code) {
    return new Promise(async (resolve, reject) => {
      try {
        const schema = {
          mfa: {
            isEnabled: auth.mfa.isEnabled,
            isCodeSent: auth.mfa.isCodeSent,
            method: auth.mfa.method,
            contactId: auth.mfa.contactId,
            code: auth.mfa.code,
            codeExpiresAt: auth.mfa.codeExpiresAt,
            lastAttemptAt: Date.now(),
            attempts: auth.mfa.attempts + 1,
          }
        }
        if (await this.matchMFACode(auth, code)) {
          if (this.mfaCodeIsExipired(auth)) throw new this.ApiError(this.ERROR_MESSAGES.EXPIRED("mfa code"))

          schema.mfa.code = ''
          schema.mfa.codeExpiresAt = Date.now()
          schema.mfa.codeVerifiedAt = Date.now()

          await auth.updateOne(schema)

          resolve({
            tokenIsActivated: true
          })
        } else {
          await auth.updateOne(schema)

          if (schema.mfa.attempts > 2) {
            await auth.updateOne({
              deletedAt: Date.now(),
            })
            throw new this.ApiError(this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY("auth token"))
          } else {
            throw new this.ApiError('Invalid mfa code')
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @getActorTypeOption
   */
  getActorTypeOption(actorType) {
    return Object.values(this.AuthEnum.ACTOR_TYPES).find(item => item.NAME === actorType);
  }
  /**
   * @requiresMfa
   */
  requiresMfa(actorType) {
    const actor = this.getActorTypeOption(actorType);
    return actor ? actor.REQUIRES_MFA : null;
  }
  /**
   * @getSchema
   */
  getSchema(actorType, actorId, locals) {
    return new Promise(async (resolve, reject) => {
      try {

        if (this.requiresMfa(actorType)) {
          const code = this.HelperMethods.generateId(4, false)

          const codeExpiresAt = Date.now() + (1000 * 60 * 15)

          // send mfa 
          const handleMFAProcessResponse = await this.handleMFAProcess(actorType, actorId, code, locals)

          return resolve({
            isEnabled: handleMFAProcessResponse.mfaEnable,
            isCodeSent: handleMFAProcessResponse.sent,
            method: handleMFAProcessResponse.method,
            contactId: handleMFAProcessResponse.contactId,
            code: handleMFAProcessResponse.mfaEnable ? await this.HelperMethods.generateBcryptHash(code) : null,
            codeExpiresAt: handleMFAProcessResponse.mfaEnable ? codeExpiresAt : null
          })

        } else {
          return resolve({
            isEnabled: false
          })
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @handleMFAProcess
   */
  handleMFAProcess(actorType, actorId, code, locals) {
    return new Promise(async (resolve, reject) => {
      try {
        // first check if this actor have custorm mfa config 
        const mfaConfig = await this.getMFAConfig(actorType, actorId)
        if (!mfaConfig) {
          // send email 
          const mfaEmailResponse = await this.sendMFAEmail(code, locals)
          return resolve({
            mfaEnable: true,
            sent: mfaEmailResponse.sent,
            contactId: mfaEmailResponse.contactId,
            method: this.MFAConfigEnum.METHODS.EMAIL
          })
        }
        if (mfaConfig.isEnabled !== true || mfaConfig.method == this.MFAConfigEnum.METHODS.NONE) {
          return resolve({
            mfaEnable: false,
            sent: false
          })
        }

        if (mfaConfig.method == this.MFAConfigEnum.METHODS.EMAIL) {
          // send email 
          const mfaEmailResponse = await this.sendMFAEmail(code, locals)

          return resolve({
            mfaEnable: true,
            sent: mfaEmailResponse.sent,
            contactId: mfaEmailResponse.contactId,
            method: this.MFAConfigEnum.METHODS.EMAIL

          })
        }

        if (mfaConfig.method == this.MFAConfigEnum.METHODS.SMS) {
          // send sms 
          const mfaSmsResponse = await this.sendMFASms(code, locals)
          return resolve({
            mfaEnable: true,
            sent: mfaSmsResponse.sent,
            contactId: mfaSmsResponse.contactId,
            method: this.MFAConfigEnum.METHODS.SMS,


          })
        }

        return resolve({
          mfaEnable: true,
          sent: false
        })



      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @showMFAConfig
   */
  showMFAConfig(query) {
    return new Promise(async (resolve, reject) => {
      try {
        // first check if this actor have custorm mfa config 
        const data = await this.MFAConfig.findOne(query)

        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @createMFAConfig
   */
  createMFAConfig(schema) {
    return new Promise(async (resolve, reject) => {
      try {
        // first check if this actor have custorm mfa config 
        const data = await this.MFAConfig.create(schema)

        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @configureMFA
   */
  configureMFA(payload) {
    return new Promise(async (resolve, reject) => {
      try {

        const schema = {
          actorType: payload.actorType,
          actorId: payload.actorId,
          method: payload.method,
          isEnabled: payload.method !== this.MFAConfigEnum.METHODS.NONE,
          phoneNumber: payload.method === this.MFAConfigEnum.METHODS.SMS ? payload.phoneNumber : null,
          emailAddress: payload.method === this.MFAConfigEnum.METHODS.EMAIL ? payload.emailAddress : null,
        }
        if (schema.method == this.MFAConfigEnum.METHODS.SMS && !schema.phoneNumber) {
          schema.isEnabled = false
        } else if (schema.method == this.MFAConfigEnum.METHODS.EMAIL && !schema.emailAddress) {
          schema.isEnabled = false
        } else {
          schema.isEnabled = false
          schema.method = this.MFAConfigEnum.METHODS.NONE

        }


        // first check if this actor have custorm mfa config 
        const configExist = this.showMFAConfig({
          actorType: schema.actorType,
          actorId: schema.actorId,
        })

        let data
        if (configExist) {
          await configExist.updateOne(schema)

          data = this.showMFAConfig({
            actorType: schema.actorType,
            actorId: schema.actorId,
          })
        } else {
          data = await this.createMFAConfig(schema)
        }

        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @getMFAConfig
   */
  getMFAConfig(actorType, actorId) {
    return new Promise(async (resolve, reject) => {
      try {
        // first check if this actor have custorm mfa config 
        const mfaConfig = await this.showMFAConfig({
          actorType: actorType,
          actorId: actorId,
        })

        return resolve(mfaConfig)

      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * @sendMFAEmail
   */
  sendMFAEmail(code, locals) {
    return new Promise(async (resolve, reject) => {
      try {

        locals.code = code
        const response = await this.Email.sendEmail(locals.email, locals, this.EMAIL_TEMPLATES.MFA_EMAIL)

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
   * @sendMFASms
   */
  sendMFASms(code, locals) {
    return new Promise(async (resolve, reject) => {
      try {

        locals.code = code
        const response = await this.Sms.sendSMS(locals.phoneNumber, locals, this.SMS_TEMPLATES.MFA_SMS)

        return resolve({
          sent: response.id ? true : false,
          contactId: response.id,
        })

      } catch (error) {
        reject(error)
      }
    })
  }

}