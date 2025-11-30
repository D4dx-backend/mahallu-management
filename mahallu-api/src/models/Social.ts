import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  image: string;
  link?: string;
  status: 'active' | 'inactive';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeed extends Document {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  image?: string;
  authorId: mongoose.Types.ObjectId; // User ID
  isSuperFeed: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLog extends Document {
  tenantId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  httpMethod: string;
  endpoint: string;
  ipAddress?: string;
  userAgent?: string;
  statusCode?: number;
  requestBody?: Record<string, any>;
  responseData?: Record<string, any>;
  errorMessage?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

export interface ISupport extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    link: String,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

const FeedSchema = new Schema<IFeed>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: String,
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isSuperFeed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    httpMethod: { type: String, required: true },
    endpoint: { type: String, required: true },
    ipAddress: String,
    userAgent: String,
    statusCode: Number,
    requestBody: Schema.Types.Mixed,
    responseData: Schema.Types.Mixed,
    errorMessage: String,
    details: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Add indexes for common queries
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ tenantId: 1, createdAt: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1 });

const SupportSchema = new Schema<ISupport>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    response: String,
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);
export const Feed = mongoose.model<IFeed>('Feed', FeedSchema);
export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
export const Support = mongoose.model<ISupport>('Support', SupportSchema);

