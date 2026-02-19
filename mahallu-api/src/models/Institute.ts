import mongoose, { Schema, Document } from 'mongoose';

export interface IInstitute extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  place: string;
  type: 'institute' | 'madrasa' | 'orphanage' | 'hospital' | 'other';
  joinDate: Date;
  description?: string;
  contactNo?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const InstituteSchema = new Schema<IInstitute>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Institute name is required'],
      trim: true,
    },
    place: {
      type: String,
      required: [true, 'Place is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['institute', 'madrasa', 'orphanage', 'hospital', 'other'],
      required: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    contactNo: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
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

export default mongoose.model<IInstitute>('Institute', InstituteSchema);

