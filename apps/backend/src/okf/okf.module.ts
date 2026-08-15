import { Global, Module } from '@nestjs/common';
import { OKFService } from './okf.service';
import { OKFValidator } from './okf.validator';

@Global()
@Module({
  providers: [OKFService, OKFValidator],
  exports: [OKFService, OKFValidator],
})
export class OKFModule {}
