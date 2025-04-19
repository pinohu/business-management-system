import { config } from 'dotenv';
config();

export const aiConfig = {
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
    models: {
      text: {
        classification: 'bert-base-uncased',
        sentiment: 'roberta-base',
        generation: 't5-base',
      },
      code: {
        analysis: 'codebert',
        generation: 'codegen',
      },
      speech: {
        recognition: 'whisper',
        synthesis: 'fastspeech2',
      },
    },
  },
  spacy: {
    model: process.env.SPACY_MODEL || 'en_core_web_lg',
    cacheDir: './cache/spacy',
  },
  yolo: {
    modelPath: process.env.YOLO_MODEL_PATH || './models/yolov5s.pt',
    confidence: 0.5,
    classes: [
      'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train',
      'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign',
      'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep',
      'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
      'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard',
      'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard',
      'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork',
      'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
      'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
      'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv',
      'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave',
      'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase',
      'scissors', 'teddy bear', 'hair drier', 'toothbrush',
    ],
  },
  tesseract: {
    lang: process.env.TESSERACT_LANG || 'eng',
    cacheDir: './cache/tesseract',
  },
  faceapi: {
    modelPath: './models/faceapi',
    minConfidence: 0.5,
    inputSize: 416,
  },
};
