import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { AppointmentModule } from 'modules/appointment/appointment.module';
import { TaskModule } from 'modules/tasks/task.module';

// import { CacheModule } from 'providers/cache/cache.module';
import { EmailModule } from 'providers/email/email.module';
import { HashModule } from 'providers/hash/hash.module';
import { PostgresqlModule } from 'providers/postgresql/postgresql.module';

import { AuthModule } from '../auth/auth.module';
import { RateLimitingGuard } from '../rate-limiting/guards/rate-limiting.guard';
import { RateLimitingModule } from '../rate-limiting/rate-limiting.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    AuthModule,
    AppointmentModule,
    // CacheModule,
    EmailModule,
    HashModule,
    PostgresqlModule,
    RateLimitingModule,
    TaskModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitingGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
