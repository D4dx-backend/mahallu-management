import mongoose, { Schema, Document } from 'mongoose';

export interface INikahRegistration extends Document {
  tenantId: mongoose.Types.ObjectId;
  groomName: string;
  groomAge?: number;
  groomId?: mongoose.Types.ObjectId; // Member ID
  brideName: string;
  brideAge?: number;
  brideId?: mongoose.Types.ObjectId; // Member ID
  nikahDate: Date;
  mahallId?: string;
  waliName?: string;
  witness1?: string;
  witness2?: string;
  mahrAmount?: number;
  mahrDescription?: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeathRegistration extends Document {
  tenantId: mongoose.Types.ObjectId;
  deceasedName: string;
  deceasedId?: mongoose.Types.ObjectId; // Member ID
  deathDate: Date;
  placeOfDeath?: string;
  causeOfDeath?: string;
  mahallId?: string;
  familyId?: mongoose.Types.ObjectId;
  informantName?: string;
  informantRelation?: string;
  informantPhone?: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INOC extends Document {
  tenantId: mongoose.Types.ObjectId;
  applicantName: string;
  applicantId?: mongoose.Types.ObjectId; // Member ID
  applicantPhone?: string;
  purpose: string;
  type: 'common' | 'nikah';
  nikahRegistrationId?: mongoose.Types.ObjectId; // For nikah NOC
  status: 'pending' | 'approved' | 'rejected';
  issuedDate?: Date;
  expiryDate?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NikahRegistrationSchema = new Schema<INikahRegistration>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    groomName: { type: String, required: true, trim: true },
    groomAge: Number,
    groomId: { type: Schema.Types.ObjectId, ref: 'Member' },
    brideName: { type: String, required: true, trim: true },
    brideAge: Number,
    brideId: { type: Schema.Types.ObjectId, ref: 'Member' },
    nikahDate: { type: Date, required: true },
    mahallId: String,
    waliName: String,
    witness1: String,
    witness2: String,
    mahrAmount: Number,
    mahrDescription: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    remarks: String,
  },
  { timestamps: true }
);

const DeathRegistrationSchema = new Schema<IDeathRegistration>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    deceasedName: { type: String, required: true, trim: true },
    deceasedId: { type: Schema.Types.ObjectId, ref: 'Member' },
    deathDate: { type: Date, required: true },
    placeOfDeath: String,
    causeOfDeath: String,
    mahallId: String,
    familyId: { type: Schema.Types.ObjectId, ref: 'Family' },
    informantName: String,
    informantRelation: String,
    informantPhone: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    remarks: String,
  },
  { timestamps: true }
);

const NOCSchema = new Schema<INOC>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    applicantName: { type: String, required: true, trim: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'Member' },
    applicantPhone: String,
    purpose: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['common', 'nikah'],
      required: true,
    },
    nikahRegistrationId: { type: Schema.Types.ObjectId, ref: 'NikahRegistration' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    issuedDate: Date,
    expiryDate: Date,
    remarks: String,
  },
  { timestamps: true }
);

export const NikahRegistration = mongoose.model<INikahRegistration>('NikahRegistration', NikahRegistrationSchema);
export const DeathRegistration = mongoose.model<IDeathRegistration>('DeathRegistration', DeathRegistrationSchema);
export const NOC = mongoose.model<INOC>('NOC', NOCSchema);

