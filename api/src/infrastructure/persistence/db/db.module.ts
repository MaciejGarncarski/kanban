import { Global, Module } from '@nestjs/common';
import { dbProvider } from './db.provider.js';

@Global()
@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
