const ApiError = require('./ApiError');
const Constant = require('./Constant');

/**
 * ValidationError class for handling validation errors.
 */
module.exports = class ValidationError extends ApiError {
    constructor(
        message = Constant.ERROR_MESSAGES.VALIDATION_ERROR,
        errors = [],
        stack = ""
    ) {
        super(
            message,
            Constant.ERROR_CODES.VALIDATION_ERROR,
            Constant.STATUS_CODES.UNPROCESSABLE_ENTITY,
            Constant.ERROR_SEVERITY.MEDIUM,
            errors,
            stack
        );

    }
}