import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Invoice, Expense, TaxEstimate } from '@prisma/client';

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

@Injectable()
export class TaxService {
  private readonly taxBrackets: TaxBracket[] = [
    { min: 0, max: 10275, rate: 0.10 },
    { min: 10276, max: 41775, rate: 0.12 },
    { min: 41776, max: 89075, rate: 0.22 },
    { min: 89076, max: 170050, rate: 0.24 },
    { min: 170051, max: 215950, rate: 0.32 },
    { min: 215951, max: 539900, rate: 0.35 },
    { min: 539901, max: Infinity, rate: 0.37 },
  ];

  constructor(private prisma: PrismaService) {}

  async calculateTaxEstimate(user: User, year: number, quarter: number) {
    // Get all income and expenses for the specified period
    const startDate = new Date(year, (quarter - 1) * 3, 1);
    const endDate = new Date(year, quarter * 3, 0);

    const [invoices, expenses] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PAID',
        },
      }),
      this.prisma.expense.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    // Calculate total income and expenses
    const totalIncome = invoices.reduce((sum: number, invoice: Invoice) => sum + invoice.amount, 0);
    const totalExpenses = expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

    // Calculate taxable income
    const taxableIncome = totalIncome - totalExpenses;

    // Calculate tax based on brackets
    let tax = 0;
    for (const bracket of this.taxBrackets) {
      if (taxableIncome > bracket.min) {
        const taxableAmount = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
        tax += taxableAmount * bracket.rate;
      }
    }

    // Create or update tax estimate
    return this.prisma.taxEstimate.upsert({
      where: {
        userId_year_quarter: {
          userId: user.id,
          year,
          quarter,
        },
      },
      create: {
        userId: user.id,
        year,
        quarter,
        income: totalIncome,
        expenses: totalExpenses,
        tax,
      },
      update: {
        income: totalIncome,
        expenses: totalExpenses,
        tax,
      },
    });
  }

  async getTaxEstimates(user: User) {
    return this.prisma.taxEstimate.findMany({
      where: { userId: user.id },
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' },
      ],
    });
  }

  async getTaxSummary(user: User, year: number) {
    const estimates = await this.prisma.taxEstimate.findMany({
      where: {
        userId: user.id,
        year,
      },
      orderBy: { quarter: 'asc' },
    });

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      totalTax: 0,
      quarterlyBreakdown: estimates.map((estimate: TaxEstimate) => ({
        quarter: estimate.quarter,
        income: estimate.income,
        expenses: estimate.expenses,
        tax: estimate.tax,
      })),
    };

    estimates.forEach((estimate: TaxEstimate) => {
      summary.totalIncome += estimate.income;
      summary.totalExpenses += estimate.expenses;
      summary.totalTax += estimate.tax;
    });

    return summary;
  }
}
