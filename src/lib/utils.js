import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 获取北京时间（UTC+8）
 * @returns {Date} 北京时间的Date对象
 */
export function getBeijingTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const beijingOffset = 8;
  return new Date(utc + 3600000 * beijingOffset);
}

/**
 * 获取北京时间字符串（YYYY-MM-DD格式）
 * @returns {string} 格式化的日期字符串
 */
export function getBeijingDateString() {
  const beijingTime = getBeijingTime();
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取北京时间ISO字符串
 * @returns {string} ISO格式的日期时间字符串
 */
export function getBeijingTimeISO() {
  return getBeijingTime().toISOString();
}