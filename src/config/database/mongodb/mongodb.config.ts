import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const mongodbConfigFactory = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mongodb',
  url: configService.get('mongodb.uri'),
  database: configService.get('mongodb.dbName'),
  entities: [__dirname + '/../../modules/**/*.schema{.ts,.js}'],
  synchronize: true,
  logging: true,
  logger: 'advanced-console',
});
