// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Plus, Search, Edit, Trash2, Shield, CheckCircle, XCircle, Filter, RefreshCw, UserPlus, Key } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, Badge, useToast, Alert, AlertDescription } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { usePermission } from '@/components/PermissionGuard';
// 角色定义
const ROLES = [{
  id: 'admin',
  name: '管理员',
  description: '系统管理员，拥有所有权限',
  color: 'bg-red-500'
}, {
  id: 'teacher',
  name: '教师',
  description: '教师账号，可管理学生和日常事务',
  color: 'bg-blue-500'
}, {
  id: 'parent',
  name: '家长',
  description: '家长账号，可查看子女信息',
  color: 'bg-green-500'
}, {
  id: 'student',
  name: '学生',
  description: '学生账号，查看个人信息和积分',
  color: 'bg-purple-500'
}];

// 模拟用户数据
const MOCK_USERS = [{
  id: 'user-001',
  name: '张管理员',
  username: 'admin001',
  email: 'admin001@school.edu',
  phone: '13800138001',
  role: 'admin',
  status: 'active',
  lastLogin: '2026-03-15 10:30:00',
  createdAt: '2026-01-01 09:00:00'
}, {
  id: 'user-002',
  name: '李老师',
  username: 'teacher001',
  email: 'li.teacher@school.edu',
  phone: '13900139001',
  role: 'teacher',
  status: 'active',
  lastLogin: '2026-03-15 09:15:00',
  createdAt: '2026-01-05 14:30:00'
}, {
  id: 'user-003',
  name: '王家长',
  username: 'parent001',
  email: 'wang.parent@school.edu',
  phone: '13700137001',
  role: 'parent',
  status: 'active',
  lastLogin: '2026-03-14 20:45:00',
  createdAt: '2026-02-01 11:00:00'
}, {
  id: 'user-004',
  name: '赵同学',
  username: 'student001',
  email: 'zhao.student@school.edu',
  phone: '13600136001',
  role: 'student',
  status: 'active',
  lastLogin: '2026-03-15 08:20:00',
  createdAt: '2026-02-15 16:30:00'
}, {
  id: 'user-005',
  name: '陈老师',
  username: 'teacher002',
  email: 'chen.teacher@school.edu',
  phone: '13500135001',
  role: 'teacher',
  status: 'inactive',
  lastLogin: '2026-03-10 17:30:00',
  createdAt: '2026-01-10 10:00:00'
}];
export default function UsersManagePage(props) {
  const {
    toast
  } = useToast();
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // 权限检查
  const {
    permission: canViewUsers,
    loading: loadingViewUsers
  } = usePermission($w, 'users', 'view');
  const {
    permission: canCreateUsers,
    loading: loadingCreateUsers
  } = usePermission($w, 'users', 'create');
  const {
    permission: canEditUsers,
    loading: loadingEditUsers
  } = usePermission($w, 'users', 'edit');
  const {
    permission: canDeleteUsers,
    loading: loadingDeleteUsers
  } = usePermission($w, 'users', 'delete');
  const {
    permission: canApproveUsers,
    loading: loadingApproveUsers
  } = usePermission($w, 'users', 'approve');
  const {
    permission: canResetPassword,
    loading: loadingResetPassword
  } = usePermission($w, 'users', 'reset_password');

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // 获取角色信息
  const getRoleInfo = roleId => ROLES.find(role => role.id === roleId) || ROLES[0];

  // 创建新用户
  const handleCreateUser = () => {
    if (!canCreateUsers) {
      toast({
        title: '权限不足',
        description: '您没有创建用户的权限',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: '功能开发中',
      description: '创建用户功能正在开发中'
    });
  };

  // 编辑用户
  const handleEditUser = user => {
    if (!canEditUsers) {
      toast({
        title: '权限不足',
        description: '您没有编辑用户的权限',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: '功能开发中',
      description: `编辑用户 ${user.name} 功能正在开发中`
    });
  };

  // 删除用户
  const handleDeleteUser = userId => {
    if (!canDeleteUsers) {
      toast({
        title: '权限不足',
        description: '您没有删除用户的权限',
        variant: 'destructive'
      });
      return;
    }
    if (window.confirm('确定要删除此用户吗？此操作不可撤销。')) {
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: '删除成功',
        description: '用户已成功删除'
      });
    }
  };

  // 重置密码
  const handleResetPassword = user => {
    if (!canResetPassword) {
      toast({
        title: '权限不足',
        description: '您没有重置密码的权限',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: '密码已重置',
      description: `用户 ${user.name} 的密码已重置为默认密码，请通知用户修改密码`
    });
  };

  // 切换用户状态
  const handleToggleStatus = user => {
    if (!canApproveUsers) {
      toast({
        title: '权限不足',
        description: '您没有修改用户状态的权限',
        variant: 'destructive'
      });
      return;
    }
    setUsers(users.map(u => u.id === user.id ? {
      ...u,
      status: u.status === 'active' ? 'inactive' : 'active'
    } : u));
    toast({
      title: '状态已更新',
      description: `用户 ${user.name} 的状态已更新`
    });
  };

  // 加载状态
  const isLoading = loadingViewUsers || loadingCreateUsers || loadingEditUsers || loadingDeleteUsers || loadingApproveUsers || loadingResetPassword;
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>;
  }

  // 权限检查
  if (!canViewUsers) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Alert className="max-w-md bg-red-900/50 border-red-500">
          <AlertDescription className="text-white">
            您没有访问用户管理的权限，请联系管理员
          </AlertDescription>
        </Alert>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-400" />
                用户管理
              </h1>
              <p className="text-slate-400">管理系统用户账号、角色分配和权限控制</p>
            </div>
            <div className="flex gap-3">
              {canCreateUsers && <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  添加用户
                </Button>}
              <Button variant="outline" onClick={() => window.location.reload()} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {ROLES.map(role => {
          const count = users.filter(u => u.role === role.id).length;
          return <div key={role.id} className={`${role.color} bg-opacity-20 backdrop-blur-sm rounded-xl p-6 border ${role.color.replace('bg-', 'border-')} border-opacity-30`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="text-sm text-slate-300">{role.name}</div>
                  </div>
                  <Shield className={`w-10 h-10 ${role.color} bg-opacity-30 rounded-lg p-2`} />
                </div>
              </div>;
        })}
        </div>

        {/* 筛选和搜索 */}
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="搜索用户名、邮箱..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
            </div>

            {/* 角色筛选 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">全部角色</option>
                {ROLES.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>

            {/* 状态筛选 */}
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">全部状态</option>
                <option value="active">活跃</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">用户列表</h2>
            <p className="text-slate-400 text-sm mt-1">共找到 {filteredUsers.length} 个用户</p>
          </div>

          {filteredUsers.length === 0 ? <div className="p-12 text-center">
              <div className="text-slate-400 text-lg">没有找到符合条件的用户</div>
            </div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 bg-opacity-50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      用户信息
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      最后登录
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredUsers.map(user => {
                const roleInfo = getRoleInfo(user.role);
                return <tr key={user.id} className="hover:bg-slate-700 hover:bg-opacity-30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full ${roleInfo.color} flex items-center justify-center text-white font-bold`}>
                              {user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-slate-400">{user.username}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${roleInfo.color} text-white`}>
                            {roleInfo.name}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {user.status === 'active' ? <Badge className="bg-green-600 text-white flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                活跃
                              </Badge> : <Badge className="bg-slate-600 text-white flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                禁用
                              </Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-300">{user.lastLogin}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-300">{user.createdAt}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canResetPassword && <Button size="sm" variant="ghost" onClick={() => handleResetPassword(user)} className="text-slate-400 hover:text-blue-400 hover:bg-blue-900/20">
                                <Key className="w-4 h-4" />
                              </Button>}
                            {canEditUsers && <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)} className="text-slate-400 hover:text-blue-400 hover:bg-blue-900/20">
                                <Edit className="w-4 h-4" />
                              </Button>}
                            {canApproveUsers && <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(user)} className="text-slate-400 hover:text-yellow-400 hover:bg-yellow-900/20">
                                {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </Button>}
                            {canDeleteUsers && <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id)} className="text-slate-400 hover:text-red-400 hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4" />
                              </Button>}
                          </div>
                        </td>
                      </tr>;
              })}
                </tbody>
              </table>
            </div>}
        </div>

        {/* TabBar */}
        <TabBar />
      </div>
    </div>;
}