import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 北京时间工具函数
export function getBeijingTime() {
  const now = new Date();
  // 获取 UTC 时间戳并转换为北京时间（UTC+8）
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const beijingTime = new Date(utcTime + 8 * 60 * 60 * 1000);
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

// 格式化积分：整数显示整数，小数最多显示两位
export function formatPoints(points) {
  if (points === undefined || points === null || isNaN(points)) return '0';
  const num = Number(points);
  const rounded = Math.round(num * 100) / 100;
  // 如果小数部分为0，显示整数；否则最多显示两位小数
  return rounded === Math.floor(rounded) ? String(Math.floor(rounded)) : rounded.toFixed(2);
}