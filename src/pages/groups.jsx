// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Users, Plus, Calendar, Search, Filter, User, Crown, Clock, Trash2, Edit, MoreVertical, ChevronRight, AlertCircle, GraduationCap, FolderOpen } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Label, useToast, Checkbox } from '@/components/ui';

import { TabBar } from '@/components/TabBar';

// 学期预设数据
const SEMESTERS = [{
  id: 1,
  name: '2024-2025第一学期',
  startDate: '2024-09-01',
  endDate: '2025-01-15',
  isCurrent: false
}, {
  id: 2,
  name: '2024-2025第二学期',
  startDate: '2025-02-15',
  endDate: '2025-07-01',
  isCurrent: true
}];

// 学生预设数据
const MOCK_STUDENTS = [{
  id: 1,
  studentId: '2024001',
  name: '张三',
  group: '第一组',
  avatar: null
}, {
  id: 2,
  studentId: '2024002',
  name: '李四',
  group: '第二组',
  avatar: null
}, {
  id: 3,
  studentId: '2024003',
  name: '王五',
  group: '第三组',
  avatar: null
}, {
  id: 4,
  studentId: '2024004',
  name: '赵六',
  group: '第一组',
  avatar: null
}, {
  id: 5,
  studentId: '2024005',
  name: '钱七',
  group: '第二组',
  avatar: null
}, {
  id: 6,
  studentId: '2024006',
  name: '孙八',
  group: '第三组',
  avatar: null
}, {
  id: 7,
  studentId: '2024007',
  name: '周九',
  group: '第一组',
  avatar: null
}, {
  id: 8,
  studentId: '2024008',
  name: '吴十',
  group: '第二组',
  avatar: null
}, {
  id: 9,
  studentId: '2024009',
  name: '郑十一',
  group: '第三组',
  avatar: null
}, {
  id: 10,
  studentId: '2024010',
  name: '王十二',
  group: '第一组',
  avatar: null
}];

// 分组预设数据
const MOCK_GROUPS = [{
  id: 1,
  name: '第一组',
  semesterId: 2,
  semesterName: '2024-2025第二学期',
  leaderId: 1,
  leaderName: '张三',
  memberCount: 4,
  createdAt: '2025-02-20',
  members: [1, 4, 7, 10]
}, {
  id: 2,
  name: '第二组',
  semesterId: 2,
  semesterName: '2024-2025第二学期',
  leaderId: 2,
  leaderName: '李四',
  memberCount: 3,
  createdAt: '2025-02-20',
  members: [2, 5, 8]
}, {
  id: 3,
  name: '第三组',
  semesterId: 2,
  semesterName: '2024-2025第二学期',
  leaderId: 3,
  leaderName: '王五',
  memberCount: 3,
  createdAt: '2025-02-20',
  members: [3, 6, 9]
}];

// 分组历史预设数据
const MOCK_HISTORY = [{
  id: 1,
  groupName: '第一组',
  action: '创建分组',
  details: '创建第一组，组长：张三，成员：4人',
  operator: '班主任',
  timestamp: '2025-02-20 09:30:00'
}, {
  id: 2,
  groupName: '第一组',
  action: '更换组长',
  details: '组长从王十二变更为张三',
  operator: '班主任',
  timestamp: '2025-02-25 14:20:00'
}, {
  id: 3,
  groupName: '第二组',
  action: '创建分组',
  details: '创建第二组，组长：李四，成员：3人',
  operator: '班主任',
  timestamp: '2025-02-20 09:35:00'
}, {
  id: 4,
  groupName: '第三组',
  action: '创建分组',
  details: '创建第三组，组长：王五，成员：3人',
  operator: '班主任',
  timestamp: '2025-02-20 09:40:00'
}, {
  id: 5,
  groupName: '第一组',
  action: '调整成员',
  details: '将王十二从第二组调入第一组',
  operator: '班主任',
  timestamp: '2025-02-28 10:00:00'
}];
export default function Groups(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('groups');
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupHistory, setGroupHistory] = useState([]);

  // 新建分组表单数据
  const [formData, setFormData] = useState({
    semesterId: '',
    groupName: '',
    leaderId: '',
    members: []
  });

  // 统计数据
  const [stats, setStats] = useState({
    totalGroups: 0,
    currentGroups: 0,
    totalMembers: 0,
    currentSemester: ''
  });
  useEffect(() => {
    loadGroupsData();
  }, []);
  useEffect(() => {
    filterGroups();
  }, [groups, selectedSemester, searchQuery]);
  const loadGroupsData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setGroups(MOCK_GROUPS);
      setHistory(MOCK_HISTORY);
      const currentSemester = SEMESTERS.find(s => s.isCurrent);
      setStats({
        totalGroups: MOCK_GROUPS.length,
        currentGroups: MOCK_GROUPS.filter(g => g.semesterId === currentSemester?.id).length,
        totalMembers: MOCK_GROUPS.reduce((sum, g) => sum + g.memberCount, 0),
        currentSemester: currentSemester?.name || '未设置'
      });
    } catch (error) {
      toast({
        title: '加载失败',
        description: '加载分组数据时出错',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const filterGroups = () => {
    let filtered = groups;
    if (selectedSemester !== 'all') {
      filtered = filtered.filter(g => g.semesterId === parseInt(selectedSemester));
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(query) || g.leaderName.toLowerCase().includes(query));
    }
    setFilteredGroups(filtered);
  };
  const handleCreateGroup = async () => {
    if (!formData.semesterId) {
      toast({
        title: '请选择学期',
        description: '必须选择所属学期',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.groupName.trim()) {
      toast({
        title: '请输入分组名称',
        description: '分组名称不能为空',
        variant: 'destructive'
      });
      return;
    }
    if (formData.members.length === 0) {
      toast({
        title: '请选择组员',
        description: '至少需要选择一名组员',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.leaderId) {
      toast({
        title: '请选择组长',
        description: '必须选择一名组长',
        variant: 'destructive'
      });
      return;
    }

    // 检查组长是否在组员列表中
    if (!formData.members.includes(parseInt(formData.leaderId))) {
      toast({
        title: '组长必须在组员中',
        description: '请确保选中的组长在组员列表中',
        variant: 'destructive'
      });
      return;
    }
    try {
      const semester = SEMESTERS.find(s => s.id === parseInt(formData.semesterId));
      const leader = MOCK_STUDENTS.find(s => s.id === parseInt(formData.leaderId));
      const members = formData.members;
      const newGroup = {
        id: groups.length + 1,
        name: formData.groupName,
        semesterId: parseInt(formData.semesterId),
        semesterName: semester?.name || '',
        leaderId: parseInt(formData.leaderId),
        leaderName: leader?.name || '',
        memberCount: members.length,
        createdAt: new Date().toISOString().split('T')[0],
        members: members
      };
      setGroups([...groups, newGroup]);

      // 添加历史记录
      const newHistory = {
        id: history.length + 1,
        groupName: newGroup.name,
        action: '创建分组',
        details: `创建${newGroup.name}，组长：${newGroup.leaderName}，成员：${members.length}人`,
        operator: '班主任',
        timestamp: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
      setHistory([newHistory, ...history]);

      // 更新学生数据中的分组信息
      console.log('分组创建成功，需要更新学生数据');
      toast({
        title: '创建成功',
        description: `分组${newGroup.name}创建成功，组长：${newGroup.leaderName}`
      });
      setShowCreateDialog(false);
      setFormData({
        semesterId: '',
        groupName: '',
        leaderId: '',
        members: []
      });

      // 重新加载统计
      const currentSemester = SEMESTERS.find(s => s.isCurrent);
      setStats(prev => ({
        totalGroups: prev.totalGroups + 1,
        currentGroups: groups.filter(g => g.semesterId === currentSemester?.id).length + 1,
        totalMembers: prev.totalMembers + members.length,
        currentSemester: currentSemester?.name || ''
      }));
    } catch (error) {
      toast({
        title: '创建失败',
        description: '创建分组时出错',
        variant: 'destructive'
      });
    }
  };
  const handleEditGroup = async () => {
    if (!formData.leaderId) {
      toast({
        title: '请选择组长',
        description: '必须选择一名组长',
        variant: 'destructive'
      });
      return;
    }

    // 检查组长是否在组员列表中
    if (!formData.members.includes(parseInt(formData.leaderId))) {
      toast({
        title: '组长必须在组员中',
        description: '请确保选中的组长在组员列表中',
        variant: 'destructive'
      });
      return;
    }
    try {
      const leader = MOCK_STUDENTS.find(s => s.id === parseInt(formData.leaderId));
      const oldLeader = MOCK_STUDENTS.find(s => s.id === selectedGroup.leaderId);
      const updatedGroups = groups.map(g => {
        if (g.id === selectedGroup.id) {
          const newLeaderName = leader?.name || '';
          const oldLeaderName = oldLeader?.name || '';
          if (newLeaderName !== oldLeaderName) {
            // 添加历史记录
            const newHistory = {
              id: history.length + 1,
              groupName: g.name,
              action: '更换组长',
              details: `组长从${oldLeaderName}变更为${newLeaderName}`,
              operator: '班主任',
              timestamp: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
            };
            setHistory([newHistory, ...history]);
          }
          return {
            ...g,
            leaderId: parseInt(formData.leaderId),
            leaderName: newLeaderName,
            members: formData.members,
            memberCount: formData.members.length
          };
        }
        return g;
      });
      setGroups(updatedGroups);
      toast({
        title: '修改成功',
        description: `分组${selectedGroup.name}修改成功`
      });
      setShowEditDialog(false);
      setSelectedGroup(null);
    } catch (error) {
      toast({
        title: '修改失败',
        description: '修改分组时出错',
        variant: 'destructive'
      });
    }
  };
  const handleShowHistory = group => {
    setSelectedGroup(group);
    const groupHistory = history.filter(h => h.groupName === group.name);
    setGroupHistory(groupHistory);
    setShowHistoryDialog(true);
  };
  const handleEditClick = group => {
    setSelectedGroup(group);
    setFormData({
      semesterId: group.semesterId.toString(),
      groupName: group.name,
      leaderId: group.leaderId.toString(),
      members: group.members
    });
    setShowEditDialog(true);
  };
  const handleMemberToggle = studentId => {
    setFormData(prev => {
      const newMembers = prev.members.includes(studentId) ? prev.members.filter(id => id !== studentId) : [...prev.members, studentId];

      // 如果组长不在新的成员列表中，清空组长选择
      if (!newMembers.includes(parseInt(prev.leaderId))) {
        return {
          ...prev,
          members: newMembers,
          leaderId: ''
        };
      }
      return {
        ...prev,
        members: newMembers
      };
    });
  };
  const handleDeleteGroup = group => {
    if (confirm(`确定要删除分组${group.name}吗？此操作不可撤销。`)) {
      try {
        const newGroups = groups.filter(g => g.id !== group.id);
        setGroups(newGroups);

        // 添加历史记录
        const newHistory = {
          id: history.length + 1,
          groupName: group.name,
          action: '删除分组',
          details: `删除分组${group.name}，原组长：${group.leaderName}`,
          operator: '班主任',
          timestamp: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        };
        setHistory([newHistory, ...history]);
        const currentSemester = SEMESTERS.find(s => s.isCurrent);
        setStats(prev => ({
          totalGroups: prev.totalGroups - 1,
          currentGroups: newGroups.filter(g => g.semesterId === currentSemester?.id).length,
          totalMembers: prev.totalMembers - group.memberCount,
          currentSemester: currentSemester?.name || ''
        }));
        toast({
          title: '删除成功',
          description: `分组${group.name}已删除`
        });
      } catch (error) {
        toast({
          title: '删除失败',
          description: '删除分组时出错',
          variant: 'destructive'
        });
      }
    }
  };
  const getSemesterStudents = () => {
    // 返回所有学生（实际应用中可以根据学期筛选）
    return MOCK_STUDENTS.filter(s => !formData.members.includes(s.id));
  };
  const getSemesterStudentsForEdit = () => {
    // 编辑时返回所有学生
    return MOCK_STUDENTS;
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent mb-3"></div>
          <p className="text-gray-600 text-sm">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-800 mb-2" style={{
          fontFamily: 'Georgia, serif'
        }}>学生分组管理</h1>
          <p className="text-gray-600">创建和管理学习小组，选举组长，记录分组历史</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-rose-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">总分组数</p>
                <p className="text-base font-bold text-gray-800">{stats.totalGroups}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">当前学期</p>
                <p className="text-base font-bold text-gray-800">{stats.currentGroups}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-pink-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">总人数</p>
                <p className="text-base font-bold text-gray-800">{stats.totalMembers}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">当前学期</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{stats.currentSemester}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="搜索分组名称或组长姓名" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm" />
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm bg-white">
              <option value="all">全部学期</option>
              {SEMESTERS.map(semester => <option key={semester.id} value={semester.id}>{semester.name}{semester.isCurrent ? '（当前）' : ''}</option>)}
            </select>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                新建分组
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold" style={{
                fontFamily: 'Georgia, serif'
              }}>创建分组</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">所属学期 *</Label>
                  <select value={formData.semesterId} onChange={e => setFormData({
                  ...formData,
                  semesterId: e.target.value
                })} className="w-full mt-1.5 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm">
                    <option value="">请选择学期</option>
                    {SEMESTERS.map(semester => <option key={semester.id} value={semester.id}>{semester.name}{semester.isCurrent ? '（当前）' : ''}</option>)}
                  </select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">分组名称 *</Label>
                  <input type="text" placeholder="例如：第一组、先锋组" value={formData.groupName} onChange={e => setFormData({
                  ...formData,
                  groupName: e.target.value
                })} className="w-full mt-1.5 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm" />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">组员 *（至少选择1名）</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {getSemesterStudents().map(student => <div key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox id={`student-${student.id}`} checked={formData.members.includes(student.id)} onCheckedChange={() => handleMemberToggle(student.id)} />
                        <label htmlFor={`student-${student.id}`} className="flex items-center space-x-3 flex-1 cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.studentId}</p>
                          </div>
                        </label>
                      </div>)}
                  </div>
                  {formData.members.length > 0 && <p className="mt-2 text-sm text-gray-600">已选择 {formData.members.length} 名组员</p>}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">组长 *</Label>
                  <select value={formData.leaderId} onChange={e => setFormData({
                  ...formData,
                  leaderId: e.target.value
                })} disabled={formData.members.length === 0} className="w-full mt-1.5 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed">
                    <option value="">请选择组长</option>
                    {formData.members.map(memberId => {
                    const student = MOCK_STUDENTS.find(s => s.id === memberId);
                    return student && <option key={memberId} value={memberId}>{student.name}（{student.studentId}）</option>;
                  })}
                  </select>
                  {formData.members.length === 0 && <p className="mt-1 text-xs text-amber-600">请先选择组员</p>}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
                  <Button onClick={handleCreateGroup} className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                    创建分组
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 分组列表 */}
        <div className="space-y-4">
          {filteredGroups.length === 0 ? <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无分组数据</p>
              <p className="text-sm text-gray-400 mt-1">点击"新建分组"开始创建</p>
            </div> : filteredGroups.map(group => {
          const isCurrent = group.semesterId === SEMESTERS.find(s => s.isCurrent)?.id;
          return <div key={group.id} className={`${isCurrent ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200' : 'bg-white border-gray-200'} border rounded-xl p-4 shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-800" style={{
                    fontFamily: 'Georgia, serif'
                  }}>{group.name}</h3>
                        {isCurrent && <span className="px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">当前</span>}
                      </div>
                      
                      <div className="flex items-center space-x-6 mb-3">
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-gray-600">组长：<span className="font-semibold text-gray-800">{group.leaderName}</span></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">组员：<span className="font-semibold text-gray-800">{group.memberCount}人</span></span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500">学期：{group.semesterName}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleShowHistory(group)} className="text-gray-600 hover:text-rose-600">
                        <Clock className="w-4 h-4 mr-1" />
                        历史
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(group)} className="text-gray-600 hover:text-pink-600">
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteGroup(group)} className="text-gray-600 hover:text-red-600">
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {group.members.map(memberId => {
                  const student = MOCK_STUDENTS.find(s => s.id === memberId);
                  if (!student) return null;
                  const isLeader = student.id === group.leaderId;
                  return <div key={memberId} className={`${isLeader ? 'bg-amber-100 border-amber-300' : 'bg-gray-50 border-gray-200'} border rounded-full px-3 py-1 flex items-center space-x-1.5`}>
                            {isLeader && <Crown className="w-3 h-3 text-amber-600" />}
                            <span className="text-xs font-medium text-gray-700">{student.name}</span>
                          </div>;
                })}
                    </div>
                  </div>
                </div>;
        })}
        </div>

        {/* 说明卡片 */}
        <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-800 mb-2" style={{
              fontFamily: 'Georgia, serif'
            }}>分组管理说明</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 每个分组需要选择一个学期、一个组长和至少一名组员</li>
                <li>• 组长必须是组员之一，负责组织小组活动和日常管理</li>
                <li>• 可以随时编辑分组信息，包括更换组长和调整组员</li>
                <li>• 所有分组操作都会记录历史，便于追踪和管理</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <TabBar currentPage={currentPage} onPageChange={pageId => {
      $w.utils.navigateTo({
        pageId,
        params: {}
      });
    }} />
      
      {/* 编辑分组对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{
            fontFamily: 'Georgia, serif'
          }}>编辑分组</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">分组名称</Label>
              <input type="text" value={formData.groupName} disabled className="w-full mt-1.5 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm disabled:cursor-not-allowed" />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">组员 *（至少选择1名）</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {getSemesterStudentsForEdit().map(student => <div key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox id={`edit-student-${student.id}`} checked={formData.members.includes(student.id)} onCheckedChange={() => handleMemberToggle(student.id)} />
                    <label htmlFor={`edit-student-${student.id}`} className="flex items-center space-x-3 flex-1 cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.studentId}</p>
                      </div>
                    </label>
                  </div>)}
              </div>
              {formData.members.length > 0 && <p className="mt-2 text-sm text-gray-600">已选择 {formData.members.length} 名组员</p>}
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">组长 *</Label>
              <select value={formData.leaderId} onChange={e => setFormData({
              ...formData,
              leaderId: e.target.value
            })} disabled={formData.members.length === 0} className="w-full mt-1.5 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed">
                <option value="">请选择组长</option>
                {formData.members.map(memberId => {
                const student = MOCK_STUDENTS.find(s => s.id === memberId);
                return student && <option key={memberId} value={memberId}>{student.name}（{student.studentId}）</option>;
              })}
              </select>
              {formData.members.length === 0 && <p className="mt-1 text-xs text-amber-600">请先选择组员</p>}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedGroup(null);
            }}>取消</Button>
              <Button onClick={handleEditGroup} className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                保存修改
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 分组历史对话框 */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center space-x-2" style={{
            fontFamily: 'Georgia, serif'
          }}>
              <Clock className="w-5 h-5" />
              <span>{selectedGroup?.name} - 分组历史</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {groupHistory.length === 0 ? <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无历史记录</p>
              </div> : groupHistory.map(h => <div key={h.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${h.action === '创建分组' ? 'bg-green-100 text-green-700' : h.action === '更换组长' ? 'bg-amber-100 text-amber-700' : h.action === '调整成员' ? 'bg-blue-100 text-blue-700' : h.action === '删除分组' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {h.action}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{h.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{h.details}</p>
                  <p className="text-xs text-gray-500">操作人：{h.operator}</p>
                </div>)}
          </div>
        </DialogContent>
      </Dialog>

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <TabBar currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>;
}