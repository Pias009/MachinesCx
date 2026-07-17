import mongoose, { Schema, model, models } from "mongoose";

export interface InquiryMachine {
  slug: string;
  name: string;
  series: string;
  model: string;
  qty: number;
  notes: string;
}

export interface InquiryPart {
  name: string;
  machine: string;       // machine this part belongs to
  machineSlug: string;   // slug of the parent machine
  quantity: number;
  notes: string;
  images: string[];      // user-uploaded reference images
}

export interface InquiryReply {
  message: string;
  images: string[];   // machine image paths attached to this reply
  sentAt: Date;
  sentBy: string;     // admin email
}

export type InquiryType = "talk-to-engineer" | "direct" | "parts";

export interface IInquiry {
  inquiryType: InquiryType;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  machines: InquiryMachine[];
  parts: InquiryPart[];
  status: "new" | "read" | "replied";
  replies: InquiryReply[];
  source: string;
  createdAt: Date;
}

const InquiryMachineSchema = new Schema<InquiryMachine>({
  slug:   { type: String, required: true },
  name:   { type: String, required: true },
  series: { type: String, default: "" },
  model:  { type: String, default: "" },
  qty:    { type: Number, default: 1 },
  notes:  { type: String, default: "" },
}, { _id: false });

const InquiryPartSchema = new Schema<InquiryPart>({
  name:       { type: String, required: true },
  machine:    { type: String, default: "" },
  machineSlug:{ type: String, default: "" },
  quantity:   { type: Number, default: 1 },
  notes:      { type: String, default: "" },
  images:     { type: [String], default: [] },
}, { _id: false });

const InquiryReplySchema = new Schema<InquiryReply>({
  message: { type: String, required: true },
  images:  { type: [String], default: [] },
  sentAt:  { type: Date, default: Date.now },
  sentBy:  { type: String, default: "" },
}, { _id: false });

const InquirySchema = new Schema<IInquiry>({
  inquiryType:{ type: String, enum: ["talk-to-engineer", "direct", "parts"], default: "direct", index: true },
  name:       { type: String, required: true },
  company:    { type: String, default: "" },
  email:      { type: String, required: true, index: true },
  phone:      { type: String, default: "" },
  country:    { type: String, default: "" },
  message:    { type: String, default: "" },
  machines:   { type: [InquiryMachineSchema], default: [] },
  parts:      { type: [InquiryPartSchema], default: [] },
  status:     { type: String, enum: ["new", "read", "replied"], default: "new", index: true },
  replies:    { type: [InquiryReplySchema], default: [] },
  source:     { type: String, default: "direct" },
  createdAt:  { type: Date, default: Date.now, index: true },
});

// Prevent model recompilation in Next.js hot-reload
const Inquiry = models.Inquiry ?? model<IInquiry>("Inquiry", InquirySchema);
export default Inquiry;
