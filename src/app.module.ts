import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Expense } from './expense.entity';
import { ExpensesService } from './expenses.service';
import { PagesController } from './pages.controller';
import { Product } from './product.entity';
import { ProductsService } from './products.service';
import { Sale } from './sale.entity';
import { SalesService } from './sales.service';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(__dirname, '..', 'data', 'papeleria.sqlite'),
      entities: [Product, Sale, Expense, Task],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product, Sale, Expense, Task]),
  ],
  controllers: [PagesController],
  providers: [ProductsService, SalesService, ExpensesService, TasksService],
})
export class AppModule {}
