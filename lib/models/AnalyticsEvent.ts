import mongoose, { Schema } from 'mongoose';

const AnalyticsEventSchema = new Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    page: {
      type: String,
      index: true,
    },
    element: String,
    label: String,
    query: String,
    appName: String,
    device: {
      type: String,
      index: true,
    },
    country: {
      type: String,
      index: true,
    },
    referrer: String,
    sessionId: {
      type: String,
      index: true,
    },
    ip: String,
    userAgent: String,
    screenWidth: Number,
    scrollDepth: Number,
    timeOnPage: Number,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  },
);

// Compound index for common queries
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ eventType: 1, page: 1, timestamp: -1 });

export default mongoose.models.AnalyticsEvent ||
  mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
