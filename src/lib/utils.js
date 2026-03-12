import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 北京时间工具函数
export function getBeijingTime() {
  const now = new Date();
  // 获取 UTC 时间戳并转换为北京时间（UTC+8）
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return beijingTime;
}

export function getBeijingTimeISO() {
  const beijingTime = getBeijingTime();
  return beijingTime.toISOString();
}

export function getBeijingDateString() {
  const beijingTime = getBeijingTime();
  return beijingTime.toISOString().split('T')[0];
}