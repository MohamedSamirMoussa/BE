import { Router } from "express";
import donateServices from './donate.services'
export const router = Router({
    mergeParams:true,
    strict:true,
    caseSensitive:true
})


// router.post("/create-payment{/:userId}" , donateServices.createPaymentIntent)
router.get('/' , donateServices.getAllDonations)
router.post("/paypal" , donateServices.createPaypalOrder)
router.post("/paypal/:orderId" , donateServices.capturePaymentWithPaypal)