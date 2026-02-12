import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostgresExtensions1728246600000 implements MigrationInterface {
  name = 'AddPostgresExtensions1728246600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Install the unaccent extension for accent-insensitive search
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);
    
    // Install the pg_trgm extension for fuzzy string matching (similarity function)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the extensions (be careful with this in production)
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pg_trgm"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "unaccent"`);
  }
}