import mongoose, { Schema, Document } from 'mongoose';

export interface ICommittee extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  members: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CommitteeSchema = new Schema<ICommittee>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Committee name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'Member',
    }],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICommittee>('Committee', CommitteeSchema);

