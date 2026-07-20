import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tracking_number: string;

  @Column()
  piu_id: number;

  @Column()
  ti_id: number;

  @Column()
  software: string;

  @Column()
  issue_category: string;

  @Column({ type: 'text', nullable: true })
  other_description: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column()
  submitter_name: string;

  @Column()
  submitter_email: string;

  @Column({ type: 'varchar', nullable: true })
  submitter_phone: string | null;

  @Column({ default: 'SUBMITTED' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  priority: string | null;

  @Column({ type: 'int', nullable: true })
  assigned_to_user_id: number | null;

  @Column({ type: 'int', nullable: true })
  accepted_by_user_id: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  accepted_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  closed_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}