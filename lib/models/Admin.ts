import mongoose, { Schema } from 'mongoose';

const AdminSchema = new Schema(
  {
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
