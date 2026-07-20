import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface AuthenticatedRequest {
  user: {
    userId: number;
    role: string;
  };
}

@Controller()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /*
   * Public upload endpoint.
   * Ticket submitter login ছাড়াই initial ticket attachment upload করতে পারবে।
   */
  @Post('tickets/:id/attachments/public')
  @UseInterceptors(FilesInterceptor('files', 10))
  async publicUpload(
    @Param('id', ParseIntPipe) ticketId: number,
    @UploadedFiles() files: MulterFile[],
  ) {
    return this.attachmentsService.uploadFiles(ticketId, files, null);
  }

  /*
   * Logged-in Admin/Developer attachment upload করবে।
   * uploader-এর real user ID database-এ save হবে।
   */
  @Post('tickets/:id/attachments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DEVELOPER')
  @UseInterceptors(FilesInterceptor('files', 10))
  async authenticatedUpload(
    @Param('id', ParseIntPipe) ticketId: number,
    @UploadedFiles() files: MulterFile[],
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attachmentsService.uploadFilesForUser(
      ticketId,
      files,
      req.user.userId,
      req.user.role,
    );
  }

  /*
   * Admin সব ticket-এর attachment দেখতে পারবে।
   * Developer শুধু assigned ticket-এর attachment দেখতে পারবে।
   */
  @Get('tickets/:id/attachments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DEVELOPER')
  async list(
    @Param('id', ParseIntPipe) ticketId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attachmentsService.listForAuthorizedUser(
      ticketId,
      req.user.userId,
      req.user.role,
    );
  }

  /*
   * Admin সব attachment download করতে পারবে।
   * Developer শুধু assigned ticket-এর attachment download করতে পারবে।
   */
  @Get('attachments/:id/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DEVELOPER')
  async download(
    @Param('id', ParseIntPipe) attachmentId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const url = await this.attachmentsService.getAuthorizedDownloadUrl(
      attachmentId,
      req.user.userId,
      req.user.role,
    );

    return { url };
  }
}