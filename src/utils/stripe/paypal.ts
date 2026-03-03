import axios from "axios";
import { BadRequestError } from "../errors/errors";

export const getAccessToken = async (): Promise<string> => {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_SECRET_ID?.trim();

  if (!clientId || !clientSecret) {
    throw new BadRequestError("PayPal Credentials are missing!");
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");


    const data = 'grant_type=client_credentials';

    const response = await axios({
      method: 'post',
      url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data, 
    });

    if(!response.data.access_token) 
      throw new BadRequestError("Failed to retrieve access token from PayPal");

    return response.data.access_token;
  } catch (error: any) {
    console.error("PayPal Auth Failed Details:", {
      status: error.response?.status,
      data: error.response?.data,
      sentAuth: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64").substring(0, 10)}...`
    });
    throw error;
  }
};