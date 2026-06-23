import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envConfig from './config/env.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PublicacionesModule } from './modules/publicaciones/publicaciones.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('config.mongoUri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PublicacionesModule,
  ],
})
export class AppModule {}