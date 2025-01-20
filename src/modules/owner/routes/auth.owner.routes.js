/**
 * @OwnerAuth 
 */


const ParentRoute = require("../../../routes/route.parent")
const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class OwnerAuthRoutes extends ParentRoute {

  constructor() {
    super()


    // Controller initialization 
    const ownerauthcontroller = new(require("../../owner/controllers/auth.owner.controller"))();

    // Initialize the express router
    const router = this.express.Router();


    /**
     * @swagger
     * tags:
     *   name: OwnerAuth
     *   description: OwnerAuth auth routes
     */
    const swaggerBuilder = new SwaggerRouteBuilder('OwnerAuth');


    // Route: Verify Owner Account
    swaggerBuilder.addRoute('/api/v1/owner/auth/verify-account', 'post', 'Verify owner account', ['AuthOwner'])
      .addRequestBody('#/components/schemas/VerifyOwnerAccountPayload', 'Verify Owner Account')
      .addResponse(201, 'Account verified', '#/components/schemas/VerifyOwnerAccountResponse')
      .addResponse(400, 'Bad request');

    router.route("/verify-account").post(this.use(ownerauthcontroller.verifyAccount));

    // Route: Resend Owner Account Verification Code
    swaggerBuilder.addRoute('/api/v1/owner/auth/resend-account-verification-code', 'post', 'Resend owner account verification code', ['AuthOwner'])
      .addRequestBody('#/components/schemas/ResendOwnerAccountVerificationCodePayload', 'Resend Owner Account Verification Code')
      .addResponse(201, 'Account verification code resent successfully', '#/components/schemas/ResendOwnerAccountVerificationCodeResponse')
      .addResponse(400, 'Bad request');

    router.route("/resend-account-verification-code").post(this.use(ownerauthcontroller.resendAccountVerificationCode));

    // Route: Sign in Owner
    swaggerBuilder.addRoute('/api/v1/owner/auth/signin', 'post', 'Sign in owner', ['AuthOwner'])
      .addRequestBody('#/components/schemas/SigninOwnerPayload', 'Sign in Owner')
      .addResponse(201, 'Signin successfully', '#/components/schemas/SigninOwnerResponse')
      .addResponse(400, 'Bad request');

    router.route("/signin").post(this.use(ownerauthcontroller.signin));

    // Route: Activate Owner MFA Token
    swaggerBuilder.addRoute('/api/v1/owner/auth/activate-mfa-token', 'post', 'Activate owner MFA token', ['AuthOwner'])
      .addRequestBody('#/components/schemas/ActivateOwnerMfaTokenPayload', 'Activate Owner MFA Token')
      .addResponse(201, 'MFA token activated successfully', '#/components/schemas/ActivateOwnerMfaTokenResponse')
      .addResponse(400, 'Bad request');

    router.route("/activate-mfa-token").post(this.use(ownerauthcontroller.activateMFAToken));

    // Route: Resend Owner MFA Code
    swaggerBuilder.addRoute('/api/v1/owner/auth/resend-mfa-code', 'post', 'Resend owner MFA code', ['AuthOwner'])
      .addRequestBody('#/components/schemas/ResendOwnerMfaCodePayload', 'Resend Owner MFA Code')
      .addResponse(201, 'MFA code resent successfully', '#/components/schemas/ResendOwnerMfaCodeResponse')
      .addResponse(400, 'Bad request');

    router.route("/resend-mfa-code").post(this.use(ownerauthcontroller.resendMFACode));

    // Route: Refresh Owner Token
    swaggerBuilder.addRoute('/api/v1/owner/auth/refresh-token', 'post', 'Refresh owner token', ['AuthOwner'])
      .addRequestBody('#/components/schemas/RefreshOwnerTokenPayload', 'Refresh Owner Token')
      .addResponse(201, 'Token refreshed successfully', '#/components/schemas/RefreshOwnerTokenResponse')
      .addResponse(400, 'Bad request');

    router.route("/refresh-token").post(this.use(ownerauthcontroller.refreshToken));

    // Route: Generate Owner Password Restoration Code
    swaggerBuilder.addRoute('/api/v1/owner/auth/generate-password-restoration-code', 'post', 'Generate owner password restoration code', ['AuthOwner'])
      .addRequestBody('#/components/schemas/GenerateOwnerPasswordRestorationCodePayload', 'Generate Owner Password Restoration Code')
      .addResponse(201, 'Password restoration code generated successfully', '#/components/schemas/GenerateOwnerPasswordRestorationCodeResponse')
      .addResponse(400, 'Bad request');

    router.route("/generate-password-restoration-code").post(this.use(ownerauthcontroller.generatePasswordResetCode));

    // Route: Verify Owner Password Reset Code
    swaggerBuilder.addRoute('/api/v1/owner/auth/verify-password-reset-code', 'post', 'Verify owner password reset code', ['AuthOwner'])
      .addRequestBody('#/components/schemas/VerifyOwnerPasswordResetCodePayload', 'Verify Owner Password Reset Code')
      .addResponse(201, 'Password reset code verified', '#/components/schemas/VerifyOwnerPasswordResetCodeResponse')
      .addResponse(400, 'Bad request');

    router.route("/verify-password-reset-code").post(this.use(ownerauthcontroller.verifyPasswordResetCode));

    // Route: Owner Reset Password
    swaggerBuilder.addRoute('/api/v1/owner/auth/reset-password', 'post', 'Reset owner password', ['AuthOwner'])
      .addRequestBody('#/components/schemas/ResetOwnerPasswordPayload', 'Reset Owner Password')
      .addResponse(201, 'Password reset successfully', '#/components/schemas/ResetOwnerPasswordResponse')
      .addResponse(400, 'Bad request');

    router.route("/reset-password").post(this.use(ownerauthcontroller.resetPassword));

    // Route: Owner Change Password
    swaggerBuilder.addRoute('/api/v1/owner/auth/change-password', 'post', 'Change owner password', ['AuthOwner'])
      .addRequestBody('#/components/schemas/ChangeOwnerPasswordPayload', 'Change Owner Password')
      .addResponse(201, 'Password changed successfully', '#/components/schemas/ChangeOwnerPasswordResponse')
      .addResponse(400, 'Bad request');

    router.route("/change-password").post(this.auth.authenticate(), this.use(ownerauthcontroller.changePassword));

    // Route: Signout Owner 
    swaggerBuilder.addRoute('/api/v1/owner/auth/signout', 'post', 'Signout owner', ['AuthOwner'])
      .addResponse(201, 'Signout successfully', '#/components/schemas/SignoutOwnerResponse')
      .addResponse(400, 'Bad request');

    router.route("/signout").post(this.auth.authenticate(), this.use(ownerauthcontroller.signout));

    // Route: Google Sign in Owner
    swaggerBuilder.addRoute('/api/v1/owner/auth/google/signin', 'post', 'Google sign in owner', ['AuthOwner'])
      .addRequestBody('#/components/schemas/GoogleOwnerSigninPayload', 'Google Sign in Owner')
      .addResponse(201, 'Signed in via Google successfully', '#/components/schemas/GoogleOwnerSigninResponse')
      .addResponse(400, 'Bad request');

    router.route("/google").get(this.use(ownerauthcontroller.redirectToGoogleAuth));

    // Route: Google Owner Callback
    swaggerBuilder.addRoute('/api/v1/owner/auth/google/callback', 'post', 'Google owner callback', ['AuthOwner'])
      .addRequestBody('#/components/schemas/GoogleOwnerCallbackPayload', 'Google Owner Callback')
      .addResponse(201, 'Google callback processed successfully', '#/components/schemas/GoogleOwnerCallbackResponse')
      .addResponse(400, 'Bad request');

    router.route("/google/callback").get(this.use(ownerauthcontroller.googleCallback));

    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('owner', 'auth.ownerauth')

    return router
  }
}