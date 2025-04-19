import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SecurityMiddleware } from './security.middleware';
import { RateLimitMiddleware } from './rate-limit.middleware';
import { LoggingMiddleware } from './logging.middleware';

@Module({})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, RateLimitMiddleware, LoggingMiddleware)
      .forRoutes('*');
  }
}
