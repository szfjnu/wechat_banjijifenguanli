// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Calendar, TrendingUp, TrendingDown, Award, AlertTriangle, Activity } from 'lucide-react';
// @ts-ignore;
import { Badge } from '@/components/ui';

// 格式化积分：整数显示整数，小数最多显示两位
const formatPoints = points => {
  if (points === undefined || points === null || isNaN(points)) return '0';
  const num = Number(points);
  const rounded = Math.round(num * 100) / 100;
  // 如果小数部分为0，显示整数；否则最多显示两位小数
  return rounded === Math.floor(rounded) ? String(Math.floor(rounded)) : rounded.toFixed(2);
};
export function GrowthTimeline({
  records
}) {
  if (!records || records.length === 0) {
    return <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
        <Activity className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">暂无成长记录</p>
        <p className="text-gray-400 text-sm mt-2">该学生还没有任何积分变动记录</p>
      </div>;
  }

  // 按日期排序（最新的在前）
  const sortedRecords = [...records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 按日期分组
  const groupedRecords = sortedRecords.reduce((groups, record) => {
    const date = new Date(record.created_at).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});
  const getScoreColor = change => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  const getScoreIcon = change => {
    if (change > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Activity className="w-5 h-5 text-gray-500" />;
  };
  const getSourceBadge = sourceType => {
    const colors = {
      '日常记录': 'bg-blue-100 text-blue-700',
      '志愿服务': 'bg-green-100 text-green-700',
      '竞赛获奖': 'bg-purple-100 text-purple-700',
      '违纪处分': 'bg-red-100 text-red-700',
      '表现优秀': 'bg-yellow-100 text-yellow-700'
    };
    const color = colors[sourceType] || 'bg-gray-100 text-gray-700';
    return <Badge className={color}>{sourceType || '其他'}</Badge>;
  };
  return <div className="space-y-6">
      {Object.entries(groupedRecords).map(([date, dayRecords]) => <div key={date}>
          {/* 日期标题 */}
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">{date}</h3>
            <span className="ml-auto text-sm text-gray-500">{dayRecords.length} 条记录</span>
          </div>

          {/* 当日记录列表 */}
          <div className="space-y-3">
            {dayRecords.map(record => <div key={record._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  {/* 左侧：主要信息 */}
                  <div className="flex items-start flex-1">
                    <div className={`mt-1 mr-3`}>
                      {getScoreIcon(record.score_change)}
                    </div>
                    <div className="flex-1">
                      {/* 记录标题 */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{record.reason_detail}</h4>
                        {getSourceBadge(record.source_type)}
                      </div>

                      {/* 详细信息 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <span className="text-gray-400 mr-1">记录人:</span>
                          <span className="font-medium">{record.recorder_name || '未知'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="text-gray-400 mr-1">记录时间:</span>
                          <span className="font-medium">
                            {new Date(record.created_at).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="text-gray-400 mr-1">审核状态:</span>
                          <span className={`font-medium ${record.approval_status === '已通过' ? 'text-green-600' : record.approval_status === '已拒绝' ? 'text-red-600' : 'text-orange-600'}`}>
                            {record.approval_status || '待审核'}
                          </span>
                        </div>
                      </div>

                      {/* 审核信息 */}
                      {record.approval_status === '已通过' && <div className="mt-3 p-2 bg-green-50 rounded border border-green-100 text-sm">
                          <span className="text-green-700">
                            审核人: {record.approver_name} | 
                            审核时间: {new Date(record.approval_time).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                          </span>
                          {record.approval_comment && <div className="mt-1 text-green-600">
                              审核: {record.approval_comment}
                            </div>}
                        </div>}

                      {record.approval_status === '已拒绝' && <div className="mt-3 p-2 bg-red-50 rounded border border-red-100 text-sm">
                          <span className="text-red-700">
                            审核人: {record.approver_name}
                          </span>
                          {record.approval_comment && <div className="mt-1 text-red-600">
                              拒绝原因: {record.approval_comment}
                            </div>}
                        </div>}
                    </div>
                  </div>

                  {/* 右侧：积分变化 */}
                  <div className="ml-4 flex flex-col items-end">
                    <div className={`text-2xl font-bold ${getScoreColor(record.score_change)}`}>
                      {record.score_change >= 0 ? '+' : ''}{formatPoints(record.score_change)}
                    </div>
                    <div className="text-sm text-gray-500">积分</div>
                  </div>
                </div>
              </div>)}
          </div>
        </div>)}
    </div>;
}