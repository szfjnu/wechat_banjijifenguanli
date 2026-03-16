// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { TrendingUp, TrendingDown } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * PointsChart 组件 - 支持两种数据格式
 * 格式1: 成长曲线 - [{ date, score }]
 * 格式2: 排行榜 - [{ name, score, className, studentId }]
 */
export function PointsChart({
  data,
  height = 250
}) {
  if (!data || data.length === 0) {
    return <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">暂无数据</p>
      </div>;
  }

  // 检测数据格式：如果有 'name' 字段则是排行榜，否则是成长曲线
  const isRanking = data[0].hasOwnProperty('name') && !data[0].hasOwnProperty('date');
  const isGrowth = data[0].hasOwnProperty('date');
  const CustomTooltip = ({
    active,
    payload,
    label
  }) => {
    if (active && payload && payload.length) {
      return <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          {payload.map((entry, index) => <p key={index} className="text-sm font-medium" style={{
          color: entry.color
        }}>
              {entry.name}: {entry.value}
            </p>)}
        </div>;
    }
    return null;
  };

  // 排行榜视图
  if (isRanking) {
    return <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0
        }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="name" tick={{
            fontSize: 12,
            fill: '#6B7280'
          }} axisLine={{
            stroke: '#E5E7EB'
          }} />
            <YAxis tick={{
            fontSize: 12,
            fill: '#6B7280'
          }} axisLine={{
            stroke: '#E5E7EB'
          }} tickLine={{
            stroke: '#E5E7EB'
          }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{
            fontSize: 12
          }} iconType="circle" />
            <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} name="积分" />
          </BarChart>
        </ResponsiveContainer>
      </div>;
  }

  // 成长曲线视图（带多系列）
  if (isGrowth) {
    return <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0
        }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="date" tick={{
            fontSize: 12,
            fill: '#6B7280'
          }} axisLine={{
            stroke: '#E5E7EB'
          }} />
            <YAxis tick={{
            fontSize: 12,
            fill: '#6B7280'
          }} axisLine={{
            stroke: '#E5E7EB'
          }} tickLine={{
            stroke: '#E5E7EB'
          }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{
            fontSize: 12
          }} iconType="circle" />
            <Bar dataKey="points" fill="#3B82F6" radius={[4, 4, 0, 0]} name="积分" />
            <Bar dataKey="daily" fill="#10B981" radius={[4, 4, 0, 0]} name="日常积分" />
            <Bar dataKey="dorm" fill="#F59E0B" radius={[4, 4, 0, 0]} name="宿舍积分" />
          </BarChart>
        </ResponsiveContainer>
      </div>;
  }

  // 默认视图（多系列）
  return <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0
      }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="name" tick={{
          fontSize: 12,
          fill: '#6B7280'
        }} axisLine={{
          stroke: '#E5E7EB'
        }} />
          <YAxis tick={{
          fontSize: 12,
          fill: '#6B7280'
        }} axisLine={{
          stroke: '#E5E7EB'
        }} tickLine={{
          stroke: '#E5E7EB'
        }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{
          fontSize: 12
        }} iconType="circle" />
          <Bar dataKey="points" fill="#3B82F6" radius={[4, 4, 0, 0]} name="积分" />
          <Bar dataKey="daily" fill="#10B981" radius={[4, 4, 0, 0]} name="日常积分" />
          <Bar dataKey="dorm" fill="#F59E0B" radius={[4, 4, 0, 0]} name="宿舍积分" />
        </BarChart>
      </ResponsiveContainer>
    </div>;
}
export default PointsChart;