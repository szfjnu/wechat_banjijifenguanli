import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 获取北京时间（UTC+8）的 Date 对象
 * @returns {Date} 北京时间的 Date 对象
 */
export function getBeijingTime() {
  const now = new Date();
  const beijingOffset = 8 * 60 * 60 * 1000; // 8小时的毫秒数
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  return new Date(utcTime + beijingOffset);
}

/**
 * 获取北京时间的 ISO 格式字符串
 * @returns {string} 北京时间的 ISO 格式字符串
 */
export function getBeijingTimeISO() {
  return getBeijingTime().toISOString();
}

/**
 * 获取北京时间的日期字符串（YYYY-MM-DD）
 * @returns {string} 北京时间的日期字符串
 */
export function getBeijingDateString() {
  return getBeijingTimeISO().split('T')[0];
}