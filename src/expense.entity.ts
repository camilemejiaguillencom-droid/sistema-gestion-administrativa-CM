import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column('real')
  amount: number;

  @Column({ default: '' })
  notes: string;
}
