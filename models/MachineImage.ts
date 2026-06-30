import mongoose, { Schema, model, models } from "mongoose";

export interface IMachineImage {
  machineSlug: string;   // e.g. "flexo-2c", "abcde-2200"
  category:    string;   // e.g. "printing", "film-blowing"
  publicId:    string;   // Cloudinary public_id
  url:         string;   // Cloudinary secure_url
  alt:         string;
  order:       number;   // display order within machine
  createdAt:   Date;
}

const MachineImageSchema = new Schema<IMachineImage>({
  machineSlug: { type: String, required: true, index: true },
  category:    { type: String, required: true, index: true },
  publicId:    { type: String, required: true, unique: true },
  url:         { type: String, required: true },
  alt:         { type: String, default: "" },
  order:       { type: Number, default: 0 },
  createdAt:   { type: Date,   default: Date.now },
});

// Prevent model recompilation in Next.js hot-reload
const MachineImage = models.MachineImage ?? model<IMachineImage>("MachineImage", MachineImageSchema);
export default MachineImage;
