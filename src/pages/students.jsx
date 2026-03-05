// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Filter, Plus, MoreVertical, TrendingUp, Award, BookOpen, User, ChevronRight, Download, Upload, AlertCircle, Calendar, Star } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { StatCard } from '@/components/StatCard';
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

      // 模拟数据加载
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudents([{
        id: 1,
        studentId: '2024001',
        name: '张三',
        gender: '男',
        group: '第一组',
        isBoarder: true,
        position: '学习委员',
        totalPoints: 156,
        dailyPoints: 85,
        dormPoints: 71,
        avatar: null,
        birthday: '2006-05-15',
        academicRecords: [{
          subject: '数学',
          score: 85,
          semester: '2024-春'
        }, {
          subject: '语文',
          score: 88,
          semester: '2024-春'
        }, {
          subject: '英语',
          score: 82,
          semester: '2024-春'
        }],
        certificates: [{
          name: '英语四级',
          level: '通过',
          date: '2024-01-15'
        }, {
          name: '数学竞赛',
          level: '省级三等奖',
          date: '2024-02-20'
        }]
      }, {
        id: 2,
        studentId: '2024002',
        name: '李四',
        gender: '女',
        group: '第二组',
        isBoarder: true,
        position: '无',
        totalPoints: 148,
        dailyPoints: 78,
        dormPoints: 70,
        avatar: null,
        birthday: '2006-03-02',
        academicRecords: [{
          subject: '数学',
          score: 92,
          semester: '2024-春'
        }, {
          subject: '语文',
          score: 85,
          semester: '2024-春'
        }, {
          subject: '英语',
          score: 90,
          semester: '2024-春'
        }],
        certificates: []
      }, {
        id: 3,
        studentId: '2024003',
        name: '王五',
        gender: '男',
        group: '第一组',
        isBoarder: false,
        position: '体育委员',
        totalPoints: 142,
        dailyPoints: 82,
        dormPoints: 60,
        avatar: null,
        birthday: '2006-08-20',
        academicRecords: [{
          subject: '数学',
          score: 78,
          semester: '2024-春'
        }, {
          subject: '语文',
          score: 80,
          semester: '2024-春'
        }, {
          subject: '英语',
          score: 75,
          semester: '2024-春'
        }],
        certificates: [{
          name: '体育特长生',
          level: '省级',
          date: '2023-12-10'
        }]
      }, {
        id: 4,
        studentId: '2024004',
        name: '赵六',
        gender: '女',
        group: '第三组',
        isBoarder: true,
        position: '无',
        totalPoints: 135,
        dailyPoints: 65,
        dormPoints: 70,
        avatar: null,
        birthday: '2006-11-25',
        academicRecords: [{
          subject: '数学',
          score: 70,
          semester: '2024-春'
        }, {
          subject: '语文',
          score: 75,
          semester: '2024-春'
        }, {
          subject: '英语',
          score: 68,
          semester: '2024-春'
        }],
        certificates: []
      }, {
        id: 5,
        studentId: '2024005',
        name: '孙七',
        gender: '男',
        group: '第二组',
        isBoarder: false,
        position: '无',
        totalPoints: 130,
        dailyPoints: 60,
        dormPoints: 70,
        avatar: null,
        birthday: '2006-07-10',
        academicRecords: [{
          subject: '数学',
          score: 65,
          semester: '2024-春'
        }, {
          subject: '语文',
          score: 72,
          semester: '2024-春'
        }, {
          subject: '英语',
          score: 63,
          semester: '2024-春'
        }],
        certificates: []
      }]);
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
    let filtered = students;
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(s => s.group === selectedGroup);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(query) || s.studentId.includes(query));
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
  const handleViewDetails = student => {
    setSelectedStudent(student);

    // 模拟积分历史
    setPointsHistory([{
      id: 1,
      type: '加分',
      reason: '课堂表现优秀',
      points: 5,
      date: '2024-03-01',
      category: '日常'
    }, {
      id: 2,
      type: '加分',
      reason: '完成志愿服务2小时',
      points: 4,
      date: '2024-02-28',
      category: '志愿'
    }, {
      id: 3,
      type: '扣分',
      reason: '宿舍卫生不达标',
      points: -3,
      date: '2024-02-25',
      category: '宿舍'
    }, {
      id: 4,
      type: '加分',
      reason: '技能证书获得',
      points: 10,
      date: '2024-02-20',
      category: '证书'
    }, {
      id: 5,
      type: '加分',
      reason: '作业完成质量好',
      points: 3,
      date: '2024-02-18',
      category: '日常'
    }]);
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
                        <span className="text-lg font-bold text-green-600 font-mono">{student.totalPoints}</span>
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
                <p className="text-2xl font-bold text-green-600 font-mono">{selectedStudent.totalPoints}</p>
                <p className="text-xs text-gray-600">总积分</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600 font-mono">{selectedStudent.dailyPoints}</p>
                <p className="text-xs text-gray-600">日常积分</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-600 font-mono">{selectedStudent.dormPoints}</p>
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