// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Plus, Calendar, Clock, Search, Filter, Heart, TrendingUp, Users, Award, Info, ChevronDown, Download } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { getBeijingDateString } from '@/lib/utils';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
import { usePermission } from '@/components/PermissionGuard';
// 志愿服务活动预设数据
const ACTIVITY_TYPES = [{
  id: 1,
  name: '社区清洁',
  pointsPerHour: 2,
  category: '环保'
}, {
  id: 2,
  name: '图书馆整理',
  pointsPerHour: 2,
  category: '校园'
}, {
  id: 3,
  name: '敬老院慰问',
  pointsPerHour: 2,
  category: '社会'
}, {
  id: 4,
  name: '交通文明劝导',
  pointsPerHour: 2,
  category: '社会'
}, {
  id: 5,
  name: '环保宣传活动',
  pointsPerHour: 2,
  category: '环保'
}, {
  id: 6,
  name: '义卖活动',
  pointsPerHour: 2,
  category: '公益'
}, {
  id: 7,
  name: '运动会志愿服务',
  pointsPerHour: 2,
  category: '校园'
}, {
  id: 8,
  name: '其他',
  pointsPerHour: 2,
  category: '其他'
}];
export default function VolunteerPage({
  className = '',
  style = {},
  $w
}) {
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('volunteer');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };

  // 权限检查
  const {
    permission: canViewVolunteer,
    loading: loadingViewVolunteer
  } = usePermission($w, 'volunteer', 'view');
  const {
    permission: canAddVolunteer,
    loading: loadingAddVolunteer
  } = usePermission($w, 'volunteer', 'add');
  const {
    permission: canEditVolunteer,
    loading: loadingEditVolunteer
  } = usePermission($w, 'volunteer', 'edit');
  const {
    permission: canDeleteVolunteer,
    loading: loadingDeleteVolunteer
  } = usePermission($w, 'volunteer', 'delete');
  const {
    permission: canVerifyVolunteer,
    loading: loadingVerifyVolunteer
  } = usePermission($w, 'volunteer', 'verify');

  // 加载数据
  useEffect(() => {
    loadStudentsData();
    loadHistoryData();
  }, []);
  const loadStudentsData = async () => {
    try {
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
      let studentQuery = {};
      if (userType === '学生') {
        // 学生只看自己的数据
        studentQuery = {
          name: userName
        };
      } else if (userType === '班主任') {
        // 班主任只看自己班级的学生
        try {
          const userResult = await db.collection('user').where({
            name: userName,
            type: '班主任'
          }).get();
          if (userResult.data && userResult.data.length > 0) {
            const userData = userResult.data[0];
            if (userData.managed_class_name) {
              studentQuery = {
                class_name: userData.managed_class_name
              };
            }
          }
        } catch (err) {
          console.error('查询班主任班级信息失败:', err);
        }
      } else if (userType === '家长') {
        // 家长看自己的孩子（这里简化处理，实际应该从关联表获取）
        // 暂时显示所有学生数据
        studentQuery = {};
      }
      // 其他角色（管理员、教师等）查看所有数据

      const result = await db.collection('students').where(studentQuery).get();
      if (result.data && result.data.length > 0) {
        const transformedStudents = result.data.map(student => ({
          id: student._id,
          studentId: student.student_id,
          name: student.name,
          group: student.group_id || student.group || '未分组',
          totalPoints: student.current_score || 0
        }));
        setStudents(transformedStudents);
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
    }
  };
  const loadHistoryData = async () => {
    try {
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
      let recordQuery = {};
      if (userType === '学生') {
        // 学生只看自己的志愿服务记录
        recordQuery = {
          student_name: userName
        };
      } else if (userType === '班主任') {
        // 班主任只看自己班级学生的志愿服务记录
        try {
          const userResult = await db.collection('user').where({
            name: userName,
            type: '班主任'
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
                recordQuery = {
                  student_name: db.command.in(studentNames)
                };
              } else {
                // 班级中没有学生，返回空结果
                setHistory([]);
                return;
              }
            }
          }
        } catch (err) {
          console.error('查询班主任班级信息失败:', err);
        }
      } else if (userType === '家长') {
        // 家长看自己孩子的志愿服务记录（这里简化处理，实际应该从关联表获取）
        // 暂时显示所有记录
        recordQuery = {};
      }
      // 其他角色（管理员、教师等）查看所有数据

      const result = await db.collection('volunteer_records').where(recordQuery).orderBy('date', 'desc').limit(50).get();
      if (result.data && result.data.length > 0) {
        const transformedHistory = result.data.map(record => ({
          id: record._id,
          studentId: record.student_id || '',
          studentName: record.student_name || '未知',
          group: record.group_name || '',
          activityName: record.activity_name || '',
          activityCategory: record.service_type || '其他',
          duration: record.duration || 0,
          points: record.earned_score || 0,
          date: record.date || '',
          location: record.location || '',
          organization: record.organization || '',
          description: record.description || '',
          note: record.note || '',
          isVerified: record.is_verified || false,
          verifierName: record.verifier_name || '',
          verificationTime: record.verification_time || '',
          recorderName: record.recorder_name || '管理员',
          semesterId: record.semester_id || '',
          semesterName: record.semester_name || '',
          proofMaterials: record.proof_materials || record.proof_images || []
        }));
        setHistory(transformedHistory);
      }
    } catch (error) {
      console.error('加载志愿服务记录失败:', error);
    }
  };
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterActivity, setFilterActivity] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({
    studentId: '',
    activityName: '',
    duration: '',
    date: getBeijingDateString(),
    note: ''
  });

  // 计算统计数据
  const stats = {
    totalRecords: history.length,
    totalHours: history.reduce((sum, record) => sum + record.duration, 0),
    totalPoints: history.reduce((sum, record) => sum + record.points, 0),
    uniqueStudents: [...new Set(history.map(r => r.studentName))].length
  };

  // 筛选历史记录
  const filteredHistory = history.filter(record => {
    const matchesSearch = record.studentName.includes(searchTerm) || record.activityName.includes(searchTerm) || record.note?.includes(searchTerm);
    const matchesStudent = filterStudent === 'all' || record.studentId === filterStudent;
    const matchesActivity = filterActivity === 'all' || record.activityCategory === filterActivity;
    return matchesSearch && matchesStudent && matchesActivity;
  });

  // 自动计算积分
  const calculatePoints = hours => {
    const numHours = parseFloat(hours) || 0;
    return numHours * 2;
  };

  // 提交新记录
  const handleSubmit = async () => {
    if (!newRecord.studentId || !newRecord.activityName || !newRecord.duration) {
      toast({
        title: '请填写完整信息',
        variant: 'destructive'
      });
      return;
    }
    try {
      const points = calculatePoints(newRecord.duration);
      const student = students.find(s => s.studentId === newRecord.studentId);
      const activity = ACTIVITY_TYPES.find(a => a.name === newRecord.activityName);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 添加到数据库
      const result = await db.collection('volunteer_records').add({
        record_id: `VOL${getBeijingTime().getTime()}`,
        student_id: newRecord.studentId,
        student_name: student?.name || '',
        activity_name: newRecord.activityName,
        service_type: activity?.category || '其他',
        duration: parseFloat(newRecord.duration),
        earned_score: points,
        date: newRecord.date,
        location: '校内',
        organization: '学校',
        description: newRecord.note || '',
        is_verified: true,
        verifier_name: '管理员',
        recorder_name: $w?.auth?.currentUser?.name || '管理员',
        created_at: getBeijingTimeISO()
      });

      // 更新前端状态
      const newEntry = {
        id: result.id || result._id,
        studentId: newRecord.studentId,
        studentName: student?.name || '',
        group: student?.group || '',
        activityName: newRecord.activityName,
        activityCategory: activity?.category || '其他',
        duration: parseFloat(newRecord.duration),
        points: points,
        date: newRecord.date,
        note: newRecord.note || '',
        operator: $w?.auth?.currentUser?.name || '管理员'
      };
      setHistory([newEntry, ...history]);
      setShowNewDialog(false);
      setNewRecord({
        studentId: '',
        activityName: '',
        duration: '',
        date: getBeijingDateString(),
        note: ''
      });
      toast({
        title: '志愿服务记录已创建',
        description: `${student?.name} - ${newRecord.activityName}，时长 ${newRecord.duration} 小时，获得 ${points} 积分`
      });
    } catch (error) {
      console.error('创建志愿服务记录失败:', error);
      toast({
        title: '创建失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 导出CSV
  const exportCSV = () => {
    const headers = ['学号', '姓名', '小组', '活动名称', '活动类别', '服务时长(小时)', '获得积分', '服务日期', '备注', '记录人', '记录时间'];
    const rows = filteredHistory.map(record => [record.studentId, record.studentName, record.group, record.activityName, record.activityCategory, record.duration, record.points, record.date, record.note || '', record.operator, record.createdAt || getBeijingTime().toLocaleString()]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `志愿服务记录_${getBeijingTime().toLocaleDateString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: '导出成功',
      description: '志愿服务记录已导出为CSV文件'
    });
  };
  return <div className={`min-h-screen bg-gray-50 pb-16 ${className}`} style={style}>
      {/* 统计卡片区域 */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-gray-800 mb-3 font-['Playfair_Display']">志愿服务管理</h1>
        <div className="grid grid-cols-2 gap-2">
          <StatCard title="总记录数" value={stats.totalRecords} icon={Heart} color="blue" />
          <StatCard title="总时长" value={`${stats.totalHours}h`} subtitle="小时" icon={Clock} color="amber" />
          <StatCard title="奖励积分" value={stats.totalPoints} icon={TrendingUp} color="orange" />
          <StatCard title="参与人数" value={stats.uniqueStudents} icon={Users} color="green" />
        </div>
      </div>

      {/* 操作栏 */}
      <div className="px-4 mb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-rose-100">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="搜索学生、活动、备注..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent" />
              </div>
              <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                <option value="all">全部学生</option>
                {students.map(student => <option key={student.studentId} value={student.studentId}>{student.name}</option>)}
              </select>
              <select value={filterActivity} onChange={e => setFilterActivity(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                <option value="all">全部类别</option>
                {[...new Set(ACTIVITY_TYPES.map(a => a.category))].map(category => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 flex-1 md:flex-none shadow-md">
                    <Plus className="w-4 h-4 mr-1" />
                    新建记录
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-800">创建志愿服务记录</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">选择学生 *</label>
                      <select value={newRecord.studentId} onChange={e => setNewRecord({
                      ...newRecord,
                      studentId: e.target.value
                    })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300">
                        <option value="">请选择学生</option>
                        {students.map(student => <option key={student.studentId} value={student.studentId}>{student.studentId} - {student.name} ({student.group}) - 当前积分: {student.totalPoints}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">活动名称 *</label>
                      <select value={newRecord.activityName} onChange={e => setNewRecord({
                      ...newRecord,
                      activityName: e.target.value
                    })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300">
                        <option value="">请选择活动</option>
                        {ACTIVITY_TYPES.map(activity => <option key={activity.id} value={activity.name}>{activity.name} ({activity.category})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">服务时长(小时) *</label>
                      <input type="number" step="0.5" min="0" max="24" value={newRecord.duration} onChange={e => setNewRecord({
                      ...newRecord,
                      duration: e.target.value
                    })} placeholder="输入服务时长，如2.5" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">服务日期</label>
                      <input type="date" value={newRecord.date} onChange={e => setNewRecord({
                      ...newRecord,
                      date: e.target.value
                    })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                      <input type="text" value={newRecord.note} onChange={e => setNewRecord({
                      ...newRecord,
                      note: e.target.value
                    })} placeholder="活动备注，如地点、内容等" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-500" strokeWidth={2} />
                          <span className="text-sm font-medium text-gray-700">预计获得积分</span>
                        </div>
                        <span className="text-xl font-bold text-amber-600 font-['Space_Mono']">{calculatePoints(newRecord.duration)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">每小时服务可获得 2 积分</p>
                    </div>
                    <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600">
                      提交记录
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={exportCSV} className="flex-1 md:flex-none border-rose-200 text-rose-600 hover:bg-rose-50">
                <Download className="w-4 h-4 mr-1" />
                导出
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="px-4 pb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-rose-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-bold text-gray-800 text-base">志愿服务历史</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredHistory.length === 0 ? <div className="p-8 text-center text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" strokeWidth={1.5} />
                <p>暂无志愿服务记录</p>
              </div> : filteredHistory.map(record => <div key={record.id} onClick={() => {
            setSelectedRecord(record);
            setShowDetailDialog(true);
          }} className="px-4 py-3 hover:bg-rose-50/50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">{record.studentName}</span>
                      <span className="text-xs text-gray-500">#{record.studentId}</span>
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full text-xs">{record.group}</span>
                    </div>
                    <div className="text-sm text-gray-600">{record.activityName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-600 font-['Space_Mono']">+{record.points}</div>
                    <div className="text-xs text-gray-500">积分</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {record.duration}小时
                    </span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded">{record.activityCategory}</span>
                  </div>
                  <span>{record.date}</span>
                </div>
                {record.note && <div className="mt-2 text-xs text-gray-500 truncate">
                    <Info className="w-3 h-3 inline mr-1" />
                    {record.note}
                  </div>}
              </div>)}
          </div>
        </div>
      </div>

      {/* 说明区域 */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl p-4 border border-rose-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-rose-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm mb-1">积分说明</h3>
              <p className="text-xs text-gray-600 leading-relaxed">志愿服务每小时可获得 2 积分，积分自动累计到学生总积分中。参与志愿服务有助于培养社会责任感和实践能力。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-800">志愿服务详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && <div className="space-y-4 mt-4">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-lg">{selectedRecord.studentName}</span>
                    <span className="text-sm text-gray-500">#{selectedRecord.studentId}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-600 font-['Space_Mono'] text-2xl">+{selectedRecord.points}</div>
                    <div className="text-xs text-gray-500">获得积分</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-0.5 bg-pink-100 text-pink-600 rounded">{selectedRecord.group}</span>
                  <span>•</span>
                  <span>{selectedRecord.date}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">活动名称</span>
                  <span className="text-sm font-medium text-gray-800">{selectedRecord.activityName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">活动类别</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-sm">{selectedRecord.activityCategory}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">服务时长</span>
                  <span className="text-sm font-medium text-gray-800 font-['Space_Mono']">{selectedRecord.duration} 小时</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">获得积分</span>
                  <span className="text-sm font-bold text-amber-600 font-['Space_Mono']">{selectedRecord.points} 分</span>
                </div>
                {selectedRecord.note && <div className="py-2">
                    <span className="text-sm text-gray-500 block mb-1">备注</span>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">{selectedRecord.note}</p>
                  </div>}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">记录人</span>
                  <span className="text-sm text-gray-600">{selectedRecord.operator}</span>
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}