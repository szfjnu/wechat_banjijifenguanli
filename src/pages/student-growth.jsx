// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Activity, TrendingUp, BarChart3, Calendar, Filter, Download, Search, ArrowLeft, User, School, Award, AlertCircle } from 'lucide-react';

import { GrowthChart } from '@/components/GrowthChart';
import { GrowthTimeline } from '@/components/GrowthTimeline';
export default function StudentGrowth(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scoreRecords, setScoreRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  // 加载学生列表
  const loadStudents = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('students').get();
      setStudents(result.data || []);
    } catch (error) {
      console.error('加载学生列表失败:', error);
      toast({
        title: '加载失败',
        description: `加载学生列表失败: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载选中学生的积分记录
  const loadStudentRecords = async student => {
    if (!student) {
      setScoreRecords([]);
      setFilteredRecords([]);
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('score_records').where({
        student_id: student.student_id,
        approval_status: '已通过'
      }).orderBy('created_at', 'asc').get();
      setScoreRecords(result.data || []);
      setFilteredRecords(result.data || []);
    } catch (error) {
      console.error('加载学生记录失败:', error);
      toast({
        title: '加载失败',
        description: `加载学生记录失败: ${error.message}`,
        variant: 'destructive'
      });
    }
  };
  useEffect(() => {
    loadStudents();
  }, []);
  useEffect(() => {
    if (selectedStudent) {
      loadStudentRecords(selectedStudent);
    }
  }, [selectedStudent]);

  // 筛选和排序记录
  useEffect(() => {
    let filtered = [...scoreRecords];

    // 关键词筛选
    if (searchKeyword) {
      filtered = filtered.filter(record => record.reason_detail?.toLowerCase().includes(searchKeyword.toLowerCase()) || record.source_type?.toLowerCase().includes(searchKeyword.toLowerCase()));
    }

    // 类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.source_type === filterType);
    }

    // 排序
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    setFilteredRecords(filtered);
  }, [searchKeyword, filterType, sortOrder, scoreRecords]);

  // 导出数据
  const handleExport = () => {
    if (!selectedStudent || filteredRecords.length === 0) {
      toast({
        title: '导出失败',
        description: '请选择学生并确保有数据可导出',
        variant: 'destructive'
      });
      return;
    }
    const exportData = {
      student: selectedStudent,
      records: filteredRecords,
      exportDate: new Date().toISOString(),
      statistics: {
        totalRecords: filteredRecords.length,
        totalScoreChange: filteredRecords.reduce((sum, r) => sum + r.score_change, 0),
        positiveRecords: filteredRecords.filter(r => r.score_change > 0).length,
        negativeRecords: filteredRecords.filter(r => r.score_change < 0).length
      }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedStudent.name}_成长轨迹_${new Date().toLocaleDateString('zh-CN')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: '导出成功',
      description: '学生成长轨迹数据已导出'
    });
  };

  // 获取可用的来源类型
  const getSourceTypes = () => {
    const types = new Set(scoreRecords.map(r => r.source_type).filter(Boolean));
    return Array.from(types);
  };

  // 计算统计数据
  const getStatistics = () => {
    const total = filteredRecords.length;
    if (total === 0) return null;
    const totalChange = filteredRecords.reduce((sum, r) => sum + r.score_change, 0);
    const positive = filteredRecords.filter(r => r.score_change > 0).length;
    const negative = filteredRecords.filter(r => r.score_change < 0).length;
    const maxPositive = Math.max(...filteredRecords.map(r => r.score_change));
    const maxNegative = Math.min(...filteredRecords.map(r => r.score_change));
    return {
      total,
      totalChange,
      positive,
      negative,
      maxPositive,
      maxNegative
    };
  };
  const stats = getStatistics();
  return <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => $w.utils.navigateBack()} className="text-orange-600 hover:text-orange-700">
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回
              </Button>
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900">学生成长轨迹</h1>
              </div>
            </div>
            <Button onClick={handleExport} disabled={!selectedStudent || filteredRecords.length === 0} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 学生选择 */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 mb-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">选择学生</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-gray-500">加载中...</div>
              </div> : students.map(student => <div key={student._id} onClick={() => setSelectedStudent(student)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedStudent?._id === student._id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <span className="text-sm text-gray-500">{student.student_id}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{student.class_name}</span>
                    {student.position && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
                        {student.position}
                      </span>}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">当前积分:</span>
                    <span className={`font-semibold ${student.current_score >= 90 ? 'text-green-600' : student.current_score >= 80 ? 'text-blue-600' : student.current_score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {student.current_score || 0}
                    </span>
                  </div>
                </div>)}
          </div>
        </div>
        
        {/* 成长轨迹详情 */}
        {selectedStudent && <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
            {/* 学生信息头部 */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>{selectedStudent.class_name}</span>
                    <span>•</span>
                    <span>{selectedStudent.student_id}</span>
                    {selectedStudent.position && <>
                        <span>•</span>
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          {selectedStudent.position}
                        </span>
                      </>}
                  </div>
                </div>
              </div>
              
              {stats && <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
                    <div className="text-gray-500">总记录</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${stats.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.totalChange >= 0 ? '+' : ''}{stats.totalChange}
                    </div>
                    <div className="text-gray-500">总分变化</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
                    <div className="text-gray-500">正向</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.negative}</div>
                    <div className="text-gray-500">负向</div>
                  </div>
                </div>}
            </div>
            
            {/* 筛选工具栏 */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="搜索关键词..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="记录类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {getSourceTypes().map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">最新在前</SelectItem>
                  <SelectItem value="asc">最早在前</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 无数据提示 */}
            {filteredRecords.length === 0 ? <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">暂无成长记录</p>
                <p className="text-gray-400 text-sm mt-2">该学生还没有任何积分变动记录</p>
              </div> : <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="timeline">
                    <Calendar className="w-4 h-4 mr-2" />
                    时间轴视图
                  </TabsTrigger>
                  <TabsTrigger value="chart">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    图表分析
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline">
                  <GrowthTimeline records={filteredRecords} />
                </TabsContent>
                
                <TabsContent value="chart">
                  <GrowthChart data={filteredRecords} />
                </TabsContent>
              </Tabs>}
          </div>}
      
        {/* 未选择学生提示 */}
        {!selectedStudent && <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <User className="w-20 h-20 text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">请选择一名学生</h3>
              <p className="text-gray-500 max-w-md">
                点击上方学生卡片选择要查看成长轨迹的学生
              </p>
            </div>
          </div>}
      </div>
    </div>;
}