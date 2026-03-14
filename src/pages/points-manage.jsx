// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Settings2, Target, Home, ShoppingBag, Bed, TrendingUp, ChevronRight, Plus, TrendingDown, Users, Award, BookOpen, Star } from 'lucide-react';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
import { usePermission, ConditionalRender } from '@/components/PermissionGuard';
export default function PointsManage({
  $w,
  className,
  style
}) {
  const [currentPage, setCurrentPage] = useState('points-manage');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };

  // 权限检查
  const {
    permission: canViewPointsSettings,
    loading: loadingPointsSettings
  } = usePermission($w, 'points_settings', 'view');
  const {
    permission: canViewDormPoints,
    loading: loadingDormPoints
  } = usePermission($w, 'dorm_points', 'view');
  const {
    permission: canViewExchangeAdmin,
    loading: loadingExchangeAdmin
  } = usePermission($w, 'exchange_admin', 'view');
  const {
    permission: canViewPoints,
    loading: loadingPoints
  } = usePermission($w, 'points', 'view');
  const stats = {
    totalProjects: 10,
    totalStudents: 35,
    totalItems: 6,
    totalExchanges: 45,
    avgPoints: 72.5
  };
  const menuItems = [{
    id: 'points-settings',
    title: '积分项目设置',
    description: '管理日常积分项目及其规则',
    icon: Target,
    color: 'blue',
    stats: {
      label: '项目总数',
      value: stats.totalProjects,
      suffix: '个'
    },
    actions: [{
      label: '添加项目',
      icon: Plus
    }, {
      label: '编辑规则',
      icon: Settings2
    }]
  }, {
    id: 'dorm-points',
    title: '宿舍积分管理',
    description: '管理住宿生宿舍积分与折算',
    icon: Bed,
    color: 'amber',
    stats: {
      label: '住宿学生',
      value: stats.totalStudents,
      suffix: '人'
    },
    actions: [{
      label: '宿舍扣分',
      icon: TrendingDown
    }, {
      label: '积分预警',
      icon: Settings2
    }]
  }, {
    id: 'exchange-admin',
    title: '积分商城管理',
    description: '管理可兑换物品及兑换记录',
    icon: ShoppingBag,
    color: 'purple',
    stats: {
      label: '兑换物品',
      value: stats.totalItems,
      suffix: '个'
    },
    actions: [{
      label: '添加物品',
      icon: Plus
    }, {
      label: '兑换记录',
      icon: BookOpen
    }]
  }, {
    id: 'points',
    title: '日常积分记录',
    description: '查看和管理学生日常积分',
    icon: TrendingUp,
    color: 'green',
    stats: {
      label: '平均积分',
      value: stats.avgPoints,
      suffix: '分'
    },
    actions: [{
      label: '积分统计',
      icon: Star
    }, {
      label: '积分榜单',
      icon: Award
    }]
  }];
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    amber: {
      bg: 'from-amber-500 to-amber-600',
      light: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    }
  };
  return <div className="min-h-screen bg-gray-50 pb-16" style={style}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-700 px-6 py-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Settings2 className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1" style={{
              fontFamily: 'Noto Serif SC, serif'
            }}>积分管理</h1>
              <p className="text-slate-300 text-sm">积分设置与管理中心</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatCard title="积分项目" value={stats.totalProjects} icon={Target} color="blue" />
          <StatCard title="住宿学生" value={stats.totalStudents} icon={Bed} color="amber" />
          <StatCard title="兑换物品" value={stats.totalItems} icon={ShoppingBag} color="purple" />
          <StatCard title="平均积分" value={stats.avgPoints} icon={TrendingUp} color="green" />
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 px-1">功能入口</h2>
          {menuItems.map((item, index) => {
          const colors = colorClasses[item.color];
          const Icon = item.icon;

          // 权限检查
          let hasPermission = false;
          if (item.id === 'points-settings') {
            hasPermission = canViewPointsSettings && !loadingPointsSettings;
          } else if (item.id === 'dorm-points') {
            hasPermission = canViewDormPoints && !loadingDormPoints;
          } else if (item.id === 'exchange-admin') {
            hasPermission = canViewExchangeAdmin && !loadingExchangeAdmin;
          } else if (item.id === 'points') {
            hasPermission = canViewPoints && !loadingPoints;
          }

          // 如果没有权限，不显示该菜单项
          if (!hasPermission) return null;
          return <div key={item.id} onClick={() => $w.utils.navigateTo({
            pageId: item.id,
            params: {}
          })} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
                      </div>
                      
                      {/* Stats Bar */}
                      <div className={`mt-4 p-3 rounded-lg ${colors.light} ${colors.border} border`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${colors.text}`}>{item.stats.label}</span>
                          <span className="text-2xl font-bold text-gray-800">{item.stats.value}<span className="text-sm font-normal text-gray-600 ml-1">{item.stats.suffix}</span></span>
                        </div>
                      </div>
                      
                      {/* Action Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.actions.map((action, actionIndex) => <span key={actionIndex} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${colors.light} ${colors.text} ${colors.border} border`}>
                            <action.icon className="w-3.5 h-3.5" />
                            {action.label}
                          </span>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>;
        })}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">积分管理提示</h3>
              <ul className="space-y-1 text-white/90 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-white/50">•</span>
                  积分项目设置可以自定义加分/扣分规则和适用范围
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/50">•</span>
                  宿舍积分自动折算到日常积分，可配置折算比例
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/50">•</span>
                  积分商城支持直接兑换和投标两种模式
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}