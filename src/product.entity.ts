import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Sale } from './sale.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('real', { default: 0 })
  purchasePrice: number;

  @Column('real', { default: 0 })
  salePrice: number;

  @Column({ default: '' })
  location: string;

  @Column({ default: '' })
  notes: string;

  @OneToMany(() => Sale, (s) => s.product)
  sales: Sale[];
}
