import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 获取北京时间（考虑时区偏移）
export function getBeijingTime() {
  // 创建当前时间对象
  const now = new Date();
  // 北京时间 UTC+8，获取当前时间并加上8小时
  const beijingOffset = 8;
  const beijingTime = new Date(now.getTime() + (beijingOffset * 60 * 60 * 1000));
  return beijingTime;
}

// 获取北京时间 ISO 格式
export function getBeijingTimeISO() {
  return getBeijingTime().toISOString();
}

// 获取北京时间日期字符串（格式：YYYY-MM-DD）
export function getBeijingDateString() {
  const beijingTime = getBeijingTime();
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}