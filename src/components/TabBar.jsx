// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Home, Users, Trophy, Calendar, Settings } from 'lucide-react';

// @ts-ignore
export function TabBar({
  currentPage,
  onPageChange
}) {
  const {
    toast
  } = useToast();
  const [activeCategory, setActiveCategory] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // 定义导航分类
  const categories = [{
    id: 'home',
    label: '首页',
    icon: Home,
    pageId: 'home',
    subItems: []
  }, {
    id: 'students',
    label: '学生管理',
    icon: Users,
    subItems: [{
      label: '学生列表',
      pageId: 'students',
      icon: Users
    }, {
      label: '学生详情',
      pageId: 'students-manage',
      icon: Users
    }, {
      label: '学生成长',
      pageId: 'student-growth',
      icon: Users
    }, {
      label: '家长视图',
      pageId: 'parent-view',
      icon: Users
    }]
  }, {
    id: 'points',
    label: '积分管理',
    icon: Trophy,
    subItems: [{
      label: '积分概览',
      pageId: 'points',
      icon: Trophy
    }, {
      label: '宿舍积分',
      pageId: 'dorm-points',
      icon: Trophy
    }, {
      label: '积分兑换',
      pageId: 'exchange',
      icon: Trophy
    }, {
      label: '兑换管理',
      pageId: 'exchange-admin',
      icon: Trophy
    }, {
      label: '积分管理',
      pageId: 'points-manage',
      icon: Trophy
    }, {
      label: '积分设置',
      pageId: 'points-settings',
      icon: Trophy
    }, {
      label: '证书管理',
      pageId: 'certificates',
      icon: Trophy
    }, {
      label: '纪律记录',
      pageId: 'discipline',
      icon: Trophy
    }, {
      label: '成绩管理',
      pageId: 'grades',
      icon: Trophy
    }, {
      label: '志愿服务',
      pageId: 'volunteer',
      icon: Trophy
    }, {
      label: '撤销申请',
      pageId: 'discipline-revocation',
      icon: Trophy
    }, {
      label: '考察进度',
      pageId: 'discipline-progress',
      icon: Trophy
    }, {
      label: '思想汇报',
      pageId: 'thought-report',
      icon: Trophy
    }, {
      label: '撤销志愿服务',
      pageId: 'revocation-volunteer',
      icon: Trophy
    }]
  }, {
    id: 'class',
    label: '班级事务',
    icon: Calendar,
    subItems: [{
      label: '分组管理',
      pageId: 'groups',
      icon: Calendar
    }, {
      label: '座位安排',
      pageId: 'seating-chart',
      icon: Calendar
    }, {
      label: '课程管理',
      pageId: 'schedule-manage',
      icon: Calendar
    }, {
      label: '值班表',
      pageId: 'duty-roster',
      icon: Calendar
    }, {
      label: '科目设置',
      pageId: 'subjects',
      icon: Calendar
    }, {
      label: '文件管理',
      pageId: 'documents',
      icon: Calendar
    }, {
      label: 'AI 评语',
      pageId: 'ai-review',
      icon: Calendar
    }, {
      label: '学期管理',
      pageId: 'semester',
      icon: Calendar
    }]
  }, {
    id: 'settings',
    label: '综合管理',
    icon: Settings,
    subItems: [{
      label: '考试监控',
      pageId: 'exam-monitor',
      icon: Settings
    }, {
      label: '通知发布',
      pageId: 'notice-publish',
      icon: Settings
    }]
  }];

  // 判断当前页面属于哪个分类
  const getCurrentCategory = () => {
    if (!currentPage) return 'home';

    // 首页
    if (currentPage === 'home') return 'home';

    // 学生管理相关页面
    if (['students', 'students-manage', 'student-growth', 'parent-view'].includes(currentPage)) {
      return 'students';
    }

    // 积分管理相关页面
    if (['points', 'dorm-points', 'exchange', 'exchange-admin', 'points-manage', 'points-settings', 'certificates', 'discipline', 'grades', 'volunteer'].includes(currentPage)) {
      return 'points';
    }

    // 班级事务相关页面
    if (['groups', 'seating-chart', 'schedule-manage', 'duty-roster', 'subjects', 'documents', 'ai-review', 'semester'].includes(currentPage)) {
      return 'class';
    }

    // 综合管理相关页面
    if (['exam-monitor', 'notice-publish'].includes(currentPage)) {
      return 'settings';
    }
    return 'home';
  };
  const currentCategory = getCurrentCategory();
  const handleNavClick = category => {
    setActiveCategory(category.id);

    // 如果是首页，直接跳转
    if (category.id === 'home') {
      setIsPanelOpen(false);
      onPageChange('home');
      return;
    }

    // 其他分类，打开弹出面板
    setIsPanelOpen(true);
  };
  const handleSubItemClick = subItem => {
    setIsPanelOpen(false);
    setActiveCategory(null);
    onPageChange(subItem.pageId);
  };
  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setActiveCategory(null);
  };
  return <>
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around items-center h-[60px]">
            {categories.map(category => {
            const Icon = category.icon;
            const isActive = currentCategory === category.id;
            return <button key={category.id} onClick={() => handleNavClick(category)} className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200
                    ${isActive ? 'scale-105' : 'scale-100'}`}>
                  <Icon className={`w-6 h-6 mb-1 transition-colors duration-200
                      ${isActive ? 'text-[#1aad19]' : 'text-[#333333]'}`} />
                  <span className={`text-[12px] transition-all duration-200
                    ${isActive ? 'text-[#1aad19] font-medium' : 'text-[#333333]'}`}>
                    {category.label}
                  </span>
                  {/* 选中状态的小圆点 */}
                  {isActive && <div className="w-1 h-1 bg-[#1aad19] rounded-full mt-1" />}
                </button>;
          })}
          </div>
        </div>
      </div>

      {/* 弹出面板 - 半屏遮罩 */}
      {isPanelOpen && <>
          {/* 遮罩层 */}
          <div className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" onClick={handlePanelClose} />
          
          {/* 弹出面板 - 从底部滑入 */}
          <div className="fixed bottom-[60px] left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-4">
            <div className="max-w-7xl mx-auto">
              {/* 顶部把手 */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
              
              {/* 分类标题 */}
              <div className="px-6 py-3 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {categories.find(c => c.id === activeCategory)?.label}
                </h3>
              </div>
              
              {/* 二级入口列表 - 网格布局 */}
              <div className="px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {activeCategory && categories.find(c => c.id === activeCategory)?.subItems.map((subItem, index) => {
                const Icon = subItem.icon;
                return <button key={subItem.pageId} onClick={() => handleSubItemClick(subItem)} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl
                          hover:bg-gray-100 transition-colors duration-200
                          animate-in fade-in" style={{
                  animationDelay: `${index * 50}ms`
                }}>
                        <Icon className="w-8 h-8 text-gray-700 mb-2" />
                        <span className="text-sm text-gray-700 font-medium text-center">
                          {subItem.label}
                        </span>
                      </button>;
              })}
                </div>
              </div>
              
              {/* 底部安全区 */}
              <div className="pb-safe" />
            </div>
          </div>
        </>}
    </>;
}
export default TabBar;