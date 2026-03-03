// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Plus, Calendar, Search, Filter, BookOpen, TrendingUp, TrendingDown, AlertCircle, Award, Calculator, FileText, Download, CheckCircle } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';

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
}, {
  id: 3,
  name: '2025-2026第一学期',
  startDate: '2025-09-01',
  endDate: '2026-01-15',
  isCurrent: false
}];

// 模拟学生数据
const MOCK_STUDENTS = [{
  id: 1,
  name: '张三',
  studentId: '202401001',
  group: '第一组',
  totalPoints: 156
}, {
  id: 2,
  name: '李四',
  studentId: '202401002',
  group: '第二组',
  totalPoints: 148
}, {
  id: 3,
  name: '王五',
  studentId: '202401003',
  group: '第一组',
  totalPoints: 132
}, {
  id: 4,
  name: '赵六',
  studentId: '202401004',
  group: '第三组',
  totalPoints: 145
}, {
  id: 5,
  name: '钱七',
  studentId: '202401005',
  group: '第二组',
  totalPoints: 138
}];

// 模拟成绩历史数据
const MOCK_GRADES = [{
  id: 1,
  studentId: '202401001',
  studentName: '张三',
  groupId: '第一组',
  semesterId: 2,
  semesterName: '2024-2025第二学期',
  subjectId: 1,
  subjectName: '语文',
  credits: 3,
  score: 85,
  gpa: 3.5,
  examDate: '2025-03-15',
  isPassing: true,
  remark: '表现良好'
}, {
  id: 2,
  studentId: '202401001',
  studentName: '张三',
  groupId: '第一组',
  semesterId: 2,
  semesterName: '2024-2025第二学期',
  subjectId: 2,
  subjectName: '数学',
  credits: 4,
  score: 92,
  gpa: 4.0,
  examDate: '2025-03-18',
  isPassing: true,
  remark: '优秀'
}, {
  id: 3,
  studentId: '202401002',
  studentName: '李四',
  groupId: '第二组',
  semesterId: 2,
  semesterName: '2024-2025第二学期',
  subjectId: 1,
  subjectName: '语文',
  credits: 3,
  score: 58,
  gpa: 0.0,
  examDate: '2025-03-15',
  isPassing: false,
  remark: '需要补考'
}, {
  id: 4,
  studentId: '202401003',
  studentName: '王五',
  groupId: '第一组',
  semesterId: 2,
  semesterName: '2024-2025第二学期',
  subjectId: 3,
  subjectName: '英语',
  credits: 3,
  score: 78,
  gpa: 2.7,
  examDate: '2025-03-17',
  isPassing: true,
  remark: '稳步提升'
}, {
  id: 5,
  studentId: '202401001',
  studentName: '张三',
  groupId: '第一组',
  semesterId: 1,
  semesterName: '2024-2025第一学期',
  subjectId: 2,
  subjectName: '数学',
  credits: 4,
  score: 88,
  gpa: 3.7,
  examDate: '2024-11-15',
  isPassing: true,
  remark: '成绩稳定'
}];

// 分数转GPA计算函数
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
  return 0.0;
};

// 计算平均GPA
const calculateAverageGPA = grades => {
  if (grades.length === 0) return 0;
  const total = grades.reduce((sum, grade) => sum + grade.gpa * grade.credits, 0);
  const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
  return totalCredits > 0 ? (total / totalCredits).toFixed(2) : '0.00';
};
export default function GradesPage({
  className,
  style,
  $w
}) {
  const {
    toast
  } = useToast();

  // 状态管理
  const [currentPage, setCurrentPage] = useState('grades');
  const [grades, setGrades] = useState(MOCK_GRADES);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // 筛选状态
  const [filterStudent, setFilterStudent] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 新增成绩表单
  const [formData, setFormData] = useState({
    studentId: '',
    semesterId: '',
    subjectId: '',
    score: '',
    examDate: new Date().toISOString().split('T')[0],
    remark: ''
  });

  // 统计数据
  const stats = React.useMemo(() => {
    const totalGrades = grades.length;
    const passingCount = grades.filter(g => g.isPassing).length;
    const failingCount = grades.filter(g => !g.isPassing).length;
    const avgGPA = calculateAverageGPA(grades);
    const highScoreCount = grades.filter(g => g.score >= 90).length;
    return {
      totalGrades,
      passingCount,
      failingCount,
      avgGPA,
      highScoreCount
    };
  }, [grades]);

  // 筛选成绩记录
  const filteredGrades = React.useMemo(() => {
    return grades.filter(grade => {
      const matchStudent = !filterStudent || grade.studentId === filterStudent;
      const matchSemester = !filterSemester || grade.semesterId === parseInt(filterSemester);
      const matchSubject = !filterSubject || grade.subjectId === parseInt(filterSubject);
      const matchSearch = !searchTerm || grade.studentName.includes(searchTerm) || grade.subjectName.includes(searchTerm) || grade.remark.includes(searchTerm);
      return matchStudent && matchSemester && matchSubject && matchSearch;
    }).sort((a, b) => new Date(b.examDate) - new Date(a.examDate));
  }, [grades, filterStudent, filterSemester, filterSubject, searchTerm]);

  // 处理新增成绩
  const handleAddGrade = () => {
    const student = MOCK_STUDENTS.find(s => s.id === parseInt(formData.studentId));
    const semester = SEMESTERS.find(s => s.id === parseInt(formData.semesterId));
    const subject = SUBJECTS.find(s => s.id === parseInt(formData.subjectId));
    if (!student || !semester || !subject) {
      toast({
        title: '验证失败',
        description: '请填写完整的成绩信息',
        variant: 'destructive'
      });
      return;
    }
    const score = parseFloat(formData.score);
    if (isNaN(score) || score < 0 || score > 100) {
      toast({
        title: '分数无效',
        description: '请输入0-100之间的有效分数',
        variant: 'destructive'
      });
      return;
    }
    const gpa = calculateGPA(score);
    const isPassing = score >= 60;
    const newGrade = {
      id: grades.length + 1,
      studentId: student.studentId,
      studentName: student.name,
      groupId: student.group,
      semesterId: semester.id,
      semesterName: semester.name,
      subjectId: subject.id,
      subjectName: subject.name,
      credits: subject.credits,
      score,
      gpa,
      examDate: formData.examDate,
      isPassing,
      remark: formData.remark
    };
    setGrades([newGrade, ...grades]);
    setShowAddDialog(false);
    setFormData({
      studentId: '',
      semesterId: '',
      subjectId: '',
      score: '',
      examDate: new Date().toISOString().split('T')[0],
      remark: ''
    });
    toast({
      title: '成绩录入成功',
      description: `${student.name}的${subject.name}成绩已记录（${score}分，GPA: ${gpa}）`
    });

    // 不及格自动发送提醒
    if (!isPassing) {
      setTimeout(() => {
        toast({
          title: '不及格提醒',
          description: `${student.name}的${subject.name}成绩不及格，已发送提醒给学生、家长和班主任`,
          variant: 'destructive'
        });
        console.log('发送不及格提醒给学生:', student.name);
        console.log('发送不及格提醒给家长:', student.studentId);
        console.log('发送不及格提醒给班主任:', student.group);
      }, 1500);
    }
  };

  // 查看成绩详情
  const viewGradeDetail = grade => {
    setSelectedGrade(grade);
    setShowDetailDialog(true);
  };

  // 导出成绩报表
  const exportGrades = () => {
    const csvContent = "data:text/csv;charset=utf-8," + "学号,姓名,小组,学期,科目,分数,GPA,学分,考试日期,是否通过,备注\n" + filteredGrades.map(g => `${g.studentId},${g.studentName},${g.groupId},${g.semesterName},${g.subjectName},${g.score},${g.gpa},${g.credits},${g.examDate},${g.isPassing ? '是' : '否'},${g.remark}`).join("\n");
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `成绩报表_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: '导出成功',
      description: `已导出${filteredGrades.length}条成绩记录`
    });
  };
  return <div className={className} style={style}>
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* 页面头部 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
          <h1 className="text-base font-bold mb-2">成绩管理</h1>
          <p className="text-indigo-100">录入和管理学生成绩，自动计算GPA</p>
        </div>
        
        {/* 统计卡片 */}
        <div className="px-4 -mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-indigo-600">{stats.totalGrades}</p>
                  <p className="text-xs text-gray-500 mt-1">总成绩数</p>
                </div>
                <BookOpen className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-green-600">{stats.passingCount}</p>
                  <p className="text-xs text-gray-500 mt-1">及格数</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-red-600">{stats.failingCount}</p>
                  <p className="text-xs text-gray-500 mt-1">不及格数</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-purple-600">{stats.avgGPA}</p>
                  <p className="text-xs text-gray-500 mt-1">平均GPA</p>
                </div>
                <Calculator className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-amber-600">{stats.highScoreCount}</p>
                  <p className="text-xs text-gray-500 mt-1">90分以上</p>
                </div>
                <Award className="w-8 h-8 text-amber-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* 筛选和操作栏 */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* 搜索框 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="搜索学生姓名、科目、备注..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              
              {/* 筛选条件 */}
              <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">全部学生</option>
                {MOCK_STUDENTS.map(student => <option key={student.id} value={student.id}>{student.name} ({student.studentId})</option>)}
              </select>
              
              <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">全部学期</option>
                {SEMESTERS.map(semester => <option key={semester.id} value={semester.id}>{semester.name}</option>)}
              </select>
              
              <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">全部科目</option>
                {SUBJECTS.map(subject => <option key={subject.id} value={subject.id}>{subject.name} ({subject.category})</option>)}
              </select>
              
              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button onClick={() => setShowAddDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-1" />
                  录入成绩
                </Button>
                <Button onClick={exportGrades} variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  导出
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 成绩列表 */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredGrades.length === 0 ? <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>暂无成绩记录</p>
                </div> : filteredGrades.map(grade => <div key={grade.id} onClick={() => viewGradeDetail(grade)} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${grade.isPassing ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
                        {grade.score}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{grade.studentName} - {grade.subjectName}</h3>
                        <p className="text-sm text-gray-500">{grade.studentId} | {grade.semesterName}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${grade.isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {grade.isPassing ? '及格' : '不及格'}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        GPA: {grade.gpa.toFixed(1)}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {grade.credits}学分
                      </span>
                      <span className="text-xs text-gray-500">
                        {grade.examDate}
                      </span>
                    </div>
                  </div>
                  
                  {grade.remark && <p className="mt-2 text-sm text-gray-600 pl-15">
                    <span className="text-gray-400">备注：</span>{grade.remark}
                  </p>}
                </div>)}
            </div>
          </div>
        </div>
        
        {/* 说明区域 */}
        <div className="px-4 mt-4 mb-4">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              GPA计算标准
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• 90-100分：GPA 4.0</p>
              <p>• 85-89分：GPA 3.7</p>
              <p>• 82-84分：GPA 3.3</p>
              <p>• 78-81分：GPA 3.0</p>
              <p>• 75-77分：GPA 2.7</p>
              <p>• 72-74分：GPA 2.3</p>
              <p>• 68-71分：GPA 2.0</p>
              <p>• 64-67分：GPA 1.5</p>
              <p>• 60-63分：GPA 1.0</p>
              <p>• 60分以下：GPA 0.0</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 新增成绩对话框 */}
      {showAddDialog && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                录入成绩
              </h2>
              
              <div className="space-y-4">
                {/* 选择学生 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择学生 *</label>
                  <select value={formData.studentId} onChange={e => setFormData({
                ...formData,
                studentId: e.target.value
              })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">请选择学生</option>
                    {MOCK_STUDENTS.map(student => <option key={student.id} value={student.id}>{student.name} ({student.studentId}) - {student.group}</option>)}
                  </select>
                </div>
                
                {/* 选择学期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择学期 *</label>
                  <select value={formData.semesterId} onChange={e => setFormData({
                ...formData,
                semesterId: e.target.value
              })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">请选择学期</option>
                    {SEMESTERS.map(semester => <option key={semester.id} value={semester.id}>{semester.name} {semester.isCurrent ? '(当前学期)' : ''}</option>)}
                  </select>
                </div>
                
                {/* 选择科目 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择科目 *</label>
                  <select value={formData.subjectId} onChange={e => {
                const subject = SUBJECTS.find(s => s.id === parseInt(e.target.value));
                setFormData({
                  ...formData,
                  subjectId: e.target.value
                });
              }} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">请选择科目</option>
                    {SUBJECTS.map(subject => <option key={subject.id} value={subject.id}>{subject.name} ({subject.category}, {subject.credits}学分)</option>)}
                  </select>
                </div>
                
                {/* 输入分数 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分数 (0-100) *</label>
                  <input type="number" min="0" max="100" step="0.5" value={formData.score} onChange={e => setFormData({
                ...formData,
                score: e.target.value
              })} placeholder="请输入分数" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {formData.score && <p className="mt-1 text-sm">预计GPA: <span className="font-semibold text-indigo-600">{calculateGPA(parseFloat(formData.score) || 0).toFixed(1)}</span></p>}
                </div>
                
                {/* 考试日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">考试日期 *</label>
                  <input type="date" value={formData.examDate} onChange={e => setFormData({
                ...formData,
                examDate: e.target.value
              })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                
                {/* 备注 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea value={formData.remark} onChange={e => setFormData({
                ...formData,
                remark: e.target.value
              })} rows="2" placeholder="请输入备注信息（可选）" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowAddDialog(false)} variant="outline" className="flex-1">
                  取消
                </Button>
                <Button onClick={handleAddGrade} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  提交
                </Button>
              </div>
            </div>
          </div>
        </div>}
      
      {/* 成绩详情对话框 */}
      {showDetailDialog && selectedGrade && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                成绩详情
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">学生</span>
                  <span className="font-semibold">{selectedGrade.studentName} ({selectedGrade.studentId})</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">小组</span>
                  <span className="font-semibold">{selectedGrade.groupId}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">学期</span>
                  <span className="font-semibold">{selectedGrade.semesterName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">科目</span>
                  <span className="font-semibold">{selectedGrade.subjectName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">分数</span>
                  <span className={`font-bold text-lg ${selectedGrade.isPassing ? 'text-green-600' : 'text-red-600'}`}>{selectedGrade.score}分</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">GPA</span>
                  <span className="font-bold text-lg text-purple-600">{selectedGrade.gpa.toFixed(1)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">学分</span>
                  <span className="font-semibold">{selectedGrade.credits}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">考试日期</span>
                  <span className="font-semibold">{selectedGrade.examDate}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">是否通过</span>
                  <span className={`font-semibold ${selectedGrade.isPassing ? 'text-green-600' : 'text-red-600'}`}>{selectedGrade.isPassing ? '及格' : '不及格'}</span>
                </div>
                
                {selectedGrade.remark && <div className="py-2 border-b">
                    <span className="text-gray-600 block mb-1">备注</span>
                    <p className="text-gray-800">{selectedGrade.remark}</p>
                  </div>}
              </div>
              
              <div className="mt-6">
                <Button onClick={() => setShowDetailDialog(false)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>}
      
      {/* 底部导航栏 */}
      <TabBar currentPage={currentPage} onPageChange={pageId => {
      setCurrentPage(pageId);
      $w.utils.navigateTo({
        pageId,
        params: {}
      });
    }} />
    </div>;
}