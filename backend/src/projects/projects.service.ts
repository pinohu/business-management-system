import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId: user.id,
      },
    });
  }

  async findAll(user: User) {
    return this.prisma.project.findMany({
      where: {
        userId: user.id,
      },
      include: {
        invoices: true,
        expenses: true,
      },
    });
  }

  async findOne(id: string, user: User) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        invoices: true,
        expenses: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User) {
    const project = await this.findOne(id, user);

    return this.prisma.project.update({
      where: { id: project.id },
      data: updateProjectDto,
    });
  }

  async remove(id: string, user: User) {
    const project = await this.findOne(id, user);

    return this.prisma.project.delete({
      where: { id: project.id },
    });
  }

  async getProjectSummary(id: string, user: User) {
    const project = await this.findOne(id, user);

    const [totalIncome, totalExpenses] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          projectId: id,
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.expense.aggregate({
        where: {
          projectId: id,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      project,
      summary: {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        netIncome: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
      },
    };
  }
}
