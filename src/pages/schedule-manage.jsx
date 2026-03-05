// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Plus, Edit2, Trash2, Clock, Calendar, BookOpen, MapPin, Save, ChevronRight, PlusCircle, Settings, Users, Bell, X } from 'lucide-react';
// @ts-ignore;
import { Button, useToast, Input, Card } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { TeacherScheduleReminder } from '@/components/TeacherScheduleReminder';
export default function ScheduleManage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('schedule-manage');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [activeTab, setActiveTab] = useState('schedule');
  const [scheduleData, setScheduleData] = useState([]);
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const sections = [{
    id: 1,
    name: '第一节',
    time: '08:50-10:10'
  }, {
    id: 2,
    name: '第二节',
    time: '09:10-09:50'
  }, {
    id: 3,
    name: '第三节',
    time: '10:20-11:00'
  }, {
    id: 4,
    name: '第四节',
    time: '11:15-11:55'
  }, {
    id: 5,
    name: '第五节',
    time: '14:00-14:40'
  }, {
    id: 6,
    name: '第六节',
    time: '14:50-15:30'
  }, {
    id: 7,
    name: '第七节',
    time: '15:40-16:20'
  }];
  const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五'];
  useEffect(() => {
    loadScheduleData();
    loadTimetableData();
  }, [activeTab]);
  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const mockSchedule = [{
        id: 1,
        dayOfWeek: '星期一',
        section: 1,
        courseName: '智能仓储大数据分析',
        className: '2024级物流服务与管理2班',
        room: '2-2703电子商务实训4室',
        campus: '大坦沙校区'
      }, {
        id: 2,
        dayOfWeek: '星期一',
        section: 2,
        courseName: '智能仓储大数据分析',
        className: '2024级物流服务与管理2班',
        room: '2-2703电子商务实训4室',
        campus: '大坦沙校区'
      }, {
        id: 3,
        dayOfWeek: '星期三',
        section: 1,
        courseName: '人工智能基础',
        className: '2023级物流服务与管理1班',
        room: '2-2504数字语音实训2室',
        campus: '大坦沙校区'
      }, {
        id: 4,
        dayOfWeek: '星期三',
        section: 3,
        courseName: '智能仓储大数据分析',
        className: '2023级物流服务与管理1班',
        room: '2-2703电子商务实训4室',
        campus: '大坦沙校区'
      }, {
        id: 5,
        dayOfWeek: '星期三',
        section: 4,
        courseName: '智能仓储大数据分析',
        className: '2023级物流服务与管理1班',
        room: '2-2703电子商务实训4室',
        campus: '大坦沙校区'
      }, {
        id: 6,
        dayOfWeek: '星期四',
        section: 5,
        courseName: '人工智能基础',
        className: '2023级物流服务与管理1班',
        room: '2-2504数字语音实训2室',
        campus: '大坦沙校区'
      }, {
        id: 7,
        dayOfWeek: '星期四',
        section: 6,
        courseName: '人工智能基础',
        className: '2023级物流服务与管理1班',
        room: '2-2504数字语音实训2室',
        campus: '大坦沙校区'
      }, {
        id: 8,
        dayOfWeek: '星期五',
        section: 1,
        courseName: '中职数字素养通识',
        className: '2024级物流服务与管理2班',
        room: '2-2504数字语音实训2室',
        campus: '大坦沙校区'
      }, {
        id: 9,
        dayOfWeek: '星期五',
        section: 2,
        courseName: '智能仓储大数据分析',
        className: '2024级物流服务与管理2班',
        room: '2-2703电子商务实训4室',
        campus: '大坦沙校区'
      }];
      setScheduleData(mockSchedule);
    } catch (error) {
      console.error('加载课程表失败:', error);
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法加载课程表数据'
      });
    } finally {
      setLoading(false);
    }
  };
  const loadTimetableData = async () => {
    try {
      setLoading(true);
      const mockTimetable = [{
        id: 1,
        period: '上午',
        items: [{
          name: '起床',
          time: '06:30',
          note: ''
        }, {
          name: '早餐',
          time: '07:00-07:50',
          note: ''
        }, {
          name: '教职工上班',
          time: '周一 08:00 / 周二至周五 08:10',
          note: ''
        }, {
          name: '升旗仪式',
          time: '周一 08:00-08:40 / 周二至周五 08:10-08:20',
          note: ''
        }, {
          name: '第一节',
          time: '08:50-10:10',
          note: '周一1、2节实训课不安排晨读'
        }, {
          name: '第二节',
          time: '09:10-09:50',
          note: ''
        }, {
          name: '课间操',
          time: '09:50-10:10',
          note: ''
        }, {
          name: '第三节',
          time: '10:20-11:00',
          note: ''
        }, {
          name: '眼保健操',
          time: '11:00-11:05',
          note: ''
        }, {
          name: '第四节',
          time: '11:15-11:55',
          note: ''
        }]
      }, {
        id: 2,
        period: '中午',
        items: [{
          name: '午餐',
          time: '第一批 11:40-12:00 / 第二批 12:00-12:30',
          note: ''
        }, {
          name: '午休',
          time: '12:45-13:45',
          note: ''
        }, {
          name: '起床',
          time: '13:45',
          note: ''
        }, {
          name: '教职工上班',
          time: '13:55',
          note: ''
        }]
      }, {
        id: 3,
        period: '下午',
        items: [{
          name: '第五节',
          time: '14:00-14:40',
          note: ''
        }, {
          name: '眼保健操',
          time: '14:40-14:45',
          note: ''
        }, {
          name: '第六节',
          time: '14:50-15:30',
          note: ''
        }, {
          name: '第七节',
          time: '15:40-16:20',
          note: ''
        }, {
          name: '阳光体育活动',
          time: '16:30-18:00',
          note: ''
        }, {
          name: '教职工下班',
          time: '16:30',
          note: ''
        }]
      }, {
        id: 4,
        period: '晚上',
        items: [{
          name: '晚餐',
          time: '17:30-18:30',
          note: ''
        }, {
          name: '晚自修',
          time: '19:30-21:00',
          note: ''
        }, {
          name: '教室熄灯',
          time: '22:00',
          note: ''
        }, {
          name: '宿舍熄灯',
          time: '22:30',
          note: ''
        }]
      }];
      setTimetableData(mockTimetable);
    } catch (error) {
      console.error('加载作息时间表失败:', error);
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法加载作息时间表数据'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAddSchedule = () => {
    setFormData({});
    setEditingItem(null);
    setShowAddModal(true);
  };
  const handleEditSchedule = item => {
    setFormData(item);
    setEditingItem(item);
    setShowAddModal(true);
  };
  const handleDeleteSchedule = id => {
    if (confirm('确定要删除这条课程吗？')) {
      setScheduleData(scheduleData.filter(item => item.id !== id));
      toast({
        title: '删除成功',
        description: '课程已删除'
      });
    }
  };
  const handleSaveSchedule = () => {
    if (editingItem) {
      setScheduleData(scheduleData.map(item => item.id === editingItem.id ? {
        ...formData,
        id: editingItem.id
      } : item));
      toast({
        title: '修改成功',
        description: '课程已更新'
      });
    } else {
      setScheduleData([...scheduleData, {
        ...formData,
        id: Date.now()
      }]);
      toast({
        title: '添加成功',
        description: '课程已添加'
      });
    }
    setShowAddModal(false);
  };
  const handleSaveTimetable = () => {
    toast({
      title: '保存成功',
      description: '作息时间已更新'
    });
  };
  const getScheduleForCell = (day, section) => {
    return scheduleData.find(item => item.dayOfWeek === day && item.section === section.id);
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="animate-pulse flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-amber-600 font-medium">加载中...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pb-24">
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">课程与作息管理</h1>
            <p className="text-orange-100 text-sm">管理课程表和作息时间</p>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-white text-orange-600 hover:bg-orange-50" onClick={handleAddSchedule}>
              <Plus className="w-4 h-4 mr-1" />
              添加课程
            </Button>
          </div>
        </div>
        <div className="flex space-x-2 bg-white/20 backdrop-blur rounded-lg p-1">
          <button className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'schedule' ? 'bg-white text-orange-600 shadow-md' : 'text-white hover:bg-white/10'}`} onClick={() => setActiveTab('schedule')}>
            <Calendar className="w-4 h-4 inline mr-1" />课程表
          </button>
          <button className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'timetable' ? 'bg-white text-orange-600 shadow-md' : 'text-white hover:bg-white/10'}`} onClick={() => setActiveTab('timetable')}>
            <Clock className="w-4 h-4 inline mr-1" />作息时间
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {activeTab === 'schedule' ? <div className="space-y-4">
            <Card className="overflow-hidden border-2 border-orange-200">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      <th className="px-2 py-2 text-left font-semibold rounded-tl-lg">节次</th>
                      {weekDays.map(day => <th key={day} className="px-2 py-2 text-center font-semibold">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section, index) => <tr key={section.id} className={`border-b border-orange-100 ${index % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'}`}>
                        <td className="px-2 py-3">
                          <div className="text-xs font-semibold text-gray-700">{section.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{section.time}</div>
                        </td>
                        {weekDays.map(day => {
                    const schedule = getScheduleForCell(day, section);
                    return <td key={`${day}-${section.id}`} className="px-1 py-1">
                              {schedule ? <div className="bg-white border-2 border-orange-300 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all" onClick={() => handleEditSchedule(schedule)}>
                                  <div className="font-semibold text-orange-700 text-xs mb-1 truncate">{schedule.courseName}</div>
                                  <div className="text-xs text-gray-600 truncate mb-1">{schedule.className}</div>
                                  <div className="flex items-center text-xs text-gray-500"><MapPin className="w-3 h-3 mr-1" /><span className="truncate">{schedule.room}</span></div>
                                </div> : <div className="h-16 border-2 border-dashed border-orange-200 rounded-lg flex items-center justify-center hover:bg-orange-50 cursor-pointer transition-all" onClick={() => handleAddSchedule()}>
                                  <PlusCircle className="w-6 h-6 text-orange-300" />
                                </div>}
                            </td>;
                  })}
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </Card>
          </div> : <div className="space-y-4">
            {timetableData.map(period => <Card key={period.id} className="border-2 border-orange-200">
                <div className="bg-gradient-to-r from-orange-400 to-amber-400 px-4 py-2">
                  <h3 className="text-white font-bold">{period.period}</h3>
                </div>
                <div className="p-4 space-y-3">
                  {period.items.map((item, index) => <div key={index} className="flex items-center justify-between py-2 border-b border-orange-100 last:border-0">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                        {item.note && <div className="text-xs text-orange-600 mt-0.5">{item.note}</div>}
                      </div>
                      <div className="text-xs font-mono text-gray-600 bg-orange-50 px-2 py-1 rounded">{item.time}</div>
                    </div>)}
                </div>
              </Card>)}
          </div>}
      </div>

      {showAddModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 rounded-t-lg flex items-center justify-between">
              <h3 className="text-white font-bold">{editingItem ? '编辑课程' : '添加课程'}</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-white" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">星期</label>
                <select className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" value={formData.dayOfWeek || ''} onChange={e => setFormData({
              ...formData,
              dayOfWeek: e.target.value
            })}>
                  <option value="">请选择</option>
                  {weekDays.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">节次</label>
                <select className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" value={formData.section || ''} onChange={e => setFormData({
              ...formData,
              section: parseInt(e.target.value)
            })}>
                  <option value="">请选择</option>
                  {sections.map(section => <option key={section.id} value={section.id}>{section.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">课程名称</label>
                <Input className="border-orange-200" value={formData.courseName || ''} onChange={e => setFormData({
              ...formData,
              courseName: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">班级</label>
                <Input className="border-orange-200" value={formData.className || ''} onChange={e => setFormData({
              ...formData,
              className: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">教室</label>
                <Input className="border-orange-200" value={formData.room || ''} onChange={e => setFormData({
              ...formData,
              room: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">校区</label>
                <Input className="border-orange-200" value={formData.campus || ''} onChange={e => setFormData({
              ...formData,
              campus: e.target.value
            })} />
              </div>
              <div className="flex space-x-2 pt-2">
                {editingItem && <Button variant="destructive" size="sm" className="flex-1" onClick={() => {
              handleDeleteSchedule(editingItem.id);
              setShowAddModal(false);
            }}>
                    <Trash2 className="w-4 h-4 mr-1" />删除
                  </Button>}
                <Button size="sm" className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500" onClick={handleSaveSchedule}>
                  <Save className="w-4 h-4 mr-1" />保存
                </Button>
              </div>
            </div>
          </Card>
        </div>}

      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}