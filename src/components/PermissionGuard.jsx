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

/**
 * 数据级权限过滤工具
 * 根据用户角色过滤数据，实现数据隔离
 * @param {Object} $w - 页面props中的$w对象
 * @param {Array} data - 原始数据数组
 * @param {string} dataType - 数据类型（students, grades, points等）
 * @returns {Object} { filteredData: 过滤后的数据, filterInfo: 过滤信息 }
 */
export function useDataFilter($w, data, dataType) {
  const [filteredData, setFilteredData] = React.useState(data || []);
  const [filterInfo, setFilterInfo] = React.useState('');
  React.useEffect(() => {
    filterDataByRole();
  }, [$w, data, dataType]);
  const filterDataByRole = () => {
    const currentUser = $w.auth.currentUser;
    if (!currentUser || !data || !Array.isArray(data)) {
      setFilteredData(data || []);
      setFilterInfo('');
      return;
    }
    const userType = currentUser.type || currentUser.nickName || '学生';
    const userName = currentUser.name || '';
    let filtered = [...data];
    let info = '';
    if (dataType === 'students') {
      if (userType === '学生') {
        // 学生只能看到自己的数据
        filtered = data.filter(item => item.name === userName);
        info = `显示您的个人数据（共${filtered.length}条）`;
      } else if (userType === '家长') {
        // 家长只能看到自己孩子的数据（根据 name 或 parent_phone_number 匹配）
        filtered = data.filter(item => {
          // 如果数据中有 parent_phone_number 字段，根据家长的电话匹配
          if (item.parent_phone_number) {
            return item.parent_phone_number === currentUser.userId; // 假设 userId 是电话
          }
          // 如果没有，暂不过滤（显示所有，实际应该有家长-学生关联表）
          return true;
        });
        if (filtered.length === data.length) {
          info = '显示所有学生数据（暂无家长-学生关联，请联系管理员）';
        } else {
          info = `显示您孩子的数据（共${filtered.length}条）`;
        }
      } else if (userType === '班主任' || userType === 'homeroom_teacher') {
        // 班主任只能看到本班学生（根据 class 字段匹配）
        // 由于 students 数据模型没有 class 字段，暂时显示所有数据
        // 实际应该从班级管理获取班主任管理的班级列表，然后过滤
        info = '显示所有学生数据（暂无班主任-班级关联，请联系管理员）';
      } else if (userType === '教师' || userType === 'class_teacher') {
        // 教师可以看到所有学生数据（用于成绩录入等）
        info = '显示所有学生数据';
      } else if (userType === 'admin') {
        // 管理员可以看到所有数据
        info = '显示所有学生数据';
      } else if (userType === '学生（班委）' || userType === 'student_committee') {
        // 学生班委可以看到所有学生数据
        info = '显示所有学生数据';
      } else {
        // 默认只看自己的数据
        filtered = data.filter(item => item.name === userName);
        info = `显示您的个人数据（共${filtered.length}条）`;
      }
    } else if (dataType === 'grades') {
      if (userType === '学生') {
        // 学生只能看到自己的成绩
        filtered = data.filter(item => item.student_name === userName);
        info = `显示您的成绩（共${filtered.length}条）`;
      } else if (userType === '家长') {
        // 家长只能看到自己孩子的成绩
        filtered = data.filter(item => {
          // 根据 student_name 或关联表匹配
          return true; // 暂不过滤
        });
        info = '显示所有成绩数据（暂无家长-学生关联，请联系管理员）';
      } else {
        // 其他角色可以看到所有成绩
        info = '显示所有成绩数据';
      }
    } else if (dataType === 'points') {
      if (userType === '学生') {
        // 学生只能看到自己的积分记录
        filtered = data.filter(item => item.student_name === userName);
        info = `显示您的积分记录（共${filtered.length}条）`;
      } else if (userType === '家长') {
        // 家长只能看到自己孩子的积分记录
        filtered = data.filter(item => {
          return true; // 暂不过滤
        });
        info = '显示所有积分记录（暂无家长-学生关联，请联系管理员）';
      } else {
        // 其他角色可以看到所有积分记录
        info = '显示所有积分记录';
      }
    } else {
      // 其他数据类型默认不过滤
      info = '显示所有数据';
    }
    setFilteredData(filtered);
    setFilterInfo(info);
  };
  return {
    filteredData,
    filterInfo
  };
}