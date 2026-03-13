// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
// @ts-ignore;
import { Progress } from '@/components/ui';

/**
 * 优化的统计卡片组件
 * @param {Object} props
 * @param {string} props.title - 卡片标题
 * @param {string|number} props.value - 显示数值
 * @param {string} [props.suffix] - 数值后缀
 * @param {React.ElementType} props.icon - 图标组件
 * @param {string} props.color - 颜色主题（red, green, blue, purple, amber）
 * @param {boolean} [props.highlight=false] - 是否高亮显示（用于重要卡片）
 * @param {boolean} [props.showProgress=false] - 是否显示进度条
 * @param {number} [props.progressValue] - 进度值（0-100）
 * @param {number} [props.progressTotal] - 进度总数
 * @param {string} [props.trend] - 趋势方向（up, down, stable）
 * @param {Function} [props.onClick] - 点击回调
 */
export function ProgressStatCard({
  title,
  value,
  suffix = '',
  icon: Icon,
  color,
  highlight = false,
  showProgress = false,
  progressValue = 0,
  progressTotal = 0,
  trend,
  onClick
}) {
  const colorClasses = {
    red: {
      bg: 'bg-red-500/10',
      iconBg: 'bg-red-500/20',
      text: 'text-red-600',
      icon: 'text-red-500',
      border: 'border-red-300',
      hover: 'hover:bg-red-50/50'
    },
    green: {
      bg: 'bg-green-500/10',
      iconBg: 'bg-green-500/20',
      text: 'text-green-600',
      icon: 'text-green-500',
      border: 'border-green-300',
      hover: 'hover:bg-green-50/50'
    },
    blue: {
      bg: 'bg-blue-500/10',
      iconBg: 'bg-blue-500/20',
      text: 'text-blue-600',
      icon: 'text-blue-500',
      border: 'border-blue-300',
      hover: 'hover:bg-blue-50/50'
    },
    purple: {
      bg: 'bg-purple-500/10',
      iconBg: 'bg-purple-500/20',
      text: 'text-purple-600',
      icon: 'text-purple-500',
      border: 'border-purple-300',
      hover: 'hover:bg-purple-50/50'
    },
    amber: {
      bg: 'bg-amber-500/10',
      iconBg: 'bg-amber-500/20',
      text: 'text-amber-600',
      icon: 'text-amber-500',
      border: 'border-amber-300',
      hover: 'hover:bg-amber-50/50'
    }
  };
  const theme = colorClasses[color] || colorClasses.blue;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400';
  return <div onClick={onClick} className={`relative bg-white rounded-xl shadow-sm p-5 cursor-pointer transition-all duration-200 ${highlight ? 'h-[140px]' : 'h-[120px]'} ${highlight ? theme.border + ' border-2' : 'border border-gray-200'} ${theme.hover} hover:shadow-md overflow-hidden`}>
      {/* 右上角箭头图标 */}
      <div className="absolute top-4 right-4 text-gray-400">
        <ChevronRight className="w-5 h-5" />
      </div>

      {/* 图标圆形背景 */}
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${theme.iconBg} mb-3`}>
        <Icon className={`w-5 h-5 ${theme.icon}`} />
      </div>

      {/* 标题 */}
      <p className="text-sm text-gray-600 mb-2">{title}</p>

      {/* 数值 */}
      {showProgress ? <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold ${highlight ? 'text-red-600' : theme.text}`}>
              {progressValue}/{progressTotal}{suffix}
            </span>
          </div>
          {/* 进度条 */}
          <Progress value={progressValue / progressTotal * 100} className="h-2" />
        </div> : <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${highlight ? 'text-red-600' : theme.text}`}>
            {value}{suffix}
          </span>
          {trend && <TrendIcon className={`w-4 h-4 ${trendColor}`} />}
        </div>}
    </div>;
}