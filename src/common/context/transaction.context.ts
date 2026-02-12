import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

export interface TransactionContext {
  manager: EntityManager;
  transactionId: string;
  startTime: number;
}

@Injectable()
export class TransactionContextService {
  private static asyncLocalStorage =
    new AsyncLocalStorage<TransactionContext>();
  private static transactionCounter = 0;
  /**
   * Lấy EntityManager hiện tại - AN TOÀN
   */
  static getManager(): EntityManager | null {
    const context = this.asyncLocalStorage.getStore();
    return context?.manager || null;
  }

  /**
   * Check if currently in transaction
   */
  static isInTransaction(): boolean {
    return this.asyncLocalStorage.getStore() !== undefined;
  }

  /**
   * Get transaction ID for logging/debugging
   */
  static getTransactionId(): string | null {
    const context = this.asyncLocalStorage.getStore();
    return context?.transactionId || null;
  }
  /**
   * Chạy callback trong transaction context - AN TOÀN
   * Đây là cách KHUYẾN KHÍCH sử dụng
   */
  static async runWithManager<T>(
    manager: EntityManager,
    callback: () => Promise<T>,
  ): Promise<T> {
    const transactionId = this.generateTransactionId();

    const context: TransactionContext = {
      manager,
      transactionId,
      startTime: Date.now(),
    };

    // Sử dụng run() thay vì enterWith() - AN TOÀN HỚN
    return this.asyncLocalStorage.run(context, async () => {
      try {
        this.logTransaction('START', context);
        const result = await callback();
        this.logTransaction('SUCCESS', context);
        return result;
      } catch (error) {
        this.logTransaction('ERROR', context, error);
        throw error;
      }
    });
  }
  /**
   * DEPRECATED - Không nên sử dụng
   * @deprecated Use runWithManager instead
   */
  static setManager(manager: EntityManager): void {
    console.warn(
      'TransactionContextService.setManager() is deprecated and unsafe. Use runWithManager() instead.',
    );
    // Không implement để tránh misuse
  }

  /**
   * DEPRECATED - Không cần thiết với AsyncLocalStorage
   * @deprecated AsyncLocalStorage auto-cleanup
   */
  static clearManager(): void {
    console.warn(
      'TransactionContextService.clearManager() is deprecated. AsyncLocalStorage handles cleanup automatically.',
    );
    // Không implement
  }

  private static generateTransactionId(): string {
    this.transactionCounter =
      (this.transactionCounter + 1) % Number.MAX_SAFE_INTEGER;
    return `txn_${Date.now()}_${this.transactionCounter}`;
  }

  private static logTransaction(
    event: 'START' | 'SUCCESS' | 'ERROR',
    context: TransactionContext,
    error?: any,
  ): void {
    if (process.env.NODE_ENV !== 'production') {
      const duration = Date.now() - context.startTime;
      const logData = {
        event,
        transactionId: context.transactionId,
        duration: `${duration}ms`,
      };

      if (event === 'ERROR') {
        console.error('[TRANSACTION ERROR]', logData, error);
      } else {
        console.log(`[TRANSACTION ${event}]`, logData);
      }
    }
  }
}
