/**
 * @OwnerAuth 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class OwnerAuthController extends CoreServices {

  constructor() {
    super()
    this.OwnerAuthServices = new(require("../../owner/services/auth.owner.services"))();
    this.OwnerAuthValidations = require("../../owner/validations/auth.owner.validations");
  }
  /**
   * OwnerAuth VerifyAccount
   * ******************
   * @name verifyAccount
   * @method post
   * @route  POST /ownerauth/auth/verify-account
   * @auth   none
   * @type verifyAccount
   * @files []
   * ******************
   * 
   */
  verifyAccount = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.VerifyAccount(req.body);

    if (error) throw new ApiError(error.details[0].message);


    await this.OwnerAuthServices.verifyAccount({
      email: req.body.email,
      code: req.body.code,
    })


    res.json({
      message: this.SUCCESS_MESSAGES.ACTIVATED_SUCCESSFULLY("account"),
      success: true,
    })
  };
  /**
   * OwnerAuth ResendAccountVerificationCode
   * ******************
   * @name resendAccountVerificationCode
   * @method post
   * @route  POST /ownerauth/auth/resend-account-verification-code
   * @auth   none
   * @type resendAccountVerificationCode
   * @files []
   * ******************
   * 
   */
  resendAccountVerificationCode = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.ResendAccountVerificationCode(req.body);

    if (error) throw new ApiError(error.details[0].message);


    await this.OwnerAuthServices.resendAccountVerificationCode({
      email: req.body.email,
    })


    res.json({
      message: this.SUCCESS_MESSAGES.SENDED_SUCCESSFULLY("verification code"),
      success: true,
    })
  };
  /**
   * OwnerAuth Signin
   * ******************
   * @name signin
   * @method post
   * @route  POST /ownerauth/auth/signin
   * @auth   none
   * @type signin
   * @files []
   * ******************
   * 
   */
  signin = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.Signin(req.body);

    if (error) throw new ApiError(error.details[0].message);


    const response = await this.OwnerAuthServices.signin({
      email: req.body.email,
      password: req.body.password,
    })


    res.json({
      success: true,
      ...response
    })
  };
  /**
   * OwnerAuth RefreshToken
   * ******************
   * @name refreshToken
   * @method post
   * @route  POST /ownerauth/auth/refresh-token
   * @auth   none
   * @type refreshToken
   * @files []
   * ******************
   * 
   */
  refreshToken = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.RefreshToken(req.body);

    if (error) throw new ApiError(error.details[0].message);


    const response = await this.OwnerAuthServices.refreshToken(req.body.refreshToken)


    res.json({
      success: true,
      refreshToken: req.body.refreshToken,
      ...response
    })
  };
  /**
   * OwnerAuth ActivateMFAToken
   * ******************
   * @name activateMFAToken
   * @method post
   * @route  POST /ownerauth/auth/activate-mfa-token
   * @auth   none
   * @type activateMFAToken
   * @files []
   * ******************
   * 
   */
  activateMFAToken = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.ActivateMFAToken(req.body);

    if (error) throw new ApiError(error.details[0].message);


    const response = await this.OwnerAuthServices.activateMFAToken(
      req.body.accessToken,
      req.body.code,
    )


    res.json({
      success: true,
      ...response
    })
  };
  /**
   * OwnerAuth ResendMFACode
   * ******************
   * @name resendMFACode
   * @method post
   * @route  POST /ownerauth/auth/resend-mfa-code
   * @auth   none
   * @type resendMFACode
   * @files []
   * ******************
   * 
   */
  resendMFACode = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.ResendMFACode(req.body);

    if (error) throw new ApiError(error.details[0].message);


    const response = await this.OwnerAuthServices.resendMFACode(
      req.body.accessToken
    )


    res.json({
      success: true,
      message: "MFA code resent",
      ...response
    })
  };
  /**
   * OwnerAuth GeneratePasswordResetCode
   * ******************
   * @name generatePasswordResetCode
   * @method post
   * @route  POST /ownerauth/auth/generate-password-restoration-code
   * @auth   none
   * @type generatePasswordResetCode
   * @files []
   * ******************
   * 
   */
  generatePasswordResetCode = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.GeneratePasswordResetCode(req.body);

    if (error) throw new ApiError(error.details[0].message);


    await this.OwnerAuthServices.generatePasswordResetCode({
      email: req.body.email,
    })


    res.json({
      message: this.SUCCESS_MESSAGES.SENDED_SUCCESSFULLY("password reset code"),
      success: true,
    })
  };
  /**
   * OwnerAuth VerifyPasswordResetCode
   * ******************
   * @name verifyPasswordResetCode
   * @method post
   * @route  POST /ownerauth/auth/verify-password-reset-code
   * @auth   none
   * @type verifyPasswordResetCode
   * @files []
   * ******************
   * 
   */
  verifyPasswordResetCode = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.VerifyPasswordResetCode(req.body);

    if (error) throw new ApiError(error.details[0].message);


    const response = await this.OwnerAuthServices.verifyPasswordResetCode({
      email: req.body.email,
      code: req.body.code,
    })

    res.json({
      success: true,
      ...response
    })
  };
  /**
   * OwnerAuth ResetPassword
   * ******************
   * @name resetPassword
   * @method post
   * @route  POST /ownerauth/auth/reset-password
   * @auth   none
   * @type resetPassword
   * @files []
   * ******************
   * 
   */
  resetPassword = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.ResetPassword(req.body);

    if (error) throw new ApiError(error.details[0].message);


    const response = await this.OwnerAuthServices.resetPassword(req.body.token, req.body.password)

    res.json({
      success: true,
      ...response
    })
  };
  /**
   * OwnerAuth ResetPassword
   * ******************
   * @name changePassword
   * @method post
   * @route  POST /ownerauth/auth/change-password
   * @auth   Actor
   * @type changePassword
   * @files []
   * ******************
   * 
   */
  changePassword = async (req, res) => {
    const {
      error
    } = this.OwnerAuthValidations.ChangePassword(req.body);

    if (error) throw new ApiError(error.details[0].message);


    const response = await this.OwnerAuthServices.changePassword({
      id: req.actor._id,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
    })

    res.json({
      success: true,
      ...response
    })
  };
  /**
   * OwnerAuth ResetPassword
   * ******************
   * @name signout
   * @method post
   * @route  POST /ownerauth/auth/signout
   * @auth   Actor
   * @type signout
   * @files []
   * ******************
   * 
   */
  signout = async (req, res) => {
    const response = await this.OwnerAuthServices.signout(req.accessToken)

    res.json({
      success: true,
      ...response
    })
  };
  /**
   * OwnerAuth RedirectToGoogleAuth
   * ******************
   * @name redirectToGoogleAuth
   * @method get
   * @route  GET        /ownerauth/auth/google
   * @auth   none
   * @type redirectToGoogleAuth
   * ******************
   * 
   */
  redirectToGoogleAuth = async (req, res) => {
    const REDIRECT_URI = `${process.env.BASE_URL}/ownerauth/auth/google/callback`
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;

    res.redirect(url);
  };
  /**
   * OwnerAuth GoogleCallback
   * ******************
   * @name googleCallback
   * @method get
   * @route  GET        /ownerauth/auth/google/callback
   * @auth   none
   * @type googleCallback
   * ******************
   * 
   */
  googleCallback = async (req, res) => {
    const {
      code
    } = req.query;
    const profile = await this.OwnerAuthServices.implementGoogleAuth(code)

    // Code to handle user authentication and retrieval using the profile data
    console.log("profile", profile)
    res.json({
      success: true,
      profile: profile
    })
  };

}