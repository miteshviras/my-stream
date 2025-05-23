import { Module } from '@nestjs/common';
    import { ServeStaticModule } from '@nestjs/serve-static';
    import { join } from 'path';
    import { AppController } from './app.controller';
    import { AppService } from './app.service';
    import { BroadcastModule } from './broadcast/broadcast.module';

    @Module({
      imports: [
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'src'), // Serve files from the 'src' directory
        }),
        BroadcastModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    })
    export class AppModule {}
