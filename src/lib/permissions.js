// 权限配置系统

/**
 * 角色定义
 */
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student'
};

/**
 * 权限分类
 */
export const PERMISSIONS = {
  // 学生管理权限
  STUDENT_VIEW: 'student:view',
  STUDENT_EDIT: 'student:edit',
  STUDENT_DELETE: 'student:delete',
  GRADE_VIEW: 'grade:view',
  GRADE_EDIT: 'grade:edit',
  CERTIFICATE_VIEW: 'certificate:view',
  CERTIFICATE_EDIT: 'certificate:edit',
  VOLUNTEER_VIEW: 'volunteer:view',
  VOLUNTEER_EDIT: 'volunteer:edit',
  GROWTH_VIEW: 'growth:view',
  GROWTH_EXPORT: 'growth:export',
  
  // 积分管理权限
  POINT_VIEW: 'point:view',
  POINT_ADD: 'point:add',
  POINT_EDIT: 'point:edit',
  POINT_DELETE: 'point:delete',
  POINT_SETTINGS: 'point:settings',
  DORM_POINT_MANAGE: 'dorm_point:manage',
  EXCHANGE_VIEW: 'exchange:view',
  EXCHANGE_MANAGE: 'exchange:manage',
  
  // 班级事务权限
  SEATING_MANAGE: 'seating:manage',
  GROUP_MANAGE: 'group:manage',
  DUTY_MANAGE: 'duty:manage',
  SUBJECT_MANAGE: 'subject:manage',
  SEMESTER_MANAGE: 'semester:manage',
  SCHEDULE_VIEW: 'schedule:view',
  SCHEDULE_MANAGE: 'schedule:manage',
  
  // 综合管理权限
  EXAM_MONITOR: 'exam:monitor',
  AI_REVIEW: 'ai:review',
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_MANAGE: 'document:manage',
  DISCIPLINE_VIEW: 'discipline:view',
  DISCIPLINE_MANAGE: 'discipline:manage',
  
  // 家长端权限
  PARENT_VIEW: 'parent:view',
  PARENT_CHILDREN: 'parent:children'
};

/**
 * 角色权限映射
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // 学生管理
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.STUDENT_EDIT,
    PERMISSIONS.STUDENT_DELETE,
    PERMISSIONS.GRADE_VIEW,
    PERMISSIONS.GRADE_EDIT,
    PERMISSIONS.CERTIFICATE_VIEW,
    PERMISSIONS.CERTIFICATE_EDIT,
    PERMISSIONS.VOLUNTEER_VIEW,
    PERMISSIONS.VOLUNTEER_EDIT,
    PERMISSIONS.GROWTH_VIEW,
    PERMISSIONS.GROWTH_EXPORT,
    // 积分管理
    PERMISSIONS.POINT_VIEW,
    PERMISSIONS.POINT_ADD,
    PERMISSIONS.POINT_EDIT,
    PERMISSIONS.POINT_DELETE,
    PERMISSIONS.POINT_SETTINGS,
    PERMISSIONS.DORM_POINT_MANAGE,
    PERMISSIONS.EXCHANGE_VIEW,
    PERMISSIONS.EXCHANGE_MANAGE,
    // 班级事务
    PERMISSIONS.SEATING_MANAGE,
    PERMISSIONS.GROUP_MANAGE,
    PERMISSIONS.DUTY_MANAGE,
    PERMISSIONS.SUBJECT_MANAGE,
    PERMISSIONS.SEMESTER_MANAGE,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_MANAGE,
    // 综合管理
    PERMISSIONS.EXAM_MONITOR,
    PERMISSIONS.AI_REVIEW,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_MANAGE,
    PERMISSIONS.DISCIPLINE_VIEW,
    PERMISSIONS.DISCIPLINE_MANAGE,
    // 家长端
    PERMISSIONS.PARENT_VIEW,
    PERMISSIONS.PARENT_CHILDREN
  ],
  
  [ROLES.TEACHER]: [
    // 学生管理
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.GRADE_VIEW,
    PERMISSIONS.GRADE_EDIT,
    PERMISSIONS.CERTIFICATE_VIEW,
    PERMISSIONS.VOLUNTEER_VIEW,
    PERMISSIONS.GROWTH_VIEW,
    PERMISSIONS.GROWTH_EXPORT,
    // 积分管理
    PERMISSIONS.POINT_VIEW,
    PERMISSIONS.POINT_ADD,
    PERMISSIONS.EXCHANGE_VIEW,
    // 班级事务
    PERMISSIONS.SEATING_MANAGE,
    PERMISSIONS.GROUP_MANAGE,
    PERMISSIONS.DUTY_MANAGE,
    PERMISSIONS.SCHEDULE_VIEW,
    // 综合管理
    PERMISSIONS.EXAM_MONITOR,
    PERMISSIONS.AI_REVIEW,
    PERMISSIONS.DOCUMENT_VIEW
  ],
  
  [ROLES.PARENT]: [
    // 家长端
    PERMISSIONS.PARENT_VIEW,
    PERMISSIONS.PARENT_CHILDREN,
    // 查看权限
    PERMISSIONS.GROWTH_VIEW,
    PERMISSIONS.GRADE_VIEW,
    PERMISSIONS.CERTIFICATE_VIEW,
    PERMISSIONS.VOLUNTEER_VIEW
  ],
  
  [ROLES.STUDENT]: [
    // 学生只能查看自己的信息
    PERMISSIONS.GROWTH_VIEW,
    PERMISSIONS.GRADE_VIEW,
    PERMISSIONS.CERTIFICATE_VIEW,
    PERMISSIONS.VOLUNTEER_VIEW,
    PERMISSIONS.EXCHANGE_VIEW
  ]
};

/**
 * 页面权限映射
 */
export const PAGE_PERMISSIONS = {
  'students': [PERMISSIONS.STUDENT_VIEW],
  'students-manage': [PERMISSIONS.STUDENT_VIEW, PERMISSIONS.STUDENT_EDIT],
  'student-growth': [PERMISSIONS.GROWTH_VIEW],
  'parent-view': [PERMISSIONS.PARENT_VIEW],
  'grades': [PERMISSIONS.GRADE_VIEW],
  'certificates': [PERMISSIONS.CERTIFICATE_VIEW],
  'volunteer': [PERMISSIONS.VOLUNTEER_VIEW],
  'points': [PERMISSIONS.POINT_VIEW],
  'dorm-points': [PERMISSIONS.DORM_POINT_MANAGE],
  'exchange': [PERMISSIONS.EXCHANGE_VIEW],
  'points-manage': [PERMISSIONS.POINT_VIEW, PERMISSIONS.POINT_ADD, PERMISSIONS.POINT_EDIT],
  'exchange-admin': [PERMISSIONS.EXCHANGE_MANAGE],
  'points-settings': [PERMISSIONS.POINT_SETTINGS],
  'seating-chart': [PERMISSIONS.SEATING_MANAGE],
  'groups': [PERMISSIONS.GROUP_MANAGE],
  'duty-roster': [PERMISSIONS.DUTY_MANAGE],
  'subjects': [PERMISSIONS.SUBJECT_MANAGE],
  'semester': [PERMISSIONS.SEMESTER_MANAGE],
  'schedule-manage': [PERMISSIONS.SCHEDULE_VIEW],
  'exam-monitor': [PERMISSIONS.EXAM_MONITOR],
  'ai-review': [PERMISSIONS.AI_REVIEW],
  'documents': [PERMISSIONS.DOCUMENT_VIEW],
  'discipline': [PERMISSIONS.DISCIPLINE_VIEW]
};

/**
 * 检查用户是否具有指定权限
 * @param {string} role - 用户角色
 * @param {string} permission - 需要的权限
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * 检查用户是否具有多个权限中的任意一个
 * @param {string} role - 用户角色
 * @param {string[]} permissions - 需要的权限列表
 * @returns {boolean}
 */
export function hasAnyPermission(role, permissions) {
  if (!role || !permissions || permissions.length === 0) return false;
  const userPermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some(perm => userPermissions.includes(perm));
}

/**
 * 检查用户是否具有所有权限
 * @param {string} role - 用户角色
 * @param {string[]} permissions - 需要的权限列表
 * @returns {boolean}
 */
export function hasAllPermissions(role, permissions) {
  if (!role || !permissions || permissions.length === 0) return false;
  const userPermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.every(perm => userPermissions.includes(perm));
}

/**
 * 检查用户是否可以访问指定页面
 * @param {string} role - 用户角色
 * @param {string} pageId - 页面ID
 * @returns {boolean}
 */
export function canAccessPage(role, pageId) {
  if (!role || !pageId) return false;
  const requiredPermissions = PAGE_PERMISSIONS[pageId] || [];
  return hasAnyPermission(role, requiredPermissions);
}

/**
 * 获取用户可访问的页面列表
 * @param {string} role - 用户角色
 * @param {Array} categories - 页面分类列表
 * @returns {Array}
 */
export function getAccessiblePages(role, categories) {
  if (!role || !categories) return [];
  
  return categories.map(category => ({
    ...category,
    items: (category.items || []).filter(item => canAccessPage(role, item.id))
  })).filter(category => category.items.length > 0);
}

/**
 * 获取用户角色名称
 * @param {string} role - 角色代码
 * @returns {string}
 */
export function getRoleName(role) {
  const names = {
    [ROLES.ADMIN]: '管理员',
    [ROLES.TEACHER]: '教师',
    [ROLES.PARENT]: '家长',
    [ROLES.STUDENT]: '学生'
  };
  return names[role] || '未知';
}

/**
 * 获取角色颜色
 * @param {string} role - 角色代码
 * @returns {string}
 */
export function getRoleColor(role) {
  const colors = {
    [ROLES.ADMIN]: 'bg-red-500',
    [ROLES.TEACHER]: 'bg-blue-500',
    [ROLES.PARENT]: 'bg-green-500',
    [ROLES.STUDENT]: 'bg-purple-500'
  };
  return colors[role] || 'bg-gray-500';
}
