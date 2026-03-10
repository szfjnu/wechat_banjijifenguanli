// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Brain, Sparkles, User, Users, Calendar, TrendingUp, Award, ShieldAlert, Heart, BookOpen, Download, Share2, Edit3, Save, CheckCircle, AlertCircle, FileText } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';

// 时间范围选项
const TIME_RANGE_OPTIONS = [{
  id: 'month',
  name: '按月',
  description: '本月表现'
}, {
  id: 'semester',
  name: '按学期',
  description: '本学期表现'
}, {
  id: 'year',
  name: '按学年',
  description: '本学年表现'
}];
export default function AIReviewPage(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils;
  const [currentPage, setCurrentPage] = useState('ai-review');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isClassReview, setIsClassReview] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('semester');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [savedReviews, setSavedReviews] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [studentDetail, setStudentDetail] = useState(null);

  // 加载学生数据
  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('student').get();
      const studentsData = result.data.map(student => ({
        id: student._id,
        _id: student._id,
        name: student.name || '未命名',
        studentId: student.student_id || '',
        group: student.group || '未分组',
        totalPoints: parseFloat(student.current_score) || 0
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error('加载学生数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载学生数据，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  // 加载学生成绩数据（按时间范围）
  const loadStudentGrades = async (studentId, timeRange) => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      let query = {
        student_id: studentId
      };
      const result = await db.collection('grade').where(query).get();
      if (result.data.length === 0) {
        return 0;
      }
      const gpas = result.data.map(grade => parseFloat(grade.gpa)).filter(gpa => gpa != null && !isNaN(gpa));
      if (gpas.length === 0) {
        return 0;
      }
      const sumGpa = gpas.reduce((sum, gpa) => sum + gpa, 0);
      return (sumGpa / gpas.length).toFixed(2);
    } catch (error) {
      console.error('加载学生成绩失败:', error);
      return 0;
    }
  };

  // 加载学生证书数量
  const loadStudentCertificates = async (studentId, useId = false) => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('certificate').where({
        student_id: useId ? parseInt(studentId) : parseInt(studentId)
      }).get();
      return result.data.length;
    } catch (error) {
      console.error('加载学生证书失败:', error);
      return 0;
    }
  };

  // 加载学生志愿时长（按时间范围）
  const loadStudentVolunteerHours = async (studentId, timeRange) => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('volunteer_record').where({
        student_id: studentId
      }).get();
      if (result.data.length === 0) {
        return 0;
      }
      const totalHours = result.data.reduce((sum, record) => sum + (parseFloat(record.duration) || 0), 0);
      return totalHours;
    } catch (error) {
      console.error('加载志愿时长失败:', error);
      return 0;
    }
  };

  // 加载已保存的点评记录

  // 加载学生详细数据（GPA、证书、志愿时长）
  const loadStudentDetail = async student => {
    try {
      const gpa = await loadStudentGrades(student.studentId, selectedTimeRange);
      const certificates = await loadStudentCertificates(student._id, true);
      const volunteerHours = await loadStudentVolunteerHours(student.studentId, selectedTimeRange);
      setStudentDetail({
        ...student,
        gpa,
        certificates,
        volunteerHours
      });
    } catch (error) {
      console.error('加载学生详细信息失败:', error);
      setStudentDetail({
        ...student,
        gpa: 0,
        certificates: 0,
        volunteerHours: 0
      });
    }
  };
  const loadSavedReviews = async () => {
    try {
      setLoadingReviews(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('ai_review_record').orderBy('created_date', 'desc').get();
      const reviews = result.data.map(record => ({
        id: record.record_id,
        studentId: record.student_id,
        studentName: record.student_name,
        timeRange: record.time_range,
        content: record.content,
        createdAt: record.created_date || new Date().toISOString()
      }));
      setSavedReviews(reviews);
    } catch (error) {
      console.error('加载历史记录失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载历史记录，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoadingReviews(false);
    }
  };
  useEffect(() => {
    loadStudents();
    loadSavedReviews();
  }, []);

  // 生成AI点评
  const generateReview = async () => {
    if (!isClassReview && !selectedStudent) {
      toast({
        title: '请选择学生',
        description: '选择一个学生以生成个性化点评',
        variant: 'destructive'
      });
      return;
    }
    setIsGenerating(true);
    try {
      let studentData;
      const studentName = isClassReview ? '全班同学' : selectedStudent.name;
      if (isClassReview) {
        // 班级点评：聚合所有学生的数据
        if (students.length === 0) {
          throw new Error('没有可用的学生数据');
        }
        const allStudentsData = await Promise.all(students.map(async student => {
          const gpa = await loadStudentGrades(student.studentId, selectedTimeRange);
          const certificates = await loadStudentCertificates(student._id, true);
          const volunteerHours = await loadStudentVolunteerHours(student.studentId, selectedTimeRange);
          return {
            ...student,
            gpa,
            certificates,
            volunteerHours
          };
        }));
        const totalPoints = allStudentsData.reduce((sum, s) => sum + s.totalPoints, 0);
        const avgGpa = allStudentsData.reduce((sum, s) => sum + parseFloat(s.gpa), 0) / allStudentsData.length;
        const avgCertificates = allStudentsData.reduce((sum, s) => sum + s.certificates, 0) / allStudentsData.length;
        const avgVolunteerHours = allStudentsData.reduce((sum, s) => sum + s.volunteerHours, 0) / allStudentsData.length;
        studentData = {
          totalPoints,
          gpa: avgGpa.toFixed(2),
          certificates: avgCertificates.toFixed(1),
          volunteerHours: avgVolunteerHours.toFixed(1)
        };
      } else {
        // 个人点评：加载该学生的详细数据
        const gpa = await loadStudentGrades(selectedStudent.studentId, selectedTimeRange);
        const certificates = await loadStudentCertificates(selectedStudent.studentId);
        const volunteerHours = await loadStudentVolunteerHours(selectedStudent.studentId, selectedTimeRange);
        studentData = {
          ...selectedStudent,
          gpa,
          certificates,
          volunteerHours
        };
      }
      const review = generateMockReview(studentName, studentData, selectedTimeRange);
      setReviewContent(review);
      setIsGenerating(false);
      setIsEditing(false);
      toast({
        title: 'AI点评已生成',
        description: '点评内容已生成，您可以进行编辑和保存'
      });
    } catch (error) {
      console.error('生成点评失败:', error);
      setIsGenerating(false);
      toast({
        title: '生成失败',
        description: error.message || '生成点评时出错，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 生成模拟点评内容
  const generateMockReview = (name, data, timeRange) => {
    const rangeText = TIME_RANGE_OPTIONS.find(r => r.id === timeRange)?.description || '本学期';
    if (isClassReview) {
      return `## 全班${rangeText}综合点评

### 整体表现概况

本学期全班同学整体表现优秀，在德智体美劳各方面均有显著进步。班级总积分达到${data.totalPoints}分，平均GPA为${data.gpa}，每位同学平均获得${data.certificates}项技能证书，累计志愿服务时长${data.volunteerHours}小时。

### 积分管理表现

班级在积分管理方面表现出色，同学们积极参与课堂互动，作业完成率高。其中按时完成作业、课堂积极发言等加分项获得较多，展现了良好的学习态度。建议继续保持，同时注意时间管理，避免因迟到等问题导致扣分。

### 学业成绩分析

班级学业成绩稳步提升，平均GPA达到${data.gpa}，在年级中处于优秀水平。同学们在各个科目均衡发展，尤其在核心课程中表现突出。建议继续加强弱项科目的学习，争取全面提高。

### 综合素养发展

班级在综合素养方面表现良好，同学们积极参与各类活动和竞赛，获得${data.certificates}项技能证书。志愿服务活动参与度高，累计服务时长${data.volunteerHours}小时，展现了良好的社会责任感。

### 改进建议

1. 继续保持良好的学习习惯和课堂纪律
2. 积极参与更多课外活动，拓宽知识面
3. 加强同学间的互助合作，共同进步
4. 保持志愿服务的热情，提升社会实践能力
5. 注意劳逸结合，保持身心健康

### 总结

总体而言，本学期班级表现优异，同学们在各方面都取得了显著进步。希望全班同学能够继续保持这种积极向上的精神状态，在未来的学习中取得更好的成绩！

---

**点评时间**：${new Date().toLocaleDateString('zh-CN')}  
**AI助手**：班级管理智能系统`;
    }
    return `## ${name}${rangeText}个人成长点评

### 综合表现总评

${name}同学在本学期表现优异，总积分达到${data.totalPoints}分，在班级中排名前列。学习态度端正，积极参与课堂互动，展现出良好的学习习惯和自律能力。

### 学习成绩分析

学业成绩稳步提升，平均GPA为${data.gpa}，各科均衡发展。建议继续保持良好的学习节奏，注意总结学习方法，提高学习效率。特别是在重点科目上要投入更多精力，争取更大的突破。

### 积分表现亮点

在积分管理方面表现突出，累计获得${data.totalPoints}分。主要亮点包括：
- 按时完成作业，学习认真负责
- 课堂积极参与，思维活跃
- 团队协作能力强，乐于帮助同学

### 综合素养发展

在综合素养方面全面发展，已获得${data.certificates}项技能证书，展现了良好的专业能力和学习能力。积极参与志愿服务活动，累计服务时长${data.volunteerHours}小时，体现了良好的社会责任感和服务意识。

### 成长建议

1. **学习方面**：继续保持良好的学习态度，加强薄弱科目学习，定期进行学习总结和反思
2. **纪律方面**：严格遵守校规校纪，注意时间管理，避免迟到早退等问题
3. **社交方面**：继续发挥团队协作优势，主动参与班级活动，提升领导力和组织能力
4. **综合发展**：积极参与更多技能培训和竞赛，拓宽知识面，提升综合素质
5. **身心健康**：注意劳逸结合，保持良好的作息习惯，积极参加体育锻炼

### 未来展望

希望${name}同学能够继续保持这种积极向上的精神状态，在未来的学习和生活中取得更好的成绩。相信只要持之以恒，一定能够实现自己的目标和梦想！

---

**点评时间**：${new Date().toLocaleDateString('zh-CN')}  
**积分情况**：${data.totalPoints}分  
**学业成绩**：GPA ${data.gpa}  
**技能证书**：${data.certificates}项  
**志愿服务**：${data.volunteerHours}小时  

**AI助手**：班级管理智能系统`;
  };

  // 保存点评
  const saveReview = async () => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const newReview = {
        record_id: `AR${Date.now()}`,
        student_id: isClassReview ? 'class' : selectedStudent.studentId,
        student_name: isClassReview ? '全班' : selectedStudent.name,
        group: isClassReview ? '全部' : selectedStudent.group,
        review_type: isClassReview ? 'class' : 'personal',
        time_range: selectedTimeRange,
        content: reviewContent,
        total_points: isClassReview ? 0 : parseFloat(selectedStudent.totalPoints) || 0,
        gpa: 0,
        certificates_count: 0,
        volunteer_hours: 0,
        created_date: new Date().toISOString().split('T')[0],
        created_by: props.$w?.auth?.currentUser?.name || '系统管理员',
        remark: ''
      };
      await db.collection('ai_review_record').add(newReview);
      await loadSavedReviews();
      toast({
        title: '点评已保存',
        description: '点评内容已成功保存到数据库'
      });
    } catch (error) {
      console.error('保存点评失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '保存点评失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 导出点评
  const exportReview = () => {
    const studentName = isClassReview ? '全班' : selectedStudent?.name || '未选择';
    const timeRangeText = TIME_RANGE_OPTIONS.find(r => r.id === selectedTimeRange)?.description || '点评';
    const filename = `${studentName}_${timeRangeText}_点评.txt`;
    const blob = new Blob([reviewContent], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: '点评已导出',
      description: `文件已保存为：${filename}`
    });
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 标题栏 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
              AI智能点评
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            基于学生的学习表现、成绩、积分、证书等多维度数据，生成个性化智能点评
          </p>
        </div>

        {/* 点评范围选择 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-3">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-800">点评范围</h2>
          </div>
          <div className="flex gap-4 mb-4">
            <Button onClick={() => {
            setIsClassReview(false);
            setSelectedStudent(null);
            setReviewContent('');
          }} variant={!isClassReview ? 'default' : 'outline'} className={!isClassReview ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white' : ''}>
              <User className="w-4 h-4 mr-2" />
              个人点评
            </Button>
            <Button onClick={() => {
            setIsClassReview(true);
            setSelectedStudent(null);
            setReviewContent('');
          }} variant={isClassReview ? 'default' : 'outline'} className={isClassReview ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white' : ''}>
              <Users className="w-4 h-4 mr-2" />
              班级点评
            </Button>
          </div>
          {!isClassReview && <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择学生</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" value={selectedStudent?.id || ''} onChange={e => {
            const student = students.find(s => s.id === e.target.value);
            setSelectedStudent(student);
            setReviewContent('');
            if (student) {
              loadStudentDetail(student);
            } else {
              setStudentDetail(null);
            }
          }}>
                <option value="">请选择学生</option>
                {students.map(student => <option key={student.id} value={student.id}>
                    {student.name}（{student.studentId}）- {student.group} - 当前积分：{student.totalPoints}分
                  </option>)}
              </select>
              {selectedStudent && <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-rose-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{selectedStudent.name}</div>
                      <div className="text-sm text-gray-600">学号：{selectedStudent.studentId} | 小组：{selectedStudent.group}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{selectedStudent.totalPoints}</div>
                      <div className="text-xs text-gray-600">当前积分</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-rose-600">{studentDetail?.gpa || '加载中...'}</div>
                      <div className="text-xs text-gray-600">GPA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{studentDetail?.certificates || '加载中...'}</div>
                      <div className="text-xs text-gray-600">证书数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{studentDetail?.volunteerHours || '加载中...'}</div>
                      <div className="text-xs text-gray-600">志愿时长</div>
                    </div>
                  </div>
                </div>}
            </div>}
        </div>

        {/* 时间范围选择 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-3">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-800">时间范围</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {TIME_RANGE_OPTIONS.map(option => <button key={option.id} onClick={() => setSelectedTimeRange(option.id)} className={`p-4 rounded-xl border-2 transition-all ${selectedTimeRange === option.id ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-rose-50' : 'border-gray-200 hover:border-amber-300 bg-white'}`}>
                <div className="font-semibold text-gray-800 mb-1">{option.name}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </button>)}
          </div>
        </div>

        {/* 生成按钮 */}
        {!reviewContent && <div className="flex justify-center mb-6">
            <Button onClick={generateReview} disabled={isGenerating || !isClassReview && !selectedStudent} className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              {isGenerating ? <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  生成中...
                </span> : <span className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  生成AI点评
                </span>}
            </Button>
          </div>}

        {/* 点评结果展示 */}
        {reviewContent && <div className="bg-white rounded-lg shadow-md p-4 mb-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-800">点评内容</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isEditing ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {isEditing ? '编辑中' : '已完成'}
                </span>
              </div>
              <div className="flex gap-2">
                {!isEditing ? <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="flex items-center gap-1">
                    <Edit3 className="w-4 h-4" />
                    编辑
                  </Button> : <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    完成
                  </Button>}
                <Button onClick={saveReview} variant="outline" size="sm" className="flex items-center gap-1">
                  <Save className="w-4 h-4" />
                  保存
                </Button>
                <Button onClick={exportReview} variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  导出
                </Button>
              </div>
            </div>
            <textarea className={`w-full min-h-[400px] p-4 rounded-lg border-2 ${isEditing ? 'border-amber-300 focus:border-amber-500' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-amber-500 resize-none`} value={reviewContent} onChange={e => setReviewContent(e.target.value)} readOnly={!isEditing} placeholder="AI将在此处生成点评内容..." />
          </div>}

        {/* 历史记录 */}
        {savedReviews.length > 0 && <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-800">历史记录</h2>
              <span className="text-sm text-gray-600">（{savedReviews.length}条）</span>
            </div>
            <div className="space-y-3">
              {savedReviews.map(review => <div key={review.id} className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 rounded-lg cursor-pointer hover:shadow-md transition-all" onClick={() => {
            setReviewContent(review.content);
            setIsEditing(false);
          }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{review.studentName}</div>
                      <div className="text-sm text-gray-600">{TIME_RANGE_OPTIONS.find(r => r.id === review.timeRange)?.description}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>)}
            </div>
          </div>}

        {/* 说明卡片 */}
        <div className="mt-6 p-6 bg-gradient-to-r from-amber-100 to-rose-100 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">使用说明</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 选择个人点评或班级点评，再选择对应的学生</li>
                <li>• 选择时间范围：按月、按学期或按学年</li>
                <li>• 点击生成按钮，AI将基于多维度数据生成个性化点评</li>
                <li>• 生成后可以编辑、保存和导出点评内容</li>
                <li>• 历史记录方便查看和回顾之前生成的点评</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}