import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { InfrastructureModule } from '@infrastructure';

@Module({
  imports: [InfrastructureModule],
  providers: [CleanupService],
})
export class CleanupModule {}
