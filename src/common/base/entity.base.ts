import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RequestContextService } from '../context/request.context';

export abstract class AbstractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    comment: 'Thời gian tạo bản ghi',
  })
  createdAt: Date;

  @Column({
    name: 'created_by',
    nullable: true,
    comment: 'ID người dùng tạo bản ghi',
  })
  createdBy: string;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    comment: 'Thời gian cập nhật bản ghi lần cuối',
  })
  updatedAt: Date;

  @Column({
    name: 'updated_by',
    nullable: true,
    comment: 'ID người dùng cập nhật bản ghi lần cuối',
  })
  updatedBy: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Thời gian xóa bản ghi (soft delete)',
  })
  @Exclude()
  deletedAt: Date;

  @BeforeInsert()
  setCreatedBy() {
    if (process.env.NODE_ENV !== 'test') {
      const userId = RequestContextService.getCurrentUserId() || 'system';
      if (userId) {
        this.createdBy = userId;
        this.updatedBy = userId;
      }
    }
  }

  @BeforeUpdate()
  setUpdatedBy() {
    if (process.env.NODE_ENV !== 'test') {
      const userId = RequestContextService.getCurrentUserId() || 'system';
      if (userId) {
        this.updatedBy = userId;
      }
    }
  }
}
