import mongoose, { Schema, Document } from 'mongoose';

export interface IFamily extends Document {
  tenantId: mongoose.Types.ObjectId; // Required for multi-tenancy
  mahallId?: string;
  varisangyaGrade?: string;
  houseName: string;
  familyHead?: string;
  contactNo?: string;
  wardNumber?: string;
  houseNo?: string;
  area?: string;
  place?: string;
  via?: string;
  state: string;
  district: string;
  pinCode?: string;
  postOffice?: string;
  lsgName: string;
  village: string;
  status: 'approved' | 'unapproved' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const FamilySchema = new Schema<IFamily>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    mahallId: {
      type: String,
      trim: true,
    },
    varisangyaGrade: {
      type: String,
      enum: ['Grade A', 'Grade B', 'Grade C', 'Grade D'],
    },
    houseName: {
      type: String,
      required: [true, 'House Name is required'],
      trim: true,
    },
    familyHead: {
      type: String,
      trim: true,
    },
    contactNo: {
      type: String,
      trim: true,
    },
    wardNumber: {
      type: String,
      trim: true,
    },
    houseNo: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      enum: ['Area A', 'Area B', 'Area C', 'Area D'],
    },
    place: {
      type: String,
      trim: true,
    },
    via: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    pinCode: {
      type: String,
      trim: true,
    },
    postOffice: {
      type: String,
      trim: true,
    },
    lsgName: {
      type: String,
      required: [true, 'LSG Name is required'],
      trim: true,
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['approved', 'unapproved', 'pending'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to populate members
FamilySchema.virtual('members', {
  ref: 'Member',
  localField: '_id',
  foreignField: 'familyId',
});

export default mongoose.model<IFamily>('Family', FamilySchema);

