import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  all() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  one(id: number) {
    return this.repo.findOneBy({ id });
  }

  save(data: Partial<Product>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Product>) {
    await this.repo.update(id, data);
    return this.one(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
