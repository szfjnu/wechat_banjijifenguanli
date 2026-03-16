// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Plus, Calendar, Search, Filter, BookOpen, TrendingUp, TrendingDown, AlertCircle, Award, Calculator, FileText, Download, CheckCircle, Users, BarChart3 } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { getBeijingDateString, getBeijingTimeISO, getBeijingTime } from '@/lib/utils';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
import { usePermission, useDataScope, useBatchOperations, BatchOperationGuard } from '@/components/PermissionGuard';

// 学科预设数据（包含标准学分）
const SUBJECTS = [{
  id: 1,
  name: '语文',
  credits: 3,
  category: '必修'
}, {
  id: 2,
  name: '数学',
  credits: 4,
  category: '必修'
}, {
  id: 3,
  name: '英语',
  credits: 3,
  category: '必修'
}, {
  id: 4,
  name: '物理',
  credits: 3,
  category: '必修'
}, {
  id: 5,
  name: '化学',
  credits: 2,
  category: '必修'
}, {
  id: 6,
  name: '生物',
  credits: 2,
  category: '必修'
}, {
  id: 7,
  name: '历史',
  credits: 2,
  category: '必修'
}, {
  id: 8,
  name: '地理',
  credits: 2,
  category: '必修'
}, {
  id: 9,
  name: '体育',
  credits: 2,
  category: '必修'
}, {
  id: 10,
  name: '音乐',
  credits: 1,
  category: '选修'
}, {
  id: 11,
  name: '美术',
  credits: 1,
  category: '选修'
}];

// 学期预设数据
// 初始化学期列表为空，后续从数据库加载
const INITIAL_SEMESTERS = [];

// 计算GPA
const calculateGPA = score => {
  if (score >= 90) return 4.0;
  if (score >= 85) return 3.7;
  if (score >= 82) return 3.3;
  if (score >= 78) return 3.0;
  if (score >= 75) return 2.7;
  if (score >= 72) return 2.3;
  if (score >= 68) return 2.0;
  if (score >= 64) return 1.5;
  if (score >= 60) return 1.0;
  return 0;
};
export default function GradesPage(props) {
  const {
    className = '',
    style = {},
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('grades');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);

  // 权限检查
  const {
    permission: canViewGrades,
    loading: loadingViewGrades
  } = usePermission($w, 'grades', 'view');
  const {
    permission: canAddGrades,
    loading: loadingAddGrades
  } = usePermission($w, 'grades', 'add');
  const {
    permission: canEditGrades,
    loading: loadingEditGrades
  } = usePermission($w, 'grades', 'edit');
  const {
    permission: canDeleteGrades,
    loading: loadingDeleteGrades
  } = usePermission($w, 'grades', 'delete');

  // 数据范围检查
  const {
    dataScope,
    canViewAll,
    canViewClass
  } = useDataScope($w);

  // 批量操作权限
  const {
    canBatchOperate,
    reason: batchReason
  } = useBatchOperations($w);
  const [students, setStudents] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [semesters, setSemesters] = useState(INITIAL_SEMESTERS);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportRange, setExportRange] = useState('all');

  // 表单状态
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    score: '',
    examDate: getBeijingDateString(),
    semesterId: '',
    remark: ''
  });

  // 加载学期数据
  const loadSemesters = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('semesters').orderBy('start_date', 'desc').get();
      if (result.data && result.data.length > 0) {
        const transformedSemesters = result.data.map(sem => ({
          id: sem._id,
          name: sem.semester_name,
          startDate: sem.start_date ? sem.start_date.split('T')[0] : '',
          endDate: sem.end_date ? sem.end_date.split('T')[0] : '',
          isCurrent: sem.is_current || false
        }));
        setSemesters(transformedSemesters);
      }
    } catch (error) {
      console.error('加载学期数据失败:', error);
    }
  };

  // 加载数据
  useEffect(() => {
    loadData();
    loadStudents();
    loadSemesters();
  }, []);
  const loadStudents = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('students').get();
      if (result.data && result.data.length > 0) {
        const transformedStudents = result.data.map(student => ({
          id: student._id,
          name: student.name,
          studentId: student.student_id || '',
          group: student.group_id || student.group || '未分组',
          totalPoints: student.current_score || 0
        }));
        setStudents(transformedStudents);
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
    }
  };
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取当前用户信息（优先从 localStorage 读取，因为登录页面使用 Mock 数据）
      let currentUser = $w.auth.currentUser;
      if (!currentUser || !currentUser.type) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        }
      }
      const userType = currentUser?.type || '';
      const userName = currentUser?.name || '';
      console.log('当前用户信息:', {
        userType,
        userName
      });

      // 根据用户类型构建查询条件
      let query = {};
      if (dataScope === 'self') {
        // 学生或家长只看自己的成绩
        query = {
          student_name: userName
        };
      } else if (dataScope === 'class') {
        // 教师或班主任查看班级学生成绩（需要先获取用户管理的班级）
        try {
          const userResult = await db.collection('user').where({
            name: userName,
            type: userType
          }).get();
          if (userResult.data && userResult.data.length > 0) {
            const userData = userResult.data[0];
            if (userData.managed_class_name) {
              // 先获取班级中的学生姓名
              const studentsResult = await db.collection('students').where({
                class_name: userData.managed_class_name
              }).field({
                name: true
              }).get();
              const studentNames = studentsResult.data?.map(s => s.name) || [];
              if (studentNames.length > 0) {
                query = {
                  student_name: db.command.in(studentNames)
                };
              } else {
                // 班级中没有学生，返回空结果
                setGrades([]);
                setLoading(false);
                return;
              }
            }
          }
        } catch (err) {
          console.error('查询班级信息失败:', err);
          // 查询失败时，显示空数据
          setGrades([]);
          setLoading(false);
          return;
        }
      }
      // dataScope === 'all'（管理员）查看所有数据

      const result = await db.collection('grade').where(query).orderBy('exam_date', 'desc').limit(100).get();
      if (result.data && result.data.length > 0) {
        const transformedGrades = result.data.map(g => ({
          id: g._id,
          studentId: g.student_id || '',
          studentName: g.student_name || '',
          subjectId: g.subject_id || 0,
          subjectName: g.subject_name || '',
          semesterId: g.semester_id || 0,
          semesterName: g.semester_name || '',
          examType: g.exam_type || '',
          score: g.score || 0,
          credits: g.credits || 0,
          examDate: g.exam_date ? g.exam_date.split('T')[0] : '',
          rank: g.rank || null,
          gpa: g.gpa || calculateGPA(g.score || 0),
          isPassing: g.is_passing || false,
          remark: g.remark || ''
        }));
        setGrades(transformedGrades);
      } else {
        setGrades([]);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载成绩数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 过滤成绩
  const filteredGrades = grades.filter(grade => {
    const matchSearch = grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || grade.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) || grade.remark.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStudent = filterStudent === 'all' || grade.studentId === filterStudent;
    const matchSubject = filterSubject === 'all' || grade.subjectId === parseInt(filterSubject);
    const matchSemester = filterSemester === 'all' || grade.semesterId === filterSemester;
    return matchSearch && matchStudent && matchSubject && matchSemester;
  });

  // 统计数据
  const stats = {
    totalGrades: filteredGrades.length,
    passingCount: filteredGrades.filter(g => g.isPassing).length,
    failingCount: filteredGrades.filter(g => !g.isPassing).length,
    avgGPA: filteredGrades.length > 0 ? (filteredGrades.reduce((sum, g) => sum + g.gpa, 0) / filteredGrades.length).toFixed(2) : '0.00',
    highScoreCount: filteredGrades.filter(g => g.score >= 90).length
  };

  // 获取分数等级样式
  const getScoreLevelStyle = score => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // 添加成绩
  const handleAddGrade = async () => {
    if (!formData.studentId || !formData.subjectId || !formData.score) {
      toast({
        title: '填写不完整',
        description: '请填写所有必填项',
        variant: 'destructive'
      });
      return;
    }
    const score = parseFloat(formData.score);
    if (score < 0 || score > 100) {
      toast({
        title: '分数无效',
        description: '分数必须在0-100之间',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const student = students.find(s => s.id === formData.studentId);
      const subject = SUBJECTS.find(sub => sub.id === parseInt(formData.subjectId));
      const semester = semesters.find(sem => sem.id === formData.semesterId);

      // 添加成绩到数据库
      const result = await db.collection('grade').add({
        student_id: formData.studentId || '',
        student_name: student.name,
        subject_id: subject.id,
        subject_name: subject.name,
        semester_id: semester.id,
        semester_name: semester.name,
        exam_type: '期末',
        score: score,
        credits: subject.credits,
        exam_date: formData.examDate,
        rank: null,
        gpa: calculateGPA(score),
        is_passing: score >= 60,
        remark: formData.remark
      });
      const newGrade = {
        id: result.id || result.ids?.[0] || `GRADE${getBeijingTime().getTime()}`,
        studentId: formData.studentId,
        studentName: student.name,
        subjectId: subject.id,
        subjectName: subject.name,
        score: score,
        credits: subject.credits,
        examDate: formData.examDate,
        semesterId: semester.id,
        semesterName: semester.name,
        isPassing: score >= 60,
        remark: formData.remark,
        gpa: calculateGPA(score)
      };
      setGrades([...grades, newGrade]);
      setShowAddDialog(false);
      setFormData({
        studentId: '',
        subjectId: '',
        score: '',
        examDate: getBeijingDateString(),
        semesterId: '',
        remark: ''
      });
      toast({
        title: '添加成功',
        description: '成绩已添加'
      });
    } catch (error) {
      console.error('添加失败:', error);
      toast({
        title: '添加失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 查看成绩详情
  const viewGradeDetail = grade => {
    setSelectedGrade(grade);
    setShowDetailDialog(true);
  };

  // 导出成绩报表
  const exportGrades = () => {
    try {
      let exportData = filteredGrades;
      if (exportRange === 'current_month') {
        const now = getBeijingTime();
        exportData = filteredGrades.filter(g => {
          const gradeDate = new Date(g.examDate);
          return gradeDate.getMonth() === now.getMonth() && gradeDate.getFullYear() === now.getFullYear();
        });
      } else if (exportRange === 'last_month') {
        const now = getBeijingTime();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        exportData = filteredGrades.filter(g => {
          const gradeDate = new Date(g.examDate);
          return gradeDate.getMonth() === lastMonth.getMonth() && gradeDate.getFullYear() === lastMonth.getFullYear();
        });
      }
      const csvContent = `学号,姓名,小组,学期,科目,分数,GPA,学分,考试日期,是否通过,备注\n${exportData.map(g => {
        const student = students.find(s => s.id === g.studentId);
        return `${g.studentId},${g.studentName},${student ? student.group : ''},${g.semesterName},${g.subjectName},${g.score},${g.gpa},${g.credits},${g.examDate},${g.isPassing ? '是' : '否'},${g.remark}`;
      }).join('\n')}`;
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `成绩报表_${getBeijingDateString()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setShowExportDialog(false);
      toast({
        title: '导出成功',
        description: `已导出${exportData.length}条成绩记录`
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-sm">加载中...</p>
          </div>
        </div>;
  }
  return <div className={`${className}`} style={style}>
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* 页面头部 - 紧凑 */}
        <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">成绩管理</h1>
              <p className="text-xs text-gray-500">学生成绩录入与统计</p>
            </div>
            <div className="flex gap-1">
              <BatchOperationGuard $w={$w}>
                <Button onClick={() => setShowExportDialog(true)} variant="outline" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </BatchOperationGuard>
              <BatchOperationGuard $w={$w}>
                <Button onClick={() => setShowAddDialog(true)} variant="outline" size="icon" className="h-8 w-8">
                  <Plus className="w-4 w-4" />
                </Button>
              </BatchOperationGuard>
            </div>
          </div>
        </header>

        <main className="px-3 py-2">
          {/* 统计概览 - 紧凑 */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard title="成绩总数" value={stats.totalGrades} icon={BookOpen} color="blue" />
            <StatCard title="及格数" value={stats.passingCount} icon={CheckCircle} color="green" />
            <StatCard title="不及格数" value={stats.failingCount} icon={AlertCircle} color="red" />
            <StatCard title="平均GPA" value={stats.avgGPA} icon={Calculator} color="purple" />
            <StatCard title="90分以上" value={stats.highScoreCount} icon={Award} color="amber" />
          </div>

          {/* 筛选栏 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="搜索学生、科目..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
                <option value="all">全部学生</option>
                {students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
              <select className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                <option value="all">全部科目</option>
                {SUBJECTS.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </div>
          </div>

          {/* 成绩列表 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                成绩列表
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredGrades.length === 0 ? <div className="p-6 text-center text-gray-500 text-sm">
                  暂无成绩记录
                </div> : filteredGrades.map(grade => {
              const scoreStyle = getScoreLevelStyle(grade.score);
              return <div key={grade.id} className={`p-2.5 hover:bg-gray-50 transition-colors ${!grade.isPassing ? 'bg-red-50/50' : ''}`}>
                    <div className="flex items-start gap-2">
                      {/* 学生头像 */}
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {grade.studentName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="font-medium text-gray-800 text-sm">{grade.studentName}</h3>
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${scoreStyle}`}>
                            {grade.score}分
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 mb-1.5">{grade.subjectName}</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${grade.isPassing ? 'text-green-600' : 'text-red-600'}`}>
                            {grade.isPassing ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                            {grade.isPassing ? '及格' : '不及格'}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            GPA: {grade.gpa.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {grade.examDate}
                          </span>
                        </div>
                      </div>
                      {/* 操作按钮 */}
                      <div className="flex gap-1">
                        <Button onClick={() => viewGradeDetail(grade)} variant="ghost" size="icon" className="h-7 w-7">
                          <FileText className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>;
            })}
            </div>
          </div>
        </main>

        {/* 添加成绩对话框 */}
        {showAddDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">添加成绩</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学生</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.studentId} onChange={e => setFormData({
                ...formData,
                studentId: e.target.value
              })}>
                    <option value="">请选择学生</option>
                    {students.map(student => <option key={student.id} value={student.id}>{student.name} ({student.studentId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.subjectId} onChange={e => setFormData({
                ...formData,
                subjectId: e.target.value
              })}>
                    <option value="">请选择科目</option>
                    {SUBJECTS.map(subject => <option key={subject.id} value={subject.id}>{subject.name} ({subject.credits}学分)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分数</label>
                  <input type="number" min="0" max="100" step="0.5" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.score} onChange={e => setFormData({
                ...formData,
                score: e.target.value
              })} placeholder="请输入分数(0-100)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">考试日期</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.examDate} onChange={e => setFormData({
                ...formData,
                examDate: e.target.value
              })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学期</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={formData.semesterId} onChange={e => setFormData({
                ...formData,
                semesterId: e.target.value
              })}>
                    <option value="">请选择学期</option>
                    {semesters.map(semester => <option key={semester.id} value={semester.id}>{semester.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" rows={2} value={formData.remark} onChange={e => setFormData({
                ...formData,
                remark: e.target.value
              })} placeholder="可选备注" />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <Button onClick={() => setShowAddDialog(false)} variant="outline" className="px-4 py-2">
                  取消
                </Button>
                <Button onClick={handleAddGrade} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2">
                  添加
                </Button>
              </div>
            </div>
          </div>}

        {/* 成绩详情对话框 */}
        {showDetailDialog && selectedGrade && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">成绩详情</h3>
                <Button onClick={() => {
              setShowDetailDialog(false);
              setSelectedGrade(null);
            }} variant="ghost" size="icon" className="h-8 w-8">
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedGrade.studentName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedGrade.studentName}</p>
                    <p className="text-sm text-gray-500">{students.find(s => s.id === selectedGrade.studentId)?.studentId}</p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg border-2 ${getScoreLevelStyle(selectedGrade.score)}
`}>
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">{selectedGrade.score}</p>
                    <p className="text-sm font-medium">分</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">科目</span>
                    <span className="text-sm font-medium text-gray-800">{selectedGrade.subjectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">GPA</span>
                    <span className="text-sm font-medium text-gray-800">{selectedGrade.gpa.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">学分</span>
                    <span className="text-sm font-medium text-gray-800">{selectedGrade.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">学期</span>
                    <span className="text-sm font-medium text-gray-800">{selectedGrade.semesterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">考试日期</span>
                    <span className="text-sm font-medium text-gray-800">{selectedGrade.examDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">是否及格</span>
                    <span className={`text-sm font-medium ${selectedGrade.isPassing ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedGrade.isPassing ? '及格' : '不及格'}
                    </span>
                  </div>
                  {selectedGrade.remark && <div className="border-t border-gray-200 pt-2">
                      <span className="text-sm text-gray-600">备注</span>
                      <p className="text-sm text-gray-800 mt-1">{selectedGrade.remark}</p>
                    </div>}
                </div>
              </div>
            </div>
          </div>}

        {/* 导出对话框 */}
        {showExportDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">导出成绩报表</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">导出范围</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportRange" value="all" checked={exportRange === 'all'} onChange={e => setExportRange(e.target.value)} className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-700">全部记录</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportRange" value="current_month" checked={exportRange === 'current_month'} onChange={e => setExportRange(e.target.value)} className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-700">本月记录</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportRange" value="last_month" checked={exportRange === 'last_month'} onChange={e => setExportRange(e.target.value)} className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-700">上月记录</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <Button onClick={() => setShowExportDialog(false)} variant="outline" className="px-4 py-2">
                  取消
                </Button>
                <Button onClick={exportGrades} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2">
                  导出
                </Button>
              </div>
            </div>
          </div>}

        {/* 底部导航栏 */}
        <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </div>;
}