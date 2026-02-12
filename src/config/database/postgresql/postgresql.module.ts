import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { postgresConfigFactory } from './postgresql.config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      name: 'postgresql',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: postgresConfigFactory,
    }),
  ],
})
export class PostgresqlModule {}
