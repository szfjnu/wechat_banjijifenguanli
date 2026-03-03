// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Calendar, Users, TrendingUp, AlertCircle, Sun, CloudRain, CloudSnow, Wind, Clock, Star, ChevronRight, Trophy, Plus, Bell, Cloud, CloudLightning, Snowflake, CalendarDays, Calculator } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { StatCard } from '@/components/StatCard';
import { PointsChart } from '@/components/PointsChart';
export default function Home(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [students, setStudents] = useState([]);
  const [pointsData, setPointsData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    loadDashboardData();
    loadWeatherData();
  }, []);
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 模拟数据加载（后续替换为真实数据源调用）
      await new Promise(resolve => setTimeout(resolve, 500));

      // 模拟学生数据
      setStudents([{
        id: 1,
        name: '张三',
        group: '第一组',
        totalPoints: 156,
        rank: 1,
        avatar: null
      }, {
        id: 2,
        name: '李四',
        group: '第二组',
        totalPoints: 148,
        rank: 2,
        avatar: null
      }, {
        id: 3,
        name: '王五',
        group: '第一组',
        totalPoints: 142,
        rank: 3,
        avatar: null
      }, {
        id: 4,
        name: '赵六',
        group: '第三组',
        totalPoints: 135,
        rank: 4,
        avatar: null
      }, {
        id: 5,
        name: '孙七',
        group: '第二组',
        totalPoints: 130,
        rank: 5,
        avatar: null
      }]);

      // 模拟积分数据
      setPointsData([{
        name: '张三',
        points: 156,
        daily: 85,
        dorm: 71
      }, {
        name: '李四',
        points: 148,
        daily: 78,
        dorm: 70
      }, {
        name: '王五',
        points: 142,
        daily: 82,
        dorm: 60
      }, {
        name: '赵六',
        points: 135,
        daily: 65,
        dorm: 70
      }, {
        name: '孙七',
        points: 130,
        daily: 60,
        dorm: 70
      }]);

      // 模拟今日任务
      setTasks([{
        id: 1,
        type: 'value',
        title: '教室值日',
        group: '第一组',
        status: 'pending',
        time: '16:00'
      }, {
        id: 2,
        type: 'dorm',
        title: '宿舍检查',
        group: '第二组',
        status: 'completed',
        time: '17:00'
      }, {
        id: 3,
        type: 'activity',
        title: '志愿活动',
        group: '第三组',
        status: 'pending',
        time: '18:00'
      }]);

      // 模拟今日生日
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      // 检查是否有学生生日（仅作演示）
      if (month === 3 && day === 2) {
        setTodayBirthdays([{
          id: 2,
          name: '李四',
          group: '第二组',
          avatar: null
        }]);
      }

      // 模拟通知
      setNotifications([{
        id: 1,
        title: '积分兑换提醒',
        message: '投标将于今日截止',
        type: 'warning',
        time: '10:00'
      }, {
        id: 2,
        title: '宿舍检查',
        message: '本周宿舍检查已安排',
        type: 'info',
        time: '09:00'
      }]);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载数据失败',
        description: error.message || '无法获取仪表盘数据，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const loadWeatherData = async () => {
    try {
      // 模拟天气数据（后续替换为真实天气API）
      await new Promise(resolve => setTimeout(resolve, 300));
      setWeather({
        condition: 'sunny',
        temperature: 23,
        description: '晴朗',
        humidity: 65,
        wind: '东北风 3级',
        advice: '天气晴朗，适合户外活动'
      });
    } catch (error) {
      console.error('加载天气失败:', error);
    }
  };
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    setTimeout(() => {
      $w.utils.navigateTo({
        pageId,
        params: {}
      });
    }, 100);
  };
  const handleAddPoints = () => {
    $w.utils.navigateTo({
      pageId: 'points',
      params: {
        action: 'add'
      }
    });
  };
  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-6 h-6 text-gray-400" />;
    switch (weather.condition) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-amber-500" />;
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'snowy':
        return <CloudSnow className="w-6 h-6 text-blue-300" />;
      case 'windy':
        return <Wind className="w-6 h-6 text-gray-500" />;
      case 'stormy':
        return <CloudLightning className="w-6 h-6 text-purple-600" />;
      default:
        return <Cloud className="w-6 h-6 text-gray-400" />;
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header - Fixed Position for WeChat Style */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold">班级积分管理</h1>
            <p className="text-blue-100 text-xs mt-0.5">欢迎回来，{$w.auth.currentUser?.name || '老师'}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-blue-400 p-1" onClick={() => $w.utils.navigateTo({
          pageId: 'students',
          params: {}
        })}>
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {/* Weather Card - Compact */}
        {weather && <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getWeatherIcon()}
                <div>
                  <p className="text-base font-bold">{weather.temperature}°C</p>
                  <p className="text-xs text-blue-100">{weather.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100">{weather.humidity}% 湿度</p>
                <p className="text-xs text-blue-100">{weather.wind}</p>
              </div>
            </div>
            <p className="text-xs text-blue-200 mt-1.5">{weather.advice}</p>
          </div>}
      </header>

      {/* Content Area - Compact Spacing */}
      <div className="px-3 py-3 space-y-3">
        {/* Today's Tasks & Birthdays - Compact Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Tasks Card */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-gray-900 text-sm">今日任务</h3>
            </div>
            <div className="space-y-1.5">
              {tasks.slice(0, 3).map(task => <div key={task.id} className={`flex items-center justify-between px-2 py-1.5 rounded ${task.status === 'completed' ? 'bg-green-50' : 'bg-amber-50'}`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-xs text-gray-700">{task.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{task.time}</span>
                </div>)}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-2 text-blue-600 text-xs h-6" onClick={() => $w.utils.navigateTo({
            pageId: 'points',
            params: {}
          })}>
              查看全部 <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {/* Birthday Card */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-4 h-4 text-rose-500" />
              <h3 className="font-medium text-gray-900 text-sm">今日生日</h3>
            </div>
            {todayBirthdays.length > 0 ? <div className="space-y-1.5">
                {todayBirthdays.map(birthday => <div key={birthday.id} className="flex items-center gap-1.5 p-1.5 bg-white rounded">
                    <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-rose-600">
                        {birthday.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">{birthday.name}</p>
                      <p className="text-xs text-gray-500">{birthday.group}</p>
                    </div>
                    <Star className="w-3 h-3 text-amber-400" />
                  </div>)}
              </div> : <div className="flex items-center justify-center h-14 text-gray-400">
                <span className="text-xs">今日无生日</span>
              </div>}
          </div>
        </div>

        {/* Quick Stats - Compact Grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard title="学生总数" value="45" icon={Users} color="blue" trend={{
          value: 5
        }} />
          <StatCard title="平均积分" value="142" icon={TrendingUp} color="green" trend={{
          value: 8.2
        }} />
          <StatCard title="待处理" value="3" icon={AlertCircle} color="amber" />
        </div>

        {/* Points Chart - Compact Card */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
              <Trophy className="w-4 h-4 text-amber-500" />
              积分排行榜（Top 5）
            </h3>
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => $w.utils.navigateTo({
            pageId: 'points',
            params: {}
          })}>
              查看全部
            </Button>
          </div>
          <PointsChart data={pointsData} height={220} />
        </div>

        {/* Notifications - Compact */}
        {notifications.length > 0 && <div className="bg-white rounded-lg p-3 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-1.5 text-sm">
              <Bell className="w-4 h-4 text-blue-600" />
              通知消息
            </h3>
            <div className="space-y-2">
              {notifications.map(notification => <div key={notification.id} className={`p-2 rounded border-l-2 ${notification.type === 'warning' ? 'bg-amber-50 border-amber-400' : 'bg-blue-50 border-blue-400'}`}>
                  <p className="text-xs font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>)}
            </div>
          </div>}

        {/* Quick Actions - Compact Grid */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3 text-sm">快捷操作</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={handleAddPoints} className="bg-blue-600 hover:bg-blue-700 h-auto flex flex-col items-center gap-1.5 py-3">
              <Plus className="w-5 h-5" />
              <span className="text-xs">记录积分</span>
            </Button>
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'exchange',
            params: {}
          })} variant="outline" className="h-auto flex flex-col items-center gap-1.5 py-3">
              <Trophy className="w-5 h-5" />
              <span className="text-xs">积分兑换</span>
            </Button>
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'duty-roster',
            params: {}
          })} variant="outline" className="h-auto flex flex-col items-center gap-1.5 py-3">
              <CalendarDays className="w-5 h-5" />
              <span className="text-xs">卫生值日</span>
            </Button>
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'subjects',
            params: {}
          })} variant="outline" className="h-auto flex flex-col items-center gap-1.5 py-3">
              <Calculator className="w-5 h-5" />
              <span className="text-xs">科目设置</span>
            </Button>
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'students',
            params: {}
          })} variant="outline" className="h-auto flex flex-col items-center gap-1.5 py-3">
              <Users className="w-5 h-5" />
              <span className="text-xs">学生管理</span>
            </Button>
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'grades',
            params: {}
          })} variant="outline" className="h-auto flex flex-col items-center gap-1.5 py-3">
              <Star className="w-5 h-5" />
              <span className="text-xs">成绩管理</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}