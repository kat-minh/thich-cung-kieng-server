import { CACHE_SEPARATOR } from '../constants/cache.constant';
import { BuildCacheKeyOptions } from '../interfaces/build-cache-key-options.interface';

export function buildCacheKey(options: BuildCacheKeyOptions): string {
  return Object.values(options).filter(Boolean).join(CACHE_SEPARATOR);
}
