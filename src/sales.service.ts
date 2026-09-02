import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Product } from './product.entity';
import { Sale } from './sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private repo: Repository<Sale>,
    @InjectRepository(Product) private products: Repository<Product>,
  ) {}

  list(from?: string, to?: string) {
    const where = from && to ? { date: Between(from, to) } : {};
    return this.repo.find({ where, order: { date: 'DESC', id: 'DESC' } });
  }

  async total(from?: string, to?: string) {
    const qb = this.repo.createQueryBuilder('s').select('COALESCE(SUM(s.amount),0)', 'sum');
    if (from && to) qb.where('s.date BETWEEN :from AND :to', { from, to });
    const r = await qb.getRawOne();
    return Number(r.sum);
  }

  async create(body: {
    date: string;
    productId: string;
    quantity: string;
    amount?: string;
    paymentMethod: string;
    notes?: string;
  }) {
    const product = await this.products.findOneBy({ id: Number(body.productId) });
    if (!product) throw new BadRequestException('Producto no encontrado');
    const qty = Number(body.quantity);
    if (qty < 1) throw new BadRequestException('Cantidad inválida');
    if (product.quantity < qty) {
      throw new BadRequestException('No hay cantidad suficiente del producto');
    }
    const amount = body.amount ? Number(body.amount) : product.salePrice * qty;
    product.quantity -= qty;
    await this.products.save(product);
    return this.repo.save(
      this.repo.create({
        date: body.date,
        product,
        quantity: qty,
        amount,
        paymentMethod: body.paymentMethod,
        notes: body.notes || '',
      }),
    );
  }
}
