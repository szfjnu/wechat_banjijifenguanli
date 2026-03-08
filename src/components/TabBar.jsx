// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, Users, TrendingUp, UsersRound, LayoutGrid, ChevronUp, ChevronDown } from 'lucide-react';

// 底部主导航项定义
const NAV_ITEMS = [{
  id: 'home',
  label: '首页',
  icon: Home,
  pageId: 'home'
}, {
  id: 'student',
  label: '学生管理',
  icon: Users,
  pageId: 'students'
}, {
  id: 'points',
  label: '积分管理',
  icon: TrendingUp,
  pageId: 'points'
}, {
  id: 'class',
  label: '班级事务',
  icon: UsersRound,
  pageId: 'seating-chart'
}, {
  id: 'comprehensive',
  label: '综合管理',
  icon: LayoutGrid,
  pageId: 'exam-monitor'
}];

/**
 * TabBar 组件 - 底部导航栏
 * 
 * 功能：
 * - 固定在页面底部
 * - 3-5个主导航项，横向等宽分布
 * - 图标在上（24×24px），文字在下（12px）
 * - 未选中状态：颜色 #333
 * - 选中状态：颜色 #1aad19，图标和文字高亮，底部小圆点
 * - 点击切换页面
 * - 适配不同屏幕尺寸，底部安全区
 */
export function TabBar({
  currentPage,
  onPageChange
}) {
  // 处理页面切换
  const handlePageChange = pageId => {
    console.log('[TabBar] 切换到页面:', pageId);

    // 验证页面 ID 是否有效
    const validPageIds = ['home', 'students', 'points', 'seating-chart', 'exam-monitor'];
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
  return <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      {/* 底部安全区 - 适配 iPhone X 等设备 */}
      <div className="pb-safe">
        <div className="flex justify-around items-center h-[60px] max-w-7xl mx-auto px-2">
          {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.pageId || currentPage !== 'home' && item.id === 'student' && ['students', 'students-manage', 'student-growth', 'parent-view', 'grades', 'certificates', 'volunteer'].includes(currentPage) || item.id === 'points' && ['points', 'dorm-points', 'exchange', 'points-manage', 'exchange-admin', 'points-settings'].includes(currentPage) || item.id === 'class' && ['seating-chart', 'groups', 'duty-roster', 'subjects', 'semester', 'schedule-manage'].includes(currentPage) || item.id === 'comprehensive' && ['exam-monitor', 'ai-review', 'documents', 'discipline', 'notice-publish'].includes(currentPage);
          return <button key={item.id} onClick={() => handlePageChange(item.pageId)} className={`flex flex-col items-center justify-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 relative group ${isActive ? 'scale-105' : 'hover:scale-105'}`}>
                  {/* 图标 */}
                  <Icon className={`w-6 h-6 transition-all duration-200 ${isActive ? 'text-[#1aad19]' : 'text-[#333333]'}`} strokeWidth={2} />

                  {/* 文字 */}
                  <span className={`text-[12px] font-medium transition-all duration-200 ${isActive ? 'text-[#1aad19] font-semibold' : 'text-[#333333]'}`}>
                    {item.label}
                  </span>

                  {/* 选中状态 - 底部小圆点 */}
                  {isActive && <div className="absolute bottom-1 w-1 h-1 bg-[#1aad19] rounded-full animate-pulse" />}
                </button>;
        })}
        </div>

        {/* 底部安全区域样式 */}
        <style>{`
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
        `}</style>
      </div>
    </nav>;
}
export default TabBar;