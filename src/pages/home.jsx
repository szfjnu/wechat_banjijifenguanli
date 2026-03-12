// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Calendar, Users, TrendingUp, AlertCircle, Sun, CloudRain, CloudSnow, Wind, Clock, Star, ChevronRight, Trophy, Plus, Bell, Cloud, CloudLightning, Snowflake, CalendarDays, Calculator } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { getBeijingTime, formatPoints } from '@/lib/utils';

import { TabBar } from '@/components/TabBar';
import { StatCard } from '@/components/StatCard';
import { PointsChart } from '@/components/PointsChart';
import { TeacherScheduleReminder } from '@/components/TeacherScheduleReminder';
export default function Home(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({
    condition: 'sunny',
    temperature: 23,
    description: '晴朗',
    humidity: 65,
    wind: '东北风 3级',
    advice: '天气晴朗，适合户外活动'
  });
  const [students, setStudents] = useState([]);
  const [pointsData, setPointsData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    avgScore: 0,
    pendingTasks: 0
  });
  useEffect(() => {
    loadDashboardData();
    loadWeatherData();
  }, []);
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 1. 先查询所有学生总数（用于统计）
      const totalStudentsResult = await db.collection('students').count();
      const totalStudents = totalStudentsResult.total || 0;

      // 2. 查询所有学生的积分数据（用于计算平均积分）
      const allStudentsResult = await db.collection('students').field({
        _id: true,
        name: true,
        current_score: true
      }).get();
      const allStudents = allStudentsResult.data || [];

      // 计算总积分和平均积分
      const totalScore = allStudents.reduce((sum, s) => sum + (s.current_score || 0), 0);
      const avgScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;

      // 3. 查询积分排行榜前10名学生
      const topStudentsResult = await db.collection('students').orderBy('current_score', 'desc').limit(10).get();
      if (topStudentsResult.data && topStudentsResult.data.length > 0) {
        const transformedStudents = topStudentsResult.data.map(student => ({
          id: student._id,
          name: student.name,
          group: student.group || '未分组',
          totalPoints: student.current_score || 0,
          rank: 0,
          avatar: student.avatar_url
        }));
        setStudents(transformedStudents);

        // 加载积分图表数据
        const transformedPointsData = topStudentsResult.data.map(student => ({
          name: student.name,
          points: formatPoints(student.current_score || 0),
          daily: formatPoints(student.current_score || 0),
          dorm: student.dorm_score || 0
        }));
        setPointsData(transformedPointsData);
      } else {
        setStudents([]);
        setPointsData([]);
      }

      // 4. 查询今日待处理任务（从 duty_task 数据模型）
      const today = getBeijingTime();
      const todayDateString = today.toISOString().split('T')[0];
      const pendingTasksResult = await db.collection('duty_task').where({
        date: todayDateString,
        status: 'pending'
      }).get();
      const pendingTasks = pendingTasksResult.data ? pendingTasksResult.data.length : 0;

      // 设置统计数据
      setStatsData({
        totalStudents,
        avgScore,
        pendingTasks
      });

      // 加载今日生日学生（使用 date_of_birth 字段）
      const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
      const todayDay = String(today.getDate()).padStart(2, '0');
      const todayDateStr = `-${todayMonth}-${todayDay}`;
      const birthdayResult = await db.collection('students').where({
        birthday: db.RegExp({
          regexp: todayDateStr,
          options: 'i'
        })
      }).get();
      if (birthdayResult.data && birthdayResult.data.length > 0) {
        const transformedBirthdays = birthdayResult.data.map(student => ({
          id: student._id,
          name: student.name,
          group: student.group || '未分组',
          avatar: student.avatar_url
        }));
        setTodayBirthdays(transformedBirthdays);
      } else {
        setTodayBirthdays([]);
      }

      // 加载今日任务
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
      // 根据当前日期生成合适的天气数据
      const today = getBeijingTime();
      const month = today.getMonth() + 1;
      let temperature = 20;
      let condition = 'sunny';
      let description = '晴朗';
      let advice = '天气晴朗，适合户外活动';

      // 根据月份调整天气
      if (month >= 6 && month <= 8) {
        temperature = 28;
        description = '晴朗炎热';
        advice = '天气炎热，注意防暑降温，多喝水';
      } else if (month >= 9 && month <= 11) {
        temperature = 23;
        description = '秋高气爽';
        advice = '天气宜人，适合户外活动';
      } else if (month >= 3 && month <= 5) {
        temperature = 18;
        description = '春暖花开';
        advice = '春光明媚，适合踏青出游';
      } else {
        temperature = 8;
        description = '寒冷';
        advice = '天气寒冷，注意保暖';
      }

      // 设置天气数据
      setWeather({
        condition: condition,
        temperature: temperature,
        description: description,
        humidity: 60 + Math.floor(Math.random() * 20),
        // 60-80%
        wind: '东北风 3级',
        advice: advice
      });
    } catch (error) {
      console.error('加载天气失败:', error);
      // 使用默认天气数据作为回退，确保天气模块始终显示
      setWeather({
        condition: 'sunny',
        temperature: 23,
        description: '晴朗',
        humidity: 65,
        wind: '东北风 3级',
        advice: '天气晴朗，适合户外活动'
      });
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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
        <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2">
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
          </div>
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

        {/* Teacher Schedule Reminder - New */}
        <TeacherScheduleReminder $w={$w} />

        {/* Quick Stats - Compact Grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard title="学生总数" value={String(statsData.totalStudents)} icon={Users} color="blue" trend={{
          value: 5
        }} />
          <StatCard title="平均积分" value={String(statsData.avgScore)} icon={TrendingUp} color="green" trend={{
          value: 8.2
        }} />
          <StatCard title="待处理" value={String(statsData.pendingTasks)} icon={AlertCircle} color="amber" />
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