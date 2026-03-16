// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Calendar, Users, TrendingUp, AlertCircle, Sun, CloudRain, CloudSnow, Wind, Clock, Star, ChevronRight, Trophy, Plus, Bell, Cloud, CloudLightning, Snowflake, CalendarDays, Calculator, BookOpen, ClipboardCheck, FileText, Award, MessageSquare, LogOut, User, Settings } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { getBeijingTime, getBeijingDateString, formatDateTime } from '@/lib/utils';

import { TabBar } from '@/components/TabBar';
import { StatCard } from '@/components/StatCard';
import { PointsChart } from '@/components/PointsChart';
import { TeacherScheduleReminder } from '@/components/TeacherScheduleReminder';
import { GrowthChart } from '@/components/GrowthChart';

// 角色配置
const ROLE_CONFIG = {
  student: {
    id: 'student',
    name: '学生',
    greeting: '同学',
    theme: 'blue',
    quickActions: [{
      icon: Plus,
      label: '申请志愿',
      page: 'volunteer'
    }, {
      icon: Award,
      label: '积分兑换',
      page: 'exchange'
    }, {
      icon: BookOpen,
      label: '我的成绩',
      page: 'grades'
    }, {
      icon: Calendar,
      label: '课表查询',
      page: 'schedule-manage'
    }, {
      icon: FileText,
      label: '成长记录',
      page: 'student-growth'
    }, {
      icon: User,
      label: '个人信息',
      page: 'students'
    }],
    statLabels: {
      stat1: '我的积分',
      stat2: '班级排名',
      stat3: '待办事项'
    }
  },
  teacher: {
    id: 'teacher',
    name: '教师',
    greeting: '老师',
    theme: 'green',
    quickActions: [{
      icon: Plus,
      label: '记录积分',
      page: 'points'
    }, {
      icon: CalendarDays,
      label: '排课管理',
      page: 'schedule-manage'
    }, {
      icon: BookOpen,
      label: '成绩管理',
      page: 'grades'
    }, {
      icon: ClipboardCheck,
      label: '值日安排',
      page: 'duty-roster'
    }, {
      icon: Users,
      label: '学生管理',
      page: 'students'
    }, {
      icon: FileText,
      label: '纪律管理',
      page: 'discipline'
    }],
    statLabels: {
      stat1: '班级学生',
      stat2: '平均积分',
      stat3: '待处理'
    }
  },
  homeroom_teacher: {
    id: 'homeroom_teacher',
    name: '班主任',
    greeting: '班主任',
    theme: 'purple',
    quickActions: [{
      icon: Plus,
      label: '记录积分',
      page: 'points'
    }, {
      icon: Bell,
      label: '发布通知',
      page: 'notice-publish'
    }, {
      icon: Users,
      label: '学生管理',
      page: 'students'
    }, {
      icon: Calendar,
      label: '课表管理',
      page: 'schedule-manage'
    }, {
      icon: ClipboardCheck,
      label: '值日安排',
      page: 'duty-roster'
    }, {
      icon: Award,
      label: '荣誉证书',
      page: 'certificates'
    }],
    statLabels: {
      stat1: '班级人数',
      stat2: '平均积分',
      stat3: '待处理'
    }
  },
  parent: {
    id: 'parent',
    name: '家长',
    greeting: '家长',
    theme: 'orange',
    quickActions: [{
      icon: BookOpen,
      label: '查看成绩',
      page: 'grades'
    }, {
      icon: Award,
      label: '积分记录',
      page: 'points'
    }, {
      icon: FileText,
      label: '成长记录',
      page: 'student-growth'
    }, {
      icon: MessageSquare,
      label: '家长视图',
      page: 'parent-view'
    }, {
      icon: Users,
      label: '班级信息',
      page: 'students'
    }, {
      icon: Calendar,
      label: '日程安排',
      page: 'schedule-manage'
    }],
    statLabels: {
      stat1: '孩子积分',
      stat2: '班级排名',
      stat3: '待办事项'
    }
  },
  admin: {
    id: 'admin',
    name: '管理员',
    greeting: '管理员',
    theme: 'red',
    quickActions: [{
      icon: Plus,
      label: '记录积分',
      page: 'points'
    }, {
      icon: Users,
      label: '用户管理',
      page: 'users-manage'
    }, {
      icon: Settings,
      label: '系统配置',
      page: 'system-config'
    }, {
      icon: ClipboardCheck,
      label: '权限管理',
      page: 'permission-audit'
    }, {
      icon: Calendar,
      label: '课表管理',
      page: 'schedule-manage'
    }, {
      icon: FileText,
      label: '成绩管理',
      page: 'grades'
    }],
    statLabels: {
      stat1: '学生总数',
      stat2: '平均积分',
      stat3: '待处理'
    }
  }
};
export default function Home(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [config, setConfig] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [statsData, setStatsData] = useState({
    stat1: 0,
    stat2: 0,
    stat3: 0
  });
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [weather, setWeather] = useState({
    condition: 'sunny',
    temperature: 23,
    description: '晴朗',
    humidity: 65,
    wind: '东北风 3级',
    advice: '天气晴朗，适合户外活动'
  });
  useEffect(() => {
    loadDashboardData();
    loadWeatherData();
  }, []);
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 获取当前用户信息
      let user = $w.auth.currentUser;
      if (!user || !user.type) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          user = JSON.parse(storedUser);
        }
      }
      if (!user) {
        console.error('无法获取用户信息');
        setLoading(false);
        return;
      }

      // 根据用户类型映射到角色配置
      let roleId = 'student';
      if (user.type === '班主任') {
        roleId = 'homeroom_teacher';
      } else if (user.type === '教师') {
        roleId = 'teacher';
      } else if (user.type === '学生家长') {
        roleId = 'parent';
      } else if (user.type === '管理员') {
        roleId = 'admin';
      } else if (user.type === '学生（班委）') {
        roleId = 'student';
      }
      setUserRole(roleId);
      const roleConfig = ROLE_CONFIG[roleId];
      setConfig(roleConfig);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const today = getBeijingTime();
      const todayDateString = getBeijingDateString();
      const userName = user.name || '';

      // 根据角色加载不同数据
      if (roleId === 'student') {
        await loadStudentData(db, userName, todayDateString);
      } else if (roleId === 'parent') {
        await loadParentData(db, userName, todayDateString);
      } else if (roleId === 'teacher' || roleId === 'homeroom_teacher') {
        await loadTeacherData(db, userName, todayDateString, roleId);
      } else if (roleId === 'admin') {
        await loadAdminData(db, todayDateString);
      }
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
  const loadStudentData = async (db, userName, todayDateString) => {
    try {
      // 查询学生个人数据
      const studentResult = await db.collection('students').where({
        name: userName
      }).get();
      if (studentResult.data && studentResult.data.length > 0) {
        const student = studentResult.data[0];
        setStudentData(student);

        // 设置统计数据
        setStatsData({
          stat1: student.current_score || 0,
          stat2: student.rank || 1,
          stat3: 0 // 待办事项需要从其他数据源获取
        });

        // 查询个人积分历史
        const pointsResult = await db.collection('point_record').where({
          student_name: userName
        }).orderBy('created_at', 'desc').limit(10).get();
        if (pointsResult.data) {
          const history = pointsResult.data.map((record, index) => ({
            date: formatDateTime(record.created_at, 'date'),
            points: record.score || 0,
            rank: index + 1
          }));
          setPointsHistory(history);
        }

        // 查询今日任务（个人值日、志愿等）
        await loadPersonalTasks(db, userName, student, todayDateString);
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
    }
  };
  const loadParentData = async (db, userName, todayDateString) => {
    try {
      // 查询家长关联的学生
      const relationResult = await db.collection('parent_student_relation').where({
        parent_name: userName
      }).get();
      if (relationResult.data && relationResult.data.length > 0) {
        const studentName = relationResult.data[0].student_name;

        // 查询学生数据
        const studentResult = await db.collection('students').where({
          name: studentName
        }).get();
        if (studentResult.data && studentResult.data.length > 0) {
          const student = studentResult.data[0];
          setStudentData(student);
          setStatsData({
            stat1: student.current_score || 0,
            stat2: student.rank || 1,
            stat3: 0
          });

          // 查询学生积分历史
          const pointsResult = await db.collection('point_record').where({
            student_name: studentName
          }).orderBy('created_at', 'desc').limit(10).get();
          if (pointsResult.data) {
            const history = pointsResult.data.map((record, index) => ({
              date: formatDateTime(record.created_at, 'date'),
              points: record.score || 0,
              rank: index + 1
            }));
            setPointsHistory(history);
          }
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };
  const loadTeacherData = async (db, userName, todayDateString, roleId) => {
    try {
      // 查询教师管理的班级
      const classQuery = roleId === 'homeroom_teacher' ? {
        homeroom_teacher: userName
      } : {
        teacher_name: userName
      };
      const classResult = await db.collection('classes').where(classQuery).get();
      if (classResult.data && classResult.data.length > 0) {
        const className = classResult.data[0].class_name;

        // 查询班级学生统计
        const studentsResult = await db.collection('students').where({
          class_name: className
        }).get();
        if (studentsResult.data) {
          const totalStudents = studentsResult.data.length;
          const avgScore = studentsResult.data.reduce((sum, s) => sum + (s.current_score || 0), 0) / totalStudents;
          setStatsData({
            stat1: totalStudents,
            stat2: Math.round(avgScore),
            stat3: 0
          });
        }
      } else {
        // 全校数据（教师没有管理班级）
        const studentsResult = await db.collection('students').get();
        if (studentsResult.data) {
          const totalStudents = studentsResult.data.length;
          const avgScore = studentsResult.data.reduce((sum, s) => sum + (s.current_score || 0), 0) / totalStudents;
          setStatsData({
            stat1: totalStudents,
            stat2: Math.round(avgScore),
            stat3: 0
          });
        }
      }
    } catch (error) {
      console.error('加载教师数据失败:', error);
    }
  };
  const loadAdminData = async (db, todayDateString) => {
    try {
      // 查询全校统计
      const studentsResult = await db.collection('students').get();
      if (studentsResult.data) {
        const totalStudents = studentsResult.data.length;
        const avgScore = studentsResult.data.reduce((sum, s) => sum + (s.current_score || 0), 0) / totalStudents;
        setStatsData({
          stat1: totalStudents,
          stat2: Math.round(avgScore),
          stat3: 0
        });
      }
    } catch (error) {
      console.error('加载管理员数据失败:', error);
    }
  };
  const loadPersonalTasks = async (db, userName, student, todayDateString) => {
    try {
      const tasks = [];

      // 查询今日值日任务
      const dutyResult = await db.collection('duty_task').where({
        date: todayDateString,
        student_name: userName
      }).get();
      if (dutyResult.data) {
        dutyResult.data.forEach(task => {
          tasks.push({
            id: task._id,
            type: 'value',
            title: task.task_type || '值日',
            group: task.group || '未分组',
            status: task.status || 'pending',
            time: task.time || '16:00'
          });
        });
      }

      // 查询今日志愿活动
      const volunteerResult = await db.collection('volunteer_records').where({
        student_name: userName,
        date: todayDateString
      }).get();
      if (volunteerResult.data) {
        volunteerResult.data.forEach(record => {
          tasks.push({
            id: record._id,
            type: 'activity',
            title: '志愿活动',
            group: record.activity_name || '志愿',
            status: record.status || 'pending',
            time: record.time || '18:00'
          });
        });
      }
      setTasks(tasks);
    } catch (error) {
      console.error('加载个人任务失败:', error);
    }
  };
  const loadWeatherData = async () => {
    try {
      const today = getBeijingTime();
      const month = today.getMonth() + 1;
      let temperature = 20;
      let condition = 'sunny';
      let description = '晴朗';
      let advice = '天气晴朗，适合户外活动';
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
      setWeather({
        condition: condition,
        temperature: temperature,
        description: description,
        humidity: 60 + Math.floor(Math.random() * 20),
        wind: '东北风 3级',
        advice: advice
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
  const handleQuickAction = page => {
    $w.utils.navigateTo({
      pageId,
      params: {}
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
  if (!config) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">无法加载用户信息，请重新登录</p>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header - Fixed Position for WeChat Style */}
      <header className={`bg-gradient-to-r from-${config.theme}-600 to-${config.theme}-500 text-white px-4 py-3 shadow-sm`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold">班级积分管理</h1>
            <p className={`${config.theme}-100 text-xs mt-0.5`}>欢迎回来，{$w.auth.currentUser?.name || config.greeting}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-1" onClick={() => $w.utils.navigateTo({
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
                <p className="text-xs text-white/80">{weather.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/80">{weather.humidity}% 湿度</p>
              <p className="text-xs text-white/80">{weather.wind}</p>
            </div>
          </div>
          <p className="text-xs text-white/70 mt-1.5">{weather.advice}</p>
        </div>
      </header>

      {/* Content Area - Compact Spacing */}
      <div className="px-3 py-3 space-y-3">
        {/* Today's Tasks - Compact Card */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-medium text-gray-900 text-sm">今日任务</h3>
          </div>
          <div className="space-y-1.5">
            {tasks.length > 0 ? tasks.slice(0, 3).map(task => <div key={task.id} className={`flex items-center justify-between px-2 py-1.5 rounded ${task.status === 'completed' ? 'bg-green-50' : 'bg-amber-50'}`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-xs text-gray-700">{task.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{task.time}</span>
                </div>) : <div className="text-center py-2 text-gray-400 text-xs">
                今日无任务
              </div>}
          </div>
        </div>

        {/* Quick Stats - Compact Grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard title={config.statLabels.stat1} value={String(statsData.stat1)} icon={Users} color={config.theme === 'blue' ? 'blue' : config.theme === 'green' ? 'green' : config.theme === 'purple' ? 'purple' : config.theme === 'orange' ? 'orange' : 'red'} />
          <StatCard title={config.statLabels.stat2} value={String(statsData.stat2)} icon={TrendingUp} color={config.theme === 'blue' ? 'green' : 'blue'} />
          <StatCard title={config.statLabels.stat3} value={String(statsData.stat3)} icon={AlertCircle} color="amber" />
        </div>

        {/* Chart Section - Based on Role */}
        {(userRole === 'student' || userRole === 'parent') && studentData ? <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                积分成长曲线
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => $w.utils.navigateTo({
            pageId: 'points',
            params: {}
          })}>
                查看详情
              </Button>
            </div>
            <GrowthChart data={pointsHistory} height={200} />
          </div> : <div className="bg-white rounded-lg p-3 shadow-sm">
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
            <PointsChart data={[]} height={220} />
          </div>}

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
            {config.quickActions.map((action, index) => {
            const Icon = action.icon;
            return <Button key={index} onClick={() => handleQuickAction(action.page)} className={index === 0 ? `bg-${config.theme}-600 hover:bg-${config.theme}-700 h-auto flex flex-col items-center gap-1.5 py-3` : 'h-auto flex flex-col items-center gap-1.5 py-3'} variant={index === 0 ? 'default' : 'outline'}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>;
          })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}