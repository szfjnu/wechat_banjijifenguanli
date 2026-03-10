import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 获取当前学期信息
 * @param {Object} tcb - 云开发实例
 * @returns {Promise<Object|null>} 当前学期对象，如果没有找到返回null
 */
export async function getCurrentSemester(tcb) {
  try {
    const db = tcb.database();
    const result = await db.collection('semester').where({
      is_current: true
    }).get();
    
    if (result.data && result.data.length > 0) {
      const semester = result.data[0];
      return {
        id: semester._id,
        name: semester.semester_name,
        semester_name: semester.semester_name,
        startDate: semester.start_date ? semester.start_date.split('T')[0] : '',
        endDate: semester.end_date ? semester.end_date.split('T')[0] : '',
        isCurrent: semester.is_current || false,
        // 宿舍积分配置
        dormConversionRatio: semester.dorm_conversion_ratio !== undefined ? semester.dorm_conversion_ratio : 0.3,
        dormCriticalThreshold: semester.dorm_critical_threshold !== undefined ? semester.dorm_critical_threshold : 40,
        dormInitialScore: semester.dorm_initial_score !== undefined ? semester.dorm_initial_score : 100,
        dormWarningThreshold: semester.dorm_warning_threshold !== undefined ? semester.dorm_warning_threshold : 60,
        initialScore: semester.initial_score !== undefined ? semester.initial_score : 100,
        isInitialized: semester.is_initialized !== undefined ? semester.is_initialized : false
      };
    }
    return null;
  } catch (error) {
    console.error('获取当前学期失败:', error);
    return null;
  }
}

/**
 * 格式化学期名称
 * @param {string} semesterName - 学期名称
 * @returns {string} 格式化后的学期名称
 */
export function formatSemesterName(semesterName) {
  if (!semesterName) return '未知学期';
  return semesterName;
}
