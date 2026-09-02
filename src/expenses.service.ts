import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Expense } from './expense.entity';

@Injectable()
export class ExpensesService {
  constructor(@InjectRepository(Expense) private repo: Repository<Expense>) {}

  list(from?: string, to?: string) {
    const where = from && to ? { date: Between(from, to) } : {};
    return this.repo.find({ where, order: { date: 'DESC', id: 'DESC' } });
  }

  async total(from?: string, to?: string) {
    const qb = this.repo.createQueryBuilder('e').select('COALESCE(SUM(e.amount),0)', 'sum');
    if (from && to) qb.where('e.date BETWEEN :from AND :to', { from, to });
    const r = await qb.getRawOne();
    return Number(r.sum);
  }

  save(data: Partial<Expense>) {
    return this.repo.save(this.repo.create(data));
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
