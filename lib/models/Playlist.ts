import mongoose, { Schema } from 'mongoose';

const PlaylistSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    content: {
      type: String,
      required: true,
    },
    logo: String,
    category: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
