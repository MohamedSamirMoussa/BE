import { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  // createPayment,
  getAccessToken,
  successHandler,
} from "../../utils";
// import { Types } from "mongoose";
import {
  DonateEnum,
  DonateModel,
  DonateRepository,
  LeaderboardModel,
  LeaderboardRepository,
  StatusEnum,
} from "../../DB";
import axios from "axios";

class DonateServices {
  private donateModel = new DonateRepository(DonateModel);
  private leaderboardModel = new LeaderboardRepository(LeaderboardModel);

  constructor() {}

  // createPaymentIntent = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ): Promise<Response | void> => {
  //   try {
  //     const userId = req.params as unknown as Types.ObjectId;
  //     const { amount } = req.body;
  //     const { success_url, url } = await createPayment(amount, userId);

  //     return successHandler({
  //       res,
  //       result: { success_url, url },
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  getAllDonations = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { month } = req.query;
      let filter: any = {};

      if (month && typeof month === "string" && month !== "undefined") {
        const startDate = new Date(`${month}-01T00:00:00Z`);
        const endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
          23,
          59,
          59,
        );

        filter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      const donations = await this.donateModel.find({
        filter,
        options: { sort: { createdAt: -1 } },
      });

      const aggregateFilter = {
        status: StatusEnum.COMPLETED,
        ...(filter.createdAt && { createdAt: filter.createdAt }),
      };

      const totalDonations = await this.donateModel.aggregate([
        {
          $match: aggregateFilter,
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $toDouble: "$amount" },
            },
          },
        },
      ]);

      const totalRevenue =
        totalDonations.length > 0 ? totalDonations[0].total : 0;

      return successHandler({
        res,
        result: { allDonations: donations, totalRevenue },
      });
    } catch (error) {
      return next(error);
    }
  };

  createPaypalOrder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { amount, username } = req.body;
      if (!amount?.value) {
        throw new BadRequestError("Amount value is required");
      }
      const accessToken = await getAccessToken();

      if (!accessToken)
        throw new BadRequestError("Failed to obtain PayPal access token");
      const response = await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              custom_id: username,
              amount: {
                currency_code: amount.currency_code,
                value: amount.value,
              },
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.data || !response.data.id)
        throw new BadRequestError("Failed to create PayPal order");

      const orderId = response.data.id;

      return successHandler({ res, result: orderId });
    } catch (error: any) {
      next(error);
    }
  };

  capturePaymentWithPaypal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { orderId } = req.params;
      const accessToken = await getAccessToken();

      if (!orderId)
        throw new BadRequestError("Order ID is required for payment capture");

      if (!accessToken)
        throw new BadRequestError("Failed to obtain PayPal access token");

      const response = await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.data || !response.data.purchase_units) {
        throw new BadRequestError("Failed to capture PayPal payment");
      }

      const paymentData = response.data;
      const capture = paymentData.purchase_units[0].payments.captures[0];
      const mcUsername = capture.custom_id;
      const amount = capture.amount.value;
      const currency = capture.amount.currency_code;

      await this.donateModel.create({
        data: [
          {
            payerMCusername: mcUsername,
            payerUsername: paymentData.payer?.name,
            donateId: paymentData.id,
            payerId: paymentData?.payer?.payer_id,
            provider: DonateEnum.paypal,
            status: paymentData.status as StatusEnum,
            amount,
            currency,
          },
        ],
        options: { validateBeforeSave: true },
      });

      if (paymentData.status === "COMPLETED") {
        await this.leaderboardModel.findOneAndUpdate({
          filter: { username: mcUsername },
          update: { $set: { isSupported: { name: "Supporter" } } },
        });
      }

      return successHandler({
        res,
        message: "Payment Captured Successfully",
        result: { paymentData },
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new DonateServices();
