import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  userId?: string;
  user?: any;
}

export class RequestContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  static run<T>(context: RequestContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  static getCurrentContext(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  static getCurrentUserId(): string | undefined {
    return this.getCurrentContext()?.userId;
  }
}
