import mongoose, { Schema } from 'mongoose';

const XtreamCodeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    serverUrl: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    expirationDate: Date,
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

export default mongoose.models.XtreamCode || mongoose.model('XtreamCode', XtreamCodeSchema);
