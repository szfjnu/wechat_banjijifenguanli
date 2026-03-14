// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Alert, AlertDescription, AlertTitle } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, CheckCircle2, XCircle, RefreshCw, Users, Shield } from 'lucide-react';

import { TabBar } from '@/components/TabBar';

/**
 * 权限审计页面
 * 检查系统权限配置和页面使用的一致性
 */
export default function PermissionAuditPage(props) {
  const [loading, setLoading] = useState(true);
  const [auditResults, setAuditResults] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    warnings: 0,
    details: []
  });
  const [permissionConfig, setPermissionConfig] = useState(null);
  const [pagePermissions, setPagePermissions] = useState([]);
  const [currentRole, setCurrentRole] = useState('admin');

  // 定义所有页面及其使用的权限模块
  const pageModuleMapping = [{
    page: 'users-manage.jsx',
    module: 'users',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'classes-manage.jsx',
    module: 'classes',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'system-config.jsx',
    module: 'system',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'students-manage.jsx',
    module: 'students',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'points-manage.jsx',
    module: 'points',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'points-settings.jsx',
    module: 'points_settings',
    operations: ['view']
  }, {
    page: 'dorm-points.jsx',
    module: 'dorm_points',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'points.jsx',
    module: 'points',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'discipline.jsx',
    module: 'discipline',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'discipline-progress.jsx',
    module: 'discipline_progress',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'discipline-revocation.jsx',
    module: 'discipline_revocation',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'discipline-level-config.jsx',
    module: 'discipline_level_config',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'certificates.jsx',
    module: 'certificates',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'grades.jsx',
    module: 'grades',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'groups.jsx',
    module: 'groups',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'seating-chart.jsx',
    module: 'seating_chart',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'volunteer.jsx',
    module: 'volunteer',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'revocation-volunteer.jsx',
    module: 'revocation_volunteer',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'exchange.jsx',
    module: 'exchange',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'exchange-admin.jsx',
    module: 'exchange_admin',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'documents.jsx',
    module: 'documents',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'ai-review.jsx',
    module: 'ai_review',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'semester.jsx',
    module: 'semester',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'exam-monitor.jsx',
    module: 'exam_monitor',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'duty-roster.jsx',
    module: 'duty_roster',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'subjects.jsx',
    module: 'subjects',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'schedule-manage.jsx',
    module: 'schedule_manage',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'student-growth.jsx',
    module: 'student_growth',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'parent-view.jsx',
    module: 'parent_view',
    operations: ['view']
  }, {
    page: 'notice-publish.jsx',
    module: 'notice_publish',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }, {
    page: 'thought-report.jsx',
    module: 'thought_report',
    operations: ['view', 'create', 'edit', 'delete', 'approve', 'reject']
  }];

  // 定义所有角色
  const roles = [{
    id: 'admin',
    name: '系统管理员',
    icon: Shield
  }, {
    id: 'homeroom_teacher',
    name: '班主任',
    icon: Users
  }, {
    id: 'class_teacher',
    name: '教师',
    icon: Users
  }, {
    id: 'student',
    name: '学生',
    icon: Users
  }, {
    id: 'student_committee',
    name: '学生（班委）',
    icon: Users
  }, {
    id: 'parent',
    name: '家长',
    icon: Users
  }];

  // 加载权限配置数据
  useEffect(() => {
    loadPermissionConfig();
  }, []);

  // 执行权限审计
  useEffect(() => {
    if (permissionConfig) {
      runAudit();
    }
  }, [permissionConfig, currentRole]);
  const loadPermissionConfig = async () => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('role_permission').get();
      setPermissionConfig(result.data);
      setLoading(false);
    } catch (error) {
      console.error('加载权限配置失败:', error);
      setLoading(false);
    }
  };
  const runAudit = () => {
    const results = [];
    let validCount = 0;
    let invalidCount = 0;
    let warningCount = 0;

    // 获取当前角色的权限配置
    const currentRoleConfig = permissionConfig.find(role => role.role_id === currentRole);
    const rolePermissions = currentRoleConfig ? currentRoleConfig.permissions : [];
    const roleModuleMap = new Map(rolePermissions.map(p => [p.module, p.operations]));
    pageModuleMapping.forEach(({
      page,
      module,
      operations
    }) => {
      const moduleExistsInConfig = roleModuleMap.has(module);
      const moduleOperations = roleModuleMap.get(module) || [];
      const missingOperations = operations.filter(op => !moduleOperations.includes(op));
      const extraOperations = moduleOperations.filter(op => !operations.includes(op));
      let status = 'valid';
      let issues = [];
      if (!moduleExistsInConfig) {
        status = 'error';
        issues.push('模块未在权限配置中定义');
      } else if (missingOperations.length > 0) {
        status = 'warning';
        issues.push(`缺少操作: ${missingOperations.join(', ')}`);
      } else if (extraOperations.length > 0) {
        status = 'warning';
        issues.push(`多余操作: ${extraOperations.join(', ')}`);
      }
      results.push({
        page,
        module,
        operations,
        status,
        issues,
        rolePermissions: moduleExistsInConfig ? moduleOperations : []
      });
      if (status === 'valid') validCount++;else if (status === 'error') invalidCount++;else warningCount++;
    });
    setAuditResults({
      total: results.length,
      valid: validCount,
      invalid: invalidCount,
      warnings: warningCount,
      details: results
    });
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> 正常</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><AlertCircle className="w-3 h-3 mr-1" /> 警告</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> 错误</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 顶部导航栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">权限审计</h1>
                <p className="text-xs text-slate-500">权限配置一致性检查</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select value={currentRole} onChange={e => setCurrentRole(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
              <button onClick={runAudit} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
                刷新
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">总页面数</p>
                <p className="text-3xl font-bold">{auditResults.total}</p>
              </div>
              <Users className="w-10 h-10 opacity-50" />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">正常</p>
                <p className="text-3xl font-bold">{auditResults.valid}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 opacity-50" />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">警告</p>
                <p className="text-3xl font-bold">{auditResults.warnings}</p>
              </div>
              <AlertCircle className="w-10 h-10 opacity-50" />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">错误</p>
                <p className="text-3xl font-bold">{auditResults.invalid}</p>
              </div>
              <XCircle className="w-10 h-10 opacity-50" />
            </div>
          </Card>
        </div>

        {/* 审计结果表格 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">审计详情</h2>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>当前角色: </span>
              <Badge variant="outline">
                {roles.find(r => r.id === currentRole)?.name}
              </Badge>
            </div>
          </div>

          {loading ? <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>页面</TableHead>
                    <TableHead>模块</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>权限操作</TableHead>
                    <TableHead>问题说明</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditResults.details.map((item, index) => <TableRow key={index}>
                      <TableCell className="font-medium">{item.page}</TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm">{item.module}</code>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.operations.map((op, i) => <Badge key={i} variant="secondary" className="text-xs">{op}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.issues.length > 0 ? <div className="space-y-1">
                            {item.issues.map((issue, i) => <div key={i} className="text-sm text-red-600">• {issue}</div>)}
                          </div> : <span className="text-sm text-slate-500">无</span>}
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>}
        </Card>

        {/* 权限配置说明 */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">权限配置说明</h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">正常</p>
                <p>页面使用的模块和操作与权限配置完全匹配</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">警告</p>
                <p>页面使用的模块存在，但操作不匹配（缺少或多余）</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">错误</p>
                <p>页面使用的模块在权限配置中不存在</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 底部导航栏 */}
      <TabBar />
    </div>;
}