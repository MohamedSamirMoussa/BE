import { Rcon } from "rcon-client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve("./config/.env.development") });

interface IRCONConfig {
  host: string;
  port: number;
  password: string;
  timeout: number;
}

const isValidPort = (port: any): boolean => {
  const p = parseInt(port, 10);
  return !isNaN(p) && p > 0 && p <= 65535;
};

const rawConfigs: Record<string, any> = {
  "1": process.env.RCON_PORT_ATM as string,
  "2": process.env.RCON_PORT_ALL_THE_MOON as string,
  "3": process.env.RCON_PORT_SB4 as string,
  "4": process.env.RCON_PORT_4 as string,
  "5": process.env.RCON_PORT_5 as string,
  "6": process.env.RCON_PORT_6 as string,
};

export const serverConfigs:Record<string,IRCONConfig> = {}
Object.entries(rawConfigs).forEach(([id , port])=>{
  if(isValidPort(port as unknown as number)) {
    serverConfigs[id] = {
      host: process.env.RCON_HOST as string,
      port: Number(port),
      password: process.env.RCON_PASS as string,
      timeout: Number(process.env.RCON_TIMEOUT),
    }
  }
})

const activeConnections: Record<string, Rcon | null> = {};
const connectingFlags: Record<string, boolean> = {};

export const getRcon = async (serverName: string): Promise<Rcon> => {
  const RCONconfig = serverConfigs[serverName];
  if (!RCONconfig) throw new Error(`Server ${serverName} config not found!`);

  if (activeConnections[serverName]?.authenticated) {
    return activeConnections[serverName]!;
  }

  if (connectingFlags[serverName]) {
    await new Promise((res) => setTimeout(res, 1000));
    return getRcon(serverName);
  }

  connectingFlags[serverName] = true;

  try {
    const rcon = new Rcon({
      host: RCONconfig.host,
      port: RCONconfig.port,
      password: RCONconfig.password,
      timeout: RCONconfig.timeout,
    });

    rcon.on("end", () => {
      console.log(`[RCON] ${serverName} disconnected`);
      activeConnections[serverName] = null;
    });

    rcon.on("error", (err) => {
      console.error(`[RCON] Error for ${serverName}:`, err.message);
      activeConnections[serverName] = null;
    });

    await rcon.connect();
    console.log(`[RCON] Connected to ${serverName} successfully`);
    activeConnections[serverName] = rcon;
    return rcon;
  } finally {
    connectingFlags[serverName] = false;
  }
};
