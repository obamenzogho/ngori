import mongoose, { Schema } from 'mongoose';

const AnalyticsDailySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    totalVisitors: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    totalDownloads: {
      type: Number,
      default: 0,
    },
    topPages: [
      {
        page: String,
        views: Number,
        avgTimeOnPage: Number,
        bounceRate: Number,
      },
    ],
    topClicks: [
      {
        element: String,
        label: String,
        clicks: Number,
        percentage: Number,
      },
    ],
    deviceBreakdown: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    countryBreakdown: [
      {
        country: String,
        visitors: Number,
        percentage: Number,
      },
    ],
    topSearches: [
      {
        query: String,
        count: Number,
      },
    ],
    adPerformance: {
      monetagImpressions: { type: Number, default: 0 },
      monetagClicks: { type: Number, default: 0 },
      adsterraImpressions: { type: Number, default: 0 },
      adsterraClicks: { type: Number, default: 0 },
      adBlockRate: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.AnalyticsDaily ||
  mongoose.model('AnalyticsDaily', AnalyticsDailySchema);
