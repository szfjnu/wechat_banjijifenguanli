// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { AlertTriangle, FileText, Search, Filter, Shield, ShieldAlert, Calendar, Clock, CheckCircle, XCircle, User, Plus, History, Download, Eye } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { StatCard } from '@/components/StatCard';
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
export default function DisciplinePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('discipline');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeRequestDialog, setShowRevokeRequestDialog] = useState(false);
  const [revokeRequestReason, setRevokeRequestReason] = useState('');
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportRange, setExportRange] = useState('all');
  const [newRecord, setNewRecord] = useState({
    studentId: '',
    levelId: '',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 加载学生数据
      const studentResult = await db.collection('students').get();
      if (studentResult.data && studentResult.data.length > 0) {
        const transformedStudents = studentResult.data.map(student => ({
          id: student._id,
          name: student.name,
          studentId: student.student_id,
          group: student.group_id || student.group || '未分组',
          totalPoints: student.current_score || 0
        }));
        setStudents(transformedStudents);
      }

      // 加载处分记录数据
      const recordResult = await db.collection('discipline_record').orderBy('date', 'desc').limit(50).get();
      if (recordResult.data && recordResult.data.length > 0) {
        const transformedRecords = recordResult.data.map(record => ({
          id: record._id,
          studentId: record.student_id || record.student_no || '',
          studentName: record.student_name || '未知',
          levelId: record.level_id || 0,
          levelName: record.level_name || '未知',
          reason: record.reason || '',
          pointsDeducted: record.points_deducted || 0,
          date: record.date || '',
          status: record.status || 'active',
          expiryDate: record.expiry_date || '',
          operator: record.operator_name || '管理员',
          revokeRequests: record.revoke_requests || [],
          semesterId: record.semester_id || '',
          semesterName: record.semester_name || ''
        }));
        setRecords(transformedRecords);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载数据，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 统计数据
  const stats = {
    total: records.length,
    active: records.filter(r => r.status === 'active').length,
    expired: records.filter(r => r.status === 'expired').length,
    revoked: records.filter(r => r.status === 'revoked').length,
    pendingReviews: records.filter(r => r.revokeRequests && r.revokeRequests.length > 0 && r.revokeRequests[0].status === 'pending').length
  };

  // 过滤记录
  const filteredRecords = records.filter(record => {
    const matchSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || record.levelName.toLowerCase().includes(searchTerm.toLowerCase()) || record.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // 获取状态样式
  const getStatusStyles = status => {
    switch (status) {
      case 'active':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          icon: AlertTriangle
        };
      case 'expired':
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: Clock
        };
      case 'revoked':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: CheckCircle
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: FileText
        };
    }
  };

  // 获取严重程度样式
  const getSeverityStyles = severity => {
    switch (severity) {
      case 'high':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-300'
        };
      case 'medium':
        return {
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-300'
        };
      case 'low':
      default:
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-300'
        };
    }
  };

  // 创建处分
  const handleCreateRecord = async () => {
    if (!newRecord.studentId || !newRecord.levelId || !newRecord.reason) {
      toast({
        title: '填写不完整',
        description: '请填写所有必填项',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const student = students.find(s => s.id === parseInt(newRecord.studentId));
      const level = DISCIPLINE_LEVELS.find(l => l.id === parseInt(newRecord.levelId));

      // 添加处分记录到数据库
      const recordResult = await db.collection('discipline_record').add({
        record_id: `DR${Date.now()}`,
        student_id: parseInt(newRecord.studentId) || 0,
        student_name: student.name,
        student_no: student.studentId || '',
        group_name: student.group || '',
        level_id: level.id,
        level_name: level.name,
        reason: newRecord.reason,
        points_deducted: level.points,
        date: newRecord.date,
        status: 'active',
        expiry_date: new Date(Date.now() + level.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        operator_name: '班主任',
        revoke_requests: []
      });
      const createdRecord = {
        id: recordResult.id || recordResult.ids?.[0] || `DR${Date.now()}`,
        studentId: parseInt(newRecord.studentId),
        studentName: student.name,
        levelId: level.id,
        levelName: level.name,
        reason: newRecord.reason,
        pointsDeducted: level.points,
        date: newRecord.date,
        status: 'active',
        expiryDate: new Date(Date.now() + level.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        operator: '班主任',
        revokeRequests: []
      };
      setRecords([...records, createdRecord]);
      setShowCreateDialog(false);
      setNewRecord({
        studentId: '',
        levelId: '',
        reason: '',
        date: new Date().toISOString().split('T')[0]
      });
      toast({
        title: '创建成功',
        description: `已为 ${student.name} 创建 ${level.name}`
      });
    } catch (error) {
      console.error('创建失败:', error);
      toast({
        title: '创建失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 查看详情
  const handleViewDetail = record => {
    setSelectedRecord(record);
    setShowDetailDialog(true);
  };

  // 撤销处分
  const handleRevokeRecord = async () => {
    if (!revokeReason.trim()) {
      toast({
        title: '请填写撤销原因',
        description: '撤销原因不能为空',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新数据库中的处分记录
      await db.collection('discipline_record').doc(selectedRecord.id).update({
        status: 'revoked',
        revoke_reason: revokeReason,
        revoked_date: new Date().toISOString()
      });

      // 更新本地状态
      const updatedRecords = records.map(r => r.id === selectedRecord.id ? {
        ...r,
        status: 'revoked',
        revokeReason,
        revokedDate: new Date().toISOString()
      } : r);
      setRecords(updatedRecords);
      setShowRevokeDialog(false);
      setRevokeReason('');
      setSelectedRecord(null);
      toast({
        title: '撤销成功',
        description: '处分记录已撤销'
      });
    } catch (error) {
      console.error('撤销失败:', error);
      toast({
        title: '撤销失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 申请撤销
  const handleRequestRevoke = async () => {
    if (!revokeRequestReason.trim()) {
      toast({
        title: '请填写申请原因',
        description: '申请原因不能为空',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取现有撤销申请
      const existingRequests = selectedRecord.revokeRequests || [];
      const newRequest = {
        reason: revokeRequestReason,
        requestDate: new Date().toISOString(),
        status: 'pending'
      };

      // 更新数据库中的撤销申请
      await db.collection('discipline_record').doc(selectedRecord.id).update({
        revoke_requests: [...existingRequests, newRequest]
      });

      // 更新本地状态
      const updatedRecords = records.map(r => r.id === selectedRecord.id ? {
        ...r,
        revokeRequests: [...existingRequests, newRequest]
      } : r);
      setRecords(updatedRecords);
      setShowRevokeRequestDialog(false);
      setRevokeRequestReason('');
      setSelectedRecord(null);
      toast({
        title: '申请已提交',
        description: '撤销申请已提交，等待审核'
      });
    } catch (error) {
      console.error('申请失败:', error);
      toast({
        title: '申请失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 查看历史记录
  const handleViewHistory = studentId => {
    const student = students.find(s => s.id === studentId);
    const historyRecords = records.filter(r => r.studentId === studentId);
    setSelectedStudentHistory({
      student,
      records: historyRecords
    });
    setShowHistoryDialog(true);
  };

  // 导出数据
  const handleExportData = async () => {
    try {
      let exportRecords = records;
      if (exportRange === 'current_month') {
        const now = new Date();
        exportRecords = records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        });
      } else if (exportRange === 'last_month') {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        exportRecords = records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate.getMonth() === lastMonth.getMonth() && recordDate.getFullYear() === lastMonth.getFullYear();
        });
      }
      // 模拟导出
      const csvContent = `学生姓名,学号,处分级别,扣分,原因,日期,状态,有效期\n${exportRecords.map(r => `${r.studentName},${r.studentId},${r.levelName},${r.pointsDeducted},${r.reason},${r.date},${r.status},${r.expiryDate}`).join('\n')}`;
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `处分记录_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setShowExportDialog(false);
      toast({
        title: '导出成功',
        description: '处分记录已导出'
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
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-sm">加载中...</p>
          </div>
        </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
        {/* 页面头部 - 紧凑 */}
        <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">处分管理</h1>
              <p className="text-xs text-gray-500">学生违纪处分记录管理</p>
            </div>
            <div className="flex gap-1">
              <Button onClick={() => setShowExportDialog(true)} variant="outline" size="icon" className="h-8 w-8">
                <Download className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowCreateDialog(true)} variant="outline" size="icon" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-3 py-2">
          {/* 统计概览 - 紧凑 */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard title="处分总数" value={stats.total} icon={FileText} color="blue" />
            <StatCard title="生效中" value={stats.active} icon={AlertTriangle} color="red" />
            <StatCard title="已过期" value={stats.expired} icon={Clock} color="amber" />
            <StatCard title="已撤销" value={stats.revoked} icon={CheckCircle} color="green" />
            <StatCard title="待审核" value={stats.pendingReviews} icon={History} color="orange" className="col-span-2" />
          </div>

          {/* 筛选栏 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="搜索学生、处分级别、原因..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">全部状态</option>
                <option value="active">生效中</option>
                <option value="expired">已过期</option>
                <option value="revoked">已撤销</option>
              </select>
            </div>
          </div>

          {/* 处分记录列表 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-600" />
                处分记录
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? <div className="p-6 text-center text-gray-500 text-sm">
                  暂无处分记录
                </div> : filteredRecords.map(record => {
            const statusStyles = getStatusStyles(record.status);
            const StatusIcon = statusStyles.icon;
            const level = DISCIPLINE_LEVELS.find(l => l.id === record.levelId);
            const severityStyles = getSeverityStyles(level?.severity);
            return <div key={record.id} className={`p-2.5 hover:bg-gray-50 transition-colors ${record.status === 'active' ? 'bg-red-50/50' : ''}`}>
                    <div className="flex items-start gap-2">
                      {/* 学生头像和基本信息 */}
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {record.studentName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="font-medium text-gray-800 text-sm">{record.studentName}</h3>
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${severityStyles.bgColor} ${severityStyles.textColor} ${severityStyles.borderColor} border`}>
                            {record.levelName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1.5 truncate">{record.reason}</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${statusStyles.textColor}`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {getStatusText(record.status)}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {record.pointsDeducted}分
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {record.date}
                          </span>
                        </div>
                      </div>
                      {/* 操作按钮 */}
                      <div className="flex gap-1">
                        <Button onClick={() => handleViewDetail(record)} variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                        {record.status === 'active' && <Button onClick={() => {
                    setSelectedRecord(record);
                    setShowRevokeDialog(true);
                  }} variant="ghost" size="icon" className="h-7 w-7">
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                          </Button>}
                        {record.revokeRequests && record.revokeRequests.length > 0 && record.revokeRequests[0].status === 'pending' && <Button onClick={() => handleViewDetail(record)} variant="ghost" size="icon" className="h-7 w-7">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          </Button>}
                      </div>
                    </div>
                  </div>;
          })}
            </div>
          </div>
        </main>

        {/* 创建处分对话框 */}
        {showCreateDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">新建处分</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学生</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={newRecord.studentId} onChange={e => setNewRecord({
              ...newRecord,
              studentId: e.target.value
            })}>
                    <option value="">请选择学生</option>
                    {students.map(student => <option key={student.id} value={student.id}>{student.name} ({student.studentId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">处分级别</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={newRecord.levelId} onChange={e => setNewRecord({
              ...newRecord,
              levelId: e.target.value
            })}>
                    <option value="">请选择处分级别</option>
                    {DISCIPLINE_LEVELS.map(level => <option key={level.id} value={level.id}>{level.name} ({level.points}分, {level.duration}天)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">处分原因</label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" rows={3} value={newRecord.reason} onChange={e => setNewRecord({
              ...newRecord,
              reason: e.target.value
            })} placeholder="请详细描述违纪原因..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={newRecord.date} onChange={e => setNewRecord({
              ...newRecord,
              date: e.target.value
            })} />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <Button onClick={() => setShowCreateDialog(false)} variant="outline" className="px-4 py-2">
                  取消
                </Button>
                <Button onClick={handleCreateRecord} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2">
                  创建
                </Button>
              </div>
            </div>
          </div>}

        {/* 详情对话框 */}
        {showDetailDialog && selectedRecord && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">处分详情</h3>
                <Button onClick={() => {
            setShowDetailDialog(false);
            setSelectedRecord(null);
          }} variant="ghost" size="icon" className="h-8 w-8">
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedRecord.studentName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedRecord.studentName}</p>
                    <p className="text-sm text-gray-500">{selectedRecord.studentId || ''}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">处分级别</span>
                    <span className="text-sm font-medium text-gray-800">{selectedRecord.levelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">扣分</span>
                    <span className={`text-sm font-medium ${selectedRecord.pointsDeducted < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                      {selectedRecord.pointsDeducted}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">原因</span>
                    <span className="text-sm font-medium text-gray-800 text-right">{selectedRecord.reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">日期</span>
                    <span className="text-sm text-gray-800">{selectedRecord.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">状态</span>
                    <span className={`text-sm font-medium ${getStatusStyles(selectedRecord.status).textColor}`}>
                      {getStatusText(selectedRecord.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">有效期至</span>
                    <span className="text-sm text-gray-800">{selectedRecord.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">操作人</span>
                    <span className="text-sm text-gray-800">{selectedRecord.operator}</span>
                  </div>
                </div>
                {selectedRecord.revokeRequests && selectedRecord.revokeRequests.length > 0 && <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-2">撤销申请</p>
                    {selectedRecord.revokeRequests.map((request, index) => <div key={index} className="text-xs text-amber-700">
                        <p>原因：{request.reason}</p>
                        <p>申请日期：{request.requestDate}</p>
                        <p>状态：{request.status === 'pending' ? '待审核' : request.status === 'approved' ? '已批准' : '已拒绝'}</p>
                      </div>)}
                  </div>}
              </div>
              <div className="p-4 border-t border-gray-200">
                {selectedRecord.status === 'active' && <Button onClick={() => {
            setShowDetailDialog(false);
            setShowRevokeDialog(true);
          }} variant="outline" className="w-full">
                    申请撤销
                  </Button>}
              </div>
            </div>
          </div>}

        {/* 撤销对话框 */}
        {showRevokeDialog && selectedRecord && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">撤销处分</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">处分信息</p>
                  <p className="text-sm font-medium text-gray-800">{selectedRecord.studentName} - {selectedRecord.levelName}</p>
                  <p className="text-xs text-gray-500">{selectedRecord.reason}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">撤销原因</label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" rows={3} value={revokeReason} onChange={e => setRevokeReason(e.target.value)} placeholder="请填写撤销原因..." />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <Button onClick={() => {
            setShowRevokeDialog(false);
            setRevokeReason('');
            setSelectedRecord(null);
          }} variant="outline" className="px-4 py-2">
                  取消
                </Button>
                <Button onClick={handleRevokeRecord} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2">
                  确认撤销
                </Button>
              </div>
            </div>
          </div>}

        {/* 撤销申请对话框 */}
        {showRevokeRequestDialog && selectedRecord && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">申请撤销处分</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">处分信息</p>
                  <p className="text-sm font-medium text-gray-800">{selectedRecord.studentName} - {selectedRecord.levelName}</p>
                  <p className="text-xs text-gray-500">{selectedRecord.reason}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">申请原因</label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" rows={3} value={revokeRequestReason} onChange={e => setRevokeRequestReason(e.target.value)} placeholder="请填写申请撤销的原因..." />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <Button onClick={() => {
            setShowRevokeRequestDialog(false);
            setRevokeRequestReason('');
            setSelectedRecord(null);
          }} variant="outline" className="px-4 py-2">
                  取消
                </Button>
                <Button onClick={handleRequestRevoke} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2">
                  提交申请
                </Button>
              </div>
            </div>
          </div>}

        {/* 历史记录对话框 */}
        {showHistoryDialog && selectedStudentHistory && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">处分历史</h3>
                <Button onClick={() => {
            setShowHistoryDialog(false);
            setSelectedStudentHistory(null);
          }} variant="ghost" size="icon" className="h-8 w-8">
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedStudentHistory.student.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedStudentHistory.student.name}</p>
                    <p className="text-sm text-gray-500">{selectedStudentHistory.student.studentId}</p>
                  </div>
                </div>
                {selectedStudentHistory.records.length === 0 ? <p className="text-center text-gray-500 py-4">暂无处分记录</p> : selectedStudentHistory.records.map(record => {
            const statusStyles = getStatusStyles(record.status);
            return <div key={record.id} className={`bg-gray-50 rounded-lg p-3 ${record.status === 'active' ? 'border-l-4 border-red-500' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{record.levelName}</span>
                        <span className={`text-xs font-medium ${statusStyles.textColor}`}>
                          {getStatusText(record.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{record.reason}</p>
                      <p className="text-xs text-gray-500">{record.date}</p>
                    </div>;
          })}
              </div>
            </div>
          </div>}

        {/* 导出对话框 */}
        {showExportDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">导出处分记录</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">导出范围</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportRange" value="all" checked={exportRange === 'all'} onChange={e => setExportRange(e.target.value)} className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-700">全部记录</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportRange" value="current_month" checked={exportRange === 'current_month'} onChange={e => setExportRange(e.target.value)} className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-700">本月记录</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportRange" value="last_month" checked={exportRange === 'last_month'} onChange={e => setExportRange(e.target.value)} className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-700">上月记录</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <Button onClick={() => setShowExportDialog(false)} variant="outline" className="px-4 py-2">
                  取消
                </Button>
                <Button onClick={handleExportData} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2">
                  导出
                </Button>
              </div>
            </div>
          </div>}

        {/* 底部导航栏 */}
        <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>;
}