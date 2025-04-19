import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  timestamp: Date;
  type: 'system' | 'model' | 'job' | 'user';
  metrics: {
    [key: string]: number | string | boolean | object;
  };
  tags?: {
    [key: string]: string;
  };
  metadata?: {
    [key: string]: any;
  };
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['system', 'model', 'job', 'user'],
      required: true
    },
    metrics: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true
    },
    tags: {
      type: Map,
      of: String
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Indexes
analyticsSchema.index({ timestamp: 1, type: 1 });
analyticsSchema.index({ type: 1, 'tags.modelId': 1 });
analyticsSchema.index({ type: 1, 'tags.userId': 1 });

// Static methods
analyticsSchema.statics.getSystemMetrics = async function(startTime: Date, endTime: Date) {
  return this.find({
    type: 'system',
    timestamp: { $gte: startTime, $lte: endTime }
  }).sort({ timestamp: 1 });
};

analyticsSchema.statics.getModelMetrics = async function(modelId: string, startTime: Date, endTime: Date) {
  return this.find({
    type: 'model',
    'tags.modelId': modelId,
    timestamp: { $gte: startTime, $lte: endTime }
  }).sort({ timestamp: 1 });
};

analyticsSchema.statics.getUserMetrics = async function(userId: string, startTime: Date, endTime: Date) {
  return this.find({
    type: 'user',
    'tags.userId': userId,
    timestamp: { $gte: startTime, $lte: endTime }
  }).sort({ timestamp: 1 });
};

analyticsSchema.statics.getJobMetrics = async function(jobId: string, startTime: Date, endTime: Date) {
  return this.find({
    type: 'job',
    'tags.jobId': jobId,
    timestamp: { $gte: startTime, $lte: endTime }
  }).sort({ timestamp: 1 });
};

// Instance methods
analyticsSchema.methods.addTag = async function(key: string, value: string): Promise<void> {
  if (!this.tags) {
    this.tags = {};
  }
  this.tags[key] = value;
  await this.save();
};

analyticsSchema.methods.addMetadata = async function(key: string, value: any): Promise<void> {
  if (!this.metadata) {
    this.metadata = {};
  }
  this.metadata[key] = value;
  await this.save();
};

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema); 