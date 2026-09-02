import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private repo: Repository<Task>) {}

  list(status?: string) {
    const where = status ? { status } : {};
    return this.repo.find({ where, order: { dueDate: 'ASC', id: 'DESC' } });
  }

  one(id: number) {
    return this.repo.findOneBy({ id });
  }

  save(data: Partial<Task>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Task>) {
    await this.repo.update(id, data);
    return this.one(id);
  }

  async toggle(id: number) {
    const t = await this.one(id);
    if (!t) return;
    t.status = t.status === 'Completada' ? 'Pendiente' : 'Completada';
    return this.repo.save(t);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
