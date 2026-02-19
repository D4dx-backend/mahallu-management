import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  tenantId: mongoose.Types.ObjectId;
  instituteId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  email?: string;
  designation: string;
  department?: string;
  joinDate: Date;
  salary: number;
  status: 'active' | 'inactive';
  address?: string;
  qualifications?: string;
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    instituteId: {
      type: Schema.Types.ObjectId,
      ref: 'Institute',
      required: [true, 'Institute ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary must be a positive number'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    address: {
      type: String,
      trim: true,
    },
    qualifications: {
      type: String,
      trim: true,
    },
    bankAccount: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
EmployeeSchema.index({ tenantId: 1, instituteId: 1 });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
