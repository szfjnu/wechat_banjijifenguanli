// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Clock, MapPin, Calendar, AlertCircle, ChevronRight, Bell, BookOpen } from 'lucide-react';
// @ts-ignore;
import { Card } from '@/components/ui';

export function TeacherScheduleReminder(props) {
  const {
    $w
  } = props;
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showReminders, setShowReminders] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    loadTodaySchedule();
    loadReminders();
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);
  const updateTime = () => {
    setCurrentTime(new Date());
    determineCurrentSection();
  };
  const determineCurrentSection = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeValue = hours * 60 + minutes;

    // 作息时间段定义（根据图片分析）
    const sections = {
      1: {
        start: '08:50',
        end: '10:10',
        name: '第一节'
      },
      2: {
        start: '09:10',
        end: '09:50',
        name: '第二节'
      },
      3: {
        start: '10:20',
        end: '11:00',
        name: '第三节'
      },
      4: {
        start: '11:15',
        end: '11:55',
        name: '第四节'
      },
      5: {
        start: '14:00',
        end: '14:40',
        name: '第五节'
      },
      6: {
        start: '14:50',
        end: '15:30',
        name: '第六节'
      },
      7: {
        start: '15:40',
        end: '16:20',
        name: '第七节'
      }
    };
    let current = null;
    let next = null;
    let foundCurrent = false;
    for (const [sectionId, info] of Object.entries(sections)) {
      const [startH, startM] = info.start.split(':').map(Number);
      const [endH, endM] = info.end.split(':').map(Number);
      const startValue = startH * 60 + startM;
      const endValue = endH * 60 + endM;
      if (timeValue >= startValue && timeValue <= endValue) {
        current = {
          id: sectionId,
          ...info
        };
        foundCurrent = true;
      } else if (!foundCurrent && timeValue < startValue) {
        next = {
          id: sectionId,
          ...info
        };
        break;
      }
    }
    setCurrentSection(current);
    setNextClass(next);
  };
  const loadReminders = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('reminder_config').where({
        is_enabled: true,
        status: 'active'
      }).orderBy('reminder_time', 'asc').get();
      if (result.data && result.data.length > 0) {
        const transformedReminders = result.data.map(reminder => ({
          id: reminder._id,
          reminderId: reminder.reminder_id,
          reminderType: reminder.reminder_type,
          reminderName: reminder.reminder_name,
          reminderContent: reminder.reminder_content,
          reminderMethod: reminder.reminder_method,
          reminderFrequency: reminder.reminder_frequency,
          reminderTime: reminder.reminder_time,
          targetType: reminder.target_type,
          targetIds: reminder.target_ids || [],
          targetNames: reminder.target_names || [],
          isAuto: reminder.is_auto,
          lastReminderTime: reminder.last_reminder_time,
          reminderCount: reminder.reminder_count,
          status: reminder.status
        }));
        setReminders(transformedReminders);
      } else {
        setReminders([]);
      }
    } catch (error) {
      console.error('加载提醒数据失败:', error);
    }
  };
  const loadTodaySchedule = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取今天是星期几（0=周日，1=周一，...，6=周六）
      const today = new Date();
      const weekDay = today.getDay(); // 0-6

      // 查询今天星期对应的课程
      const result = await db.collection('schedule').where({
        week_day: weekDay
      }).orderBy('section', 'asc').get();
      if (result.data && result.data.length > 0) {
        // 转换数据格式
        const schedule = result.data.map((item, index) => {
          // 根据当前时间确定课程状态
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const [startH, startM] = (item.start_time || '08:00').split(':').map(Number);
          const [endH, endM] = (item.end_time || '09:00').split(':').map(Number);
          const startTimeValue = startH * 60 + startM;
          const endTimeValue = endH * 60 + endM;
          let status = 'upcoming';
          if (currentTime >= endTimeValue) {
            status = 'completed';
          } else if (currentTime >= startTimeValue && currentTime <= endTimeValue) {
            status = 'ongoing';
          }
          return {
            id: item._id,
            section: item.section || index + 1,
            sectionName: `第${item.section || index + 1}节`,
            courseName: item.course_name || '未知课程',
            className: item.class_name || '',
            room: item.room || '',
            campus: item.campus || '',
            startTime: item.start_time || '',
            endTime: item.end_time || '',
            status: status
          };
        });
        setTodaySchedule(schedule);
      } else {
        setTodaySchedule([]);
      }
    } catch (error) {
      console.error('加载课程表失败:', error);
      setTodaySchedule([]);
    } finally {
      setLoading(false);
    }
  };
  const formatTime = date => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getStatusColor = status => {
    switch (status) {
      case 'ongoing':
        return 'bg-red-500 animate-pulse';
      case 'completed':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };
  if (loading) {
    return <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="animate-pulse flex items-center space-x-4">
          <div className="h-4 w-4 bg-amber-400 rounded"></div>
          <div className="h-4 w-32 bg-amber-200 rounded"></div>
        </div>
      </Card>;
  }
  return <Card className="overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-white animate-swing" />
          <h3 className="text-white font-bold text-base flex items-center space-x-2">
            <span>今日课程</span>
            <span className="text-amber-200 text-xs font-normal">
              {new Date().toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
              weekday: 'short'
            })}
            </span>
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <Clock className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-mono">
            {formatTime(currentTime)}
          </span>
          <button className="relative p-1 hover:bg-amber-400 rounded-full transition-colors" onClick={() => setShowReminders(!showReminders)}>
            <Bell className="w-4 h-4 text-white" />
            {reminders.filter(r => r.isAuto && r.reminderCount > 0).length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {reminders.filter(r => r.isAuto && r.reminderCount > 0).length}
                </span>}
          </button>
        </div>
      </div>

      {/* Current Class Alert */}
      {currentSection && <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 animate-pulse" />
            <span className="font-semibold text-sm">
              当前正在上课：{currentSection.name}
            </span>
          </div>
          <span className="text-xs bg-red-600 px-2 py-1 rounded font-mono">
            {currentSection.start} - {currentSection.end}
          </span>
        </div>}

      {/* Next Class Alert */}
      {nextClass && !currentSection && <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold text-sm">
              下一节课：{nextClass.name}
            </span>
          </div>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded font-mono">
            {nextClass.start} - {nextClass.end}
          </span>
        </div>}

      {/* Schedule List */}
      <div className="p-3 space-y-2">
        {todaySchedule.length === 0 ? <div className="text-center py-6 text-gray-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">今日无课程安排</p>
          </div> : todaySchedule.map((item, index) => {
        const isCurrent = currentSection && currentSection.id == item.section;
        return <div key={item.id} className={`bg-white rounded-lg p-3 border-2 transition-all hover:shadow-md ${isCurrent ? 'border-red-400 bg-red-50' : item.status === 'completed' ? 'border-green-200 opacity-75' : 'border-amber-200'}`}>
                {/* Time and Section */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />\n                    <span className="text-xs font-semibold text-gray-600">
                      {item.sectionName}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.startTime} - {item.endTime}
                  </div>
                </div>

                {/* Course Name */}
                <div className="flex items-center space-x-2 mb-1">
                  <BookOpen className="w-4 h-4 text-orange-500" />\n                  <span className={`font-semibold text-sm ${isCurrent ? 'text-red-700' : 'text-gray-800'}`}>
                    {item.courseName}
                  </span>
                </div>

                {/* Class Name */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs text-gray-600">班级：</span>
                  <span className="text-xs font-medium text-gray-800">
                    {item.className}
                  </span>
                </div>

                {/* Room Info */}
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />\n                  <span className="text-xs text-gray-600">
                    {item.room}
                  </span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-600">
                    {item.campus}
                  </span>
                </div>
              </div>;
      })}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 border-t border-amber-200">
        <button className="w-full text-center text-xs text-amber-700 font-medium flex items-center justify-center space-x-1 hover:text-amber-800 transition-colors" onClick={() => $w.utils.navigateTo({
        pageId: 'schedule-manage',
        params: {}
      })}>
          <Calendar className="w-3.5 h-3.5" />
          <span>查看完整课表</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>;
}