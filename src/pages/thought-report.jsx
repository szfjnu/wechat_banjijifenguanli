// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast, Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { Trophy, FileText, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Book, Upload, History, FileCheck, Plus, Eye } from 'lucide-react';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
import { ProgressStatCard } from '@/components/ProgressStatCard';
import { usePermission } from '@/components/PermissionGuard';

// 获取北京时间（UTC+8）
const getBeijingTime = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const beijingOffset = 8;
  return new Date(utc + 3600000 * beijingOffset);
};

// 获取北京时间字符串（YYYY-MM-DD格式）
const getBeijingDateString = () => {
  const beijingTime = getBeijingTime();
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export default function ThoughtReportPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [disciplineRecords, setDisciplineRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [newReport, setNewReport] = useState({
    disciplineRecordId: '',
    title: '',
    content: ''
  });
  useEffect(() => {
    if ($w && $w.auth && $w.auth.currentUser) {
      setCurrentUser($w.auth.currentUser);
    }
  }, [$w]);
  useEffect(() => {
    loadData();
  }, [currentUser]);
  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 查询用户的处分记录
      const recordResult = await db.collection('discipline_record').where({
        student_id: currentUser.userId,
        months: db.command.gt(0),
        revocation_status: '考察中'
      }).get();
      if (recordResult.data) {
        setDisciplineRecords(recordResult.data);
      }

      // 查询思想汇报记录
      const reportResult = await db.collection('thought_report').where({
        student_id: currentUser.userId
      }).orderBy('submit_date', 'desc').get();
      if (reportResult.data) {
        setReports(reportResult.data);
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
  const handleSubmitReport = async () => {
    if (!newReport.disciplineRecordId || !newReport.title || !newReport.content) {
      toast({
        title: '提示',
        description: '请填写完整的汇报信息',
        variant: 'destructive'
      });
      return;
    }

    // 检查字数
    const wordCount = newReport.content.trim().length;
    if (wordCount < 800) {
      toast({
        title: '字数不足',
        description: `当前字数: ${wordCount}，至少需要800字`,
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 查找选中的处分记录
      const record = disciplineRecords.find(r => r.record_id === newReport.disciplineRecordId);
      if (!record) {
        toast({
          title: '错误',
          description: '未找到处分记录',
          variant: 'destructive'
        });
        return;
      }

      // 生成汇报月份
      const now = new Date();
      const reportMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // 创建思想汇报
      const reportResult = await db.collection('thought_report').add({
        report_id: `TR${Date.now()}`,
        discipline_record_id: newReport.disciplineRecordId,
        student_id: currentUser.userId,
        student_name: currentUser.name,
        title: newReport.title,
        content: newReport.content,
        submit_date: getBeijingDateString(),
        report_month: reportMonth,
        status: '待审核',
        created_by: currentUser.userId,
        submit_by: currentUser.userId,
        word_count: wordCount
      });

      // 更新处分记录的思想汇报完成次数
      const newCount = (record.completed_report_count || 0) + 1;
      const newStatus = newCount >= record.report_count_required && record.completed_volunteer_hours >= record.volunteer_hours_required ? '符合条件' : '考察中';
      await db.collection('discipline_record').where({
        record_id: newReport.disciplineRecordId
      }).update({
        completed_report_count: newCount,
        revocation_status: newStatus
      });

      // 更新本地状态
      setReports([{
        ...(reportResult.data || {}),
        id: reportResult.id
      }, ...reports]);
      setDisciplineRecords(records.map(r => r.record_id === newReport.disciplineRecordId ? {
        ...r,
        completed_report_count: newCount,
        revocation_status: newStatus
      } : r));
      setShowCreateDialog(false);
      setNewReport({
        disciplineRecordId: '',
        title: '',
        content: ''
      });
      toast({
        title: '提交成功',
        description: '思想汇报已提交，等待审核'
      });
      loadData();
    } catch (error) {
      console.error('提交汇报失败:', error);
      toast({
        title: '提交失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const getStatusStyles = status => {
    switch (status) {
      case '待审核':
        return {
          textColor: 'text-amber-600',
          bgColor: 'bg-amber-100',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-500'
        };
      case '已通过':
        return {
          textColor: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500'
        };
      case '未通过':
        return {
          textColor: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500'
        };
      default:
        return {
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500'
        };
    }
  };
  const handleCardClick = type => {
    toast({
      title: '点击详情',
      description: `查看${type}详情`,
      variant: 'default'
    });
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <Book className="w-6 h-6" />
            思想汇报
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 统计概览 - 汇报状态 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">汇报状态</h2>
          <div className="border-b border-gray-200 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProgressStatCard title="已提交汇报" value={reports.filter(r => r.status === '已通过').length} suffix="篇" icon={FileCheck} color="purple" trend="up" onClick={() => handleCardClick('已提交')} />
            <ProgressStatCard title="待审核" value={reports.filter(r => r.status === '待审核').length} suffix="篇" icon={Clock} color="amber" onClick={() => handleCardClick('待审核')} />
            <ProgressStatCard title="需重写" value={reports.filter(r => r.status === '未通过').length} suffix="篇" icon={XCircle} color="red" onClick={() => handleCardClick('需重写')} />
          </div>
        </div>

        {/* 创建汇报按钮 */}
        {disciplineRecords.length > 0 && <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-purple-800">提交思想汇报</h2>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                新建汇报
              </Button>
            </div>
            <p className="text-sm text-gray-600">每月需提交一篇思想汇报，汇报内容需800字以上。</p>
          </div>}

        {/* 处分记录列表 */}
        {disciplineRecords.length > 0 && <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
            <h2 className="text-lg font-bold text-purple-800 mb-4">关联处分记录</h2>
            <div className="space-y-3">
              {disciplineRecords.map(record => <Card key={record.record_id} className={`${record.completed_report_count >= record.report_count_required ? 'bg-green-50 border-green-200' : 'bg-white'} border-l-4 border-l-purple-400`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{record.level_name}</h3>
                        <p className="text-sm text-gray-600">{record.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-600">
                          {record.completed_report_count} / {record.report_count_required} 篇
                        </p>
                        {record.completed_report_count >= record.report_count_required && <span className="text-xs text-green-600 font-medium">
                            ✓ 已完成
                          </span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>}

        {/* 历史汇报列表 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
          <h2 className="text-lg font-bold text-purple-800 mb-4">历史汇报记录</h2>
          {reports.length === 0 ? <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>暂无汇报记录</p>
            </div> : <div className="space-y-3">
              {reports.map(report => {
            const statusStyles = getStatusStyles(report.status);
            const record = disciplineRecords.find(r => r.record_id === report.discipline_record_id);
            return <Card key={report.report_id || report.id} className={`${statusStyles.borderColor} border-l-4`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{report.title}</h3>
                          <p className="text-xs text-gray-500 mb-2">
                            {record?.level_name} - {report.submit_date}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles.bgColor} ${statusStyles.textColor}`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {report.content?.substring(0, 100)}...
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>字数: {report.word_count || 0}</span>
                          <span>月份: {report.report_month}</span>
                        </div>
                        <Button onClick={() => {
                    setSelectedReport(report);
                    setShowViewDialog(true);
                  }} variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {report.review_comments && <div className="mt-2 bg-gray-50 rounded p-2 text-sm text-gray-600">
                          <p><strong>审核意见:</strong> {report.review_comments}</p>
                          {report.review_date && <p className="text-xs text-gray-500">审核日期: {report.review_date}</p>}
                        </div>}
                    </CardContent>
                  </Card>;
          })}
            </div>}
        </div>
      </div>

      {/* 创建汇报对话框 */}
      {showCreateDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                新建思想汇报
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择处分记录</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" value={newReport.disciplineRecordId} onChange={e => setNewReport({
                ...newReport,
                disciplineRecordId: e.target.value
              })}>
                    <option value="">请选择处分记录</option>
                    {disciplineRecords.map(record => <option key={record.record_id} value={record.record_id}>
                        {record.level_name} - {record.reason}
                      </option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">汇报标题</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" value={newReport.title} onChange={e => setNewReport({
                ...newReport,
                title: e.target.value
              })} placeholder="请输入汇报标题" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    汇报内容 
                    <span className={`text-xs ml-2 ${newReport.content.length >= 800 ? 'text-green-600' : 'text-gray-500'}`}>
                      ({newReport.content.length} / 800 字)
                    </span>
                  </label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" rows={12} value={newReport.content} onChange={e => setNewReport({
                ...newReport,
                content: e.target.value
              })} placeholder="请详细汇报思想认识、改正措施、学习体会等内容（至少800字）..." />
                  {newReport.content.length > 0 && newReport.content.length < 800 && <p className="text-xs text-red-600 mt-1">还需 {800 - newReport.content.length} 字</p>}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setShowCreateDialog(false)} variant="outline" className="flex-1">
                    取消
                  </Button>
                  <Button onClick={handleSubmitReport} disabled={!newReport.disciplineRecordId || !newReport.title || newReport.content.length < 800} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    提交汇报
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>}

      {/* 查看汇报对话框 */}
      {showViewDialog && selectedReport && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-purple-800">汇报详情</h2>
                <Button onClick={() => setShowViewDialog(false)} variant="ghost" size="sm">
                  关闭
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-gray-800 mb-2">{selectedReport.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>提交日期: {selectedReport.submit_date}</p>
                    <p>汇报月份: {selectedReport.report_month}</p>
                    <p>字数: {selectedReport.word_count}</p>
                    <p>
                      状态: 
                      <span className={`font-medium ${selectedReport.status === '已通过' ? 'text-green-600' : selectedReport.status === '未通过' ? 'text-red-600' : 'text-amber-600'}`}>
                        {selectedReport.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">汇报内容</h4>
                  <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedReport.content}
                  </div>
                </div>

                {selectedReport.review_comments && <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-2">审核意见</h4>
                    <p className="text-gray-700 text-sm">{selectedReport.review_comments}</p>
                    {selectedReport.review_date && <p className="text-xs text-gray-500 mt-2">审核日期: {selectedReport.review_date}</p>}
                  </div>}
              </div>
            </div>
          </div>
        </div>}

      <TabBar />
    </div>;
}