// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Calendar, User, Star, CheckCircle, Clock, AlertCircle, Plus, Bell, Camera, FileImage, MessageSquare, TrendingUp, CalendarDays, ChevronRight, ChevronLeft, Trash2, Edit3, Home } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, useToast, Badge } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { StatCard } from '@/components/StatCard';
export default function DutyRoster(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('duty-roster');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('this-week');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [customTaskName, setCustomTaskName] = useState('');
  const [isCustomTask, setIsCustomTask] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 新增值日任务表单
  const [newTask, setNewTask] = useState({
    studentId: '',
    taskName: '',
    date: '',
    points: 5
  });
  // 检查评分表单
  const [checkForm, setCheckForm] = useState({
    score: 0,
    comment: '',
    images: []
  });
  // 值日提醒表单
  const [reminderForm, setReminderForm] = useState({
    taskId: null,
    studentName: '',
    taskName: '',
    message: ''
  });
  // 值日任务类型配置（预设任务）
  const PRESET_TASKS = [{
    id: 'sweep-floor',
    name: '清扫地面',
    icon: '🧹',
    points: 5,
    description: '清扫教室地面，保持干净'
  }, {
    id: 'clean-blackboard',
    name: '清理黑板',
    icon: '📝',
    points: 3,
    description: '清理黑板和粉笔槽'
  }, {
    id: 'clean-windows',
    name: '擦拭窗户',
    icon: '🪟',
    points: 4,
    description: '擦拭窗户玻璃和窗框'
  }, {
    id: 'arrange-desks',
    name: '整理课桌',
    icon: '🪑',
    points: 3,
    description: '整理课桌椅，摆放整齐'
  }, {
    id: 'empty-trash',
    name: '清理垃圾桶',
    icon: '🗑️',
    points: 3,
    description: '清理垃圾桶并套上新袋子'
  }, {
    id: 'organize-books',
    name: '整理图书角',
    icon: '📚',
    points: 2,
    description: '整理图书角的书籍'
  }, {
    id: 'water-flowers',
    name: '浇花',
    icon: '🌸',
    points: 1,
    description: '为班级植物浇水'
  }, {
    id: 'clean-corridor',
    name: '打扫走廊',
    icon: '🚪',
    points: 4,
    description: '打扫教室外的走廊'
  }];
  const [students, setStudents] = useState([]);
  useEffect(() => {
    loadDutyData();
  }, []);
  useEffect(() => {
    filterTasks();
  }, [tasks, selectedStatus, selectedWeek]);
  const loadDutyData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();

      // 1. 加载学生数据
      let loadedStudents = [];
      try {
        const studentsResult = await tcb.database().collection('students').get();
        if (studentsResult.data && studentsResult.data.length > 0) {
          loadedStudents = studentsResult.data.map(s => ({
            _id: s._id,
            id: s.student_id,
            name: s.name,
            studentId: s.student_id,
            studentNo: s.student_id,
            gender: s.gender,
            group: s.group || '未分组',
            avatar: s.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + s.student_id
          }));
          console.log('加载的学生数据:', loadedStudents);
        }
      } catch (error) {
        console.error('加载学生数据失败:', error);
      }
      setStudents(loadedStudents);

      // 2. 加载值日任务数据
      let loadedTasks = [];
      let loadedNotifications = [];
      try {
        const tasksResult = await tcb.database().collection('duty_task').orderBy('date', 'desc').limit(100).get();
        if (tasksResult.data && tasksResult.data.length > 0) {
          loadedTasks = tasksResult.data.map(task => ({
            id: task._id,
            _id: task._id,
            studentId: task.student_id,
            studentName: task.student_name,
            studentNo: task.student_no,
            taskName: task.task_name,
            taskIcon: task.task_icon || '🧹',
            points: task.points || 5,
            date: task.date,
            semesterId: task.semester_id,
            semesterName: task.semester_name,
            weekNumber: task.week_number,
            status: task.status || 'pending',
            score: task.score || 0,
            comment: task.comment || '',
            images: task.images || [],
            isCustom: task.is_custom || false,
            reminderSent: task.reminder_sent || false,
            createdAt: task.createdAt ? new Date(task.createdAt).toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN')
          }));
          console.log('加载的值日任务数据:', loadedTasks);
          console.log('加载的学生数据:', loadedStudents);

          // 验证学生匹配情况
          loadedTasks.forEach(task => {
            const student = loadedStudents.find(s => s.id === task.studentId);
            console.log('任务学生匹配:', task.studentId, student ? '✅匹配' : '❌未匹配', task.studentName);
          });
          console.log('加载的值日任务数据:', loadedTasks);

          // 生成未完成任务的通知
          const pendingTasks = loadedTasks.filter(t => t.status === 'pending');
          loadedNotifications = pendingTasks.map(task => ({
            id: task.id,
            type: 'pending',
            message: `${task.studentName} ${task.date}的${task.taskName}任务尚未完成`,
            time: '待完成',
            studentId: task.studentId,
            taskId: task.id
          })).slice(0, 5);
        }
      } catch (error) {
        console.error('加载值日任务数据失败:', error);
      }
      setTasks(loadedTasks);
      setNotifications(loadedNotifications);

      // 3. 设置当前周的开始日期（本周一）
      const today = new Date();
      const day = today.getDay() || 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - day + 1);
      setCurrentWeekStart(monday);

      // 如果没有值日任务数据，显示提示
      if (loadedStudents.length === 0) {
        toast({
          title: '提示',
          description: '暂无学生数据，请先在学生管理页面添加学生',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('加载值日数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载值日数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const generateWeeklyTasks = (startDate, weekNumber) => {
    const tasks = [];
    const weekTasks = [];
    const monday = new Date(startDate);
    const dayOfWeek = monday.getDay() || 7;
    monday.setDate(startDate.getDate() - dayOfWeek + 1);
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];
      // 每天分配2个值日任务（按学生轮值）
      const studentIndex1 = day * 2 % students.length;
      const studentIndex2 = (day * 2 + 1) % students.length;
      const taskIndex1 = day % PRESET_TASKS.length;
      const taskIndex2 = (day + 1) % PRESET_TASKS.length;
      const task1 = PRESET_TASKS[taskIndex1];
      const task2 = PRESET_TASKS[taskIndex2];
      // 第一个任务
      weekTasks.push({
        id: Date.now() + day * 1000,
        studentId: students[studentIndex1].id,
        studentName: students[studentIndex1].name,
        studentNo: students[studentIndex1].studentId,
        taskName: task1.name,
        taskIcon: task1.icon,
        points: task1.points,
        date: dateStr,
        status: day === 2 ? 'completed' : 'pending',
        score: day === 2 ? 4 : null,
        comment: day === 2 ? '完成质量较好' : '',
        images: [],
        createdAt: new Date().toISOString(),
        weekNumber: weekNumber,
        isCustom: false,
        reminderSent: false
      });
      // 第二个任务
      weekTasks.push({
        id: Date.now() + day * 1000 + 1,
        studentId: students[studentIndex2].id,
        studentName: students[studentIndex2].name,
        studentNo: students[studentIndex2].studentId,
        taskName: task2.name,
        taskIcon: task2.icon,
        points: task2.points,
        date: dateStr,
        status: day === 2 ? 'completed' : 'pending',
        score: day === 2 ? 5 : null,
        comment: day === 2 ? '优秀' : '',
        images: [],
        createdAt: new Date().toISOString(),
        weekNumber: weekNumber,
        isCustom: false,
        reminderSent: false
      });
    }
    return weekTasks;
  };
  const filterTasks = () => {
    let filtered = [...tasks];
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }
    if (selectedWeek === 'this-week') {
      const weekNumber = getWeekNumber(new Date());
      filtered = filtered.filter(task => task.weekNumber === weekNumber);
    } else if (selectedWeek === 'last-week') {
      const weekNumber = getWeekNumber(new Date()) - 1;
      filtered = filtered.filter(task => task.weekNumber === weekNumber);
    }
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredTasks(filtered);
  };
  const getWeekNumber = date => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };
  // 自动分配本周值日任务
  const autoAssignWeekly = async () => {
    try {
      if (!confirm('确定要重新生成本周的值日安排吗？这将覆盖现有任务。')) {
        return;
      }
      const tcb = await $w.cloud.getCloudInstance();
      const weekNumber = getWeekNumber(new Date());

      // 删除本周的旧任务
      await tcb.database().collection('duty_task').where({
        week_number: weekNumber
      }).remove();

      // 生成新任务并保存到数据库
      const newTasks = generateWeeklyTasks(new Date(), weekNumber);
      const promises = newTasks.map(async task => {
        const result = await tcb.database().collection('duty_task').add({
          student_id: task.studentId,
          student_name: task.studentName,
          student_no: task.studentNo,
          task_name: task.taskName,
          task_icon: task.taskIcon,
          points: task.points,
          date: task.date,
          semester_id: 1,
          semester_name: '当前学期',
          week_number: task.weekNumber,
          status: task.status,
          score: task.score || 0,
          comment: task.comment || '',
          images: task.images || [],
          is_custom: task.isCustom || false,
          reminder_sent: task.reminderSent || false,
          created_at: task.createdAt
        });
        return {
          ...task,
          id: result.id,
          _id: result.id
        };
      });
      const savedTasks = await Promise.all(promises);

      // 只保留本周之前的任务，替换本周的任务
      const oldTasks = tasks.filter(t => t.weekNumber !== weekNumber);
      setTasks([...oldTasks, ...savedTasks]);
      toast({
        title: '自动分配成功',
        description: `已为本周（第${weekNumber}周）自动生成${newTasks.length}个值日任务`
      });
    } catch (error) {
      console.error('自动分配失败:', error);
      toast({
        title: '分配失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handleAddTask = async () => {
    if (!newTask.studentId || !newTask.taskName || !newTask.date) {
      toast({
        title: '请填写完整信息',
        description: '学生、任务名称和日期为必填项',
        variant: 'destructive'
      });
      return;
    }
    const weekNumber = getWeekNumber(new Date(newTask.date));
    const student = students.find(s => s.id === newTask.studentId);
    const presetTask = PRESET_TASKS.find(t => t.name === newTask.taskName);
    try {
      const tcb = await $w.cloud.getCloudInstance();

      // 保存到数据库
      const result = await tcb.database().collection('duty_task').add({
        student_id: newTask.studentId,
        student_name: student.name,
        student_no: student.studentId,
        task_name: newTask.taskName,
        task_icon: presetTask ? presetTask.icon : '📌',
        points: newTask.points,
        date: newTask.date,
        semester_id: 1,
        semester_name: '当前学期',
        week_number: weekNumber,
        status: 'pending',
        score: 0,
        comment: '',
        images: [],
        is_custom: isCustomTask,
        reminder_sent: false,
        created_at: new Date().toISOString()
      });
      const task = {
        id: result.id,
        _id: result.id,
        studentId: newTask.studentId,
        studentName: student.name,
        studentNo: student.studentId,
        taskName: newTask.taskName,
        taskIcon: presetTask ? presetTask.icon : '📌',
        points: newTask.points,
        date: newTask.date,
        semesterId: 1,
        semesterName: '当前学期',
        weekNumber: weekNumber,
        status: 'pending',
        score: 0,
        comment: '',
        images: [],
        isCustom: isCustomTask,
        reminderSent: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, task]);
      setShowAddDialog(false);
      setNewTask({
        studentId: '',
        taskName: '',
        date: '',
        points: 5
      });
      setCustomTaskName('');
      setIsCustomTask(false);
      toast({
        title: '添加成功',
        description: `已为${student.name}添加值日任务：${task.taskName}`
      });
    } catch (error) {
      console.error('添加任务失败:', error);
      toast({
        title: '添加失败',
        description: error.message || '无法添加值日任务',
        variant: 'destructive'
      });
    }
  };
  const handleDeleteTask = async taskId => {
    try {
      const tcb = await $w.cloud.getCloudInstance();

      // 从数据库删除
      await tcb.database().collection('duty_task').doc(taskId).remove();
      setTasks(tasks.filter(t => t.id !== taskId));
      setShowDeleteConfirm(false);
      setSelectedTask(null);
      toast({
        title: '删除成功',
        description: '值日任务已删除'
      });
    } catch (error) {
      console.error('删除任务失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '无法删除值日任务',
        variant: 'destructive'
      });
    }
  };
  const handleCheckTask = async () => {
    if (checkForm.score === 0) {
      toast({
        title: '请选择评分',
        description: '请为该任务打分',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();

      // 更新数据库中的任务状态
      await tcb.database().collection('duty_task').doc(selectedTask.id).update({
        status: 'completed',
        score: checkForm.score,
        comment: checkForm.comment,
        images: checkForm.images
      });
      const updatedTasks = tasks.map(t => t.id === selectedTask.id ? {
        ...t,
        status: 'completed',
        score: checkForm.score,
        comment: checkForm.comment,
        images: checkForm.images
      } : t);
      setTasks(updatedTasks);
      setShowCheckDialog(false);
      setCheckForm({
        score: 0,
        comment: '',
        images: []
      });
      setSelectedTask(null);
      toast({
        title: '评分成功',
        description: `已完成${selectedTask.studentName}的${selectedTask.taskName}任务评分`
      });
    } catch (error) {
      console.error('评分失败:', error);
      toast({
        title: '评分失败',
        description: error.message || '无法保存评分',
        variant: 'destructive'
      });
    }
  };
  const handleSendReminder = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();

      // 更新数据库中的提醒状态
      await tcb.database().collection('duty_task').doc(reminderForm.taskId).update({
        reminder_sent: true
      });
      const updatedTasks = tasks.map(t => t.id === reminderForm.taskId ? {
        ...t,
        reminderSent: true
      } : t);
      setTasks(updatedTasks);
      const notification = {
        id: Date.now(),
        type: 'reminder',
        message: `已提醒${reminderForm.studentName}完成${reminderForm.taskName}任务`,
        time: '刚刚',
        studentId: reminderForm.studentId,
        taskId: reminderForm.taskId
      };
      setNotifications([notification, ...notifications]);
      setShowReminderDialog(false);
      setReminderForm({
        taskId: null,
        studentName: '',
        taskName: '',
        message: ''
      });
      toast({
        title: '提醒已发送',
        description: `${reminderForm.studentName}将收到值日提醒通知`
      });
    } catch (error) {
      console.error('发送提醒失败:', error);
      toast({
        title: '发送失败',
        description: error.message || '无法发送提醒',
        variant: 'destructive'
      });
    }
  };
  const openReminderDialog = task => {
    setReminderForm({
      taskId: task.id,
      studentName: task.studentName,
      taskName: task.taskName,
      message: `${task.studentName}，请记得完成${task.date}的${task.taskName}任务`
    });
    setShowReminderDialog(true);
  };
  const openCheckDialog = task => {
    setSelectedTask(task);
    setCheckForm({
      score: 0,
      comment: '',
      images: []
    });
    setShowCheckDialog(true);
  };
  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast({
        title: '上传失败',
        description: '最多只能上传5张图片',
        variant: 'destructive'
      });
      return;
    }
    const images = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setCheckForm({
      ...checkForm,
      images: [...checkForm.images, ...images]
    });
  };
  const removeImage = imageId => {
    setCheckForm({
      ...checkForm,
      images: checkForm.images.filter(img => img.id !== imageId)
    });
  };
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const options = {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    };
    return date.toLocaleDateString('zh-CN', options);
  };
  const getWeekRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
  };
  const pendingTasks = tasks.filter(t => t.status === 'pending' && t.weekNumber === getWeekNumber(new Date()));
  const completedTasks = tasks.filter(t => t.status === 'completed' && t.weekNumber === getWeekNumber(new Date()));
  const avgScore = completedTasks.length > 0 ? (completedTasks.reduce((sum, t) => sum + (t.score || 0), 0) / completedTasks.length).toFixed(1) : 0;
  const totalPoints = completedTasks.reduce((sum, t) => sum + (t.points || 0), 0);
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载值日数据...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 头部统计 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 pb-5">
        <h1 className="text-xl font-bold mb-1.5 flex items-center">
          <CalendarDays className="mr-2" />
          卫生值日表
        </h1>
        <p className="text-blue-100 text-xs mb-4">管理班级值日任务，支持自动分配、评分与提醒</p>
        <div className="grid grid-cols-2 gap-2">
          <StatCard title="本周任务" value={pendingTasks.length + completedTasks.length} icon={Calendar} color="blue" subtitle="总共" />
          <StatCard title="待完成" value={pendingTasks.length} icon={Clock} color="amber" subtitle="值日任务" />
          <StatCard title="已完成" value={completedTasks.length} icon={CheckCircle} color="green" subtitle="值日任务" />
          <StatCard title="平均分" value={avgScore} icon={Star} color="purple" subtitle="任务评分" />
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="px-3 py-2 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 font-medium">筛选:</span>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">本周</SelectItem>
              <SelectItem value="last-week">上周</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待完成</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button onClick={autoAssignWeekly} size="sm" variant="outline" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              自动分配
            </Button>
            <Button onClick={() => {
            setIsCustomTask(false);
            setNewTask({
              studentId: '',
              taskName: '',
              date: '',
              points: 5
            });
            setShowAddDialog(true);
          }} size="sm" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              添加任务
            </Button>
          </div>
        </div>
      </div>

      {/* 待提醒任务通知 */}
      {notifications.length > 0 && <div className="px-4 py-3">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 mb-1 text-sm">待提醒任务</h3>
                <div className="space-y-2">
                  {notifications.map(notification => <div key={notification.id} className="bg-white rounded p-2 text-xs">
                      <p className="text-gray-700">{notification.message}</p>
                      <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>}

      {/* 值日任务列表 */}
      <div className="px-4 py-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <h2 className="text-lg font-semibold text-gray-800">值日任务清单</h2>
            <p className="text-xs text-gray-600 mt-0.5">{getWeekRange()} · 第{getWeekNumber(new Date())}周</p>
          </div>
          <div className="divide-y">
            {filteredTasks.map(task => <div key={task.id} className={`p-2 hover:bg-gray-50 transition-colors ${task.status === 'completed' ? 'bg-green-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{task.taskIcon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{task.taskName}</h3>
                        <p className="text-sm text-gray-500">{task.studentName} · {task.studentNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(task.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {task.points}分
                      </span>
                      {task.isCustom && <Badge variant="secondary" className="text-xs">自定义</Badge>}
                    </div>
                    {task.status === 'completed' && <div className="mt-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600 font-medium">已评分：</span>
                          <span className="text-yellow-500 font-bold">{task.score}分</span>
                          <span className="text-gray-500">/ {task.points}分</span>
                        </div>
                        {task.comment && <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded p-1.5">评价：{task.comment}</p>}
                        {task.images && task.images.length > 0 && <div className="mt-1.5 flex gap-2">
                            {task.images.map((img, idx) => <button key={idx} onClick={() => {
                      setPreviewImage(img.url);
                      setShowImagePreview(true);
                    }} className="w-16 h-16 rounded-lg object-cover border-2 border-blue-300 hover:border-blue-500 transition-colors">
                                <img src={img.url} alt="值日记录" className="w-full h-full object-cover rounded" />
                              </button>)}
                          </div>}
                      </div>}
                  </div>
                  <div className="flex flex-col gap-2">
                    {task.status === 'pending' && <>
                        <Button size="sm" onClick={() => openReminderDialog(task)} variant="outline" className="flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          提醒
                        </Button>
                        <Button size="sm" onClick={() => openCheckDialog(task)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
                          <CheckCircle className="w-3 h-3" />
                          评分
                        </Button>
                      </>}
                    {task.status === 'completed' && <div className="text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                        <span className="text-xs text-green-600 font-medium">已完成</span>
                      </div>}
                    <Button size="sm" onClick={() => {
                  setSelectedTask(task);
                  setShowDeleteConfirm(true);
                }} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>)}
            {filteredTasks.length === 0 && <div className="p-6 text-center text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p>暂无值日任务</p>
              </div>}
          </div>
        </div>
      </div>

      {/* 添加任务对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加值日任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">选择学生</label>
              <Select value={newTask.studentId} onValueChange={val => setNewTask({
              ...newTask,
              studentId: val
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择学生" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => <SelectItem key={student.id} value={student.id}>
                      {student.name}（{student.studentId}）
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">任务类型</label>
              <div className="space-y-2">
                <Button onClick={() => setIsCustomTask(false)} variant={!isCustomTask ? 'default' : 'outline'} className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  预设任务
                </Button>
                {isCustomTask && <input type="text" value={customTaskName} onChange={e => setCustomTaskName(e.target.value)} placeholder="请输入自定义任务名称" className="w-full px-3 py-2 border rounded-md" />}
                {!isCustomTask && <Select value={newTask.taskName} onValueChange={val => {
                const task = PRESET_TASKS.find(t => t.name === val);
                setNewTask({
                  ...newTask,
                  taskName: val,
                  points: task.points
                });
              }}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择预设任务" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_TASKS.map(task => <SelectItem key={task.id} value={task.name}>
                          <div className="flex items-center gap-2">
                            <span>{task.icon}</span>
                            <div>
                              <div className="font-medium">{task.name}</div>
                              <div className="text-xs text-gray-500">{task.points}分 · {task.description}</div>
                            </div>
                          </div>
                        </SelectItem>)}
                    </SelectContent>
                  </Select>}
                <Button onClick={() => setIsCustomTask(true)} variant={isCustomTask ? 'default' : 'outline'} className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  自定义任务
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">值日日期</label>
              <Input type="date" value={newTask.date} onChange={e => setNewTask({
              ...newTask,
              date: e.target.value
            })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">任务积分</label>
              <Input type="number" value={newTask.points} onChange={e => setNewTask({
              ...newTask,
              points: parseInt(e.target.value)
            })} min="1" max="10" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button onClick={handleAddTask}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 评分对话框 */}
      <Dialog open={showCheckDialog} onOpenChange={setShowCheckDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>评分：{selectedTask?.studentName} - {selectedTask?.taskName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">任务评分（满分{selectedTask?.points || 5}分）</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(score => <Button key={score} onClick={() => setCheckForm({
                ...checkForm,
                score
              })} variant={checkForm.score === score ? 'default' : 'outline'} className="w-12 h-12 flex items-center justify-center text-lg">
                    {score}
                  </Button>)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">评价备注</label>
              <Textarea value={checkForm.comment} onChange={e => setCheckForm({
              ...checkForm,
              comment: e.target.value
            })} placeholder="请输入评价备注（可选）" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">上传证据图片（可选）</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="task-images" />
                <label htmlFor="task-images" className="cursor-pointer">
                  <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                  <p className="text-sm text-gray-600">点击上传图片</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">支持jpg、png格式，最多5张</p>
                </label>
              </div>
              {checkForm.images.length > 0 && <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {checkForm.images.map(img => <div key={img.id} className="relative">
                      <img src={img.url} alt="预览" className="w-full h-20 object-cover rounded" />
                      <button onClick={() => removeImage(img.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs">
                        ×
                      </button>
                    </div>)}
                </div>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckDialog(false)}>取消</Button>
            <Button onClick={handleCheckTask} className="bg-green-600 hover:bg-green-700">提交评分</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 提醒对话框 */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发送值日提醒</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-sm text-blue-800">
                <strong>{reminderForm.studentName}</strong> 将收到任务提醒
              </p>
              <p className="text-[10px] text-blue-600 mt-0.5">任务：{reminderForm.taskName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">提醒消息</label>
              <Textarea value={reminderForm.message} onChange={e => setReminderForm({
              ...reminderForm,
              message: e.target.value
            })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>取消</Button>
            <Button onClick={handleSendReminder} className="bg-orange-500 hover:bg-orange-600">
              <Bell className="w-4 h-4 mr-2" />
              发送提醒
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">确定要删除这个值日任务吗？此操作不可撤销。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>取消</Button>
            <Button onClick={() => handleDeleteTask(selectedTask.id)} variant="destructive">删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 图片预览对话框 */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-4xl">
          {previewImage && <img src={previewImage} alt="预览" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </div>;
}