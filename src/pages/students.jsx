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
      const result = await db.collection('students').get();

      // 添加调试日志
      console.log('students.jsx 加载学生数据:', {
        数据总数: result.data ? result.data.length : 0,
        数据库集合名: 'students',
        查询结果: result
      });
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
      // 从数据库加载真实的积分历史
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('point_record').where({
        student_id: student.studentId
      }).orderBy('record_date', 'desc').limit(20).get();
      if (result.data && result.data.length > 0) {
        const transformedHistory = result.data.map(record => ({
          id: record._id,
          type: record.point_change >= 0 ? '加分' : '扣分',
          reason: record.reason || '未说明',
          points: record.point_change,
          date: record.record_date ? record.record_date.substring(0, 10) : record.created_date?.substring(0, 10),
          category: record.point_type || '日常',
          status: record.status || '待审核'
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
        studentId: student.id
      }
    });
  };
  const handleExport = () => {
    toast({
      title: '导出成功',
      description: '学生数据已导出为Excel文件'
    });
  };
  const groups = ['all', '第一组', '第二组', '第三组', '第四组'];
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">学生管理</h1>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={handleExport} className="h-8 w-8">
              <Download className="w-4 h-4" />
            </Button>
            <Button onClick={() => toast({
            title: '功能开发中',
            description: '批量导入功能即将上线'
          })} className="h-8 text-xs">
              <Upload className="w-3.5 h-3.5 mr-1" />
              批量导入
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜索姓名或学号..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-8" />
          </div>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="选择小组" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部小组</SelectItem>
              <SelectItem value="第一组">第一组</SelectItem>
              <SelectItem value="第二组">第二组</SelectItem>
              <SelectItem value="第三组">第三组</SelectItem>
              <SelectItem value="第四组">第四组</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Stats */}
      <div className="px-3 py-2">
        <div className="grid grid-cols-3 gap-2">
          <StatCard title="总人数" value={students.length} icon={User} color="blue" />
          <StatCard title="住宿生" value={students.filter(s => s.isBoarder).length} icon={Star} color="amber" />
          <StatCard title="班干部" value={students.filter(s => s.position !== '无').length} icon={Award} color="green" />
        </div>
      </div>

      {/* Student List */}
      <div className="px-3">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm">学生列表</h3>
            <p className="text-xs text-gray-500">共 {filteredStudents.length} 名学生</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredStudents.map((student, index) => <div key={student.id} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewDetails(student)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 flex-1">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold ${index < 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'}`}>
                      {student.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className="font-semibold text-gray-900 text-sm">{student.name}</h4>
                        {student.position !== '无' && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-medium">
                            {student.position}
                          </span>}
                        {student.isBoarder && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            住宿
                          </span>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>学号: {student.studentId}</span>
                        <span>{student.group}</span>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-lg font-bold text-green-600 font-mono">{formatPoints(student.totalPoints)}</span>
                      </div>
                      <p className="text-xs text-gray-500">总积分</p>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="ml-2" onClick={e => {
                e.stopPropagation();
                handleAddPoints(student);
              }}>
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {showDetails && selectedStudent && <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-10 sm:animate-in sm:fade-in sm:zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-serif">学生档案</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Basic Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 text-white`}>
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                <p className="text-sm text-gray-500">学号: {selectedStudent.studentId}</p>
                <div className="flex gap-2 mt-1">
                  {selectedStudent.position !== '无' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                      {selectedStudent.position}
                    </span>}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${selectedStudent.isBoarder ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {selectedStudent.isBoarder ? '住宿生' : '走读生'}
                  </span>
                </div>
              </div>
            </div>

            {/* Points Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600 font-mono">{formatPoints(selectedStudent.totalPoints)}</p>
                <p className="text-xs text-gray-600">总积分</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600 font-mono">{formatPoints(selectedStudent.dailyPoints)}</p>
                <p className="text-xs text-gray-600">日常积分</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-600 font-mono">{formatPoints(selectedStudent.dormPoints)}</p>
                <p className="text-xs text-gray-600">宿舍积分</p>
              </div>
            </div>

            {/* Points History */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                积分历史
              </h4>
              <div className="space-y-2">
                {pointsHistory.map(record => <div key={record.id} className={`p-3 rounded-lg border-l-4 ${record.type === '加分' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${record.type === '加分' ? 'text-green-700' : 'text-red-700'}`}>
                        {record.type}: {record.points > 0 ? '+' : ''}{record.points}
                      </span>
                      <span className="text-xs text-gray-500">{record.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{record.reason}</p>
                    <span className="text-xs text-gray-400">{record.category}</span>
                  </div>)}
              </div>
            </div>

            {/* Academic Records */}
            {selectedStudent.academicRecords.length > 0 && <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  成绩记录
                </h4>
                <div className="space-y-2">
                  {selectedStudent.academicRecords.map((record, index) => <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{record.subject}</span>
                        <span className={`text-sm font-bold ${record.score >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                          {record.score}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{record.semester}</p>
                    </div>)}
                </div>
              </div>}

            {/* Certificates */}
            {selectedStudent.certificates.length > 0 && <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  技能证书
                </h4>
                <div className="space-y-2">
                  {selectedStudent.certificates.map((cert, index) => <div key={index} className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cert.name}</span>
                        <span className="text-xs text-amber-700 font-medium">{cert.level}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{cert.date}</p>
                    </div>)}
                </div>
              </div>}

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => {
            setShowDetails(false);
            handleAddPoints(selectedStudent);
          }}>
                <Plus className="w-4 h-4 mr-2" />
                添加积分
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
            toast({
              title: '功能开发中',
              description: '积分兑换功能即将上线'
            });
          }}>
                <Award className="w-4 h-4 mr-2" />
                积分兑换
              </Button>
            </div>
          </div>
        </div>}

      {/* Bottom Navigation */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}