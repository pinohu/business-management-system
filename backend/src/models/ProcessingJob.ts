import mongoose, { Document, Schema } from 'mongoose';

export interface IProcessingJob extends Document {
  userId: mongoose.Types.ObjectId;
  modelId: mongoose.Types.ObjectId;
  type: 'text' | 'vision' | 'code' | 'speech';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: {
    [key: string]: any;
  };
  output?: {
    [key: string]: any;
  };
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  metrics: {
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    resourceUsage?: {
      cpu: number;
      memory: number;
      gpu?: number;
    };
  };
  priority: number;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

const processingJobSchema = new Schema<IProcessingJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'Model',
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'vision', 'code', 'speech'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    input: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true
    },
    output: {
      type: Map,
      of: Schema.Types.Mixed
    },
    error: {
      message: String,
      code: String,
      details: Schema.Types.Mixed
    },
    metrics: {
      startTime: Date,
      endTime: Date,
      duration: Number,
      resourceUsage: {
        cpu: Number,
        memory: Number,
        gpu: Number
      }
    },
    priority: {
      type: Number,
      default: 0
    },
    retries: {
      type: Number,
      default: 0
    },
    maxRetries: {
      type: Number,
      default: 3
    }
  },
  {
    timestamps: true
  }
);

// Indexes
processingJobSchema.index({ userId: 1, status: 1 });
processingJobSchema.index({ modelId: 1, status: 1 });
processingJobSchema.index({ type: 1, status: 1 });
processingJobSchema.index({ priority: -1, createdAt: 1 });
processingJobSchema.index({ 'metrics.startTime': 1 });

// Methods
processingJobSchema.methods.startProcessing = async function(): Promise<void> {
  this.status = 'processing';
  this.metrics.startTime = new Date();
  await this.save();
};

processingJobSchema.methods.complete = async function(output: any): Promise<void> {
  this.status = 'completed';
  this.output = output;
  this.metrics.endTime = new Date();
  this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();
  await this.save();
};

processingJobSchema.methods.fail = async function(error: { message: string; code: string; details?: any }): Promise<void> {
  this.status = 'failed';
  this.error = error;
  this.metrics.endTime = new Date();
  this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();
  await this.save();
};

processingJobSchema.methods.retry = async function(): Promise<boolean> {
  if (this.retries >= this.maxRetries) {
    return false;
  }
  this.retries += 1;
  this.status = 'pending';
  this.error = undefined;
  this.metrics = {};
  await this.save();
  return true;
};

export const ProcessingJob = mongoose.model<IProcessingJob>('ProcessingJob', processingJobSchema); 