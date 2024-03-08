import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// import { CourseModule } from './courses/courses.module';
// import { DepartmentModule } from './department/department.module';
// import { ExamsModule } from './exams/exams.module';
// import { AssignmentModule } from './assignment/assignment.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { StorageModule } from './storage/storage.module';
import { MemcachedController } from './memcached/memcached.controller';
import { MemcachedService } from './memcached/memcached.service';
import { MemcachedModule } from './memcached/memcached.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10,
        limit: 2,
      },
    ]),
    AuthModule,
    // CourseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // DepartmentModule,
    // ExamsModule,
    // AssignmentModule,
    StorageModule,
    MemcachedModule,
  ],
  controllers: [AppController, MemcachedController],
  providers: [AppService, MemcachedService],
  exports: [],
})
export class AppModule {}
