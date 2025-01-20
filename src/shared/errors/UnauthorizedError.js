const ApiError = require('./ApiError');
const Constant = require('./Constant');

/**
 * UnauthorizedError class for 401 errors.
 */
module.exports = class UnauthorizedError extends ApiError {
    constructor(
        message = Constant.ERROR_MESSAGES.INVALID_LOGIN,
        errors = [],
        stack = ""
    ) {

        super(
            message,
            Constant.ERROR_CODES.INVALID_LOGIN,
            Constant.STATUS_CODES.UNAUTHORIZED,
            Constant.ERROR_SEVERITY.MEDIUM,
            errors,
            stack
        );
    }
}