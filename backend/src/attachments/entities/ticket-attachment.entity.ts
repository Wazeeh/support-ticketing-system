import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ticket_attachments')
export class TicketAttachment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  ticket_id!: number;

  @Column()
  file_name!: string;

  @Column()
  storage_key!: string;

  @Column()
  mime_type!: string;

  @Column({ type: 'bigint' })
  size_bytes!: number;

@Column({ type: 'int', nullable: true })
  uploaded_by_user_id?: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}