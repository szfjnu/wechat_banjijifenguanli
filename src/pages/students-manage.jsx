// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Filter, Plus, MoreVertical, TrendingUp, Award, User, ChevronRight, Download, Upload, AlertCircle, Calendar, Star, Edit, Trash2 } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { StatCard } from '@/components/StatCard';
import { StudentForm } from '@/components/StudentForm';
import { StudentDetail } from '@/components/StudentDetail';
import { usePermission } from '@/components/PermissionGuard';

// 格式化积分：整数显示整数，小数最多显示两位
const formatPoints = points => {
  if (points === undefined || points === null || isNaN(points)) return '0';
  const num = Number(points);
  const rounded = Math.round(num * 100) / 100;
  // 如果小数部分为0，显示整数；否则最多显示两位小数
  return rounded === Math.floor(rounded) ? String(Math.floor(rounded)) : rounded.toFixed(2);
};
export default function StudentsManage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('students-manage');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };

  // 权限检查
  const {
    permission: canAddStudent,
    loading: loadingAddStudent
  } = usePermission($w, 'student', 'add');
  const {
    permission: canEditStudent,
    loading: loadingEditStudent
  } = usePermission($w, 'student', 'edit');
  const {
    permission: canDeleteStudent,
    loading: loadingDeleteStudent
  } = usePermission($w, 'student', 'delete');
  const {
    permission: canExportStudent,
    loading: loadingExportStudent
  } = usePermission($w, 'student', 'export');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDorm, setSelectedDorm] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortBy, setSortBy] = useState('current_score');
  const [sortOrder, setSortOrder] = useState('desc');
  useEffect(() => {
    loadStudentsData();
  }, []);
  useEffect(() => {
    filterAndSortStudents();
  }, [students, selectedClass, selectedDorm, searchQuery, sortBy, sortOrder]);
  const loadStudentsData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('students').get();

      // 添加调试日志
      console.log('students-manage.jsx 加载学生数据:', {
        数据总数: result.data ? result.data.length : 0,
        数据库集合名: 'students',
        查询结果: result
      });
      if (result.data && result.data.length > 0) {
        setStudents(result.data);
        setFilteredStudents(result.data);
        toast({
          title: '加载成功',
          description: `成功加载 ${result.data.length} 名学生数据`,
          variant: 'default'
        });
      } else {
        setStudents([]);
        setFilteredStudents([]);
        toast({
          title: '无数据',
          description: 'students 数据集暂无学生记录',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载学生数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const filterAndSortStudents = () => {
    let filtered = [...students];

    // 按班级筛选
    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.class_name === selectedClass);
    }

    // 按住宿状态筛选
    if (selectedDorm !== 'all') {
      filtered = filtered.filter(s => selectedDorm === 'boarding' ? s.is_boarding : !s.is_boarding);
    }

    // 搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.name?.toLowerCase().includes(query) || s.student_id?.toLowerCase().includes(query));
    }

    // 排序
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    setFilteredStudents(filtered);
  };
  const handleAddStudent = async formData => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 检查学号是否已存在
      const existing = await db.collection('students').where({
        student_id: formData.student_id
      }).get();
      if (existing.data && existing.data.length > 0) {
        toast({
          title: '添加失败',
          description: '学号已存在，请检查后重试',
          variant: 'destructive'
        });
        return;
      }
      const studentData = {
        ...formData,
        _openid: $w.auth.currentUser.userId,
        created_at: getBeijingDateString(),
        updated_at: getBeijingDateString(),
        current_score: formData.current_score || 100,
        initial_score: formData.initial_score || 100,
        dorm_score: formData.is_boarding ? formData.dorm_score || 100 : 0,
        dorm_initial_score: formData.is_boarding ? formData.dorm_initial_score || 100 : 0,
        operation_history: [{
          operation: '创建学生档案',
          operator: $w.auth.currentUser.name || '系统',
          timestamp: getBeijingTimeISO(),
          details: '新建学生基础信息'
        }]
      };
      await db.collection('students').add(studentData);
      toast({
        title: '添加成功',
        description: `学生 ${formData.name} 的档案已创建`
      });
      setShowAddDialog(false);
      loadStudentsData();
    } catch (error) {
      console.error('添加学生失败:', error);
      toast({
        title: '添加失败',
        description: error.message || '无法添加学生',
        variant: 'destructive'
      });
    }
  };
  const handleUpdateStudent = async formData => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const updateData = {
        ...formData,
        updated_at: getBeijingDateString(),
        updated_by: $w.auth.currentUser.userId,
        dorm_score: formData.is_boarding ? formData.dorm_score || 100 : 0
      };
      await db.collection('students').doc(selectedStudent._id).update(updateData);
      toast({
        title: '更新成功',
        description: `学生 ${formData.name} 的档案已更新`
      });
      setShowEditDialog(false);
      loadStudentsData();
    } catch (error) {
      console.error('更新学生失败:', error);
      toast({
        title: '更新失败',
        description: error.message || '无法更新学生信息',
        variant: 'destructive'
      });
    }
  };
  const handleDeleteStudent = async student => {
    try {
      if (!confirm(`确定要删除学生 ${student.name} 的档案吗？此操作不可恢复。`)) {
        return;
      }
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('students').doc(student._id).remove();
      toast({
        title: '删除成功',
        description: `学生 ${student.name} 的档案已删除`
      });
      loadStudentsData();
    } catch (error) {
      console.error('删除学生失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '无法删除学生档案',
        variant: 'destructive'
      });
    }
  };
  const getUniqueClasses = () => {
    const classes = [...new Set(students.map(s => s.class_name).filter(Boolean))];
    return classes.sort();
  };
  const calculateScoreLevel = score => {
    if (score >= 90) return {
      label: '优秀',
      color: 'bg-green-100 text-green-800'
    };
    if (score >= 80) return {
      label: '良好',
      color: 'bg-blue-100 text-blue-800'
    };
    if (score >= 70) return {
      label: '中等',
      color: 'bg-yellow-100 text-yellow-800'
    };
    if (score >= 60) return {
      label: '及格',
      color: 'bg-orange-100 text-orange-800'
    };
    return {
      label: '需努力',
      color: 'bg-red-100 text-red-800'
    };
  };
  const handleExportData = () => {
    try {
      const exportData = filteredStudents.map(s => ({
        学号: s.student_id,
        姓名: s.name,
        性别: s.gender,
        班级: s.class_name,
        手机号: s.phone_number,
        家长手机: s.parent_phone_number,
        当前积分: formatPoints(s.current_score),
        是否住宿: s.is_boarding ? '是' : '否',
        职务: s.position || '无'
      }));
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students_${getBeijingDateString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: '导出成功',
        description: '学生数据已导出为JSON文件'
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">学生基础信息管理</h1>
          <p className="text-gray-600 mt-2">管理学生的详细档案信息</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="学生总数" value={students.length} icon={User} color="text-orange-500" bgColor="bg-orange-100" />
          <StatCard title="住宿生" value={students.filter(s => s.is_boarding).length} icon={Calendar} color="text-blue-500" bgColor="bg-blue-100" />
          <StatCard title="班干部" value={students.filter(s => s.position).length} icon={Award} color="text-purple-500" bgColor="bg-purple-100" />
          <StatCard title="平均积分" value={formatPoints(students.reduce((sum, s) => sum + (s.current_score || 0), 0) / (students.length || 1))} icon={TrendingUp} color="text-green-500" bgColor="bg-green-100" />
        </div>

        {/* 操作栏 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input placeholder="搜索学生姓名或学号..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部班级</SelectItem>
                {getUniqueClasses().map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedDorm} onValueChange={setSelectedDorm}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="boarding">住宿生</SelectItem>
                <SelectItem value="day">走读生</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_score">按积分</SelectItem>
                <SelectItem value="name">按姓名</SelectItem>
                <SelectItem value="student_id">按学号</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className={sortOrder === 'asc' ? 'bg-orange-50 border-orange-300' : ''}>
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              {canAddStudent && <Button onClick={() => setShowAddDialog(true)} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  添加学生
                </Button>}
              {canExportStudent && <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>}
            </div>
          </div>
        </div>

        {/* 学生列表 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">学生列表 ({filteredStudents.length})</h2>
          </div>

          {filteredStudents.length === 0 ? <div className="p-12 text-center text-gray-400">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">暂无学生数据</p>
              <p className="text-sm mt-2">点击「添加学生」按钮开始添加</p>
            </div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">学号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">姓名</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">班级</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">性别</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">当前积分</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">职务</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">住宿</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => {
                const scoreLevel = calculateScoreLevel(student.current_score || 0);
                return <tr key={student._id} className="border-b hover:bg-orange-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm">{student.student_id}</td>
                        <td className="py-3 px-4 font-medium">{student.name}</td>
                        <td className="py-3 px-4 text-sm">{student.class_name}</td>
                        <td className="py-3 px-4 text-sm">{student.gender}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreLevel.color}`}>
                            {formatPoints(student.current_score || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{student.position || '-'}</td>
                        <td className="py-3 px-4">
                          {student.is_boarding ? <Badge className="bg-blue-100 text-blue-800">住宿</Badge> : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedStudent(student);
                        setShowDetailDialog(true);
                      }}>
                              查看
                            </Button>
                            {canEditStudent && <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedStudent(student);
                        setShowEditDialog(true);
                      }}>
                                <Edit className="h-4 w-4" />
                              </Button>}
                            {canDeleteStudent && <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>}
                          </div>
                        </td>
                      </tr>;
              })}
                </tbody>
              </table>
            </div>}
        </div>
      </div>

      {/* 底部导航 */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />

      {/* 添加学生对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加新学生</DialogTitle>
          </DialogHeader>
          <StudentForm student={null} onSave={handleAddStudent} onCancel={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* 编辑学生对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑学生信息</DialogTitle>
          </DialogHeader>
          <StudentForm student={selectedStudent} onSave={handleUpdateStudent} onCancel={() => setShowEditDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* 学生详情对话框 */}
      {showDetailDialog && <StudentDetail student={selectedStudent} onEdit={() => {
      setShowDetailDialog(false);
      setShowEditDialog(true);
    }} onClose={() => setShowDetailDialog(false)} />}
    </div>;
}