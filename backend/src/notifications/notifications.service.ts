import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UserLookup } from './entities/user-lookup.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    @InjectRepository(UserLookup)
    private userLookupRepo: Repository<UserLookup>,
  ) {}

  async notifyUser(userId: number, ticketId: number, type: string, message: string): Promise<void> {
    const notification = this.notificationsRepo.create({
      user_id: userId,
      ticket_id: ticketId,
      type,
      is_read: false,
    });
    await this.notificationsRepo.save(notification);
  }

  async notifyAllAdmins(ticketId: number, type: string, message: string): Promise<void> {
    const admins = await this.userLookupRepo.find({
      where: { role: 'ADMIN', is_active: true },
    });

    for (const admin of admins) {
      await this.notifyUser(admin.id, ticketId, type, message);
    }
  }

  async findForUser(userId: number, unreadOnly?: boolean): Promise<Notification[]> {
    return this.notificationsRepo.find({
      where: unreadOnly ? { user_id: userId, is_read: false } : { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(notificationId: number): Promise<Notification | null> {
    const notification = await this.notificationsRepo.findOne({ where: { id: notificationId } });
    if (!notification) {
      return null;
    }
    notification.is_read = true;
    return this.notificationsRepo.save(notification);
  }
}