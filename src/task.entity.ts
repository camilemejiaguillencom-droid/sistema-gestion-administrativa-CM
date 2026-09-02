import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'date' })
  dueDate: string;

  @Column()
  priority: string;

  @Column({ default: 'Pendiente' })
  status: string;
}
