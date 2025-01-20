/**
 * @AuthController
 */

const AuthService = require("../services/auth.services");
const CoreServices = require("../../../shared/services/core.services")
module.exports = class AuthController extends CoreServices {

  constructor() {
    super()

    this.AuthService = new AuthService();
    this.Auth = require("../models/auth.model");
    this.AuthValidation = require("../validations/auth.validations");
  }
}