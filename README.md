# Business Management System

A comprehensive business management system built with open-source components.

## Features

- **AI and Machine Learning**
  - Text processing with Hugging Face Transformers
  - Natural Language Processing with spaCy
  - Computer Vision with OpenCV and YOLO
  - OCR with Tesseract.js

- **Document Processing**
  - PDF manipulation with pdf-lib
  - Document parsing with Apache Tika
  - Document conversion with LibreOffice
  - Image processing with Sharp

- **Analytics**
  - Web analytics with Matomo
  - Application metrics with OpenTelemetry
  - Monitoring with Prometheus

- **Database**
  - PostgreSQL with Prisma ORM
  - TypeORM for additional database support

## Prerequisites

- Node.js >= 16.0.0
- PostgreSQL >= 13.0
- LibreOffice >= 7.0
- Apache Tika Server

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/business-management.git
   cd business-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Set up PostgreSQL:
   ```bash
   npm run prisma:migrate
   ```

5. Start the services:
   ```bash
   # Start Apache Tika Server
   java -jar tika-server-standard-2.4.1.jar

   # Start Matomo
   docker-compose -f docker-compose.matomo.yml up -d

   # Start Prometheus
   docker-compose -f docker-compose.prometheus.yml up -d

   # Start the application
   npm run dev
   ```

## Configuration

### AI Services

- Hugging Face Transformers: Configure models in `src/config/ai.ts`
- spaCy: Download language models using `python -m spacy download en_core_web_lg`
- OpenCV and YOLO: Download model weights and configuration files
- Tesseract.js: Configure OCR settings in `src/config/ocr.ts`

### Document Processing

- Apache Tika: Configure server URL in `.env`
- LibreOffice: Set path in `.env`
- PDF.js: Configure settings in `src/config/pdf.ts`

### Analytics

- Matomo: Configure in `src/config/analytics.ts`
- OpenTelemetry: Configure in `src/config/telemetry.ts`
- Prometheus: Configure in `prometheus.yml`

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Monitor the application:
   - Matomo dashboard: http://localhost:8080
   - Prometheus dashboard: http://localhost:9090
   - Grafana dashboard: http://localhost:3000

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hugging Face](https://huggingface.co/) for Transformers
- [spaCy](https://spacy.io/) for NLP
- [OpenCV](https://opencv.org/) for Computer Vision
- [Apache Tika](https://tika.apache.org/) for Document Processing
- [Matomo](https://matomo.org/) for Analytics
- [OpenTelemetry](https://opentelemetry.io/) for Observability
