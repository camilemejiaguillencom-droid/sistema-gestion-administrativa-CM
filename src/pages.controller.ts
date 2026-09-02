import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Render,
} from '@nestjs/common';
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  PRODUCT_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from './catalog';
import { ExpensesService } from './expenses.service';
import { ProductsService } from './products.service';
import { SalesService } from './sales.service';
import { TasksService } from './tasks.service';

const money = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

@Controller()
export class PagesController {
  constructor(
    private products: ProductsService,
    private sales: SalesService,
    private expenses: ExpensesService,
    private tasks: TasksService,
  ) {}

  @Get()
  @Render('dashboard')
  async dashboard(@Query('from') from?: string, @Query('to') to?: string) {
    const [income, expense, pending, products] = await Promise.all([
      this.sales.total(from, to),
      this.expenses.total(from, to),
      this.tasks.list('Pendiente'),
      this.products.all(),
    ]);
    return {
      title: 'Resumen',
      from: from || '',
      to: to || '',
      income: money(income),
      expense: money(expense),
      balance: money(income - expense),
      pending,
      products,
    };
  }

  @Get('productos')
  @Render('products')
  async productList(@Query('q') q?: string, @Query('error') error?: string) {
    let items = await this.products.all();
    if (q) {
      const s = q.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.location.toLowerCase().includes(s),
      );
    }
    return {
      title: 'Productos',
      items,
      q: q || '',
      error: error || '',
      categories: PRODUCT_CATEGORIES,
    };
  }

  @Post('productos')
  @Redirect('/productos')
  async createProduct(@Body() b: any) {
    await this.products.save({
      name: b.name,
      category: b.category,
      quantity: Number(b.quantity || 0),
      purchasePrice: Number(b.purchasePrice || 0),
      salePrice: Number(b.salePrice || 0),
      location: b.location || '',
      notes: b.notes || '',
    });
  }

  @Get('productos/:id/editar')
  @Render('product-edit')
  async editProduct(@Param('id') id: string) {
    const item = await this.products.one(Number(id));
    return { title: 'Editar producto', item, categories: PRODUCT_CATEGORIES };
  }

  @Post('productos/:id')
  @Redirect('/productos')
  async updateProduct(@Param('id') id: string, @Body() b: any) {
    await this.products.update(Number(id), {
      name: b.name,
      category: b.category,
      quantity: Number(b.quantity || 0),
      purchasePrice: Number(b.purchasePrice || 0),
      salePrice: Number(b.salePrice || 0),
      location: b.location || '',
      notes: b.notes || '',
    });
  }

  @Post('productos/:id/eliminar')
  @Redirect('/productos')
  async removeProduct(@Param('id') id: string) {
    try {
      await this.products.remove(Number(id));
      return { url: '/productos' };
    } catch {
      return { url: '/productos?error=' + encodeURIComponent('No se puede eliminar: tiene ventas asociadas') };
    }
  }

  @Get('ventas')
  @Render('sales')
  async saleList(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('error') error?: string,
  ) {
    const [items, total, products] = await Promise.all([
      this.sales.list(from, to),
      this.sales.total(from, to),
      this.products.all(),
    ]);
    return {
      title: 'Ventas',
      items,
      total: money(total),
      from: from || '',
      to: to || '',
      error: error || '',
      products,
      payments: PAYMENT_METHODS,
    };
  }

  @Post('ventas')
  @Redirect('/ventas')
  async createSale(@Body() b: any) {
    try {
      await this.sales.create(b);
      return { url: '/ventas', statusCode: 302 };
    } catch (e) {
      const msg = e instanceof BadRequestException ? String(e.message) : 'No se pudo registrar la venta';
      return { url: `/ventas?error=${encodeURIComponent(msg)}`, statusCode: 302 };
    }
  }

  @Get('gastos')
  @Render('expenses')
  async expenseList(@Query('from') from?: string, @Query('to') to?: string) {
    const [items, total] = await Promise.all([this.expenses.list(from, to), this.expenses.total(from, to)]);
    return {
      title: 'Gastos',
      items,
      total: money(total),
      from: from || '',
      to: to || '',
      categories: EXPENSE_CATEGORIES,
    };
  }

  @Post('gastos')
  @Redirect('/gastos')
  async createExpense(@Body() b: any) {
    await this.expenses.save({
      date: b.date,
      description: b.description,
      category: b.category,
      amount: Number(b.amount || 0),
      notes: b.notes || '',
    });
  }

  @Post('gastos/:id/eliminar')
  @Redirect('/gastos')
  async removeExpense(@Param('id') id: string) {
    await this.expenses.remove(Number(id));
  }

  @Get('tareas')
  @Render('tasks')
  async taskList(@Query('estado') estado?: string) {
    const items = await this.tasks.list(estado || undefined);
    return {
      title: 'Tareas',
      items,
      estado: estado || '',
      priorities: TASK_PRIORITIES,
      statuses: TASK_STATUSES,
    };
  }

  @Post('tareas')
  @Redirect('/tareas')
  async createTask(@Body() b: any) {
    await this.tasks.save({
      name: b.name,
      description: b.description || '',
      date: b.date,
      dueDate: b.dueDate,
      priority: b.priority,
      status: b.status || 'Pendiente',
    });
  }

  @Get('tareas/:id/editar')
  @Render('task-edit')
  async editTask(@Param('id') id: string) {
    const item = await this.tasks.one(Number(id));
    return { title: 'Editar tarea', item, priorities: TASK_PRIORITIES, statuses: TASK_STATUSES };
  }

  @Post('tareas/:id')
  @Redirect('/tareas')
  async updateTask(@Param('id') id: string, @Body() b: any) {
    await this.tasks.update(Number(id), {
      name: b.name,
      description: b.description || '',
      date: b.date,
      dueDate: b.dueDate,
      priority: b.priority,
      status: b.status,
    });
  }

  @Post('tareas/:id/estado')
  @Redirect('/tareas')
  async toggleTask(@Param('id') id: string) {
    await this.tasks.toggle(Number(id));
  }

  @Post('tareas/:id/eliminar')
  @Redirect('/tareas')
  async removeTask(@Param('id') id: string) {
    await this.tasks.remove(Number(id));
  }
}
