import mongoose, { Schema } from 'mongoose';

const MacPortalSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    portalUrl: {
      type: String,
      required: true,
    },
    macAddress: String,
    macIdentifier: String,
    logo: String,
    category: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MacPortal || mongoose.model('MacPortal', MacPortalSchema);
