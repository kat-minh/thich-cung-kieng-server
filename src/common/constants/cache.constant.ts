export const CACHE_NAMESPACE = 'cache';
export const CACHE_SEPARATOR = ':';
export const CACHE_FIELD_LIST_ALL_FILTER = 'list:all:filter';
export const CACHE_FIELD_DETAIL = 'detail';
export const CACHE_FIELD_SELECT_OPTIONS = 'select:options';
export const CACHE_FIELD_FIND_ONE_OPTIONS = 'find:one:options';
export const CACHE_FIELD_FIND_ALL_OPTIONS = 'find:all:options';

export const TTL_SECONDS = 600; // 10 phút
export const BATCH_SIZE = 100; // Kích thước batch cho xóa key
export const MAX_CONCURRENT = 3; // Số lượng concurrent requests tối đa khi xóa key theo pattern
