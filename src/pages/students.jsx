// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Filter, Plus, MoreVertical, TrendingUp, Award, BookOpen, User, ChevronRight, Download, Upload, AlertCircle, Calendar, Star } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { StatCard } from '@/components/StatCard';

// 格式化积分：整数显示整数，小数最多显示两位
const formatPoints = points => {
  if (points === undefined || points === null || isNaN(points)) return '0';
  const num = Number(points);
  const rounded = Math.round(num * 100) / 100;
  // 如果小数部分为0，显示整数；否则最多显示两位小数
  return rounded === Math.floor(rounded) ? String(Math.floor(rounded)) : rounded.toFixed(2);
};
export default function Students(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('students');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pointsHistory, setPointsHistory] = useState([]);
  useEffect(() => {
    loadStudentsData();
  }, []);
  useEffect(() => {
    filterStudents();
  }, [students, selectedGroup, searchQuery]);
  const loadStudentsData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('student').get();
      if (result.data && result.data.length > 0) {
        // 转换数据格式，适配前端显示
        const transformedStudents = result.data.map(student => ({
          id: student._id,
          studentId: student.student_id,
          name: student.name,
          gender: student.gender,
          group: student.group || '未分组',
          isBoarder: student.is_boarding,
          position: student.position || '无',
          totalPoints: student.current_score || 0,
          dailyPoints: student.current_score || 0,
          dormPoints: student.dorm_score || 100,
          avatar: student.avatar_url,
          birthday: student.birthday,
          className: student.class_name,
          phoneNumber: student.phone_number,
          parentPhoneNumber: student.parent_phone_number,
          academicRecords: student.academic_records || [],
          certificates: student.certificates || []
        }));
        setStudents(transformedStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法获取学生数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const filterStudents = () => {
    let filtered = [...students];
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(s => s.group === selectedGroup);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.name?.toLowerCase().includes(query) || s.studentId?.toLowerCase().includes(query));
    }
    setFilteredStudents(filtered);
  };
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const handleViewDetails = async student => {
    setSelectedStudent(student);
    try {
      // 从数据库加载真实的积分历史，使用 point_record 数据模型
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      // 使用 student_id_number 字段（学号）进行关联查询
      const result = await db.collection('point_record').where({
        student_id_number: student.studentId
      }).orderBy('record_date', 'desc').limit(20).get();
      if (result.data && result.data.length > 0) {
        const transformedHistory = result.data.map(record => ({
          id: record._id,
          type: record.point_change >= 0 ? '加分' : '扣分',
          reason: record.item_name || record.reason || '未说明',
          points: record.point_change,
          date: record.record_date ? record.record_date.substring(0, 10) : '',
          category: record.item_category || '日常',
          status: record.status || '已生效'
        }));
        setPointsHistory(transformedHistory);
      } else {
        setPointsHistory([]);
      }
    } catch (error) {
      console.error('加载积分历史失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载积分历史记录',
        variant: 'destructive'
      });
      setPointsHistory([]);
    }
    setShowDetails(true);
  };
  const handleAddPoints = student => {
    $w.utils.navigateTo({
      pageId: 'points',
      params: {
        action: 'add',
        studentId: student.studentId
      }
    });
  };
  const handleExportData = () => {
    toast({
      title: '导出功能',
      description: '正在开发中，敬请期待',
      variant: 'default'
    });
  };
  const handleImportData = () => {
    toast({
      title: '导入功能',
      description: '正在开发中，敬请期待',
      variant: 'default'
    });
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      <div className="p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">学生管理</h1>
          <p className="text-gray-600 text-sm">查看和管理班级学生信息</p>
        </header>

        {/* 筛选区域 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input placeholder="搜索姓名或学号" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择分组" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分组</SelectItem>
                  <SelectItem value="第一组">第一组</SelectItem>
                  <SelectItem value="第二组">第二组</SelectItem>
                  <SelectItem value="第三组">第三组</SelectItem>
                  <SelectItem value="第四组">第四组</SelectItem>
                  <SelectItem value="未分组">未分组</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <Button variant="outline" size="sm" onClick={handleImportData}>
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="学生总数" value={String(filteredStudents.length)} icon={User} color="blue" />
          <StatCard title="已分组" value={String(filteredStudents.filter(s => s.group !== '未分组').length)} icon={Filter} color="green" />
          <StatCard title="住宿生" value={String(filteredStudents.filter(s => s.isBoarder).length)} icon={Calendar} color="purple" />
          <StatCard title="班干部" value={String(filteredStudents.filter(s => s.position && s.position !== '无').length)} icon={Award} color="amber" />
        </div>

        {/* 学生列表 */}
        <div className="space-y-3">
          {filteredStudents.map(student => <div key={student.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetails(student)}>
              <div className="flex items-center gap-4">
                {/* 头像 */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {student.avatar ? <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full object-cover" /> : student.name?.charAt(0)}
                </div>

                {/* 基本信息 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.studentId} · {student.gender} · {student.group}</p>
                </div>

                {/* 积分信息 */}
                <div className="flex-shrink-0 text-right px-4">
                  <p className="text-2xl font-bold text-green-600 font-mono">{formatPoints(student.totalPoints)}</p>
                  <p className="text-xs text-gray-500">总积分</p>
                </div>

                {/* 操作按钮 */}
                <Button variant="ghost" size="sm" onClick={e => {
              e.stopPropagation();
              handleAddPoints(student);
            }}>
                  <Plus className="h-4 w-4" />
                </Button>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>)}

          {filteredStudents.length === 0 && <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">没有找到匹配的学生</p>
            </div>}
        </div>
      </div>

      {/* 学生详情模态框 */}
      {showDetails && selectedStudent && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center md:items-center">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">学生详情</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                ×
              </Button>
            </div>
            <div className="p-4">
              {/* 基本信息 */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {selectedStudent.avatar ? <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-full h-full rounded-full object-cover" /> : selectedStudent.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h3>
                  <p className="text-gray-600">{selectedStudent.studentId} · {selectedStudent.gender} · {selectedStudent.className}</p>
                </div>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">分组</p>
                  <p className="font-semibold text-gray-800">{selectedStudent.group}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">职位</p>
                  <p className="font-semibold text-gray-800">{selectedStudent.position}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">是否住宿</p>
                  <p className="font-semibold text-gray-800">{selectedStudent.isBoarder ? '是' : '否'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">生日</p>
                  <p className="font-semibold text-gray-800">{selectedStudent.birthday || '未设置'}</p>
                </div>
              </div>

              {/* 积分信息 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">积分信息</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600 font-mono">{formatPoints(selectedStudent.totalPoints)}</p>
                    <p className="text-xs text-gray-600">总积分</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 font-mono">{selectedStudent.dailyPoints}</p>
                    <p className="text-xs text-gray-600">日常积分</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600 font-mono">{selectedStudent.dormPoints}</p>
                    <p className="text-xs text-gray-600">宿舍积分</p>
                  </div>
                </div>
              </div>

              {/* 积分历史 */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  积分历史
                </h4>
                <div className="space-y-2">
                  {pointsHistory.length > 0 ? pointsHistory.map(record => <div key={record.id} className={`p-3 rounded-lg border-l-4 ${record.type === '加分' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{record.reason}</p>
                          <p className="text-sm text-gray-600">{record.category} · {record.date}</p>
                        </div>
                        <span className={`font-bold font-mono ${record.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {record.type}: {record.points > 0 ? '+' : ''}{record.points}
                        </span>
                      </div>
                    </div>) : <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                      暂无积分记录
                    </div>}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => handleAddPoints(selectedStudent)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加积分
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => {
              toast({
                title: '积分兑换',
                description: '积分兑换功能即将上线',
                variant: 'default'
              });
            }}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  积分兑换
                </Button>
              </div>
            </div>
          </div>
        </div>}

      <TabBar currentPage={currentPage} onNavigate={handlePageChange} />
    </div>;
}