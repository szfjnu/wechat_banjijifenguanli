// @ts-ignore;
import React, { createContext, useContext, useState, useEffect } from 'react';
// @ts-ignore;
import { toast } from '@/components/ui';

import { ROLES, hasPermission, hasAnyPermission, canAccessPage, getAccessiblePages } from '@/lib/permissions';
// 权限上下文
// 创建默认上下文值，避免在没有 Provider 时 useContext 报错
const defaultPermissionContext = {
  userRole: ROLES.ADMIN,
  userPermissions: [],
  accessiblePages: [],
  isLoading: false,
  checkPageAccess: () => true,
  checkPermission: () => true,
  handlePermissionDenied: () => {}
};
const PermissionContext = createContext(defaultPermissionContext);

/**
 * 权限提供者组件
 * 
 * 功能：
 * - 管理用户角色和权限
 * - 提供权限检查方法
 * - 过滤用户可访问的页面
 * - 处理权限不足的情况
 */
export function PermissionProvider({
  children,
  currentUser,
  categories
}) {
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [accessiblePages, setAccessiblePages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从用户信息中获取角色
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        setIsLoading(true);

        // 如果用户未登录，设置为 null
        if (!currentUser || !currentUser.userId) {
          setUserRole(null);
          setUserPermissions([]);
          setAccessiblePages([]);
          return;
        }

        // 从用户 type 字段获取角色
        let role = currentUser.type;

        // 如果 type 不在预定义角色中，根据用户类型判断
        if (!Object.values(ROLES).includes(role)) {
          if (role === 'teacher' || role === 'admin') {
            role = ROLES.TEACHER;
          } else if (role === 'parent') {
            role = ROLES.PARENT;
          } else if (role === 'student') {
            role = ROLES.STUDENT;
          } else {
            role = ROLES.TEACHER; // 默认为教师
          }
        }
        setUserRole(role);

        // 获取用户可访问的页面
        if (categories) {
          const pages = getAccessiblePages(role, categories);
          setAccessiblePages(pages);
        }
      } catch (error) {
        console.error('加载用户权限失败:', error);
        toast({
          title: '加载权限失败',
          description: error.message,
          variant: 'destructive'
        });
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserRole();
  }, [currentUser, categories]);

  /**
   * 检查用户是否具有指定权限
   */
  const checkPermission = permission => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  /**
   * 检查用户是否具有多个权限中的任意一个
   */
  const checkAnyPermission = permissions => {
    if (!userRole) return false;
    return hasAnyPermission(userRole, permissions);
  };

  /**
   * 检查用户是否可以访问指定页面
   */
  const checkPageAccess = pageId => {
    if (!userRole) return false;
    return canAccessPage(userRole, pageId);
  };

  /**
   * 处理权限不足的情况
   */
  const handlePermissionDenied = (message = '您没有权限执行此操作') => {
    toast({
      title: '权限不足',
      description: message,
      variant: 'destructive'
    });
  };
  const value = {
    userRole,
    userPermissions,
    accessiblePages,
    isLoading,
    checkPermission,
    checkAnyPermission,
    checkPageAccess,
    handlePermissionDenied,
    hasPermission: checkPermission,
    canAccessPage: checkPageAccess
  };
  return <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>;
}

/**
 * 使用权限上下文的 Hook
 */
export function usePermission() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission 必须在 PermissionProvider 内部使用');
  }
  return context;
}

/**
 * 权限保护组件
 * 用于包装需要权限的内容
 */
export function RequirePermission({
  permission,
  fallback = null,
  children
}) {
  const {
    checkPermission,
    handlePermissionDenied
  } = usePermission();
  const hasAccess = checkPermission(permission);
  useEffect(() => {
    if (!hasAccess && !fallback) {
      handlePermissionDenied('您没有权限访问此内容');
    }
  }, [hasAccess, fallback, handlePermissionDenied]);
  if (!hasAccess) {
    return fallback || null;
  }
  return children;
}

/**
 * 页面访问控制组件
 * 用于包装整个页面，检查页面访问权限
 */
export function PageAccessControl({
  pageId,
  fallback = null,
  children
}) {
  const {
    checkPageAccess,
    handlePermissionDenied,
    isLoading
  } = usePermission();
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>;
  }
  const hasAccess = checkPageAccess(pageId);
  useEffect(() => {
    if (!hasAccess && !fallback) {
      handlePermissionDenied(`您没有权限访问此页面`);
    }
  }, [hasAccess, fallback, handlePermissionDenied]);
  if (!hasAccess) {
    return fallback || <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">权限不足</h2>
          <p className="text-gray-600">您没有权限访问此页面，请联系管理员获取权限。</p>
        </div>
      </div>;
  }
  return children;
}

/**
 * 角色检查组件
 * 用于包装需要特定角色的内容
 */
export function RequireRole({
  roles,
  fallback = null,
  children
}) {
  const {
    userRole,
    handlePermissionDenied
  } = usePermission();
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const hasRole = roleArray.includes(userRole);
  useEffect(() => {
    if (!hasRole && !fallback) {
      handlePermissionDenied('您的角色没有权限访问此内容');
    }
  }, [hasRole, fallback, handlePermissionDenied]);
  if (!hasRole) {
    return fallback || null;
  }
  return children;
}