import { Module } from '@nestjs/common';
import { GaiaCronService } from './gaia-cron.service';

@Module({
  exports: [GaiaCronService],
  providers: [GaiaCronService],
})
export class AppCronJobModule {}
