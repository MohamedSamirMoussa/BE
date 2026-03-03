import axios from "axios";
import { BadRequestError, NotFoundError } from "../errors/errors";

class MineCraftServers {
  constructor() {}

  getAllServers = async () => {
    try {
      const { data } = await axios.get(`${process.env.PTERO_URL as string}`, {
        headers: {
          Authorization: `Bearer ${process.env.PTERO_API_KEY as string}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!data || !data.data)
        throw new BadRequestError("Missing data servers");

      // نمر على السيرفرات ونستخرج الـ Port الافتراضي هنا
      return data.data.map((server: any) => {
        const allocations =
          server.attributes?.relationships?.allocations?.data || [];
        const defaultAlloc = allocations.find(
          (a: any) => a.attributes.is_default,
        );

        return {
          ...server,
          // نضع الـ port والـ ip المستخرجين داخل كائن خاص لتسهيل الوصول إليهم في الـ Service
          extracted_details: {
            port: defaultAlloc?.attributes?.port || "25565",
            ip:
              defaultAlloc?.attributes?.ip_alias ||
              defaultAlloc?.attributes?.ip ||
              "0.0.0.0",
          },
        };
      });
    } catch (error: any) {
      console.error(
        "Error in getAllServers:",
        error.response?.data || error.message,
      );
      throw new BadRequestError("Failed to fetch servers list", {
        cause: error,
      });
    }
  };

  getServerUsage = async (serverId: string) => {
    try {
      if (!serverId) throw new NotFoundError("Server not found");

      const { data } = await axios.get(
        `${process.env.PTERO_URL}/servers/${serverId}/resources`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PTERO_API_KEY}`,
            Accept: "application/json",
          },
        },
      );

      // تصحيح الخطأ هنا: الدخول مباشرة إلى data.attributes
      if (!data || !data.attributes)
        throw new BadRequestError("Missing resource data");

      const stats = data.attributes.resources;

      return {
        status: data.attributes.current_state,
        cpu: stats?.cpu_absolute?.toFixed(2) + "%" || "0%",
        memory: (stats?.memory_bytes / 1024 / 1024).toFixed(2) + " MB",
        disk: (stats?.disk_bytes / 1024 / 1024).toFixed(2) + " MB",
        network_rx: (stats?.network_rx_bytes / 1024 / 1024).toFixed(2) + " MB",
        network_tx: (stats?.network_tx_bytes / 1024 / 1024).toFixed(2) + " MB",
      };
    } catch (error: any) {
      // طباعة تفاصيل الخطأ في الـ console لمعرفة السبب الحقيقي (API Key or URL)
      console.error(
        `Error in getServerUsage for ${serverId}:`,
        error.response?.data || error.message,
      );
      throw new BadRequestError("Failed to fetch server usage", {
        cause: error,
      });
    }
  };
}

export default new MineCraftServers();
