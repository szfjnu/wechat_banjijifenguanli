// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Home, Users, TrendingUp, Gift, ShieldAlert, Award, BookOpen, UsersRound, Grid3X3, Heart, FileText, Brain, CalendarDays, GraduationCap, CalendarCheck, Calculator, ChevronUp, ChevronDown, Bed, Star, Settings, LayoutGrid, Grid2x2 } from 'lucide-react';

// 分类定义 - 按功能归类
const CATEGORIES = [{
  id: 'student',
  label: '学生管理',
  icon: Users,
  color: 'blue',
  items: [{
    id: 'students',
    label: '学生档案',
    icon: Users
  }, {
    id: 'grades',
    label: '成绩管理',
    icon: BookOpen
  }, {
    id: 'certificates',
    label: '证书管理',
    icon: Award
  }, {
    id: 'volunteer',
    label: '志愿时长',
    icon: Heart
  }]
}, {
  id: 'points',
  label: '积分管理',
  icon: TrendingUp,
  color: 'green',
  items: [{
    id: 'points',
    label: '积分规则',
    icon: TrendingUp
  }, {
    id: 'dorm-points',
    label: '宿舍积分',
    icon: Bed
  }, {
    id: 'exchange',
    label: '积分兑换',
    icon: Gift
  }, {
    id: 'points-manage',
    label: '积分管理',
    icon: Settings
  }, {
    id: 'exchange-admin',
    label: '兑换管理',
    icon: Star
  }, {
    id: 'points-settings',
    label: '积分设置',
    icon: Calculator
  }]
}, {
  id: 'class',
  label: '班级事务',
  icon: UsersRound,
  color: 'purple',
  items: [{
    id: 'seating-chart',
    label: '座位安排',
    icon: Grid3X3
  }, {
    id: 'groups',
    label: '分组管理',
    icon: UsersRound
  }, {
    id: 'duty-roster',
    label: '值日安排',
    icon: CalendarCheck
  }, {
    id: 'subjects',
    label: '科目设置',
    icon: Calculator
  }, {
    id: 'semester',
    label: '学期计划',
    icon: CalendarDays
  }]
}, {
  id: 'comprehensive',
  label: '综合管理',
  icon: LayoutGrid,
  color: 'orange',
  items: [{
    id: 'exam-monitor',
    label: '转段考',
    icon: GraduationCap
  }, {
    id: 'ai-review',
    label: 'AI点评',
    icon: Brain
  }, {
    id: 'documents',
    label: '文件资料',
    icon: FileText
  }, {
    id: 'discipline',
    label: '违纪记录',
    icon: ShieldAlert
  }]
}];

// 获取颜色样式
const getColorStyles = (color, isActive) => {
  const colorMap = {
    blue: {
      active: 'bg-blue-500 text-white',
      inactive: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50',
      bg: 'bg-white border border-gray-200',
      hex: '#3b82f6'
    },
    green: {
      active: 'bg-green-500 text-white',
      inactive: 'text-gray-600 hover:text-green-600 hover:bg-green-50',
      bg: 'bg-white border border-gray-200',
      hex: '#22c55e'
    },
    purple: {
      active: 'bg-purple-500 text-white',
      inactive: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50',
      bg: 'bg-white border border-gray-200',
      hex: '#a855f7'
    },
    orange: {
      active: 'bg-orange-500 text-white',
      inactive: 'text-gray-600 hover:text-orange-600 hover:bg-orange-50',
      bg: 'bg-white border border-gray-200',
      hex: '#f97316'
    }
  };
  return colorMap[color] || colorMap.blue;
};

/**
 * TabBar 组件 - 底部导航栏（横向布局）
 *
 * 功能：
 * - 首页快速入口
 * - 分类导航（学生管理、积分管理、班级事务、综合管理）
 * - 横向排列的主导航按钮
 * - 点击展开下拉子菜单
 * - 页面切换
 */
export function TabBar({
  currentPage,
  onPageChange
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // 判断当前页面属于哪个分类
  useEffect(() => {
    let found = false;
    for (const category of CATEGORIES) {
      if (category.items && category.items.some(item => item.id === currentPage)) {
        setActiveCategory(category.id);
        found = true;
        break;
      }
    }
    if (!found) {
      setActiveCategory(null);
    }
  }, [currentPage]);

  // 处理页面切换
  const handlePageChange = pageId => {
    console.log('[TabBar] 切换到页面:', pageId);
    setExpandedCategory(null);

    // 验证页面 ID 是否有效
    const validPageIds = ['home',
    // 学生管理
    'students', 'grades', 'certificates', 'volunteer',
    // 积分管理
    'points', 'dorm-points', 'exchange', 'points-manage', 'exchange-admin', 'points-settings',
    // 班级事务
    'seating-chart', 'groups', 'duty-roster', 'subjects', 'semester',
    // 综合管理
    'exam-monitor', 'ai-review', 'documents', 'discipline'];
    if (!validPageIds.includes(pageId)) {
      console.error('[TabBar] 无效的页面 ID:', pageId, '有效页面列表:', validPageIds);
      return;
    }
    if (onPageChange && typeof onPageChange === 'function') {
      try {
        onPageChange(pageId);
        console.log('[TabBar] 页面切换成功:', pageId);
      } catch (error) {
        console.error('[TabBar] 页面切换失败:', error);
      }
    } else {
      console.error('[TabBar] onPageChange 函数未定义或不是函数');
    }
  };

  // 切换分类展开状态
  const toggleCategory = categoryId => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  // 点击外部关闭展开的分类
  useEffect(() => {
    const handleClickOutside = () => {
      setExpandedCategory(null);
    };
    if (expandedCategory) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [expandedCategory]);
  return <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1.5 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* 底部主导航 - 横向排列 */}
        <div className="flex justify-between items-center gap-1">
          {/* 首页按钮 */}
          <button onClick={() => handlePageChange('home')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs ${currentPage === 'home' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}>
            <Home className="w-4 h-4" strokeWidth={2.5} />
            <span className="font-medium">首页</span>
          </button>

          {/* 分类按钮 - 横向排列 */}
          {CATEGORIES.map(category => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;
          const isActive = activeCategory === category.id;
          const styles = getColorStyles(category.color, isActive);
          return <div key={category.id} className="relative" onClick={e => e.stopPropagation()}>
                <button onClick={e => {
              e.stopPropagation();
              if (category.items && category.items.length > 0) {
                toggleCategory(category.id);
              } else {
                handlePageChange(category.id);
              }
            }} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200 text-xs ${isActive && !isExpanded ? styles.active : styles.inactive}`}>
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  <span className="font-medium">{category.label}</span>
                  {isActive && !isExpanded && <span className="ml-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                </button>

                {/* 展开的子菜单 */}
                {isExpanded && <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                    bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden 
                    min-w-[280px] animate-in slide-in-from-bottom-2 duration-200 z-[100]
                  `}>
                    <div className="p-2">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <Icon className="w-4 h-4" style={{
                    color: styles.hex
                  }} />
                        <span className="text-xs font-semibold text-gray-700">{category.label}</span>
                        <span className="ml-auto text-[10px] text-gray-400">{category.items.length} 项</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {category.items && category.items.map(item => {
                    const ItemIcon = item.icon;
                    const isItemActive = currentPage === item.id;
                    const itemStyles = getColorStyles(category.color, isItemActive);
                    return <button key={item.id} onClick={e => {
                      e.stopPropagation();
                      handlePageChange(item.id);
                    }} className={`flex items-center gap-1.5 p-2 rounded-lg transition-all duration-200 text-xs ${isItemActive ? itemStyles.active : 'text-gray-600 hover:bg-gray-50'}`}>
                              <ItemIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                              <span className="font-medium">{item.label}</span>
                            </button>;
                  })}
                      </div>
                    </div>
                    {/* 三角形箭头 */}
                    <div className={`absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 
                      w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45 z-[-1]
                    `}>
                    </div>
                  </div>}
              </div>;
        })}
        </div>
      </div>
    </nav>;
}