// @ts-ignore;
import React from 'react';

import { PermissionProvider } from '@/components/PermissionProvider';

// 分类定义（从 TabBar.jsx 复制，保持一致性）
const CATEGORIES = [{
  id: 'student',
  label: '学生管理',
  icon: null,
  color: 'blue',
  items: [{
    id: 'students',
    label: '学生档案',
    icon: null
  }, {
    id: 'students-manage',
    label: '基础信息',
    icon: null
  }, {
    id: 'student-growth',
    label: '成长轨迹',
    icon: null
  }, {
    id: 'parent-view',
    label: '家长查看',
    icon: null
  }, {
    id: 'grades',
    label: '成绩管理',
    icon: null
  }, {
    id: 'certificates',
    label: '证书管理',
    icon: null
  }, {
    id: 'volunteer',
    label: '志愿时长',
    icon: null
  }]
}, {
  id: 'points',
  label: '积分管理',
  icon: null,
  color: 'green',
  items: [{
    id: 'points',
    label: '积分规则',
    icon: null
  }, {
    id: 'dorm-points',
    label: '宿舍积分',
    icon: null
  }, {
    id: 'exchange',
    label: '积分兑换',
    icon: null
  }, {
    id: 'points-manage',
    label: '积分管理',
    icon: null
  }, {
    id: 'exchange-admin',
    label: '兑换管理',
    icon: null
  }, {
    id: 'points-settings',
    label: '积分设置',
    icon: null
  }]
}, {
  id: 'class',
  label: '班级事务',
  icon: null,
  color: 'purple',
  items: [{
    id: 'seating-chart',
    label: '座位安排',
    icon: null
  }, {
    id: 'groups',
    label: '分组管理',
    icon: null
  }, {
    id: 'duty-roster',
    label: '值日安排',
    icon: null
  }, {
    id: 'subjects',
    label: '科目设置',
    icon: null
  }, {
    id: 'semester',
    label: '学期计划',
    icon: null
  }, {
    id: 'schedule-manage',
    label: '课程表',
    icon: null
  }]
}, {
  id: 'comprehensive',
  label: '综合管理',
  icon: null,
  color: 'orange',
  items: [{
    id: 'exam-monitor',
    label: '转段考',
    icon: null
  }, {
    id: 'ai-review',
    label: 'AI点评',
    icon: null
  }, {
    id: 'documents',
    label: '文件资料',
    icon: null
  }, {
    id: 'discipline',
    label: '违纪记录',
    icon: null
  }]
}, {
  id: 'parent',
  label: '家长端',
  icon: null,
  color: 'green',
  items: [{
    id: 'parent-view',
    label: '家长查看',
    icon: null
  }]
}, {
  id: 'system',
  label: '系统管理',
  icon: null,
  color: 'red',
  items: [{
    id: 'permission-manage',
    label: '权限管理',
    icon: null
  }]
}];

/**
 * 页面包装器组件
 * 
 * 功能：
 * - 为页面提供权限上下文
 * - 自动根据用户角色过滤可访问的页面
 * - 为 TabBar 提供分类数据
 */
export function PageWrapper({
  currentUser,
  children
}) {
  return <PermissionProvider currentUser={currentUser} categories={CATEGORIES}>
      {children}
    </PermissionProvider>;
}

/**
 * 页面权限控制 HOC
 * 用于包装需要权限控制的页面组件
 */
export function withPageAccessControl(pageId) {
  return function WrappedPage(Component) {
    return function PageWithAccessControl(props) {
      const {
        PageAccessControl
      } = require('@/components/PermissionProvider');
      return <PageAccessControl pageId={pageId}>
          <Component {...props} />
        </PageAccessControl>;
    };
  };
}