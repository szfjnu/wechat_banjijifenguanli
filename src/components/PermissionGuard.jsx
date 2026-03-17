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

      // 获取当前用户信息（优先从 $w.auth.currentUser，如果为空则从 localStorage 读取）
      let currentUser = $w.auth.currentUser;
      if (!currentUser || !currentUser.type) {
        try {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            currentUser = JSON.parse(storedUser);
          }
        } catch (err) {
          console.error('从 localStorage 读取用户信息失败:', err);
        }
      }
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
 * 获取用户数据范围Hook
 * 返回用户的数据访问范围：all（所有数据）、class（本班级数据）、self（仅个人数据）
 * @param {Object} $w - 页面props中的$w对象
 * @returns {string} 数据范围
 */
export function useDataScope($w) {
  const [dataScope, setDataScope] = React.useState('self');
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetchDataScope();
  }, [$w]);
  const fetchDataScope = async () => {
    try {
      setLoading(true);

      // 获取当前用户信息（优先从 $w.auth.currentUser，如果为空则从 localStorage 读取）
      let currentUser = $w.auth.currentUser;
      if (!currentUser || !currentUser.type) {
        try {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            currentUser = JSON.parse(storedUser);
          }
        } catch (err) {
          console.error('从 localStorage 读取用户信息失败:', err);
        }
      }
      if (!currentUser || !currentUser.type) {
        setDataScope('self');
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

      // 查询角色数据范围
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('role_permission').where({
        role_id: roleId
      }).get();
      if (result.data.length > 0) {
        const roleData = result.data[0];
        setDataScope(roleData.data_scope || 'self');
      } else {
        setDataScope('self');
      }
    } catch (error) {
      console.error('获取数据范围失败:', error);
      setDataScope('self');
    } finally {
      setLoading(false);
    }
  };
  return {
    dataScope,
    loading,
    canViewAll: dataScope === 'all',
    canViewClass: dataScope === 'class' || dataScope === 'all',
    canViewSelf: dataScope === 'self' || dataScope === 'class' || dataScope === 'all'
  };
}

/**
 * 判断是否显示批量操作按钮
 * 如果数据权限为 'self'，则隐藏批量操作按钮
 * @param {Object} $w - 页面props中的$w对象
 * @returns {boolean} 是否显示批量操作按钮
 */
export function useBatchOperations($w) {
  const {
    dataScope
  } = useDataScope($w);
  const [canBatchOperate, setCanBatchOperate] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    // 只有数据权限为 'all' 或 'class' 时，才允许批量操作
    setCanBatchOperate(dataScope === 'all' || dataScope === 'class');
    setLoading(false);
  }, [dataScope]);
  return {
    canBatchOperate,
    loading,
    reason: dataScope === 'self' ? '您只能管理自己的数据，无法进行批量操作' : ''
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

/**
 * 批量操作权限保护组件
 * 如果用户数据权限为 'self'，则显示提示信息，隐藏批量操作按钮
 * @param {Object} $w - 页面props中的$w对象
 * @param {React.ReactNode} children - 有批量操作权限时显示的内容
 * @param {React.ReactNode} fallback - 无批量操作权限时显示的内容（可选）
 */
export function BatchOperationGuard({
  $w,
  children,
  fallback = null
}) {
  const {
    canBatchOperate,
    loading,
    reason
  } = useBatchOperations($w);
  if (loading) {
    return <div className="flex items-center justify-center min-h-[40px]">
        <div className="text-gray-500 text-sm">权限检查中...</div>
      </div>;
  }
  if (!canBatchOperate) {
    if (fallback) {
      return fallback;
    }
    return <div className="flex items-center justify-center min-h-[60px] bg-blue-50 border border-blue-200 rounded-lg p-4">
        <Lock className="w-5 h-5 text-blue-500 mr-2" />
        <p className="text-blue-700 text-sm">{reason}</p>
      </div>;
  }
  return <>{children}</>;
}

/**
 * 数据范围过滤Hook
 * 根据用户的数据范围，生成数据查询条件
 * @param {Object} $w - 页面props中的$w对象
 * @param {string} collectionName - 数据集名称
 * @param {Object} baseQuery - 基础查询条件
 * @returns {Object} 查询条件对象
 */
export function useDataScopeFilter($w, collectionName, baseQuery = {}) {
  const {
    dataScope
  } = useDataScope($w);
  const [filterQuery, setFilterQuery] = React.useState(baseQuery);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    applyDataScopeFilter();
  }, [dataScope, baseQuery, $w]);
  const applyDataScopeFilter = async () => {
    try {
      setLoading(true);
      const currentUser = $w.auth.currentUser;
      if (!currentUser) {
        setFilterQuery(baseQuery);
        return;
      }
      const query = {
        ...baseQuery
      };

      // 根据数据范围添加过滤条件
      if (dataScope === 'self') {
        // 只能查看自己的数据
        // 假设数据集中有 user_id 或 student_id 字段
        if (currentUser.userId) {
          query.user_id = currentUser.userId;
        }
      } else if (dataScope === 'class') {
        // 可以查看本班级的数据
        // 假设用户有 classId 信息
        if (currentUser.classId) {
          query.class_id = currentUser.classId;
        }
      }
      // dataScope === 'all' 时，不需要额外的过滤条件

      setFilterQuery(query);
    } catch (error) {
      console.error('应用数据范围过滤失败:', error);
      setFilterQuery(baseQuery);
    } finally {
      setLoading(false);
    }
  };
  return {
    filterQuery,
    loading,
    dataScope
  };
}