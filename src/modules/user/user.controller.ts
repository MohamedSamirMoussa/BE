import { Router } from "express";
import userServices from "./user.services";
import * as validators from "./user.validation";
import { authentication, authorization, validation } from "../../middleware";
import { TokenEnum } from "../../utils";
import { endpoint } from "./user.authorization";
export const router: Router = Router({
  caseSensitive: true,
  strict: true,
  mergeParams: false,
});

router.post(
  "/register",
  validation(validators.register),
  userServices.register,
);
router.post(
  "/confirm-email",
  validation(validators.confirmEmail),
  userServices.confirmEmail,
);
router.post("/login", validation(validators.login), userServices.login);
router.post("/google-login",validation(validators.loginWithGoogle), userServices.loginWithGoogle);
router.get("/discord", userServices.discordRedirect);
router.get("/discord/callback", userServices.discordLogin);
router.post("/forget-password", userServices.forgetPassword);
router.post("/reset-password", userServices.resetPassword);
router.post("/confirm-password", userServices.confirmPasswordOtp);
router.get("/check-auth" , authentication(), userServices.checkAuth );


router.patch("/give-admin/:userId" , authentication() , authorization(endpoint.theme) , userServices.giveAdminPermission)

router.post(
  "/resend-otp",
  validation(validators.resendOtp),
  userServices.resendOtp,
);
router.post(
  "/refresh-token",
  authentication(TokenEnum.refresh),
  userServices.refreshToken,
);

router.get(
  "/getAllUsers",
  authentication(),
  authorization(endpoint.block) ,
  userServices.getAllUsers,
);

router.patch('/block/:userId' , authentication() , authorization(endpoint.block) , userServices.toggleBlockUser)

router.post(
  "/logout",
  authentication(),
  validation(validators.logout),
  userServices.logout,
);
