// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Lock, ShieldX } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

/**
 * 权限检查Hook
 * 检查当前用户是否具有指定模块和操作的权限
 * @param {Object} $w - 页面props中的$w对象
 * @param {string} moduleId - 模块ID
 * @param {string} operation - 操作类型（view, create, edit, delete, approve, reject）
 * @returns {boolean} 是否有权限
 */
export function usePermission($w, moduleId, operation) {
  const [permission, setPermission] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const {
    toast
  } = useToast();
  React.useEffect(() => {
    checkPermission();
  }, [$w, moduleId, operation]);
  const checkPermission = async () => {
    try {
      setLoading(true);

      // 获取当前用户信息
      const currentUser = $w.auth.currentUser;
      if (!currentUser || !currentUser.type) {
        setPermission(false);
        setLoading(false);
        return;
      }

      // 根据用户类型获取角色ID映射
      const roleMap = {
        'admin': 'admin',
        'homeroom_teacher': 'homeroom_teacher',
        'class_teacher': 'class_teacher',
        'student': 'student',
        'student_committee': 'student_committee',
        'parent': 'parent'
      };
      const roleId = roleMap[currentUser.type] || 'student';

      // 查询角色权限
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const _ = db.command;
      const result = await db.collection('role_permission').where({
        role_id: roleId
      }).get();
      if (result.data.length === 0) {
        setPermission(false);
        setLoading(false);
        return;
      }
      const roleData = result.data[0];
      const permissions = roleData.permissions || [];

      // 查找指定模块的权限
      const modulePermission = permissions.find(p => p.module === moduleId);
      if (!modulePermission) {
        setPermission(false);
        setLoading(false);
        return;
      }

      // 检查是否有指定操作的权限
      const hasPermission = modulePermission.operations.includes(operation);
      setPermission(hasPermission);
    } catch (error) {
      console.error('权限检查失败:', error);
      setPermission(false);
    } finally {
      setLoading(false);
    }
  };
  return {
    permission,
    loading
  };
}

/**
 * 权限检查高阶组件
 * 如果没有权限，显示权限不足提示
 */
export function PermissionGuard({
  $w,
  moduleId,
  operation,
  children,
  fallback
}) {
  const {
    permission,
    loading
  } = usePermission($w, moduleId, operation);
  if (loading) {
    return <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">权限检查中...</div>
      </div>;
  }
  if (!permission) {
    if (fallback) {
      return fallback;
    }
    return <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-8">
        <ShieldX className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">权限不足</h3>
        <p className="text-gray-500 text-center max-w-md">
          您当前没有访问该功能的权限。如需帮助，请联系系统管理员。
        </p>
      </div>;
  }
  return <>{children}</>;
}

/**
 * 根据权限条件渲染内容
 * @param {Object} $w - 页面props中的$w对象
 * @param {string} moduleId - 模块ID
 * @param {string} operation - 操作类型
 * @param {React.ReactNode} children - 有权限时显示的内容
 * @param {React.ReactNode} fallback - 无权限时显示的内容（可选）
 */
export function ConditionalRender({
  $w,
  moduleId,
  operation,
  children,
  fallback = null
}) {
  const {
    permission,
    loading
  } = usePermission($w, moduleId, operation);
  if (loading) {
    return null;
  }
  return permission ? children : fallback;
}