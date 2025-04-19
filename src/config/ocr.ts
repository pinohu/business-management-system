import { config } from 'dotenv';
config();

export const ocrConfig = {
  tesseract: {
    lang: process.env.TESSERACT_LANG || 'eng',
    cacheDir: './cache/tesseract',
    workerPath: './node_modules/tesseract.js/dist/worker.min.js',
    corePath: './node_modules/tesseract.js-core/tesseract-core.wasm.js',
    options: {
      tessjs_create_pdf: '1',
      tessjs_create_hocr: '1',
      tessjs_create_tsv: '1',
      tessjs_create_box: '1',
      tessjs_create_unlv: '1',
      tessjs_create_osd: '1',
    },
  },
  preprocessing: {
    resize: {
      width: 2000,
      height: 2000,
    },
    threshold: 128,
    blur: {
      kernelSize: 3,
      sigma: 0,
    },
    denoise: {
      templateWindowSize: 7,
      searchWindowSize: 21,
    },
  },
  postprocessing: {
    confidenceThreshold: 60,
    removeWhitespace: true,
    normalizeText: true,
  },
};
