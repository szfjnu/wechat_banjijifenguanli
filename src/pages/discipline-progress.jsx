// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast, Progress, Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { Trophy, Calendar, Clock, FileText, AlertCircle, CheckCircle, Timer, BookOpen, Activity, TrendingUp } from 'lucide-react';
// @ts-ignore;
import { getBeijingDateString } from '@/lib/utils';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
export default function DisciplineProgressPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
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
      const result = await db.collection('discipline_record').where({
        student_id: currentUser.userId,
        months: db.command.gt(0)
      }).orderBy('date', 'desc').get();
      if (result.data) {
        setRecords(result.data);
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
  const calculateRemainingDays = endDate => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const calculateProgress = (required, completed) => {
    if (required <= 0) return 100;
    const progress = completed / required * 100;
    return Math.min(progress, 100).toFixed(0);
  };
  const getRemainingMonths = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    if (today > end) return 0;
    const monthDiff = end.getMonth() - today.getMonth() + 12 * (end.getFullYear() - today.getFullYear());
    return monthDiff;
  };
  const getReportStatus = (completed, required, startDate, endDate) => {
    if (required <= 0) return {
      total: 0,
      completed: 0,
      remaining: 0,
      months: []
    };
    const months = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    let currentDate = new Date(start);
    let reportIndex = 0;
    while (currentDate <= end && currentDate <= today) {
      const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const isSubmitted = reportIndex < completed;
      months.push({
        month: monthStr,
        submitted: isSubmitted,
        overdue: !isSubmitted && currentDate.getMonth() < today.getMonth()
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
      reportIndex++;
    }
    const overdueMonths = months.filter(m => !m.submitted && m.overdue).length;
    return {
      total: required,
      completed: completed,
      remaining: required - completed,
      overdue: overdueMonths,
      months
    };
  };
  const getStatusStyles = status => {
    switch (status) {
      case '考察中':
        return {
          textColor: 'text-amber-600',
          bgColor: 'bg-amber-100',
          iconColor: 'text-amber-500'
        };
      case '符合条件':
        return {
          textColor: 'text-green-600',
          bgColor: 'bg-green-100',
          iconColor: 'text-green-500'
        };
      default:
        return {
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-500'
        };
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            考察进度追踪
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="考察中处分" value={records.filter(r => r.revocation_status === '考察中').length} icon={AlertCircle} color="amber" />
          <StatCard title="符合条件" value={records.filter(r => r.revocation_status === '符合条件').length} icon={CheckCircle} color="green" />
          <StatCard title="已完成志愿" value={records.reduce((sum, r) => sum + (r.completed_volunteer_hours || 0), 0).toFixed(1)} icon={Activity} color="blue" suffix="小时" />
          <StatCard title="已提交汇报" value={records.reduce((sum, r) => sum + (r.completed_report_count || 0), 0)} icon={BookOpen} color="purple" suffix="篇" />
        </div>

        {/* 处分记录列表 */}
        {records.length === 0 ? <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-indigo-200">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">暂无考察中处分</p>
          </div> : <div className="space-y-6">
            {records.map(record => {
          const remainingDays = calculateRemainingDays(record.end_date);
          const volunteerProgress = calculateProgress(record.volunteer_hours_required, record.completed_volunteer_hours);
          const reportStatus = getReportStatus(record.completed_report_count, record.report_count_required, record.start_date, record.end_date);
          const statusStyles = getStatusStyles(record.revocation_status);
          return <Card key={record.record_id} className={`${statusStyles.bgColor} border-2`}>
                  <CardContent className="p-6">
                    {/* 头部信息 */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{record.level_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles.bgColor} ${statusStyles.textColor}`}>
                            {record.revocation_status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{record.reason}</p>
                        <p className="text-sm text-gray-500">处分日期: {record.date}</p>
                      </div>
                    </div>

                    {/* 考察期倒计时 */}
                    <div className="bg-white/60 rounded-lg p-4 mb-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Timer className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-gray-800">考察期</span>
                        </div>
                        <span className={`text-sm font-medium ${remainingDays < 0 ? 'text-red-600' : remainingDays <= 30 ? 'text-amber-600' : 'text-green-600'}`}>
                          {remainingDays === null ? '-' : remainingDays < 0 ? `已结束 ${Math.abs(remainingDays)} 天` : remainingDays === 0 ? '今天到期' : `剩余 ${remainingDays} 天`}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>开始日期: {record.start_date}</p>
                        <p>结束日期: {record.end_date}</p>
                      </div>
                    </div>

                    {/* 撤销条件进度 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        撤销条件完成情况
                      </h4>

                      {/* 志愿服务时长 */}
                      <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-800">志愿服务时长</span>
                          </div>
                          <span className={`font-bold ${parseInt(volunteerProgress) >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                            {record.completed_volunteer_hours} / {record.volunteer_hours_required} 小时
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={volunteerProgress} className="flex-1" />
                          <span className={`text-sm font-semibold ${parseInt(volunteerProgress) >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                            {volunteerProgress}%
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">还需完成:</span>
                          <span className="text-xs font-medium text-blue-600">
                            {Math.max(0, record.volunteer_hours_required - record.completed_volunteer_hours).toFixed(1)} 小时
                          </span>
                        </div>
                      </div>

                      {/* 思想汇报 */}
                      <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-gray-800">思想汇报</span>
                          </div>
                          <span className={`font-bold ${reportStatus.completed >= reportStatus.total ? 'text-green-600' : 'text-purple-600'}`}>
                            {reportStatus.completed} / {reportStatus.total} 篇
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <Progress value={calculateProgress(reportStatus.total, reportStatus.completed)} className="flex-1" />
                          <span className={`text-sm font-semibold ${reportStatus.completed >= reportStatus.total ? 'text-green-600' : 'text-purple-600'}`}>
                            {calculateProgress(reportStatus.total, reportStatus.completed)}%
                          </span>
                        </div>
                        
                        {/* 月份展示 */}
                        <div className="flex flex-wrap gap-2">
                          {reportStatus.months.map((month, index) => <span key={index} className={`px-3 py-1 rounded-full text-xs font-medium ${month.submitted ? 'bg-green-100 text-green-700' : month.overdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                              {month.month}
                              {month.submitted ? ' ✓' : month.overdue ? ' ⚠' : ' ⏳'}
                            </span>)}
                        </div>
                        
                        {reportStatus.overdue > 0 && <div className="mt-2 flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">{reportStatus.overdue} 个月份未按时提交</span>
                          </div>}
                      </div>
                    </div>

                    {/* 总体进度 */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">总体完成度</span>
                        <span className={`text-lg font-bold ${parseInt(volunteerProgress) >= 100 && reportStatus.completed >= reportStatus.total ? 'text-green-600' : 'text-indigo-600'}`}>
                          {((parseInt(volunteerProgress) + calculateProgress(reportStatus.total, reportStatus.completed)) / 2).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={(parseInt(volunteerProgress) + calculateProgress(reportStatus.total, reportStatus.completed)) / 2} className="h-3" />
                      
                      {parseInt(volunteerProgress) >= 100 && reportStatus.completed >= reportStatus.total && <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-700">已满足撤销条件，可以申请撤销</span>
                        </div>}
                    </div>
                  </CardContent>
                </Card>;
        })}
          </div>}
      </div>

      <TabBar />
    </div>;
}