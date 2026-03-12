// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 格式化积分：整数显示整数，小数最多显示两位
const formatPoints = points => {
  if (points === undefined || points === null || isNaN(points)) return '0';
  const num = Number(points);
  const rounded = Math.round(num * 100) / 100;
  // 如果小数部分为0，显示整数；否则最多显示两位小数
  return rounded === Math.floor(rounded) ? String(Math.floor(rounded)) : rounded.toFixed(2);
};
export function GrowthChart({
  data
}) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">暂无成长数据</p>
      </div>;
  }

  // 计算统计数据
  const totalChanges = data.reduce((sum, record) => sum + record.score_change, 0);
  const positiveCount = data.filter(r => r.score_change > 0).length;
  const negativeCount = data.filter(r => r.score_change < 0).length;
  const avgScore = data.length > 0 ? totalChanges / data.length : 0;

  // 准备图表数据 - 累计积分变化
  let cumulativeScore = 0;
  const chartData = data.map(record => {
    cumulativeScore += record.score_change;
    return {
      date: new Date(record.date).toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      }),
      scoreChange: record.score_change,
      cumulativeScore: cumulativeScore,
      scoreType: record.score_change > 0 ? 'positive' : record.score_change < 0 ? 'negative' : 'neutral',
      reason: record.reason_detail
    };
  });

  // 按来源类型分组统计
  const typeStats = {};
  data.forEach(record => {
    const type = record.source_type || '其他';
    if (!typeStats[type]) {
      typeStats[type] = {
        count: 0,
        totalScore: 0
      };
    }
    typeStats[type].count++;
    typeStats[type].totalScore += record.score_change;
  });
  const typeChartData = Object.entries(typeStats).map(([type, stats]) => ({
    type,
    count: stats.count,
    avgScore: stats.count > 0 ? formatPoints(stats.totalScore / stats.count) : '0'
  }));
  return <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">总积分变化</p>
              <p className={`text-2xl font-bold ${totalChanges >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChanges >= 0 ? '+' : ''}{totalChanges}
              </p>
            </div>
            {totalChanges >= 0 ? <TrendingUp className="w-8 h-8 text-green-500" /> : <TrendingDown className="w-8 h-8 text-red-500" />}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">正向记录</p>
              <p className="text-2xl font-bold text-green-600">{positiveCount}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">负向记录</p>
              <p className="text-2xl font-bold text-orange-600">{negativeCount}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">平均变化</p>
              <p className={`text-2xl font-bold ${avgScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgScore >= 0 ? '+' : ''}{formatPoints(avgScore)}
              </p>
            </div>
            <Minus className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 积分变化曲线图 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">积分变化趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }} formatter={(value, name) => {
            if (name === 'scoreChange') {
              return [`${value >= 0 ? '+' : ''}${value} 分`, '本次变化'];
            }
            if (name === 'cumulativeScore') {
              return [`${value} 分`, '累计积分'];
            }
            return [value, name];
          }} />
            <Legend />
            <Line type="monotone" dataKey="scoreChange" stroke="#3b82f6" strokeWidth={2} name="单次变化" dot={{
            fill: '#3b82f6',
            strokeWidth: 2,
            r: 4
          }} />
            <Line type="monotone" dataKey="cumulativeScore" stroke="#10b981" strokeWidth={2} name="累计积分" dot={{
            fill: '#10b981',
            strokeWidth: 2,
            r: 4
          }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 来源类型分布图 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">记录来源分布</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={typeChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="type" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }} />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="记录次数" />
            <Bar dataKey="avgScore" fill="#10b981" name="平均得分" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 累计积分面积图 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">累计积分走势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }} formatter={value => [`${formatPoints(value)} 分`, '累计积分']} />
            <Area type="monotone" dataKey="cumulativeScore" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>;
}