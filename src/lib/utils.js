import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 获取北京时间格式的日期字符串
 * @returns {string} 格式: YYYY-MM-DD
 */
export function getBeijingDateString() {
  const now = new Date();
  // 转换为北京时间（UTC+8）
  const beijingOffset = 8 * 60; // 8小时的分钟数
  const localOffset = now.getTimezoneOffset(); // 本地时区偏移（分钟）
  const beijingTime = new Date(now.getTime() + (beijingOffset - localOffset) * 60 * 1000);
  
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 获取北京时间的 ISO 格式字符串
 * @returns {string} 格式: YYYY-MM-DDTHH:mm:ss.sssZ
 */
export function getBeijingTimeISO() {
  const now = new Date();
  // 转换为北京时间（UTC+8）
  const beijingOffset = 8 * 60; // 8小时的分钟数
  const localOffset = now.getTimezoneOffset(); // 本地时区偏移（分钟）
  const beijingTime = new Date(now.getTime() + (beijingOffset - localOffset) * 60 * 1000);
  
  return beijingTime.toISOString();
}