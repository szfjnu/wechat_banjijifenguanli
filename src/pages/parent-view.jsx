// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/components/ui';
// @ts-ignore;
import { User, TrendingUp, Calendar, Target, Award, ShieldAlert, Mail, Phone, MapPin } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
import StudentComparison from '@/components/StudentComparison';
import ExcelExport from '@/components/ExcelExport';
import ReportGenerator from '@/components/ReportGenerator';
import GrowthTimeline from '@/components/GrowthTimeline';
import GrowthChart from '@/components/GrowthChart';
import { usePermission } from '@/components/PermissionGuard';

// 格式化积分：整数显示整数，小数最多显示两位
const formatPoints = points => {
  if (points === undefined || points === null || isNaN(points)) return '0';
  const num = Number(points);
  const rounded = Math.round(num * 100) / 100;
  // 如果小数部分为0，显示整数；否则最多显示两位小数
  return rounded === Math.floor(rounded) ? String(Math.floor(rounded)) : rounded.toFixed(2);
};
const ParentView = ({
  $w
}) => {
  const [currentPage, setCurrentPage] = useState('parent-view');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCompare, setShowCompare] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // 权限检查
  const {
    permission: canViewStudentData,
    loading: loadingViewStudentData
  } = usePermission($w, 'students', 'view');
  const {
    permission: canViewDisciplineRecords,
    loading: loadingViewDisciplineRecords
  } = usePermission($w, 'discipline', 'view');
  const {
    permission: canViewGrowthRecords,
    loading: loadingViewGrowthRecords
  } = usePermission($w, 'student_growth', 'view');
  const {
    permission: canExportData,
    loading: loadingExportData
  } = usePermission($w, 'parent_view', 'view');

  // 模拟家长关联的学生（实际项目中需要从数据库查询家长关联的学生）
  const [parentStudents, setParentStudents] = useState([]);
  useEffect(() => {
    loadInitialData();
  }, []);
  useEffect(() => {
    if (selectedStudent && selectedSemester) {
      loadGrowthRecords(selectedStudent.student_id, selectedSemester);
    }
  }, [selectedStudent, selectedSemester]);
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取当前用户信息
      const currentUser = $w.auth.currentUser;
      const userType = currentUser?.type || '';
      const userName = currentUser?.name || '';
      const userId = currentUser?.userId || '';

      // 验证用户是否为家长
      if (userType !== '家长') {
        toast({
          title: '权限错误',
          description: '当前页面仅限家长访问',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // 加载家长关联的学生（根据家长电话号码或ID查询）
      // 这里使用 parent_phone_number 字段匹配当前用户的 userId 或 name
      const studentsRes = await db.collection('students').get();
      const allStudents = studentsRes.data || [];

      // 筛选家长关联的学生（这里简化为匹配家长电话）
      // 实际项目中应该有专门的家长-学生关联表
      const parentStudents = allStudents.filter(student => {
        // 匹配家长电话号码（如果有这个字段）
        if (student.parent_phone_number && (student.parent_phone_number === userId || student.parent_phone_number === userName)) {
          return true;
        }
        return false;
      });
      setStudents(parentStudents);

      // 加载学期列表
      const semesterRes = await db.collection('semesters').get();
      const semesterList = semesterRes.data || [];
      setSemesters(semesterList);
      if (semesterList.length > 0) {
        setSelectedSemester(semesterList[0]._id);
      }

      // 如果没有关联的学生，显示提示
      if (parentStudents.length === 0) {
        toast({
          title: '提示',
          description: '系统未找到您关联的学生信息，请联系班主任确认。',
          variant: 'info'
        });
      }
      console.log('parent-view.jsx 加载家长数据:', {
        用户类型: userType,
        用户名称: userName,
        用户ID: userId,
        关联学生数: parentStudents.length,
        学生信息: parentStudents.map(s => ({
          学号: s.student_id,
          姓名: s.name
        }))
      });
      const relatedStudents = allStudents.filter(s => parentStudentIds.includes(s.student_id));
      setParentStudents(relatedStudents);

      // 默认选中第一个学生
      if (relatedStudents.length > 0) {
        setSelectedStudent(relatedStudents[0]);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const loadGrowthRecords = async (studentId, semesterId) => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const _ = db.command;
      const res = await db.collection('score_records').where({
        student_id: studentId,
        approval_status: '已通过'
      }).orderBy('date', 'desc').get();
      setGrowthRecords(res.data || []);
    } catch (error) {
      console.error('加载成长记录失败:', error);
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const calculateScoreLevel = score => {
    if (score >= 120) return {
      level: '优秀',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
    if (score >= 100) return {
      level: '良好',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    };
    if (score >= 80) return {
      level: '中等',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    };
    if (score >= 60) return {
      level: '及格',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    };
    return {
      level: '需努力',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    };
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>;
  }
  return <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 pb-20">
      {/* 头部标题 */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">家长查看</h1>
        <p className="text-orange-100 mt-1">查看孩子在校表现和成长轨迹</p>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        {/* 学生选择卡片 */}
        <Card className="border-orange-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-500" />
              选择学生
            </CardTitle>
            <CardDescription>
              选择要查看的孩子
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {parentStudents.map(student => {
                const isSelected = selectedStudent?.student_id === student.student_id;
                const scoreLevel = calculateScoreLevel(student.current_score);
                return <Card key={student.student_id} className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-2 border-orange-500 bg-orange-50' : ''}`} onClick={() => setSelectedStudent(student)}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                          <User className="h-8 w-8 text-orange-500" />
                        </div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {student.class_name}
                        </p>
                        <Badge className="mt-2" style={{
                        backgroundColor: scoreLevel.bgColor,
                        color: scoreLevel.color
                      }}>
                          {formatPoints(student.current_score)}分
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>;
              })}
            </div>
          </CardContent>
        </Card>

        {/* 学期筛选 */}
        <Card className="border-orange-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <span className="font-medium">选择学期：</span>
              </div>
              <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                {semesters.map(semester => <option key={semester._id} value={semester._id}>
                    {semester.name}
                  </option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => setShowCompare(true)} className="bg-orange-500 hover:bg-orange-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            对比分析
          </Button>
          <Button onClick={() => setShowExport(true)} variant="outline">
            <Target className="h-4 w-4 mr-2" />
            导出 Excel
          </Button>
          <Button onClick={() => setShowReport(true)} variant="outline">
            <Award className="h-4 w-4 mr-2" />
            生成报告
          </Button>
        </div>

        {/* 学生详细信息 */}
        {selectedStudent && <>
            <Card className="border-orange-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  学生信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">姓名</p>
                    <p className="font-medium">{selectedStudent.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">学号</p>
                    <p className="font-medium">{selectedStudent.student_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">班级</p>
                    <p className="font-medium">{selectedStudent.class_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">职务</p>
                    <p className="font-medium">{selectedStudent.position || '无'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">当前积分</p>
                    <p className="font-medium text-orange-600">
                      {formatPoints(selectedStudent.current_score)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">住宿状态</p>
                    <p className="font-medium">
                      {selectedStudent.is_boarding ? '住宿' : '走读'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">家长电话</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedStudent.parent_phone_number || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">家庭住址</p>
                    <p className="font-medium flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4" />
                      {selectedStudent.home_address || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 成长记录标签页 */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500">
                  数据概览
                </TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-orange-500">
                  成长时间轴
                </TabsTrigger>
                <TabsTrigger value="chart" className="data-[state=active]:bg-orange-500">
                  图表分析
                </TabsTrigger>
                <TabsTrigger value="statistics" className="data-[state=active]:bg-orange-500">
                  统计分析
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">总记录数</p>
                          <p className="text-2xl font-bold mt-2">{growthRecords.length}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">总分变化</p>
                          <p className="text-2xl font-bold mt-2">
                            {growthRecords.reduce((sum, r) => sum + r.score_change, 0)}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">正向记录</p>
                          <p className="text-2xl font-bold mt-2 text-green-600">
                            {growthRecords.filter(r => r.score_change > 0).length}
                          </p>
                        </div>
                        <Award className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">负向记录</p>
                          <p className="text-2xl font-bold mt-2 text-red-600">
                            {growthRecords.filter(r => r.score_change < 0).length}
                          </p>
                        </div>
                        <ShieldAlert className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <GrowthTimeline student={selectedStudent} records={growthRecords} />
              </TabsContent>

              <TabsContent value="chart">
                <GrowthChart records={growthRecords} student={selectedStudent} />
              </TabsContent>

              <TabsContent value="statistics">
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle>详细统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>最高单次得分</span>
                        <span className="font-bold text-green-600">
                          +{Math.max(...growthRecords.map(r => r.score_change), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>最低单次扣分</span>
                        <span className="font-bold text-red-600">
                          {Math.min(...growthRecords.map(r => r.score_change), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>平均每次变化</span>
                        <span className="font-bold">
                          {growthRecords.length > 0 ? (growthRecords.reduce((sum, r) => sum + r.score_change, 0) / growthRecords.length).toFixed(1) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>最近记录</span>
                        <span className="font-bold">
                          {growthRecords.length > 0 ? new Date(growthRecords[0].date).toLocaleDateString('zh-CN') : '-'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>}

        {/* 没有学生时的提示 */}
        {parentStudents.length === 0 && <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                没有关联的学生信息
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                请联系班主任关联学生信息
              </p>
            </CardContent>
          </Card>}
      </div>

      {/* 对话框 */}
      {selectedStudent && <>
          <StudentComparison open={showCompare} onOpenChange={setShowCompare} students={parentStudents} semesterId={selectedSemester} />

          <ExcelExport open={showExport} onOpenChange={setShowExport} data={[selectedStudent]} fileName={`${selectedStudent.name}_成长记录`} />

          <ReportGenerator open={showReport} onOpenChange={setShowReport} studentData={selectedStudent} growthData={growthRecords} />
        </>}
      </div>
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </>;
};
export default ParentView;