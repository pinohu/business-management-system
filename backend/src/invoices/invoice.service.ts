import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PDFDocument } from 'pdf-lib';
import { User } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async generateInvoice(invoiceId: string, user: User) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        project: true,
        user: true,
      },
    });

    if (!invoice || invoice.userId !== user.id) {
      throw new Error('Invoice not found or unauthorized');
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size

    // Add content to the PDF
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;

    // Add header
    page.drawText('INVOICE', {
      x: margin,
      y: height - margin,
      size: 24,
    });

    // Add invoice details
    page.drawText(`Invoice #: ${invoice.number}`, {
      x: margin,
      y: height - margin - 40,
      size: fontSize,
    });

    page.drawText(`Date: ${invoice.createdAt.toLocaleDateString()}`, {
      x: margin,
      y: height - margin - 60,
      size: fontSize,
    });

    page.drawText(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, {
      x: margin,
      y: height - margin - 80,
      size: fontSize,
    });

    // Add client details
    page.drawText('Bill To:', {
      x: margin,
      y: height - margin - 120,
      size: fontSize,
    });

    page.drawText(invoice.project.client, {
      x: margin,
      y: height - margin - 140,
      size: fontSize,
    });

    // Add project details
    page.drawText('Project:', {
      x: margin,
      y: height - margin - 180,
      size: fontSize,
    });

    page.drawText(invoice.project.name, {
      x: margin,
      y: height - margin - 200,
      size: fontSize,
    });

    // Add amount
    page.drawText('Amount Due:', {
      x: margin,
      y: height - margin - 240,
      size: fontSize,
    });

    page.drawText(`$${invoice.amount.toFixed(2)}`, {
      x: margin,
      y: height - margin - 260,
      size: fontSize,
    });

    // Add footer
    page.drawText('Thank you for your business!', {
      x: margin,
      y: margin,
      size: fontSize,
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Update invoice status
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'SENT' },
    });

    return pdfBytes;
  }

  async createInvoice(projectId: string, amount: number, dueDate: Date, user: User) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== user.id) {
      throw new Error('Project not found or unauthorized');
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    return this.prisma.invoice.create({
      data: {
        number: invoiceNumber,
        amount,
        dueDate,
        projectId,
        userId: user.id,
      },
    });
  }

  async getInvoices(user: User) {
    return this.prisma.invoice.findMany({
      where: { userId: user.id },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateInvoiceStatus(invoiceId: string, status: string, user: User) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.userId !== user.id) {
      throw new Error('Invoice not found or unauthorized');
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });
  }
}
