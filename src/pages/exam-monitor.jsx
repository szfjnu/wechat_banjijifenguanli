// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { GraduationCap, BookOpen, Award, TrendingUp, AlertCircle, CheckCircle, Clock, Search, Download, FileText, Plus, Flag, Info, Target } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';

// 模拟转段考科目配置（可标记为转段考科目）
const EXAM_SUBJECTS = [{
  id: 1,
  name: '语文',
  isExamSubject: true,
  passingScore: 60,
  credits: 3
}, {
  id: 2,
  name: '数学',
  isExamSubject: true,
  passingScore: 60,
  credits: 4
}, {
  id: 3,
  name: '英语',
  isExamSubject: true,
  passingScore: 60,
  credits: 3
}, {
  id: 4,
  name: '物理',
  isExamSubject: false,
  passingScore: 60,
  credits: 3
}, {
  id: 5,
  name: '化学',
  isExamSubject: false,
  passingScore: 60,
  credits: 2
}, {
  id: 6,
  name: '生物',
  isExamSubject: false,
  passingScore: 60,
  credits: 2
}, {
  id: 7,
  name: '历史',
  isExamSubject: false,
  passingScore: 60,
  credits: 2
}, {
  id: 8,
  name: '地理',
  isExamSubject: false,
  passingScore: 60,
  credits: 2
}];

// 模拟学生数据
const MOCK_STUDENTS = [{
  id: 1,
  studentId: '2024001',
  name: '张伟',
  group: '第一组',
  points: 85,
  gpa: 3.5,
  certificates: [{
    name: '英语四级',
    level: '省级',
    date: '2024-12-15'
  }, {
    name: '计算机二级',
    level: '省级',
    date: '2025-01-10'
  }]
}, {
  id: 2,
  studentId: '2024002',
  name: '李娜',
  group: '第二组',
  points: 72,
  gpa: 3.8,
  certificates: [{
    name: '英语四级',
    level: '省级',
    date: '2024-11-20'
  }]
}, {
  id: 3,
  studentId: '2024003',
  name: '王强',
  group: '第一组',
  points: 68,
  gpa: 3.2,
  certificates: []
}, {
  id: 4,
  studentId: '2024004',
  name: '赵敏',
  group: '第三组',
  points: 91,
  gpa: 4.0,
  certificates: [{
    name: '英语六级',
    level: '国家级',
    date: '2024-10-05'
  }, {
    name: '计算机二级',
    level: '省级',
    date: '2024-12-20'
  }, {
    name: '普通话证书',
    level: '省级',
    date: '2025-01-05'
  }]
}, {
  id: 5,
  studentId: '2024005',
  name: '刘洋',
  group: '第二组',
  points: 55,
  gpa: 2.8,
  certificates: [{
    name: '英语四级',
    level: '省级',
    date: '2025-01-15'
  }]
}, {
  id: 6,
  studentId: '2024006',
  name: '陈静',
  group: '第三组',
  points: 78,
  gpa: 3.6,
  certificates: []
}];

// 模拟转段考成绩记录
const MOCK_EXAM_GRADES = [{
  id: 1,
  studentId: '2024001',
  studentName: '张伟',
  subjectId: 1,
  subjectName: '语文',
  score: 85,
  examDate: '2025-06-15',
  isPassing: true,
  remarks: ''
}, {
  id: 2,
  studentId: '2024001',
  studentName: '张伟',
  subjectId: 2,
  subjectName: '数学',
  score: 72,
  examDate: '2025-06-15',
  isPassing: true,
  remarks: ''
}, {
  id: 3,
  studentId: '2024001',
  studentName: '张伟',
  subjectId: 3,
  subjectName: '英语',
  score: 88,
  examDate: '2025-06-15',
  isPassing: true,
  remarks: ''
}, {
  id: 4,
  studentId: '2024002',
  studentName: '李娜',
  subjectId: 1,
  subjectName: '语文',
  score: 92,
  examDate: '2025-06-15',
  isPassing: true,
  remarks: ''
}, {
  id: 5,
  studentId: '2024002',
  studentName: '李娜',
  subjectId: 2,
  subjectName: '数学',
  score: 68,
  examDate: '2025-06-15',
  isPassing: true,
  remarks: ''
}, {
  id: 6,
  studentId: '2024002',
  studentName: '李娜',
  subjectId: 3,
  subjectName: '英语',
  score: 76,
  examDate: '2025-06-15',
  isPassing: true,
  remarks: ''
}, {
  id: 7,
  studentId: '2024003',
  studentName: '王强',
  subjectId: 1,
  subjectName: '语文',
  score: 58,
  examDate: '2025-06-15',
  isPassing: false,
  remarks: '不及格'
}, {
  id: 8,
  studentId: '2024003',
  studentName: '王强',
  subjectId: 2,
  subjectName: '数学',
  score: 55,
  examDate: '2025-06-15',
  isPassing: false,
  remarks: '不及格'
}, {
  id: 9,
  studentId: '2024003',
  studentName: '王强',
  subjectId: 3,
  subjectName: '英语',
  score: 62,
  examDate: '2025-06-15',
  isPassing: true,
  remarks: ''
}];

// 技能证书要求配置
const CERTIFICATE_REQUIREMENTS = [{
  id: 1,
  name: '英语四级',
  required: true,
  level: '省级',
  priority: 'high'
}, {
  id: 2,
  name: '计算机二级',
  required: true,
  level: '省级',
  priority: 'medium'
}, {
  id: 3,
  name: '普通话证书',
  required: false,
  level: '省级',
  priority: 'low'
}, {
  id: 4,
  name: '英语六级',
  required: false,
  level: '国家级',
  priority: 'medium'
}];
export default function ExamMonitorPage(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils;
  const [currentPage, setCurrentPage] = useState('exam-monitor');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };

  // 数据状态
  const [students] = useState(MOCK_STUDENTS);
  const [examGrades, setExamGrades] = useState(MOCK_EXAM_GRADES);
  const [examSubjects, setExamSubjects] = useState(EXAM_SUBJECTS);

  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('全部小组');
  const [selectedStatus, setSelectedStatus] = useState('全部状态');

  // 对话框状态
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);

  // 新增成绩表单
  const [newGrade, setNewGrade] = useState({
    studentId: '',
    subjectId: '',
    score: '',
    examDate: '',
    remarks: ''
  });

  // 统计数据
  const totalStudents = students.length;
  const examSubjectCount = examSubjects.filter(s => s.isExamSubject).length;
  const examGradesCount = examGrades.length;
  const passingStudents = students.filter(student => {
    const studentGrades = examGrades.filter(g => g.studentId === student.studentId);
    const examSubjectIds = examSubjects.filter(s => s.isExamSubject).map(s => s.id);
    const hasExamGrades = studentGrades.some(g => examSubjectIds.includes(g.subjectId));
    if (!hasExamGrades) return false;
    return studentGrades.every(g => g.isPassing);
  }).length;
  const certificateProgress = students.map(student => {
    const requiredCertificates = CERTIFICATE_REQUIREMENTS.filter(c => c.required);
    const studentCertificates = student.certificates || [];
    const obtainedCertificates = requiredCertificates.filter(req => studentCertificates.some(cert => cert.name === req.name));
    return {
      studentId: student.studentId,
      studentName: student.name,
      required: requiredCertificates.length,
      obtained: obtainedCertificates.length,
      progress: requiredCertificates.length > 0 ? Math.round(obtainedCertificates.length / requiredCertificates.length * 100) : 0
    };
  });
  const averageCertificateProgress = Math.round(certificateProgress.reduce((sum, p) => sum + p.progress, 0) / certificateProgress.length);

  // 格式化日期
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 计算学生转段考状态
  const getExamStatus = student => {
    const examSubjectIds = examSubjects.filter(s => s.isExamSubject).map(s => s.id);
    const studentGrades = examGrades.filter(g => g.studentId === student.studentId && examSubjectIds.includes(g.subjectId));
    if (studentGrades.length === 0) {
      return {
        status: '未考试',
        color: 'gray',
        icon: Clock,
        message: '尚未参加转段考'
      };
    }
    const allPassed = studentGrades.every(g => g.isPassing);
    if (allPassed) {
      return {
        status: '全部通过',
        color: 'green',
        icon: CheckCircle,
        message: '所有转段考科目均通过'
      };
    }
    const failedCount = studentGrades.filter(g => !g.isPassing).length;
    return {
      status: '部分通过',
      color: 'orange',
      icon: AlertCircle,
      message: `${failedCount}门科目未通过`
    };
  };

  // 计算证书完成度
  const getCertificateProgress = student => {
    const requiredCertificates = CERTIFICATE_REQUIREMENTS.filter(c => c.required);
    const studentCertificates = student.certificates || [];
    const obtainedCertificates = requiredCertificates.filter(req => studentCertificates.some(cert => cert.name === req.name));
    return {
      required: requiredCertificates.length,
      obtained: obtainedCertificates.length,
      progress: requiredCertificates.length > 0 ? Math.round(obtainedCertificates.length / requiredCertificates.length * 100) : 0,
      missingCertificates: requiredCertificates.filter(req => !studentCertificates.some(cert => cert.name === req.name)).map(c => c.name)
    };
  };

  // 检查学生是否符合转段条件
  const checkPromotionEligibility = student => {
    const examStatus = getExamStatus(student);
    const certProgress = getCertificateProgress(student);
    const examsPassed = examStatus.status === '全部通过';
    const certificatesCompleted = certProgress.progress >= 100;
    const points = student.points || 0;
    const pointsPassed = points >= 60;
    if (examsPassed && certificatesCompleted && pointsPassed) {
      return {
        eligible: true,
        message: '符合转段条件',
        color: 'green'
      };
    }
    const issues = [];
    if (!examsPassed) issues.push('转段考科目未全部通过');
    if (!certificatesCompleted) issues.push('必备技能证书未完成');
    if (!pointsPassed) issues.push('积分未达标');
    return {
      eligible: false,
      message: issues.join('、'),
      color: 'red'
    };
  };

  // 切换转段考科目标记
  const toggleExamSubject = subjectId => {
    setExamSubjects(prev => prev.map(subject => subject.id === subjectId ? {
      ...subject,
      isExamSubject: !subject.isExamSubject
    } : subject));
    toast({
      title: '科目设置已更新',
      description: '转段考科目标记已更新',
      variant: 'success'
    });
  };

  // 提交成绩
  const handleSubmitGrade = () => {
    if (!newGrade.studentId || !newGrade.subjectId || !newGrade.score || !newGrade.examDate) {
      toast({
        title: '请填写完整信息',
        description: '请选择学生、科目、分数和考试日期',
        variant: 'error'
      });
      return;
    }
    const student = students.find(s => s.studentId === newGrade.studentId);
    const subject = examSubjects.find(s => s.id === parseInt(newGrade.subjectId));
    const score = parseFloat(newGrade.score);
    const isPassing = score >= subject.passingScore;
    const grade = {
      id: examGrades.length + 1,
      studentId: newGrade.studentId,
      studentName: student.name,
      subjectId: parseInt(newGrade.subjectId),
      subjectName: subject.name,
      score: score,
      examDate: newGrade.examDate,
      isPassing: isPassing,
      remarks: newGrade.remarks
    };
    setExamGrades(prev => [...prev, grade]);
    setShowGradeDialog(false);
    setNewGrade({
      studentId: '',
      subjectId: '',
      score: '',
      examDate: '',
      remarks: ''
    });
    toast({
      title: '成绩录入成功',
      description: `${student.name} ${subject.name} 成绩已录入`,
      variant: 'success'
    });
  };

  // 导出报表
  const handleExport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,\ufeff学号,姓名,小组,转段考科目数,通过科目数,证书要求,已获证书,证书完成度,积分,GPA,转段状态\n' + students.map(student => {
      const examStatus = getExamStatus(student);
      const certProgress = getCertificateProgress(student);
      const eligibility = checkPromotionEligibility(student);
      return `${student.studentId},${student.name},${student.group},${examSubjectCount},
          ${examStatus.status === '全部通过' ? examSubjectCount : examStatus.status === '未考试' ? 0 : examSubjectCount - parseInt(examStatus.message)},
          ${certProgress.required},${certProgress.obtained},${certProgress.progress}%,${student.points},${student.gpa},
          ${eligibility.eligible ? '符合' : '不符合'}`;
    }).join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `转段考监控报表_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
    toast({
      title: '导出成功',
      description: '转段考监控报表已导出',
      variant: 'success'
    });
  };

  // 筛选学生列表
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) || student.studentId.includes(searchTerm);
    const matchesGroup = selectedGroup === '全部小组' || student.group === selectedGroup;
    const eligibility = checkPromotionEligibility(student);
    const matchesStatus = selectedStatus === '全部状态' || selectedStatus === '符合条件' && eligibility.eligible || selectedStatus === '不符合条件' && !eligibility.eligible;
    return matchesSearch && matchesGroup && matchesStatus;
  });
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部标题栏 */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-6 py-8 text-white shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-8 h-8" />
            <h1 className="text-3xl font-bold">转段考监控</h1>
          </div>
          <p className="text-blue-100 ml-11">监控转段考成绩，检查技能证书进度，管理学生转段资格</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <StatCard title="总学生数" value={totalStudents} icon={GraduationCap} color="blue" />
          <StatCard title="全部通过" value={passingStudents} icon={CheckCircle} color="green" />
          <StatCard title="转段考科目" value={examSubjectCount} icon={BookOpen} color="orange" />
          <StatCard title="证书完成度" value={`${averageCertificateProgress}%`} icon={Award} color="cyan" />
        </div>

        {/* 操作栏 */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索学号或姓名" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="全部小组">全部小组</option>
            <option value="第一组">第一组</option>
            <option value="第二组">第二组</option>
            <option value="第三组">第三组</option>
          </select>
          
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="全部状态">全部状态</option>
            <option value="符合条件">符合条件</option>
            <option value="不符合条件">不符合条件</option>
          </select>
          
          <div className="flex gap-2">
            <Button onClick={() => setShowGradeDialog(true)} className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              录入成绩
            </Button>
            
            <Button onClick={() => setShowConfigDialog(true)} className="border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 px-4 py-2 rounded-lg flex items-center gap-2">
              <Flag className="w-4 h-4" />
              科目设置
            </Button>
            
            <Button onClick={handleExport} className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" />
              导出报表
            </Button>
          </div>
        </div>

        {/* 学生转段状态列表 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            学生转段状态
          </h2>
          
          {filteredStudents.length === 0 ? <p className="text-gray-500 text-center py-8">暂无符合条件的记录</p> : <div className="space-y-4">
              {filteredStudents.map(student => {
            const examStatus = getExamStatus(student);
            const certProgress = getCertificateProgress(student);
            const eligibility = checkPromotionEligibility(student);
            const StatusIcon = examStatus.icon;
            return <div key={student.id} className={`${eligibility.eligible ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-orange-50 to-red-50'} rounded-lg p-3 border ${eligibility.eligible ? 'border-green-200' : 'border-orange-200'} hover:shadow-md transition-shadow`}>
                    {/* 学生基本信息 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${eligibility.eligible ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                          {student.name[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-500">学号：{student.studentId} · {student.group}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${eligibility.eligible ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          <StatusIcon className="w-4 h-4" />
                          {eligibility.eligible ? '符合转段条件' : '不符合转段条件'}
                        </div>
                      </div>
                    </div>
                    
                    {/* 详细状态信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* 转段考成绩状态 */}
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className={`w-4 h-4 ${examStatus.color === 'green' ? 'text-green-600' : examStatus.color === 'orange' ? 'text-orange-600' : 'text-gray-600'}`} />
                          <span className="text-sm font-medium text-gray-700">转段考成绩</span>
                        </div>
                        <p className={`text-lg font-bold ${examStatus.color === 'green' ? 'text-green-600' : examStatus.color === 'orange' ? 'text-orange-600' : 'text-gray-600'}`}>{examStatus.status}</p>
                        <p className="text-xs text-gray-500">{examStatus.message}</p>
                      </div>
                      
                      {/* 证书完成度 */}
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className={`w-4 h-4 ${certProgress.progress >= 100 ? 'text-green-600' : 'text-orange-600'}`} />
                          <span className="text-sm font-medium text-gray-700">技能证书</span>
                        </div>
                        <p className={`text-lg font-bold ${certProgress.progress >= 100 ? 'text-green-600' : 'text-orange-600'}`}>{certProgress.obtained}/{certProgress.required}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div className={`${certProgress.progress >= 100 ? 'bg-green-500' : 'bg-orange-500'} h-2 rounded-full`} style={{
                      width: `${certProgress.progress}%`
                    }}></div>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">完成度 {certProgress.progress}%</p>
                      </div>
                      
                      {/* 综合指标 */}
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-700">综合指标</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">积分</p>
                            <p className={`font-bold ${student.points >= 60 ? 'text-green-600' : 'text-red-600'}`}>{student.points}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">GPA</p>
                            <p className="font-bold text-indigo-600">{student.gpa}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 缺失证书提示 */}
                    {certProgress.missingCertificates.length > 0 && <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                        <p className="text-sm text-orange-700 font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          缺少必备证书：
                        </p>
                        <p className="text-xs text-orange-600 mt-1">{certProgress.missingCertificates.join('、')}</p>
                      </div>}
                    
                    {/* 查看详情按钮 */}
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => setViewingStudent(student)} variant="outline" className="text-sm">
                        <FileText className="w-4 h-4 mr-1" />
                        查看详情
                      </Button>
                    </div>
                  </div>;
          })}
            </div>}
        </div>

        {/* 说明区域 */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
          <h3 className="text-base font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            转段条件说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p><strong>转段考成绩：</strong>所有转段考科目均需达到及格分数（≥60分）</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p><strong>技能证书：</strong>完成所有必备技能证书（如英语四级、计算机二级）</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p><strong>积分要求：</strong>学生总积分需达到60分以上</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p><strong>GPA要求：</strong>学业成绩GPA需达到2.0以上</p>
            </div>
          </div>
        </div>
      </div>

      {/* 录入成绩对话框 */}
      {showGradeDialog && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                录入转段考成绩
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择学生 *</label>
                  <select value={newGrade.studentId} onChange={e => setNewGrade({
                ...newGrade,
                studentId: e.target.value
              })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">请选择学生</option>
                    {students.map(student => <option key={student.id} value={student.studentId}>
                        {student.name} ({student.studentId})
                      </option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择科目 *</label>
                  <select value={newGrade.subjectId} onChange={e => setNewGrade({
                ...newGrade,
                subjectId: e.target.value
              })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">请选择科目</option>
                    {examSubjects.map(subject => <option key={subject.id} value={subject.id}>
                        {subject.name} {subject.isExamSubject && '(转段考)'}
                      </option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分数 *</label>
                  <input type="number" min="0" max="100" step="0.5" value={newGrade.score} onChange={e => setNewGrade({
                ...newGrade,
                score: e.target.value
              })} placeholder="0-100" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">考试日期 *</label>
                  <input type="date" value={newGrade.examDate} onChange={e => setNewGrade({
                ...newGrade,
                examDate: e.target.value
              })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea value={newGrade.remarks} onChange={e => setNewGrade({
                ...newGrade,
                remarks: e.target.value
              })} placeholder="填写备注信息（可选）" rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowGradeDialog(false)} variant="outline" className="flex-1">
                  取消
                </Button>
                <Button onClick={handleSubmitGrade} className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white">
                  提交成绩
                </Button>
              </div>
            </div>
          </div>
        </div>}

      {/* 学生详情对话框 */}
      {viewingStudent && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {viewingStudent.name} - 转段详情
                </h2>
                <Button onClick={() => setViewingStudent(null)} variant="outline" size="sm">
                  关闭
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">基本信息</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">学号</p>
                      <p className="font-medium">{viewingStudent.studentId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">姓名</p>
                      <p className="font-medium">{viewingStudent.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">小组</p>
                      <p className="font-medium">{viewingStudent.group}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">积分</p>
                      <p className={`font-medium ${viewingStudent.points >= 60 ? 'text-green-600' : 'text-red-600'}`}>{viewingStudent.points}</p>
                    </div>
                  </div>
                </div>
                
                {/* 转段考成绩 */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    转段考成绩
                  </h3>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    {examSubjects.filter(s => s.isExamSubject).map(subject => {
                  const grade = examGrades.find(g => g.studentId === viewingStudent.studentId && g.subjectId === subject.id);
                  return <div key={subject.id} className={`flex items-center justify-between p-2 ${grade && grade.isPassing ? 'bg-green-50' : grade && !grade.isPassing ? 'bg-red-50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{subject.name}</span>
                            {grade && <span className={`text-xs px-2 py-0.5 rounded ${grade.isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {grade.isPassing ? '及格' : '不及格'}
                              </span>}
                          </div>
                          <span className={`font-bold ${grade && grade.isPassing ? 'text-green-600' : grade && !grade.isPassing ? 'text-red-600' : 'text-gray-400'}`}>
                            {grade ? grade.score : '未考试'}
                          </span>
                        </div>;
                })}
                  </div>
                </div>
                
                {/* 技能证书 */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    技能证书
                  </h3>
                  <div className="space-y-2">
                    {CERTIFICATE_REQUIREMENTS.filter(c => c.required).map(req => {
                  const hasCertificate = (viewingStudent.certificates || []).some(cert => cert.name === req.name);
                  return <div key={req.id} className={`flex items-center justify-between p-2 rounded-lg ${hasCertificate ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                          <div className="flex items-center gap-2">
                            {hasCertificate ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-orange-600" />}
                            <span className="font-medium">{req.name}</span>
                            <span className="text-xs text-gray-500">({req.level})</span>
                          </div>
                          <span className={`text-sm font-medium ${hasCertificate ? 'text-green-600' : 'text-orange-600'}`}>
                            {hasCertificate ? '已获得' : '未获得'}
                          </span>
                        </div>;
                })}
                  </div>
                </div>
                
                {/* 其他证书 */}
                {viewingStudent.certificates && viewingStudent.certificates.length > 0 && <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      其他证书
                    </h3>
                    <div className="space-y-2">
                      {viewingStudent.certificates.filter(cert => !CERTIFICATE_REQUIREMENTS.some(req => req.required && req.name === cert.name)).map((cert, index) => <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{cert.name}</span>
                              <span className="text-xs text-gray-500">({cert.level})</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">获得日期：{formatDate(cert.date)}</p>
                          </div>)}
                    </div>
                  </div>}
              </div>
            </div>
          </div>
        </div>}

      {/* 科目设置对话框 */}
      {showConfigDialog && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5" />
                转段考科目设置
              </h2>
              
              <div className="space-y-2 mb-4">
                {examSubjects.map(subject => <div key={subject.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={subject.isExamSubject} onChange={() => toggleExamSubject(subject.id)} className="w-5 h-5 text-indigo-600 rounded" />
                      <span className="font-medium">{subject.name}</span>
                    </div>
                    {subject.isExamSubject && <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        转段考
                      </span>}
                  </div>)}
              </div>
              
              <Button onClick={() => setShowConfigDialog(false)} className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white">
                完成
              </Button>
            </div>
          </div>
        </div>}

      {/* 底部导航栏 */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}