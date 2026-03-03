import { Schema, model } from "mongoose";
import { NotificationEnum, NotificationModel } from "./notification.model";
export enum DonateEnum {
  stripe = "stripe",
  paypal = "paypal",
}
export enum StatusEnum {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export interface IDonateSchema {
  payerUsername: { given_name: string; surname: string };
  donateId: string;
  payerId: string;
  currency: string;
  provider: DonateEnum;
  status: StatusEnum;
  email?: string;
  payerMCusername?: string;
  amount: string;
}

const schema = new Schema<IDonateSchema>(
  {
    payerMCusername: {
      type: String,
      ref: "Leaderboard",
    },
    payerUsername: {
      given_name: String,
      surname: String,
    },
    donateId: { type: String, required: true },
    payerId: { type: String, required: true },
    provider: {
      type: String,
      enum: DonateEnum,
      default: DonateEnum.paypal,
      required: true,
    },
    status: {
      type: String,
      enum: StatusEnum,
      default: StatusEnum.PENDING,
      required: true,
    },
    email: String,
    amount: String,
    currency: String,
  },
  { timestamps: true },
);

schema.post("save", async function (doc) {
  try {
    await NotificationModel.create({
      type: NotificationEnum.NEW_DONATION,
      message: `New donation created: ${doc.amount}`,
      metadata: {
        donateId: doc._id,
        amount: doc.amount,
      },
    });
    console.log(`✅ Notification record created for donation: ${doc.amount}`);
  } catch (error) {
    console.error("❌ Failed to create notification record:", error);
  }
});

export const DonateModel = model("Donation", schema);
