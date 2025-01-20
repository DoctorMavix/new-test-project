/**
 * @Auth 
 */
const CoreServices = require("../../../shared/services/core.services")
module.exports = class AuthMiddlewares {

  constructor() {
    this.AuthService = new(require("../services/auth.services"))();
    const services = new CoreServices()
    this.UtilMethod = services.UtilMethod
    this.UtilConstant = services.UtilConstant
    this.Logger = services.Logger
    this.STATUS_CODES = services.STATUS_CODES
    this.ERROR_MESSAGES = services.ERROR_MESSAGES
    this.ERROR_CODES = services.ERROR_CODES
    this.SUCCESS_MESSAGES = services.SUCCESS_MESSAGES
    this.TIME_SETTINGS = services.TIME_SETTINGS
    this.asyncHandler = services.asyncHandler
  }
  /**
   * @requireLoginOrNot 
   */
  requireLoginOrNot(accessLevels) {
    return this.asyncHandler(async (req, res, next) => {

      try {
        const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

        const authenticateResponse = await this.AuthService.authenticate(token, accessLevels)

        if (authenticateResponse && authenticateResponse.success) {
          req.actor = authenticateResponse.data
          req.accessToken = token
        }

        return next();

      } catch (error) {
        next(error)

      }
    });
  }
  /**
   * @authenticate 
   */
  authenticate(accessLevels) {
    return this.asyncHandler(async (req, res, next) => {

      try {
        const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

        const authenticateResponse = await this.AuthService.authenticate(token, accessLevels)

        if (authenticateResponse && authenticateResponse.success) {
          req.actor = authenticateResponse.data
          req.accessToken = token
          return next();
        }
        throw new ApiError(authenticateResponse.message || this.ERROR_MESSAGES.ACCESS_DENIED, authenticateResponse.error || this.ERROR_CODES.ACCESS_DENIED, this.STATUS_CODES.UNAUTHORIZED);


      } catch (error) {
        next(error)

      }
    });
  }

}