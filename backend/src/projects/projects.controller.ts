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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user);
  }

  @Get(':id/summary')
  getProjectSummary(@Param('id') id: string, @Request() req) {
    return this.projectsService.getProjectSummary(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user);
  }
}
