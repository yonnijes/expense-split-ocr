import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';
import { InfrastructureModule } from '@infrastructure';

@Module({
  imports: [ScheduleModule.forRoot(), InfrastructureModule],
  providers: [CleanupService],
})
export class CleanupModule {}
