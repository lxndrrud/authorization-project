import { Module } from '@nestjs/common';
import { Hasher, UTILS_HASHER } from './utils/hasher/hasher';
import { JwtHelper, UTILS_JWT_HELPER } from './utils/jwt-helper/jwt-helper';

@Module({
  providers: [
    { provide: UTILS_HASHER, useClass: Hasher },
    { provide: UTILS_JWT_HELPER, useClass: JwtHelper },
  ],
  exports: [
    { provide: UTILS_HASHER, useClass: Hasher },
    { provide: UTILS_JWT_HELPER, useClass: JwtHelper },
  ],
})
export class SharedModule {}
