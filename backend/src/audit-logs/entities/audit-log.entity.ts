import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticket_id: number;

  @Column({ nullable: true })
  actor_id: number;

  @Column()
  action: string;

  @Column({ nullable: true })
  from_value: string;

  @Column({ nullable: true })
  to_value: string;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}