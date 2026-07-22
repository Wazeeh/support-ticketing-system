import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsAdminAliasController } from './notifications-admin-alias.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { UserLookup } from './entities/user-lookup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserLookup])],
  controllers: [NotificationsController, NotificationsAdminAliasController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}