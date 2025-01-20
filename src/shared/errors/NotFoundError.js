const ApiError = require('./ApiError');
const Constant = require('./Constant');

/**
 * NotFoundError class for 404 errors.
 */
module.exports = class NotFoundError extends ApiError {
    constructor(
        message = Constant.ERROR_MESSAGES.CAN_NOT_FIND('resource'),
        errors = [],
        stack = ""
    ) {

        super(
            message,
            Constant.ERROR_CODES.NOT_FOUND,
            Constant.STATUS_CODES.NOT_FOUND,
            Constant.ERROR_SEVERITY.LOW,
            errors,
            stack
        );

    }
}