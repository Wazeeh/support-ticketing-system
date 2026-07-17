import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  tracking_number: string;

  @Column()
  piu_id: number;

  @Column()
  ti_id: number;

  @Column({ type: 'enum', enum: ['TMS', 'FINMAN'] })
  software: string;

  @Column({ type: 'enum', enum: [
    'LOGIN', 'ENROLLMENT', 'ASSESSMENT', 'CERTIFICATION', 'COURSE_DATA',
    'BATCH_DATA', 'TRAINEE_DATA', 'CLAIM_1_BILLING', 'CLAIM_2_BILLING',
    'CLAIM_3_BILLING', 'LEDGER', 'BUDGET', 'SOE', 'DOUBLE_COLUMN_CASHBOOK', 'OTHER',
  ] })
  issue_category: string;

  @Column({ type: 'text', nullable: true })
  other_description?: string;

  @Column()
  submitter_name: string;

  @Column()
  submitter_email: string;

  @Column({ nullable: true })
  submitter_phone: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: [
    'SUBMITTED', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'REOPENED',
  ], default: 'SUBMITTED' })
  status: string;

  @Column({ type: 'enum', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], nullable: true })
  priority?: string;

  @Column({ type: 'int', nullable: true })
  assigned_to_user_id?: number;

  @Column({ type: 'int', nullable: true })
  accepted_by_user_id?: number;

  @Column({ type: 'timestamptz', nullable: true })
  accepted_at?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  closed_at?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}