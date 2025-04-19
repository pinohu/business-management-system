import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TaxService } from './tax.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('taxes')
@UseGuards(JwtAuthGuard)
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('estimate')
  async calculateTaxEstimate(
    @User() user: any,
    @Body() data: { year: number; quarter: number },
  ) {
    return this.taxService.calculateTaxEstimate(user, data.year, data.quarter);
  }

  @Get()
  async getTaxEstimates(@User() user: any) {
    return this.taxService.getTaxEstimates(user);
  }

  @Get('summary/:year')
  async getTaxSummary(
    @User() user: any,
    @Param('year') year: string,
  ) {
    return this.taxService.getTaxSummary(user, parseInt(year));
  }
}
