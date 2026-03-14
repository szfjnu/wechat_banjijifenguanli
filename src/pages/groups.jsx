// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Users, Plus, Calendar, Search, Filter, User, Crown, Clock, Trash2, Edit, MoreVertical, ChevronRight, AlertCircle, GraduationCap, FolderOpen, Settings } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
import { usePermission } from '@/components/PermissionGuard';

// 学期预设数据
// 初始化学期列表为空，后续从数据库加载
const INITIAL_SEMESTERS = [];

// 删除模拟数据，使用数据库真实数据
export default function GroupsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('groups');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  // 权限检查
  const {
    permission: canViewGroups,
    loading: loadingViewGroups
  } = usePermission($w, 'groups', 'view');
  const {
    permission: canCreateGroups,
    loading: loadingCreateGroups
  } = usePermission($w, 'groups', 'create');
  const {
    permission: canEditGroups,
    loading: loadingEditGroups
  } = usePermission($w, 'groups', 'edit');
  const {
    permission: canDeleteGroups,
    loading: loadingDeleteGroups
  } = usePermission($w, 'groups', 'delete');
  const {
    permission: canAssignStudents,
    loading: loadingAssignStudents
  } = usePermission($w, 'groups', 'assign');
  const [students, setStudents] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [loadingAction, setLoadingAction] = useState(false);
  const [assignedStudentIds, setAssignedStudentIds] = useState([]);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    semesterId: '',
    leaderId: '',
    memberIds: []
  });
  const [semesters, setSemesters] = useState(INITIAL_SEMESTERS);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();

      // 加载学期数据
      const semesterResult = await db.collection('semesters').orderBy('created_at', 'desc').get();
      const transformedSemesters = semesterResult.data.map(sem => ({
        id: sem._id,
        name: sem.semester_name,
        isCurrent: sem.is_current || false
      }));
      setSemesters(transformedSemesters);

      // 加载分组数据
      const groupResult = await db.collection('group').get();
      const transformedGroups = groupResult.data.map(g => ({
        _id: g._id,
        id: g._id,
        name: g.name,
        semesterId: g.semester_id,
        semesterName: g.semester_name,
        leaderId: g.leader_id,
        leaderName: g.leader_name,
        memberCount: g.member_count || g.members.length,
        createdAt: new Date(g.created_at).toLocaleDateString('zh-CN'),
        members: g.members || []
      }));
      setGroups(transformedGroups);

      // 加载学生数据
      const studentResult = await db.collection('students').get();
      const transformedStudents = studentResult.data.map(s => ({
        _id: s._id,
        id: s.student_id,
        studentId: s.student_id,
        name: s.name,
        gender: s.gender,
        group: s.group || '未分组',
        avatar: s.avatar_url || null
      }));
      setStudents(transformedStudents);

      // 收集所有分组中的学生 ID（包括组长和组员）
      const assignedIds = new Set();
      transformedGroups.forEach(group => {
        // 添加组长 ID
        if (group.leaderId) assignedIds.add(group.leaderId);
        // 添加组员 ID
        if (group.members) group.members.forEach(memberId => assignedIds.add(memberId));
      });
      setAssignedStudentIds(Array.from(assignedIds));
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 过滤分组
  const filteredGroups = groups.filter(group => {
    const matchSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) || group.leaderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSemester = selectedSemester === 'all' || group.semesterId === parseInt(selectedSemester) || group.semesterId === selectedSemester;
    return matchSearch && matchSemester;
  });

  // 统计数据
  const stats = {
    totalGroups: filteredGroups.length,
    currentGroups: filteredGroups.filter(g => {
      const semester = semesters.find(s => s.id === g.semesterId);
      return semester?.isCurrent;
    }).length,
    totalMembers: filteredGroups.reduce((sum, g) => sum + g.memberCount, 0),
    currentSemester: semesters.find(s => s.isCurrent)?.name || ''
  };

  // 创建分组
  const handleCreateGroup = async () => {
    if (!formData.name || !formData.semesterId || !formData.leaderId) {
      toast({
        title: '填写不完整',
        description: '请填写所有必填项',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoadingAction(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const semester = semesters.find(s => s.id === formData.semesterId || s.id === parseInt(formData.semesterId));
      const leader = students.find(s => s.studentId === formData.leaderId);
      if (!semester) {
        toast({
          title: '学期错误',
          description: '选择的学期不存在',
          variant: 'destructive'
        });
        setLoadingAction(false);
        return;
      }
      if (!leader) {
        toast({
          title: '组长错误',
          description: '选择的组长不存在',
          variant: 'destructive'
        });
        setLoadingAction(false);
        return;
      }
      const result = await db.collection('group').add({
        name: formData.name,
        semester_id: parseInt(formData.semesterId),
        semester_name: semester.name,
        leader_id: formData.leaderId,
        leader_name: leader.name,
        member_count: formData.memberIds.length + 1,
        members: [formData.leaderId, ...formData.memberIds],
        change_history: `${getBeijingDateString()}: 创建分组，组长：${leader.name}，成员：${leader.name}、${formData.memberIds.map(id => {
          const student = students.find(s => s.studentId === id);
          return student ? student.name : id;
        }).join('、')}`,
        created_at: getBeijingTime().getTime(),
        updated_at: getBeijingTime().getTime()
      });

      // 同步更新 students 数据模型中所有成员的 group 字段
      const allMemberIds = [formData.leaderId, ...formData.memberIds];
      for (const studentId of allMemberIds) {
        const student = students.find(s => s.studentId === studentId);
        if (student) {
          await db.collection('students').where({
            student_id: studentId
          }).update({
            group: formData.name
          });
        }
      }
      const newGroup = {
        _id: result.id,
        id: result.id,
        name: formData.name,
        semesterId: parseInt(formData.semesterId),
        semesterName: semester.name,
        leaderId: formData.leaderId,
        leaderName: leader.name,
        memberCount: formData.memberIds.length + 1,
        members: [formData.leaderId, ...formData.memberIds],
        createdAt: getBeijingDateString()
      };
      setGroups([...groups, newGroup]);
      setShowCreateDialog(false);
      setFormData({
        name: '',
        semesterId: '',
        leaderId: '',
        memberIds: []
      });
      toast({
        title: '创建成功',
        description: '分组已创建'
      });
    } catch (error) {
      console.error('创建分组失败:', error);
      toast({
        title: '创建失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // 编辑分组
  const handleEditGroup = async () => {
    if (!formData.name || !formData.semesterId || !formData.leaderId) {
      toast({
        title: '填写不完整',
        description: '请填写所有必填项',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoadingAction(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const semester = semesters.find(s => s.id === formData.semesterId || s.id === parseInt(formData.semesterId));
      const leader = students.find(s => s.studentId === formData.leaderId);
      if (!semester) {
        toast({
          title: '学期错误',
          description: '选择的学期不存在',
          variant: 'destructive'
        });
        setLoadingAction(false);
        return;
      }
      if (!leader) {
        toast({
          title: '组长错误',
          description: '选择的组长不存在',
          variant: 'destructive'
        });
        setLoadingAction(false);
        return;
      }
      await db.collection('group').doc(selectedGroup._id).update({
        name: formData.name,
        semester_id: parseInt(formData.semesterId),
        semester_name: semester.name,
        leader_id: formData.leaderId,
        leader_name: leader.name,
        member_count: formData.memberIds.length + 1,
        members: [formData.leaderId, ...formData.memberIds],
        updated_at: getBeijingTime().getTime()
      });

      // 同步更新 students 数据模型中所有成员的 group 字段
      const newMemberIds = [formData.leaderId, ...formData.memberIds];
      const oldMemberIds = selectedGroup.members || [];

      // 更新旧成员中被移出的学生，将其 group 字段清空
      for (const oldStudentId of oldMemberIds) {
        if (!newMemberIds.includes(oldStudentId)) {
          await db.collection('students').where({
            student_id: oldStudentId
          }).update({
            group: ''
          });
        }
      }

      // 更新旧成员中保留的学生，将其 group 字段更新为新分组名（如果组名有变化）
      for (const newStudentId of newMemberIds) {
        await db.collection('students').where({
          student_id: newStudentId
        }).update({
          group: formData.name
        });
      }
      const updatedGroups = groups.map(g => g._id === selectedGroup._id ? {
        ...g,
        name: formData.name,
        semesterId: parseInt(formData.semesterId),
        semesterName: semester.name,
        leaderId: formData.leaderId,
        leaderName: leader.name,
        memberCount: formData.memberIds.length + 1,
        members: [formData.leaderId, ...formData.memberIds]
      } : g);
      setGroups(updatedGroups);
      setShowEditDialog(false);
      setSelectedGroup(null);
      setFormData({
        name: '',
        semesterId: '',
        leaderId: '',
        memberIds: []
      });
      toast({
        title: '更新成功',
        description: '分组已更新'
      });
    } catch (error) {
      console.error('更新分组失败:', error);
      toast({
        title: '更新失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // 删除分组
  const handleDeleteGroup = async groupId => {
    if (!confirm('确定要删除这个分组吗？')) {
      return;
    }
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const groupToDelete = groups.find(g => g._id === groupId);
      if (groupToDelete && groupToDelete.members) {
        // 清空所有成员的 group 字段
        for (const studentId of groupToDelete.members) {
          await db.collection('students').where({
            student_id: studentId
          }).update({
            group: ''
          });
        }
      }
      await db.collection('group').doc(groupId).remove();
      const updatedGroups = groups.filter(g => g._id !== groupId);
      setGroups(updatedGroups);
      toast({
        title: '删除成功',
        description: '分组已删除'
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 查看详情
  const handleViewDetail = group => {
    setSelectedGroup(group);
    setShowDetailDialog(true);
  };

  // 打开编辑对话框
  const openEditDialog = group => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      semesterId: group.semesterId,
      leaderId: group.leaderId,
      memberIds: group.members.filter(id => id !== group.leaderId)
    });
    setShowEditDialog(true);
  };

  // 切换成员选中状态
  const toggleMember = studentId => {
    const memberIds = [...formData.memberIds];
    const index = memberIds.indexOf(studentId);
    if (index > -1) {
      memberIds.splice(index, 1);
    } else {
      memberIds.push(studentId);
    }
    setFormData({
      ...formData,
      memberIds
    });
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-sm">加载中...</p>
          </div>
        </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
        {/* 页面头部 - 紧凑 */}
        <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">分组管理</h1>
              <p className="text-xs text-gray-500">学生学习小组管理</p>
            </div>
            <div className="flex gap-1">
              <Button onClick={() => setShowCreateDialog(true)} variant="outline" size="icon" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-3 py-2">
          {/* 统计概览 - 紧凑 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <StatCard title="分组总数" value={stats.totalGroups} icon={Users} color="rose" />
            <StatCard title="当前学期" value={stats.currentGroups} icon={GraduationCap} color="pink" />
            <StatCard title="总人数" value={stats.totalMembers} icon={User} color="orange" />
            <StatCard title="学期" value={stats.currentSemester.split('第')[1]?.split('学')[0] || '-'} subtitle="当前学期" icon={Calendar} color="amber" />
          </div>

          {/* 筛选栏 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="搜索分组、组长..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                <option value="all">全部学期</option>
                {semesters.map(semester => <option key={semester.id} value={semester.id}>{semester.name}{semester.isCurrent ? '（当前）' : ''}</option>)}
              </select>
            </div>
          </div>

          {/* 分组列表 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-rose-600" />
                分组列表
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredGroups.length === 0 ? <div className="p-6 text-center text-gray-500 text-sm">
                  暂无分组记录
                </div> : filteredGroups.map(group => {
            const semester = semesters.find(s => s.id === group.semesterId);
            return <div key={group.id} className={`p-2.5 hover:bg-gray-50 transition-colors ${semester?.isCurrent ? 'bg-rose-50/50' : ''}`}>
                    <div className="flex items-start gap-2">
                      {/* 组头像 */}
                      <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {group.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="font-medium text-gray-800 text-sm">{group.name}</h3>
                          {semester?.isCurrent && <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
                              当前
                            </span>}
                        </div>
                        <p className="text-xs text-gray-500 mb-1.5">组长: {group.leaderName}</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-600">
                            <User className="w-2.5 h-2.5" />
                            {group.memberCount}人
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {group.semesterName}
                          </span>
                        </div>
                      </div>
                      {/* 操作按钮 */}
                      <div className="flex gap-1">
                        <Button onClick={() => handleViewDetail(group)} variant="ghost" size="icon" className="h-7 w-7">
                          <FolderOpen className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                        <Button onClick={() => openEditDialog(group)} variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="w-3.5 h-3.5 text-blue-500" />
                        </Button>
                        <Button onClick={() => handleDeleteGroup(group.id)} variant="ghost" size="icon" className="h-7 w-7">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>;
          })}
            </div>
          </div>
        </main>

        {/* 创建/编辑分组对话框 */}
        {(showCreateDialog || showEditDialog) && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{showEditDialog ? '编辑分组' : '创建分组'}</h3>
                <Button onClick={() => {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            setSelectedGroup(null);
            setFormData({
              name: '',
              semesterId: '',
              leaderId: '',
              memberIds: []
            });
          }} variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分组名称</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} placeholder="请输入分组名称" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学期</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm" value={formData.semesterId} onChange={e => setFormData({
              ...formData,
              semesterId: e.target.value
            })}>
                    <option value="">请选择学期</option>
                    {semesters.map(semester => <option key={semester.id} value={semester.id}>{semester.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">组长</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm" value={formData.leaderId} onChange={e => setFormData({
              ...formData,
              leaderId: e.target.value
            })}>
                    <option value="">请选择组长</option>
                    {students.filter(s => showEditDialog ?
              // 编辑模式：排除其他分组的组长，保留当前分组的组长
              !assignedStudentIds.includes(s.studentId) || s.studentId === selectedGroup.leaderId :
              // 创建模式：排除所有已分组的学生
              !assignedStudentIds.includes(s.studentId)).map(student => <option key={student._id} value={student.studentId}>{student.name} ({student.studentId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">组员</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {students.filter(s => showEditDialog ?
              // 编辑模式：排除其他分组的成员，保留当前分组的成员，也排除当前选择的组长
              (!assignedStudentIds.includes(s.studentId) || selectedGroup.members && selectedGroup.members.includes(s.studentId)) && s.studentId !== formData.leaderId :
              // 创建模式：排除所有已分组的学生，也排除当前选择的组长
              !assignedStudentIds.includes(s.studentId) && s.studentId !== formData.leaderId).map(student => <label key={student._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={formData.memberIds.includes(student.studentId)} onChange={() => toggleMember(student.studentId)} className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500" />
                        <span className="text-sm text-gray-700">{student.name}</span>
                        <span className="text-xs text-gray-500">({student.studentId})</span>
                      </label>)}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <Button onClick={() => {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            setSelectedGroup(null);
            setFormData({
              name: '',
              semesterId: '',
              leaderId: '',
              memberIds: []
            });
          }} variant="outline" className="px-4 py-2">
                  取消
                </Button>
                <Button onClick={showEditDialog ? handleEditGroup : handleCreateGroup} disabled={loadingAction} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2">
                  {loadingAction ? '处理中...' : showEditDialog ? '更新' : '创建'}
                </Button>
              </div>
            </div>
          </div>}

        {/* 详情对话框 */}
        {showDetailDialog && selectedGroup && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">分组详情</h3>
                <Button onClick={() => {
            setShowDetailDialog(false);
            setSelectedGroup(null);
          }} variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {selectedGroup.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedGroup.name}</p>
                    <p className="text-sm text-gray-500">{selectedGroup.semesterName}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">组长</span>
                    <span className="text-sm font-medium text-gray-800">{selectedGroup.leaderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">成员数</span>
                    <span className="text-sm font-medium text-gray-800">{selectedGroup.memberCount}人</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">创建日期</span>
                    <span className="text-sm text-gray-800">{selectedGroup.createdAt}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">成员列表</h4>
                  <div className="space-y-2">
                    {selectedGroup.members.map(memberId => {
                const member = students.find(s => s.studentId === memberId);
                if (!member) return null;
                return <div key={member._id} className={`flex items-center gap-2 p-2 rounded-lg ${memberId === selectedGroup.leaderId ? 'bg-amber-50' : 'bg-gray-50'}`}>
                          {memberId === selectedGroup.leaderId && <Crown className="w-3.5 h-3.5 text-amber-600" />}
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {member.name[0]}
                          </div>
                          <span className="text-sm text-gray-800">{member.name}</span>
                          <span className="text-xs text-gray-500">{member.studentId}</span>
                        </div>;
              })}
                  </div>
                </div>
              </div>
            </div>
          </div>}

        {/* 底部导航栏 */}
        <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>;
}