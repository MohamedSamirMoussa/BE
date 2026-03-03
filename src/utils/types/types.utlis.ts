export interface ILink {
  text: string;
  url: string;
}

export interface IModCard {
  title: string;
  description: string;
  link: ILink;
}

export interface IStep {
  id: number;
  title: string;
  description: string;
}

export interface IServerContent {
  serverName?: string;
  title?: string;
  description?: string;
  linkText?: string;
  ipAddress?: string;
  version?: string;
  showIP?: boolean;
  mods?: IModCard[];
  steps?: IStep[];
}

export interface IPageContent {
  sectionName: string;
  servers: Record<string, IServerContent>;
  discordLink?: string;
  globalTitle?: string;
  desc: string;
  descFooter: string;
}
