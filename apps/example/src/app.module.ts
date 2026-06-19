import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseWrapperModule } from '@reysin/nestjs-response-wrapper';

@Module({
  imports: [
    ResponseWrapperModule.forRoot({
      debug: true,
      version: '1.0.0',
      enableGlobalInterceptor: true,
      excludeRoutes: ['/raw'],
      includeMeta: true
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
