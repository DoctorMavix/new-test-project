/**
 * @ErrorHandlerMiddleware 
 */
const ApiError = require("../errors/ApiError");
const mongoose = require("mongoose");

module.exports = class ErrorHandlerMiddleware {

    constructor() {


    }



    /**
     * @handler
     */
    handler(err, req, res, next) {

        let error = {...err };
        error.message = err.message;

        let errorResponse;

        // Handle MongoDB/Mongoose errors
        if (err instanceof mongoose.Error) {
            // CastError (e.g., invalid ObjectId)
            if (err.name === 'CastError' && err.kind === 'ObjectId') {
                errorResponse = new ApiError("Invalid ObjectId Format", 400, "medium", [], `Invalid ID: ${err.value}`).formatErrorResponse();
            }
            // ValidationError (e.g., schema validation failed)
            else if (err.name === 'ValidationError') {
                errorResponse = new ApiError("Schema Validation Error", 400, "medium", Object.values(err.errors), err.message).formatErrorResponse();
            }
            // MongoError (e.g., duplicate key, index errors)
            else if (err.code && err.code === 11000) {
                const duplicateKey = Object.keys(err.keyValue);
                errorResponse = new ApiError("Duplicate Key Error", 409, "medium", [], `Duplicate value for field(s): ${duplicateKey.join(', ')}`).formatErrorResponse();
            }
            // Other mongoose-related errors
            else {
                errorResponse = new ApiError("Database Error", 500, "medium", [], err.message).formatErrorResponse();
            }
        }
        // Handle specific Node.js errors like "castle" errors
        else if (err.name === 'CastleError') {
            errorResponse = new ApiError("Security Error", 403, "high", [], err.message).formatErrorResponse();
        }
        // Handle custom ApiError
        else if (err instanceof ApiError) {
            errorResponse = err.formatErrorResponse();
        }
        // Handle any other uncaught errors
        else {
            const genericError = new ApiError("Internal Server Error", 500, "high", [], err.stack);
            errorResponse = genericError.formatErrorResponse();
        }

        // Log the error if needed (e.g., to a file or external service)

        res.status(error.statusCode || 500).json(errorResponse);


    }



}