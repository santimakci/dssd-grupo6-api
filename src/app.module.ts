import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as typeOrmConfig } from './config/db.config';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { OngsModule } from './modules/ongs/ongs.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    AuthModule,
    ProjectsModule,
    OngsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
