/**
 * @OwnerAuth 
 */
const CoreServices = require("../../../shared/services/core.services")
module.exports = class OwnerAuthMiddlewares {

  constructor() {
    this.OwnerAuthServices = new(require("../../owner/services/auth.owner.services"))();

    const service = new CoreServices()
    this.STATUS_CODES = service.STATUS_CODES
    this.ERROR_MESSAGES = service.ERROR_MESSAGES
    this.ERROR_CODES = service.ERROR_CODES
    this.SUCCESS_MESSAGES = service.SUCCESS_MESSAGES
    this.TIME_SETTINGS = service.TIME_SETTINGS
    this.asyncHandler = service.asyncHandler
  }
  /**
   * @requireLoginOrNot 
   */
  requireLoginOrNot(roles) {
    return this.asyncHandler(async (req, res, next) => {

      try {
        const id = req.actor ? req.actor._id : null

        const token = !id ? (req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null) : null;

        if (id || token) {
          const {
            error,
            data
          } = await this.OwnerAuthServices.authorizeOwnerAuth({
            id,
            token,
            roles
          })

          if (data) {
            req.owner = data
          }
        }

        return next();

      } catch (error) {
        next(error)

      }
    });
  }
  /**
   * @authorizeOwnerAuth 
   * @type authorizeActor
   */
  authorizeOwnerAuth(roles) {
    return this.asyncHandler(async (req, res, next) => {
      try {

        const id = req.actor ? req.actor._id : null

        const token = !id ? (req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null) : null;

        if (!id && !token)
          throw new ApiError(this.ERROR_MESSAGES.ACCESS_DENIED, this.ERROR_CODES.ACCESS_DENIED, this.STATUS_CODES.UNAUTHORIZED);

        const {
          error,
          data,
          message
        } = await this.OwnerAuthServices.authorizeOwnerAuth({
          id,
          token,
          roles
        })

        if (data) {
          req.owner = data
          return next()
        }

        throw new ApiError(message || this.ERROR_MESSAGES.ACCESS_DENIED, error || this.ERROR_CODES.ACCESS_DENIED, this.STATUS_CODES.UNAUTHORIZED);

      } catch (error) {
        next(error)

      }
    });
  }

}