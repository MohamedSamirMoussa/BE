import { HydratedDocument, model, models, Schema } from "mongoose";
import {
  ILink,
  IModCard,
  IServerContent,
  IStep,
  IPageContent,
} from "types.utlis";

// --- Interfaces ---

const linkSchema = new Schema<ILink>(
  {
    text: { type: String, default: "Download" },
    url: { type: String, default: "#" },
  },
  { _id: false },
);

const modCardSchema = new Schema<IModCard>(
  {
    title: { type: String },
    description: { type: String },
    link: linkSchema,
  },
  { _id: false },
);

const stepSchema = new Schema<IStep>(
  {
    id: { type: Number },
    title: { type: String },
    description: { type: String },
  },
  { _id: false },
);

const serverContentSchema = new Schema<IServerContent>(
  {
    serverName: { type: String },
    title: { type: String },
    description: { type: String },
    linkText: { type: String },
    ipAddress: { type: String },
    version: { type: String },
    showIP: { type: Boolean, default: true },
    mods: { type: [modCardSchema], default: [] },
    steps: { type: [stepSchema], default: [] },
  },
  { _id: false },
);

const pageContentSchema = new Schema<IPageContent>(
  {
    sectionName: { type: String, required: true, unique: true },

    servers: {
      type: Map,
      of: serverContentSchema,
      default: {},
    },
    desc: String,
    descFooter: String,
    discordLink: { type: String },
    globalTitle: { type: String },
  },
  { timestamps: true },
);

export const PageContentModel =
  models.PageContent || model<IPageContent>("PageContent", pageContentSchema);

export type HPageDoc = HydratedDocument<IPageContent>;
