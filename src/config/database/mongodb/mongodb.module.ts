import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mongodbConfigFactory } from './mongodb.config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: 'mongodb',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mongodbConfigFactory,
    }),
  ],
})
export class MongodbModule {}
