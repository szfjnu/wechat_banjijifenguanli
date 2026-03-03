// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { AlertTriangle, FileText, Search, Filter, Shield, ShieldAlert, Calendar, Clock, CheckCircle, XCircle, User, Plus, History, Download, Eye } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';

// 处分级别预设数据（包含扣分分值）
const DISCIPLINE_LEVELS = [{
  id: 1,
  name: '口头警告',
  points: -2,
  severity: 'low',
  duration: 7,
  // 有效期（天）
  description: '轻微违纪，口头提醒'
}, {
  id: 2,
  name: '通报批评',
  points: -5,
  severity: 'low',
  duration: 14,
  description: '一般违纪，班级通报'
}, {
  id: 3,
  name: '警告',
  points: -10,
  severity: 'medium',
  duration: 30,
  description: '较重违纪，书面警告'
}, {
  id: 4,
  name: '严重警告',
  points: -15,
  severity: 'medium',
  duration: 60,
  description: '严重违纪，影响评优'
}, {
  id: 5,
  name: '记过',
  points: -20,
  severity: 'high',
  duration: 90,
  description: '严重违纪，记入档案'
}, {
  id: 6,
  name: '留校察看',
  points: -30,
  severity: 'high',
  duration: 180,
  description: '严重违纪，留校察看'
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
  totalPoints: 128
}, {
  id: 6,
  name: '孙八',
  studentId: '202401006',
  group: '第三组',
  totalPoints: 139
}, {
  id: 7,
  name: '周九',
  studentId: '202401007',
  group: '第四组',
  totalPoints: 142
}, {
  id: 8,
  name: '吴十',
  studentId: '202401008',
  group: '第四组',
  totalPoints: 135
}];

// 模拟处分历史数据
const MOCK_DISCIPLINE_HISTORY = [{
  id: 1,
  studentId: 2,
  studentName: '李四',
  levelId: 3,
  levelName: '警告',
  reason: '上课期间玩手机被老师发现',
  pointsDeducted: -10,
  date: '2025-02-28 14:30',
  status: 'active',
  // active, expired, revoked
  expiryDate: '2025-03-30',
  operator: '班主任',
  revokeRequests: []
}, {
  id: 2,
  studentId: 5,
  studentName: '钱七',
  levelId: 4,
  levelName: '严重警告',
  reason: '多次迟到并旷课',
  pointsDeducted: -15,
  date: '2025-02-25 09:15',
  status: 'active',
  expiryDate: '2025-04-25',
  operator: '班主任',
  revokeRequests: [{
    id: 1,
    requestDate: '2025-03-01',
    reason: '已深刻认识错误并积极改正',
    evidence: '悔过书.pdf',
    status: 'pending' // pending, approved, rejected
  }]
}, {
  id: 3,
  studentId: 3,
  studentName: '王五',
  levelId: 1,
  levelName: '口头警告',
  reason: '未按时完成作业',
  pointsDeducted: -2,
  date: '2025-02-20 10:00',
  status: 'expired',
  expiryDate: '2025-02-27',
  operator: '班主任',
  revokeRequests: []
}, {
  id: 4,
  studentId: 6,
  studentName: '孙八',
  levelId: 5,
  levelName: '记过',
  reason: '考试作弊',
  pointsDeducted: -20,
  date: '2025-02-15 11:00',
  status: 'revoked',
  expiryDate: '2025-05-15',
  operator: '班主任',
  revokeRequests: [{
    id: 2,
    requestDate: '2025-03-02',
    reason: '表现优秀，积极配合班级工作',
    evidence: '证明材料.pdf',
    status: 'approved'
  }]
}];
export default function Discipline(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('discipline');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [reason, setReason] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeEvidence, setRevokeEvidence] = useState(null);
  useEffect(() => {
    loadDisciplineData();
  }, []);
  const loadDisciplineData = async () => {
    try {
      setLoading(true);

      // 模拟数据加载（后续替换为真实数据源调用）
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudents(MOCK_STUDENTS);
      setHistory(MOCK_DISCIPLINE_HISTORY);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '加载数据失败',
        description: error.message || '请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  // 创建处分记录
  const handleCreateDiscipline = async () => {
    if (!selectedStudent || !selectedLevel || !reason.trim()) {
      toast({
        variant: 'destructive',
        title: '请填写完整信息',
        description: '请选择学生、处分级别并填写处分事由'
      });
      return;
    }
    try {
      // 计算预计积分
      const pointsChange = selectedLevel.points;
      const newTotalPoints = selectedStudent.totalPoints + pointsChange;
      const newRecord = {
        id: Date.now(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        levelId: selectedLevel.id,
        levelName: selectedLevel.name,
        reason: reason,
        pointsDeducted: pointsChange,
        date: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: 'active',
        expiryDate: calculateExpiryDate(selectedLevel.duration),
        operator: '班主任',
        revokeRequests: []
      };

      // 添加到历史记录
      setHistory([newRecord, ...history]);

      // 更新学生积分
      const updatedStudents = students.map(s => s.id === selectedStudent.id ? {
        ...s,
        totalPoints: newTotalPoints
      } : s);
      setStudents(updatedStudents);
      setShowCreateDialog(false);
      setSelectedStudent(null);
      setSelectedLevel(null);
      setReason('');
      toast({
        title: '处分记录创建成功',
        description: `已为 ${selectedStudent.name} 创建${selectedLevel.name}处分，扣除${pointsChange}分`
      });

      // 如果处分级别为警告及以上，发送评优限制提醒
      if (selectedLevel.severity === 'medium' || selectedLevel.severity === 'high') {
        setTimeout(() => {
          toast({
            variant: 'warning',
            title: '评优资格限制提醒',
            description: `${selectedStudent.name} 因受${selectedLevel.name}处分，评优资格已被限制`
          });
        }, 1000);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 计算过期日期
  const calculateExpiryDate = days => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('zh-CN');
  };

  // 提交撤销申请
  const handleSubmitRevokeRequest = async () => {
    if (!revokeReason.trim()) {
      toast({
        variant: 'destructive',
        title: '请填写撤销理由',
        description: '请详细说明申请撤销的理由'
      });
      return;
    }
    try {
      const newRequest = {
        id: Date.now(),
        requestDate: new Date().toLocaleDateString('zh-CN'),
        reason: revokeReason,
        evidence: revokeEvidence?.name || null,
        status: 'pending'
      };
      const updatedHistory = history.map(record => record.id === selectedDiscipline.id ? {
        ...record,
        revokeRequests: [...record.revokeRequests, newRequest]
      } : record);
      setHistory(updatedHistory);
      setShowRevokeDialog(false);
      setSelectedDiscipline(null);
      setRevokeReason('');
      setRevokeEvidence(null);
      toast({
        title: '撤销申请已提交',
        description: '班主任审核后将通知您结果'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '提交失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 审核撤销申请
  const handleReviewRevokeRequest = (recordId, requestId, approved) => {
    const updatedHistory = history.map(record => {
      if (record.id === recordId) {
        const updatedRequests = record.revokeRequests.map(req => req.id === requestId ? {
          ...req,
          status: approved ? 'approved' : 'rejected'
        } : req);
        return {
          ...record,
          revokeRequests: updatedRequests
        };
      }
      return record;
    });
    setHistory(updatedHistory);
    toast({
      title: approved ? '撤销申请已批准' : '撤销申请已拒绝',
      description: approved ? '该处分记录已标记为已撤销' : '该撤销申请未通过审核'
    });
  };

  // 筛选后的历史记录
  const filteredHistory = history.filter(record => {
    const matchSearch = record.studentName.includes(searchKeyword) || record.reason.includes(searchKeyword);
    const matchStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // 统计数据
  const stats = {
    total: history.length,
    active: history.filter(r => r.status === 'active').length,
    expired: history.filter(r => r.status === 'expired').length,
    revoked: history.filter(r => r.status === 'revoked').length,
    pendingReviews: history.reduce((count, record) => count + record.revokeRequests.filter(r => r.status === 'pending').length, 0)
  };

  // 获取严重程度样式
  const getSeverityStyle = severity => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // 获取状态样式
  const getStatusStyle = status => {
    switch (status) {
      case 'active':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'expired':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'revoked':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // 获取状态文本
  const getStatusText = status => {
    switch (status) {
      case 'active':
        return '生效中';
      case 'expired':
        return '已过期';
      case 'revoked':
        return '已撤销';
      default:
        return status;
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm">加载中...</div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">学生处分管理</h1>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              新建处分
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">处分总数</p>
                <p className="text-base font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="bg-slate-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">生效中</p>
                <p className="text-base font-bold text-red-600">{stats.active}</p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已过期</p>
                <p className="text-base font-bold text-gray-600">{stats.expired}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">已撤销</p>
                <p className="text-base font-bold text-green-600">{stats.revoked}</p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">待审核</p>
                <p className="text-base font-bold text-amber-600">{stats.pendingReviews}</p>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg">
                <History className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="搜索学生姓名或处分事由..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option value="all">全部状态</option>
                <option value="active">生效中</option>
                <option value="expired">已过期</option>
                <option value="revoked">已撤销</option>
              </select>
            </div>
          </div>
        </div>

        {/* 处分历史列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">处分历史记录</h2>
          </div>

          {filteredHistory.length === 0 ? <div className="p-12 text-center text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p>暂无处分记录</p>
            </div> : <div className="divide-y divide-slate-200">
              {filteredHistory.map(record => <div key={record.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{record.studentName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityStyle(DISCIPLINE_LEVELS.find(l => l.id === record.levelId)?.severity)}`}>
                          {record.levelName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{record.reason}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>处分日期：{record.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>有效期至：{record.expiryDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>扣分：{record.pointsDeducted}分</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {record.status === 'active' && <Button size="sm" variant="outline" onClick={() => {
                  setSelectedDiscipline(record);
                  setShowRevokeDialog(true);
                }} className="text-orange-600 border-orange-300 hover:bg-orange-50">
                          <FileText className="w-4 h-4 mr-2" />
                          申请撤销
                        </Button>}
                      {record.revokeRequests.length > 0 && <Button size="sm" variant="outline" onClick={() => {
                  // 显示撤销申请详情（可扩展）
                  toast({
                    title: '撤销申请详情',
                    description: `该处分有 ${record.revokeRequests.length} 条撤销申请`
                  });
                }} className="text-blue-600 border-blue-300 hover:bg-blue-50">
                          <Eye className="w-4 h-4 mr-2" />
                          查看申请
                        </Button>}
                    </div>
                  </div>

                  {/* 撤销申请列表 */}
                  {record.revokeRequests.length > 0 && <div className="mt-4 bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">撤销申请记录</h4>
                      <div className="space-y-3">
                        {record.revokeRequests.map(request => <div key={request.id} className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-slate-700">
                                  申请时间：{request.requestDate}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-amber-100 text-amber-700' : request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {request.status === 'pending' ? '待审核' : request.status === 'approved' ? '已批准' : '已拒绝'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">{request.reason}</p>
                              {request.evidence && <div className="flex items-center gap-2 mt-1">
                                  <FileText className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-500">附件：{request.evidence}</span>
                                </div>}
                            </div>
                            {request.status === 'pending' && <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleReviewRevokeRequest(record.id, request.id, true)} className="text-green-600 border-green-300 hover:bg-green-50">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleReviewRevokeRequest(record.id, request.id, false)} className="text-red-600 border-red-300 hover:bg-red-50">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>}
                          </div>)}
                      </div>
                    </div>}
                </div>)}
            </div>}
        </div>

        {/* 说明信息 */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-2">注意事项</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 处分级别为警告及以上时，将自动限制学生评优资格</li>
                <li>• 处分记录创建后，会自动在积分系统中扣除相应分数</li>
                <li>• 学生可在处分有效期内提交撤销申请，需提供相关证明材料</li>
                <li>• 处分有效期结束前，系统会自动提醒学生和家长</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* 新建处分对话框 */}
      {showCreateDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">新建处分</h3>
                <Button variant="ghost" size="sm" onClick={() => {
              setShowCreateDialog(false);
              setSelectedStudent(null);
              setSelectedLevel(null);
              setReason('');
            }}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* 选择学生 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    选择学生 <span className="text-red-500">*</span>
                  </label>
                  <select value={selectedStudent?.id || ''} onChange={e => {
                const student = students.find(s => s.id === parseInt(e.target.value));
                setSelectedStudent(student);
              }} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">请选择学生</option>
                    {students.map(student => <option key={student.id} value={student.id}>
                        {student.name} ({student.studentId}) - {student.group} - 当前积分：{student.totalPoints}
                      </option>)}
                  </select>
                </div>

                {/* 选择处分级别 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    处分级别 <span className="text-red-500">*</span>
                  </label>
                  <select value={selectedLevel?.id || ''} onChange={e => {
                const level = DISCIPLINE_LEVELS.find(l => l.id === parseInt(e.target.value));
                setSelectedLevel(level);
              }} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">请选择处分级别</option>
                    {DISCIPLINE_LEVELS.map(level => <option key={level.id} value={level.id}>
                        {level.name} (扣{level.points}分，有效期{level.duration}天)
                      </option>)}
                  </select>
                  {selectedLevel && <p className="mt-2 text-sm text-slate-600">{selectedLevel.description}</p>}
                </div>

                {/* 处分事由 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    处分事由 <span className="text-red-500">*</span>
                  </label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} placeholder="请详细描述违纪事实和具体情况..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                </div>

                {/* 预计积分变化 */}
                {selectedStudent && selectedLevel && <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">积分变化预览</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">当前积分：</span>
                      <span className="font-semibold text-slate-800">{selectedStudent.totalPoints}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">扣分：</span>
                      <span className="font-semibold text-red-600">{selectedLevel.points}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-300">
                      <span className="text-slate-600">预计总积分：</span>
                      <span className={`font-bold ${selectedStudent.totalPoints + selectedLevel.points < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {selectedStudent.totalPoints + selectedLevel.points}
                      </span>
                    </div>
                  </div>}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => {
              setShowCreateDialog(false);
              setSelectedStudent(null);
              setSelectedLevel(null);
              setReason('');
            }}>
                  取消
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white" onClick={handleCreateDiscipline}>
                  确认创建
                </Button>
              </div>
            </div>
          </div>
        </div>}

      {/* 申请撤销对话框 */}
      {showRevokeDialog && selectedDiscipline && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">申请撤销处分</h3>
                <Button variant="ghost" size="sm" onClick={() => {
              setShowRevokeDialog(false);
              setSelectedDiscipline(null);
              setRevokeReason('');
              setRevokeEvidence(null);
            }}>
                  ✕
                </Button>
              </div>

              {/* 处分信息 */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-800">{selectedDiscipline.studentName}</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">处分级别：</span>
                    <span className="font-medium text-slate-800">{selectedDiscipline.levelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">处分事由：</span>
                    <span className="font-medium text-slate-800">{selectedDiscipline.reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">有效期至：</span>
                    <span className="font-medium text-slate-800">{selectedDiscipline.expiryDate}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* 撤销理由 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    撤销理由 <span className="text-red-500">*</span>
                  </label>
                  <textarea value={revokeReason} onChange={e => setRevokeReason(e.target.value)} rows={4} placeholder="请详细说明申请撤销的理由，如已认识错误、积极改正、表现良好等..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                </div>

                {/* 上传证明材料 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    证明材料（可选）
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <input type="file" onChange={e => setRevokeEvidence(e.target.files[0])} className="hidden" id="evidence-upload" />
                    <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <Download className="w-8 h-8 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {revokeEvidence ? revokeEvidence.name : '点击上传悔过书、证明材料等'}
                      </span>
                      <span className="text-xs text-slate-400">支持 PDF、Word、图片格式</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => {
              setShowRevokeDialog(false);
              setSelectedDiscipline(null);
              setRevokeReason('');
              setRevokeEvidence(null);
            }}>
                  取消
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white" onClick={handleSubmitRevokeRequest}>
                  提交申请
                </Button>
              </div>
            </div>
          </div>
        </div>}

      <TabBar currentPage={currentPage} />
    </div>;
}