/**
 * @CoreServices 
 */

module.exports = class CoreServices {


    constructor() {

        this.Logger = require('../../config/logger/winston.logger');
        this.Email = require("./email.services")
        this.ApiError = require("../errors/ApiError")



        this.HelperMethods = new(require("../utils/helper.utils"))()

        this.STATUS_CODES = require("../constants/statusCodes")
        this.ERROR_MESSAGES = require("../constants/errorMessages")
        this.ERROR_CODES = require("../constants/errorCodes")
        this.SUCCESS_MESSAGES = require("../constants/successMessages")
        this.TIME_SETTINGS = require("../constants/timeSettings")
        this.COLORS = require("../constants/colors")
        this.EMAIL_TEMPLATES = require("../constants/emailTemplates")

        this.CommonConstants = {
            STATUS_CODES: this.STATUS_CODES,
            ERROR_MESSAGES: this.ERROR_MESSAGES,
            SUCCESS_MESSAGES: this.SUCCESS_MESSAGES,
            TIME_SETTINGS: this.TIME_SETTINGS,
            COLORS: this.COLORS,
        }


        this.jwt = require("jsonwebtoken");
        this.bcrypt = require("bcryptjs");
        this.mongoose = require("mongoose");
        const {
            default: jwtDecode
        } = require("jwt-decode");
        this.jwtDecode = jwtDecode
        const {
            unlink
        } = require('fs-extra')
        this.unlink = unlink

        this.asyncHandler = fn => (req, res, next) =>
            Promise.resolve(fn(req, res, next)).catch(next)


        this.jwtVerify = (token, secret = process.env.SECRET_KEY) => {
            try {
                const decoded = this.jwt.verify(token, secret);
                return decoded
            } catch (err) {
                console.error('Token is invalid or expired', err);
                return err
            }
        }


    }

    /**
     * @getPaginateAggregateDataService
     */
    getPaginateAggregateDataService = async(options) => {
        return new Promise(async(resolve, reject) => {
            try {
                const {
                    pipeline = [],
                        page = 1,
                        query = {},
                        route = "",
                        Model,
                        includeDeleted = false,
                        onlyDeleted = false,
                } = options;
                let { perPage = 10 } = options;
                perPage = Number(perPage);

                // Add soft delete filter
                if (!includeDeleted && !onlyDeleted) {
                    pipeline.unshift({
                        $match: { deletedAt: { $exists: false } }
                    });
                } else if (onlyDeleted) {
                    pipeline.unshift({
                        $match: { deletedAt: { $exists: true } }
                    });
                }

                const skipCount = (page - 1) * perPage;

                // Count total items
                const countSchema = pipeline.concat({
                    $count: "totalItems"
                });

                let totalItems = await Model.aggregate(countSchema);
                totalItems = totalItems[0] ? totalItems[0].totalItems : 0;

                const totalPages = Math.ceil(totalItems / perPage);

                // Paginate data
                const paginationSchema = pipeline.concat([
                    { $skip: skipCount },
                    { $limit: perPage }
                ]);

                let data = await Model.aggregate(paginationSchema);

                // Build output
                const output = {
                    data,
                    totalItems,
                    totalPages,
                    nextLink: this.HelperMethods.getPaginationNextPage({
                        currentPage: page,
                        totalPages,
                        query,
                        route
                    }),
                    prevLink: this.HelperMethods.getPaginationPreviousPage({
                        currentPage: page,
                        query,
                        route
                    })
                };

                resolve(output);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * @executeQueryHookWithSession 
     */
    async executeQueryHookWithSession(query, session = null) {
        try {
            if (session) {
                query.session(session)
            }
            return await query
        } catch (error) {
            throw error
        }
    }





}