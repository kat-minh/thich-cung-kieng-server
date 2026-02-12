export enum UserEventStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DONE = 'done',
}

export enum UserEventRepeatRule {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum UserEventType {
  PERSONAL = 'personal',
  RITUAL = 'ritual',
}
