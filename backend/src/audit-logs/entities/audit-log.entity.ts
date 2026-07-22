import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticket_id: number;

  @Column({ type: 'int', nullable: true })
  actor_id: number | null;

  @Column()
  action: string;

  @Column({ type: 'varchar', nullable: true })
  from_value: string | null;

  @Column({ type: 'varchar', nullable: true })
  to_value: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}