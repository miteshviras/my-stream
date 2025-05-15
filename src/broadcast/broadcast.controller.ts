import { Controller, Get, Post, Body } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';

@Controller('broadcast')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post('start') // Use POST for starting a broadcast with data
  startBroadcast(@Body('streamKey') streamKey: string): string {
    const hlsUrl = this.broadcastService.startBroadcast(streamKey);
    return `/viewer.html?url=${encodeURIComponent(hlsUrl)}`;
  }

  // You would add endpoints for stopping, getting viewer links, etc.
}
