import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ticket_replies')
export class TicketReply {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  ticket_id: number;

  @Column({ nullable: true })
  author_user_id: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  is_closing_reply: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}