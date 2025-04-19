import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TaxModule } from './tax/tax.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { ExpensesModule } from './expenses/expenses.module';
import { MiddlewareModule } from './middleware/middleware.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TaxModule,
    PrismaModule,
    ProjectsModule,
    ExpensesModule,
    MiddlewareModule,
  ],
})
export class AppModule {}
