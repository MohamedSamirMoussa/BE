import { Router } from "express";
import { authentication, authorization } from "../../middleware";
import notificationServices from "./notification.service";
import { endpoint } from "../user/user.authorization";


export const router:Router = Router()


router.get('/' , authentication() , authorization(endpoint.block) , notificationServices.getNotifications)
router.delete('/' , authentication() , authorization(endpoint.block) , notificationServices.clearNotification)