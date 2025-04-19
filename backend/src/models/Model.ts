import mongoose, { Document, Schema } from 'mongoose';

export interface IModel extends Document {
  name: string;
  type: 'text' | 'vision' | 'code' | 'speech';
  version: string;
  description: string;
  architecture: string;
  parameters: {
    [key: string]: any;
  };
  performance: {
    accuracy: number;
    latency: number;
    throughput: number;
    lastEvaluated: Date;
  };
  status: 'active' | 'training' | 'evaluating' | 'deprecated';
  path: string;
  size: number;
  dependencies: string[];
  metadata: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const modelSchema = new Schema<IModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'vision', 'code', 'speech'],
      required: true
    },
    version: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    architecture: {
      type: String,
      required: true
    },
    parameters: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
    performance: {
      accuracy: {
        type: Number,
        default: 0
      },
      latency: {
        type: Number,
        default: 0
      },
      throughput: {
        type: Number,
        default: 0
      },
      lastEvaluated: {
        type: Date,
        default: Date.now
      }
    },
    status: {
      type: String,
      enum: ['active', 'training', 'evaluating', 'deprecated'],
      default: 'active'
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    dependencies: [{
      type: String
    }],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes
modelSchema.index({ name: 1, version: 1 }, { unique: true });
modelSchema.index({ type: 1, status: 1 });
modelSchema.index({ 'performance.lastEvaluated': 1 });

export const Model = mongoose.model<IModel>('Model', modelSchema); 