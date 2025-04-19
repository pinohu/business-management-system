import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return this.expensesService.create(createExpenseDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.expensesService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.expensesService.findOne(id, req.user);
  }

  @Get('project/:projectId')
  getExpensesByProject(@Param('projectId') projectId: string, @Request() req) {
    return this.expensesService.getExpensesByProject(projectId, req.user);
  }

  @Get('summary')
  getExpensesSummary(@Request() req) {
    return this.expensesService.getExpensesSummary(req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req,
  ) {
    return this.expensesService.update(id, updateExpenseDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.expensesService.remove(id, req.user);
  }
}
