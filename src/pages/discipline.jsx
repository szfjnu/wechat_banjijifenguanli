// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { AlertTriangle, FileText, Search, Filter, Shield, ShieldAlert, Calendar, Clock, CheckCircle, XCircle, User, Plus, History, Download, Eye, Settings } from 'lucide-react';
// @ts-ignore;
import { Button, useToast, Progress } from '@/components/ui';
// @ts-ignore;
import { getBeijingTimeISO, getBeijingDateString } from '@/lib/utils';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
import { usePermission, ConditionalRender } from '@/components/PermissionGuard';
// 格式化积分：整数显示整数，小数最多显示两位
const formatPoints = points => {
  if (points === undefined || points === null || isNaN(points)) return '0';
  const num = Number(points);
  const rounded = Math.round(num * 100) / 100;
  // 如果小数部分为0，显示整数；否则最多显示两位小数
  return rounded === Math.floor(rounded) ? String(Math.floor(rounded)) : rounded.toFixed(2);
};

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
  const [disciplineLevels, setDisciplineLevels] = useState([]);
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
    date: getBeijingDateString(),
    months: '',
    volunteerHoursRequired: '',
    reportCountRequired: ''
  });

  // 权限检查
  const {
    permission: canCreateDiscipline,
    loading: loadingCreateDiscipline
  } = usePermission($w, 'discipline', 'create');
  const {
    permission: canEditDiscipline,
    loading: loadingEditDiscipline
  } = usePermission($w, 'discipline', 'edit');
  const {
    permission: canApproveDiscipline,
    loading: loadingApproveDiscipline
  } = usePermission($w, 'discipline', 'approve');
  const {
    permission: canRejectDiscipline,
    loading: loadingRejectDiscipline
  } = usePermission($w, 'discipline', 'reject');

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取当前用户信息
      const currentUser = $w.auth.currentUser;
      const userType = currentUser?.type || '';
      const userName = currentUser?.name || '';

      // 根据用户类型构建查询条件
      let studentQuery = {};
      let recordQuery = {};
      if (userType === '学生') {
        // 学生只看自己的数据
        studentQuery = {
          name: userName
        };
        recordQuery = {
          student_name: userName
        };
      } else if (userType === '班主任') {
        // 班主任只看自己班级的学生（需要先获取班主任管理的班级）
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
              recordQuery = {
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
        recordQuery = {};
      }
      // 其他角色（管理员、教师等）查看所有数据

      // 加载学生数据
      const studentResult = await db.collection('students').where(studentQuery).get();
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

      // 加载处分级别数据
      const levelResult = await db.collection('discipline_level_config').get();
      if (levelResult.data && levelResult.data.length > 0) {
        const transformedLevels = levelResult.data.map(level => ({
          id: level._id,
          levelName: level.level_name,
          deductPoints: level.deduct_points,
          validDays: level.valid_days,
          description: level.description,
          sortOrder: level.sort_order,
          months: level.months || 0,
          volunteerHoursRequired: level.volunteer_hours_required || 0,
          reportCountRequired: level.report_count_required || 0
        }));
        setDisciplineLevels(transformedLevels);
      }

      // 加载处分记录数据（根据用户身份筛选）
      const recordResult = await db.collection('discipline_record').where(recordQuery).orderBy('date', 'desc').limit(50).get();
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
          semesterName: record.semester_name || '',
          months: record.months || 0,
          volunteerHoursRequired: record.volunteer_hours_required || 0,
          completedVolunteerHours: record.completed_volunteer_hours || 0,
          reportCountRequired: record.report_count_required || 0,
          completedReportCount: record.completed_report_count || 0,
          startDate: record.start_date || '',
          endDate: record.end_date || '',
          revocationStatus: record.revocation_status || '考察中'
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

  // 处分级别变化时自动设置撤销条件
  const handleLevelChange = levelId => {
    setNewRecord(prev => ({
      ...prev,
      levelId
    }));
    const level = disciplineLevels.find(l => l.id === levelId);
    if (level) {
      setNewRecord(prev => ({
        ...prev,
        months: level.months || '',
        volunteerHoursRequired: level.volunteer_hours_required || '',
        reportCountRequired: level.report_count_required || ''
      }));
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
      const student = students.find(s => s.id === newRecord.studentId);
      const level = disciplineLevels.find(l => l.id === newRecord.levelId);
      if (!level) {
        toast({
          title: '错误',
          description: '未找到处分级别配置',
          variant: 'destructive'
        });
        return;
      }

      // 根据处分级别设置默认撤销条件，允许班主任调整
      const months = parseInt(newRecord.months) !== '' ? parseInt(newRecord.months) : level.months || 0;
      const volunteerHoursRequired = parseInt(newRecord.volunteerHoursRequired) !== '' ? parseInt(newRecord.volunteerHoursRequired) : level.volunteerHoursRequired || 0;
      const reportCountRequired = parseInt(newRecord.reportCountRequired) !== '' ? parseInt(newRecord.reportCountRequired) : level.reportCountRequired || 0;

      // 计算处分开始和结束日期
      const startDate = newRecord.date;
      const endDate = months > 0 ? new Date(new Date(newRecord.date).getTime() + months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';

      // 添加处分记录到数据库
      const recordResult = await db.collection('discipline_record').add({
        record_id: `DR${getBeijingTime().getTime()}`,
        student_id: newRecord.studentId || '',
        student_name: student.name,
        student_no: student.studentId || '',
        group_name: student.group || '',
        level_id: level.id,
        level_name: level.levelName,
        reason: newRecord.reason,
        points_deducted: level.deductPoints,
        date: newRecord.date,
        status: 'active',
        expiry_date: getBeijingDateString(),
        operator_name: '班主任',
        revoke_requests: [],
        months: months,
        volunteer_hours_required: volunteerHoursRequired,
        completed_volunteer_hours: 0,
        report_count_required: reportCountRequired,
        completed_report_count: 0,
        start_date: startDate,
        end_date: endDate,
        revocation_status: months > 0 ? '考察中' : '无考察期'
      });
      const createdRecord = {
        id: recordResult.id || recordResult.ids?.[0] || `DR${getBeijingTime().getTime()}`,
        studentId: newRecord.studentId,
        studentName: student.name,
        levelId: level.id,
        levelName: level.levelName,
        reason: newRecord.reason,
        pointsDeducted: level.deductPoints,
        date: newRecord.date,
        status: 'active',
        expiryDate: getBeijingDateString(),
        operator: '班主任',
        revokeRequests: [],
        months: months,
        volunteerHoursRequired: volunteerHoursRequired,
        completedVolunteerHours: 0,
        reportCountRequired: reportCountRequired,
        completedReportCount: 0,
        startDate: startDate,
        endDate: endDate,
        revocationStatus: months > 0 ? '考察中' : '无考察期'
      };
      setRecords([...records, createdRecord]);
      setShowCreateDialog(false);
      setNewRecord({
        studentId: '',
        levelId: '',
        reason: '',
        date: getBeijingDateString(),
        months: '',
        volunteerHoursRequired: '',
        reportCountRequired: ''
      });
      toast({
        title: '创建成功',
        description: `已为 ${student.name} 创建 ${level.levelName}`
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
        revoked_date: getBeijingTimeISO()
      });

      // 更新本地状态
      const updatedRecords = records.map(r => r.id === selectedRecord.id ? {
        ...r,
        status: 'revoked',
        revokeReason,
        revokedDate: getBeijingTimeISO()
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
        requestDate: getBeijingTimeISO(),
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
        const now = getBeijingTime();
        exportRecords = records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        });
      } else if (exportRange === 'last_month') {
        const now = getBeijingTime();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        exportRecords = records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate.getMonth() === lastMonth.getMonth() && recordDate.getFullYear() === lastMonth.getFullYear();
        });
      }
      // 模拟导出
      const csvContent = `学生姓名,学号,处分级别,扣分,原因,日期,状态,有效期\n${exportRecords.map(r => `${r.studentName},${r.studentId},${r.levelName},${formatPoints(r.pointsDeducted)},${r.reason},${r.date},${r.status},${r.expiryDate}`).join('\n')}`;
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `处分记录_${getBeijingDateString()}.csv`;
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

  // 计算撤销条件完成度
  const calculateProgress = (required, completed) => {
    if (required <= 0) return 100;
    const progress = completed / required * 100;
    return Math.min(progress, 100).toFixed(0);
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
              <Button onClick={() => $w.utils.navigateTo({
            pageId: 'points-settings',
            params: {}
          })} variant="outline" size="icon" className="h-8 w-8" title="处分级别设置">
                <Settings className="w-4 h-4" />
              </Button>
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
            const level = disciplineLevels.find(l => l.id === record.levelId) || {
              levelName: record.levelName,
              deductPoints: record.pointsDeducted
            };
            // 根据扣分值判断严重程度样式
            const getSeverityByPoints = points => {
              if (points >= 20) return 'high';
              if (points >= 10) return 'medium';
              return 'low';
            };
            const severityStyles = getSeverityStyles(getSeverityByPoints(level.deductPoints));
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
                            {formatPoints(record.pointsDeducted)}分
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {record.date}
                          </span>
                          {/* 显示考察状态 */}
                          {record.months > 0 && <span className={`text-[10px] ${record.revocationStatus === '考察中' ? 'text-amber-600' : record.revocationStatus === '符合条件' ? 'text-green-600' : 'text-gray-500'}`}>
                              {record.revocationStatus}
                            </span>}
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
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={newRecord.levelId} onChange={e => handleLevelChange(e.target.value)}>
                    <option value="">请选择处分级别</option>
                    {disciplineLevels.map(level => <option key={level.id} value={level.id}>{level.levelName} (扣{level.deductPoints}分, 有效{level.validDays}天)</option>)}
                  </select>
                </div>

                {/* 撤销条件设置 */}
                {newRecord.levelId && <div className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">撤销条件设置</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">考察期（月）</label>
                        <input type="number" min="0" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs" value={newRecord.months} onChange={e => setNewRecord({
                  ...newRecord,
                  months: e.target.value
                })} placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">志愿时长（小时）</label>
                        <input type="number" min="0" step="0.5" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs" value={newRecord.volunteerHoursRequired} onChange={e => setNewRecord({
                  ...newRecord,
                  volunteerHoursRequired: e.target.value
                })} placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">思想汇报（次）</label>
                        <input type="number" min="0" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs" value={newRecord.reportCountRequired} onChange={e => setNewRecord({
                  ...newRecord,
                  reportCountRequired: e.target.value
                })} placeholder="0" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">选择处分级别后自动设置，可调整</p>
                  </div>}

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
                    <span className={`text-sm font-medium text-red-600`}>
                      扣{Math.abs(formatPoints(selectedRecord.pointsDeducted))}分
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

                {/* 撤销条件和考察进度 */}
                {selectedRecord.months > 0 && <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 space-y-3 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">撤销条件与考察进度</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">考察状态</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedRecord.revocationStatus === '考察中' ? 'bg-amber-100 text-amber-700' : selectedRecord.revocationStatus === '符合条件' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {selectedRecord.revocationStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">考察期</span>
                      <span className="text-xs font-medium text-gray-800">
                        {selectedRecord.startDate} ~ {selectedRecord.endDate}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">志愿服务</span>
                        <span className="text-xs font-medium text-gray-800">
                          {formatPoints(selectedRecord.completedVolunteerHours)} / {formatPoints(selectedRecord.volunteerHoursRequired)} 小时
                        </span>
                      </div>
                      <Progress value={calculateProgress(selectedRecord.volunteerHoursRequired, selectedRecord.completedVolunteerHours)} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">思想汇报</span>
                        <span className="text-xs font-medium text-gray-800">
                          {selectedRecord.completedReportCount} / {selectedRecord.reportCountRequired} 篇
                        </span>
                      </div>
                      <Progress value={calculateProgress(selectedRecord.reportCountRequired, selectedRecord.completedReportCount)} className="h-1.5" />
                    </div>
                  </div>}
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