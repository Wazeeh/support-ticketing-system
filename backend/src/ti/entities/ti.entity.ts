import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ti')
export class Ti {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  piu_id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}