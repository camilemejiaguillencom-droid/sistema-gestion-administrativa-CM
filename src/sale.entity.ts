import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => Product, (p) => p.sales, { eager: true, onDelete: 'RESTRICT' })
  product: Product;

  @Column('int')
  quantity: number;

  @Column('real')
  amount: number;

  @Column()
  paymentMethod: string;

  @Column({ default: '' })
  notes: string;
}
