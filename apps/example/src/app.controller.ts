import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipResponseWrapper } from '@reysin/nestjs-response-wrapper';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('paginated')
  getPaginatedData(@Query('page') page: string) {
    return this.appService.getPaginatedData(page);
  }

  @Get('error')
  getError() {
    throw new HttpException('Custom error message', HttpStatus.BAD_REQUEST);
  }

  @Get('raw')
  getRaw() {
    return 'This is raw response (excluded by route)';
  }

  @SkipResponseWrapper()
  @Get('skipped')
  getSkipped() {
    return 'This is raw response (skipped by decorator)';
  }
}
