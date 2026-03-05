// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Shield, ShieldCheck, ShieldAlert, Users, ChevronRight, ChevronDown, Search, Filter, MoreHorizontal, Edit, Trash2, UserPlus } from 'lucide-react';
// @ts-ignore;
import { toast, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

import { usePermission } from '@/components/PermissionProvider';
import { ROLES, ROLE_PERMISSIONS, PERMISSIONS, getRoleName, getRoleColor } from '@/lib/permissions';
/**
 * 权限管理页面
 * 
 * 功能：
 * - 查看所有用户及其角色
 * - 查看角色权限配置
 * - 编辑用户角色
 * - 权限配置可视化
 */
export default function PermissionManage({
  className,
  style,
  $w
}) {
  const {
    userRole,
    checkPermission
  } = usePermission();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 查询所有用户，模拟数据（实际应该从用户表查询）
      const mockUsers = [{
        id: 1,
        name: '张老师',
        type: 'admin',
        avatar: '',
        nickName: '管理员'
      }, {
        id: 2,
        name: '李老师',
        type: 'teacher',
        avatar: '',
        nickName: '数学老师'
      }, {
        id: 3,
        name: '王老师',
        type: 'teacher',
        avatar: '',
        nickName: '语文老师'
      }, {
        id: 4,
        name: '赵妈妈',
        type: 'parent',
        avatar: '',
        nickName: '学生家长'
      }, {
        id: 5,
        name: '钱爸爸',
        type: 'parent',
        avatar: '',
        nickName: '学生家长'
      }, {
        id: 6,
        name: '孙小明',
        type: 'student',
        avatar: '',
        nickName: '学生'
      }];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      console.error('加载用户列表失败:', error);
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadUsers();
  }, []);

  // 筛选用户
  useEffect(() => {
    let result = users;

    // 角色筛选
    if (selectedRole !== 'all') {
      result = result.filter(user => user.type === selectedRole);
    }

    // 搜索筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => user.name.toLowerCase().includes(term) || user.nickName && user.nickName.toLowerCase().includes(term));
    }
    setFilteredUsers(result);
  }, [selectedRole, searchTerm, users]);

  // 获取角色权限统计
  const getPermissionStats = role => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return {
      total: permissions.length,
      student: permissions.filter(p => p.startsWith('student')).length,
      point: permissions.filter(p => p.startsWith('point') || p.startsWith('dorm') || p.includes('exchange')).length,
      class: permissions.filter(p => p.includes('seating') || p.includes('group') || p.includes('duty') || p.includes('subject') || p.includes('semester') || p.includes('schedule')).length,
      comprehensive: permissions.filter(p => p.includes('exam') || p.includes('ai') || p.includes('document') || p.includes('discipline')).length,
      parent: permissions.filter(p => p.startsWith('parent')).length
    };
  };

  // 保存用户角色修改
  const handleSaveUserRole = async () => {
    if (!editingUser || !newRole) return;
    try {
      // 实际应该调用 API 更新用户角色
      // 这里模拟更新
      setUsers(prevUsers => prevUsers.map(user => user.id === editingUser.id ? {
        ...user,
        type: newRole
      } : user));
      toast({
        title: '保存成功',
        description: `已将 ${editingUser.name} 的角色更改为 ${getRoleName(newRole)}`
      });
      setEditingUser(null);
      setNewRole('');
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 如果不是管理员，显示权限不足
  if (userRole !== ROLES.ADMIN) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ShieldAlert className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">权限不足</h2>
            <p className="text-gray-600">只有管理员才能访问权限管理页面。</p>
          </div>
        </div>
      </div>;
  }
  return <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 ${className || ''}`} style={style}>
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">权限管理</h1>
                <p className="text-gray-600 mt-1">管理系统用户和角色权限</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              添加用户
            </Button>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[{
              id: 'users',
              label: '用户管理',
              icon: Users
            }, {
              id: 'roles',
              label: '角色配置',
              icon: ShieldCheck
            }, {
              id: 'permissions',
              label: '权限详情',
              icon: Shield
            }].map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>)}
            </nav>
          </div>
        </div>

        {/* 用户管理 Tab */}
        {activeTab === 'users' && <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* 筛选和搜索 */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input placeholder="搜索用户姓名或昵称..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="teacher">教师</SelectItem>
                  <SelectItem value="parent">家长</SelectItem>
                  <SelectItem value="student">学生</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 用户列表 */}
            {isLoading ? <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">加载中...</div>
              </div> : filteredUsers.length === 0 ? <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">暂无用户数据</p>
              </div> : <div className="space-y-3">
                {filteredUsers.map(user => <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full ${getRoleColor(user.type)} flex items-center justify-center text-white font-bold`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.nickName || '无昵称'}</p>
                      </div>
                    </div>
                    
                    {editingUser?.id === user.id ? <div className="flex items-center space-x-2">
                        <Select value={newRole} onValueChange={setNewRole}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ROLES.ADMIN}>管理员</SelectItem>
                            <SelectItem value={ROLES.TEACHER}>教师</SelectItem>
                            <SelectItem value={ROLES.PARENT}>家长</SelectItem>
                            <SelectItem value={ROLES.STUDENT}>学生</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleSaveUserRole}>保存</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>取消</Button>
                      </div> : <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.type === 'admin' ? 'bg-red-100 text-red-700' : user.type === 'teacher' ? 'bg-blue-100 text-blue-700' : user.type === 'parent' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          {getRoleName(user.type)}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => {
                setEditingUser(user);
                setNewRole(user.type);
              }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>}
                  </div>)}
              </div>}
          </div>}

        {/* 角色配置 Tab */}
        {activeTab === 'roles' && <div className="space-y-4">
            {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => {
          const stats = getPermissionStats(role);
          const isExpanded = expandedRole === role;
          return <div key={role} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button onClick={() => setExpandedRole(isExpanded ? null : role)} className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${getRoleColor(role)} flex items-center justify-center`}>
                        {isExpanded ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-800">{getRoleName(role)}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          共 {stats.total} 项权限
                        </p>
                      </div>
                    </div>
                    
                    {/* 权限统计标签 */}
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.student}</div>
                        <div className="text-xs text-gray-600">学生管理</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.point}</div>
                        <div className="text-xs text-gray-600">积分管理</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.class}</div>
                        <div className="text-xs text-gray-600">班级事务</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.comprehensive}</div>
                        <div className="text-xs text-gray-600">综合管理</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600">{stats.parent}</div>
                        <div className="text-xs text-gray-600">家长端</div>
                      </div>
                    </div>
                  </button>
                  
                  {/* 权限详情 */}
                  {isExpanded && <div className="p-6 border-t border-gray-200 bg-gray-50">
                      <h4 className="font-semibold text-gray-700 mb-4">权限详情：</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {permissions.map(permission => <div key={permission} className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                            {permission}
                          </div>)}
                      </div>
                    </div>}
                </div>;
        })}
          </div>}

        {/* 权限详情 Tab */}
        {activeTab === 'permissions' && <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">所有权限列表</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(PERMISSIONS).map(permission => <div key={permission} className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <code className="text-sm text-gray-700 font-mono">{permission}</code>
                </div>)}
            </div>
          </div>}
      </div>
    </div>;
}