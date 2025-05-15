import { Module } from '@nestjs/common';
import { BroadcastController } from './broadcast.controller';
import { BroadcastService } from './broadcast.service';
import { BroadcastGateway } from './broadcast.gateway';

@Module({
  controllers: [BroadcastController],
  providers: [BroadcastService, BroadcastGateway]
})
export class BroadcastModule {}
