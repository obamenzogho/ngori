import mongoose, { Schema } from 'mongoose';

const AppItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    version: {
      type: String,
      default: '1.0.0',
    },
    downloadUrl: {
      type: String,
      required: true,
    },
    icon: String,
    category: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    fileSize: String,
    packageId: {
      type: String,
      sparse: true,
    },
    lienMonetise: String,
    source: {
      type: String,
      enum: ['manual', 'google_play', 'apkpure'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AppItem || mongoose.model('AppItem', AppItemSchema);
