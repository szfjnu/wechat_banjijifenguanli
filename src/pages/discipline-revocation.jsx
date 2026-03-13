// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast, Progress, Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { Trophy, Calendar, Clock, FileText, Upload, AlertCircle, CheckCircle, XCircle, File, Eye, Plus, History } from 'lucide-react';
// @ts-ignore;
import { getBeijingDateString } from '@/lib/utils';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
export default function DisciplineRevocationPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [requests, setRequests] = useState([]);
  const [disciplineRecords, setDisciplineRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [newRequest, setNewRequest] = useState({
    disciplineRecordId: '',
    reason: '',
    attachments: []
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
        revocation_status: '考察中'
      }).get();
      if (recordResult.data) {
        setDisciplineRecords(recordResult.data);
      }

      // 查询撤销申请记录
      const requestResult = await db.collection('revocation_request').where({
        student_id: currentUser.userId
      }).orderBy('request_date', 'desc').get();
      if (requestResult.data) {
        setRequests(requestResult.data);
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
  const handleSubmitRequest = async () => {
    if (!newRequest.disciplineRecordId || !newRequest.reason) {
      toast({
        title: '提示',
        description: '请填写完整的申请信息',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 查找选中的处分记录
      const record = disciplineRecords.find(r => r.record_id === newRequest.disciplineRecordId);
      if (!record) {
        toast({
          title: '错误',
          description: '未找到处分记录',
          variant: 'destructive'
        });
        return;
      }

      // 创建撤销申请
      const requestResult = await db.collection('revocation_request').add({
        request_id: `RR${Date.now()}`,
        discipline_record_id: newRequest.disciplineRecordId,
        student_id: currentUser.userId,
        student_name: currentUser.name,
        level_name: record.level_name,
        reason: newRequest.reason,
        volunteer_progress: record.completed_volunteer_hours,
        report_progress: record.completed_report_count,
        attachments: newRequest.attachments,
        status: '待审核',
        request_date: getBeijingDateString(),
        created_by: currentUser.userId,
        submit_by: currentUser.userId
      });

      // 更新处分记录的撤销申请列表
      await db.collection('discipline_record').where({
        record_id: newRequest.disciplineRecordId
      }).update({
        revocation_application_records: [...(record.revocation_application_records || []), {
          request_id: `RR${Date.now()}`,
          reason: newRequest.reason,
          request_date: getBeijingDateString(),
          status: '待审核'
        }]
      });

      // 更新本地状态
      setRequests([{
        ...(recordResult.data || {}),
        id: requestResult.id
      }, ...requests]);
      setShowCreateDialog(false);
      setNewRequest({
        disciplineRecordId: '',
        reason: '',
        attachments: []
      });
      toast({
        title: '提交成功',
        description: '撤销申请已提交，等待审核'
      });
      loadData();
    } catch (error) {
      console.error('提交申请失败:', error);
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
          borderColor: 'border-amber-200'
        };
      case '已通过':
        return {
          textColor: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200'
        };
      case '已拒绝':
        return {
          textColor: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200'
        };
      default:
        return {
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        };
    }
  };
  const calculateProgress = (required, completed) => {
    if (required <= 0) return 100;
    const progress = completed / required * 100;
    return Math.min(progress, 100).toFixed(0);
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold text-orange-800 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            处分撤销申请
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="考察中处分" value={disciplineRecords.length} icon={AlertCircle} color="amber" />
          <StatCard title="申请中" value={requests.filter(r => r.status === '待审核').length} icon={Clock} color="orange" />
          <StatCard title="已通过" value={requests.filter(r => r.status === '已通过').length} icon={CheckCircle} color="green" />
        </div>

        {/* 创建申请按钮 */}
        {disciplineRecords.length > 0 && <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-orange-800">申请撤销处分</h2>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                新建申请
              </Button>
            </div>
            <p className="text-sm text-gray-600">在满足考察条件后，您可以申请撤销处分。</p>
          </div>}

        {/* 考察中处分列表 */}
        {disciplineRecords.length > 0 && <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
            <h2 className="text-lg font-bold text-orange-800 mb-4">考察中处分</h2>
            <div className="space-y-4">
              {disciplineRecords.map(record => <Card key={record.record_id} className="border-l-4 border-l-orange-400">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{record.level_name}</h3>
                        <p className="text-sm text-gray-600">{record.reason}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.revocation_status === '考察中' ? 'bg-amber-100 text-amber-700' : record.revocation_status === '符合条件' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {record.revocation_status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">考察期</span>
                          <span className="font-medium text-gray-800">
                            {record.start_date} ~ {record.end_date}
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">志愿服务</span>
                          <span className="font-medium text-gray-800">
                            {record.completed_volunteer_hours} / {record.volunteer_hours_required} 小时
                          </span>
                        </div>
                        <Progress value={calculateProgress(record.volunteer_hours_required, record.completed_volunteer_hours)} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">思想汇报</span>
                          <span className="font-medium text-gray-800">
                            {record.completed_report_count} / {record.report_count_required} 篇
                          </span>
                        </div>
                        <Progress value={calculateProgress(record.report_count_required, record.completed_report_count)} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>}

        {/* 申请历史 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
          <h2 className="text-lg font-bold text-orange-800 mb-4">申请历史</h2>
          {requests.length === 0 ? <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>暂无申请记录</p>
            </div> : <div className="space-y-3">
              {requests.map(request => <Card key={request.request_id || request.id} className={`${getStatusStyles(request.status).borderColor} border-l-4`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{request.level_name}</h3>
                        <p className="text-sm text-gray-600">申请日期: {request.request_date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(request.status).bgColor} ${getStatusStyles(request.status).textColor}
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">原因: {request.reason}</p>
                    {request.review_comments && <div className="bg-gray-50 rounded p-2 text-sm text-gray-600">
                        <p><strong>审核意见:</strong> {request.review_comments}</p>
                        {request.review_date && <p className="text-xs text-gray-500">审核日期: {request.review_date}</p>}
                      </div>}
                  </CardContent>
                </Card>)}
            </div>}
        </div>
      </div>

      {/* 创建申请对话框 */}
      {showCreateDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                新建撤销申请
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择处分记录</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={newRequest.disciplineRecordId} onChange={e => setNewRequest({
                ...newRequest,
                disciplineRecordId: e.target.value
              })}>
                    <option value="">请选择处分记录</option>
                    {disciplineRecords.map(record => <option key={record.record_id} value={record.record_id}>
                        {record.level_name} - {record.reason}
                      </option>)}
                  </select>
                </div>

                {newRequest.disciplineRecordId && <div className="bg-orange-50 rounded-lg p-3 space-y-2 border border-orange-200">
                    <p className="text-sm font-medium text-orange-800">当前进度</p>
                    {(() => {
                const record = disciplineRecords.find(r => r.record_id === newRequest.disciplineRecordId);
                if (!record) return null;
                return <>
                          <div className="flex justify-between text-xs">
                            <span>志愿服务</span>
                            <span>{record.completed_volunteer_hours} / {record.volunteer_hours_required} 小时</span>
                          </div>
                          <Progress value={calculateProgress(record.volunteer_hours_required, record.completed_volunteer_hours)} className="h-1.5" />
                          <div className="flex justify-between text-xs">
                            <span>思想汇报</span>
                            <span>{record.completed_report_count} / {record.report_count_required} 篇</span>
                          </div>
                          <Progress value={calculateProgress(record.report_count_required, record.completed_report_count)} className="h-1.5" />
                        </>;
              })()}
                  </div>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">申请原因</label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" rows={4} value={newRequest.reason} onChange={e => setNewRequest({
                ...newRequest,
                reason: e.target.value
              })} placeholder="请详细说明申请撤销的原因..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">附件（可选）</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">点击或拖拽文件到此处上传</p>
                    <p className="text-xs text-gray-400">支持图片、文档等格式</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setShowCreateDialog(false)} variant="outline" className="flex-1">
                    取消
                  </Button>
                  <Button onClick={handleSubmitRequest} className="flex-1 bg-orange-600 hover:bg-orange-700">
                    提交申请
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>}

      <TabBar />
    </div>;
}