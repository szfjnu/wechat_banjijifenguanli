import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 获取北京时间 (UTC+8)
 * @returns {Date} 北京时间的 Date 对象
 */
export function getBeijingTime() {
  const now = new Date();
  // UTC 时间 + 8 小时 = 北京时间
  const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return beijingTime;
}

/**
 * 获取北京日期字符串 (YYYY-MM-DD)
 * @returns {string} 格式化的日期字符串
 */
export function getBeijingDateString() {
  const beijingTime = getBeijingTime();
  const year = beijingTime.getUTCFullYear();
  const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取北京时间 ISO 字符串 (YYYY-MM-DD HH:mm:ss)
 * @returns {string} 格式化的日期时间字符串
 */
export function getBeijingTimeISO() {
  const beijingTime = getBeijingTime();
  const year = beijingTime.getUTCFullYear();
  const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getUTCDate()).padStart(2, '0');
  const hours = String(beijingTime.getUTCHours()).padStart(2, '0');
  const minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化日期时间为中文格式
 * @param {Date|string} date - 日期对象或日期字符串
 * @param {string} format - 格式类型：'full' | 'date' | 'datetime'
 * @returns {string} 格式化的日期时间字符串
 */
export function formatDateTime(date, format = 'datetime') {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'full':
      return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    case 'date':
      return `${year}-${month}-${day}`;
    case 'datetime':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}

/**
 * 计算两个日期之间的天数差
 * @param {Date|string} date1 - 日期1
 * @param {Date|string} date2 - 日期2
 * @returns {number} 天数差
 */
export function getDaysDiff(date1, date2) {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = d1.getTime() - d2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 判断日期是否过期
 * @param {Date|string} date - 要检查的日期
 * @returns {boolean} 是否过期
 */
export function isExpired(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < getBeijingTime();
}

/**
 * 添加天数到日期
 * @param {Date|string} date - 原始日期
 * @param {number} days - 要添加的天数
 * @returns {Date} 新的日期对象
 */
export function addDays(date, days) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 获取周数 (ISO 8601)
 * @param {Date} date - 日期对象
 * @returns {number} 周数
 */
export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * 获取一周的开始日期
 * @param {Date} date - 日期对象
 * @returns {Date} 周一的日期
 */
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * 获取一周的结束日期
 * @param {Date} date - 日期对象
 * @returns {Date} 周日的日期
 */
export function getWeekEnd(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(d.setDate(diff));
}