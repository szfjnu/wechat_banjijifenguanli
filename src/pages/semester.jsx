// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Plus, Calendar, Clock, CheckCircle, Edit3, Trash2, Flag, CalendarDays, Info } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';

// 模拟学期数据
const MOCK_SEMESTERS = [{
  id: 1,
  name: '2024-2025第一学期',
  startDate: '2024-09-01',
  endDate: '2025-01-20',
  isCurrent: true,
  createdAt: '2024-08-20T10:00:00'
}, {
  id: 2,
  name: '2024-2025第二学期',
  startDate: '2025-02-15',
  endDate: '2025-07-10',
  isCurrent: false,
  createdAt: '2024-12-15T14:30:00'
}, {
  id: 3,
  name: '2025-2026第一学期',
  startDate: '2025-09-01',
  endDate: '2026-01-20',
  isCurrent: false,
  createdAt: '2025-08-20T10:00:00'
}];
export default function SemesterPage(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils;
  const [semesters, setSemesters] = useState(MOCK_SEMESTERS);
  const [currentPage, setCurrentPage] = useState('semester');

  // 创建学期对话框
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSemester, setNewSemester] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  // 编辑学期对话框
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);

  // 统计数据
  const totalSemesters = semesters.length;
  const currentSemester = semesters.find(s => s.isCurrent) || null;

  // 格式化日期
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 计算学期天数
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 获取学期状态
  const getSemesterStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) {
      return {
        text: '未开始',
        color: 'bg-gray-100 text-gray-700 border-gray-300'
      };
    } else if (now > end) {
      return {
        text: '已结束',
        color: 'bg-gray-100 text-gray-700 border-gray-300'
      };
    } else {
      return {
        text: '进行中',
        color: 'bg-green-100 text-green-700 border-green-300'
      };
    }
  };

  // 创建学期
  const handleCreateSemester = () => {
    if (!newSemester.name || !newSemester.startDate || !newSemester.endDate) {
      toast({
        title: '提示',
        description: '请填写完整的学期信息',
        variant: 'destructive'
      });
      return;
    }
    if (new Date(newSemester.endDate) <= new Date(newSemester.startDate)) {
      toast({
        title: '提示',
        description: '结束日期必须晚于开始日期',
        variant: 'destructive'
      });
      return;
    }

    // 检查是否有重叠的学期
    const hasOverlap = semesters.some(sem => {
      const newStart = new Date(newSemester.startDate);
      const newEnd = new Date(newSemester.endDate);
      const existStart = new Date(sem.startDate);
      const existEnd = new Date(sem.endDate);
      return newStart < existEnd && newEnd > existStart;
    });
    if (hasOverlap) {
      toast({
        title: '提示',
        description: '学期时间不能与现有学期重叠',
        variant: 'destructive'
      });
      return;
    }
    const createdSemester = {
      id: semesters.length + 1,
      name: newSemester.name,
      startDate: newSemester.startDate,
      endDate: newSemester.endDate,
      isCurrent: false,
      createdAt: new Date().toISOString()
    };
    setSemesters([...semesters, createdSemester]);
    setNewSemester({
      name: '',
      startDate: '',
      endDate: ''
    });
    setShowCreateDialog(false);
    toast({
      title: '创建成功',
      description: `学期“${newSemester.name}”已创建`
    });
    console.log('[模拟] 创建学期:', createdSemester);
  };

  // 设置当前学期
  const handleSetCurrent = semesterId => {
    const updatedSemesters = semesters.map(sem => ({
      ...sem,
      isCurrent: sem.id === semesterId
    }));
    setSemesters(updatedSemesters);
    const semester = semesters.find(s => s.id === semesterId);
    toast({
      title: '设置成功',
      description: `已设置“${semester.name}”为当前学期`
    });
    console.log('[模拟] 设置当前学期:', semester);
  };

  // 编辑学期
  const handleEditSemester = () => {
    if (!editingSemester.name || !editingSemester.startDate || !editingSemester.endDate) {
      toast({
        title: '提示',
        description: '请填写完整的学期信息',
        variant: 'destructive'
      });
      return;
    }
    if (new Date(editingSemester.endDate) <= new Date(editingSemester.startDate)) {
      toast({
        title: '提示',
        description: '结束日期必须晚于开始日期',
        variant: 'destructive'
      });
      return;
    }
    const updatedSemesters = semesters.map(sem => sem.id === editingSemester.id ? editingSemester : sem);
    setSemesters(updatedSemesters);
    setEditingSemester(null);
    setShowEditDialog(false);
    toast({
      title: '修改成功',
      description: `学期“${editingSemester.name}”已更新`
    });
    console.log('[模拟] 编辑学期:', editingSemester);
  };

  // 删除学期
  const handleDeleteSemester = semesterId => {
    const semester = semesters.find(s => s.id === semesterId);
    if (semester.isCurrent) {
      toast({
        title: '提示',
        description: '不能删除当前学期',
        variant: 'destructive'
      });
      return;
    }
    const updatedSemesters = semesters.filter(s => s.id !== semesterId);
    setSemesters(updatedSemesters);
    toast({
      title: '删除成功',
      description: `学期“${semester.name}”已删除`
    });
    console.log('[模拟] 删除学期:', semester);
  };

  // 打开编辑对话框
  const openEditDialog = semester => {
    setEditingSemester({
      ...semester
    });
    setShowEditDialog(true);
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部标题栏 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-indigo-600" strokeWidth={2.5} />
            学期管理
          </h1>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">学期总数</p>
                <p className="text-3xl font-bold text-slate-800">{totalSemesters}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">当前学期</p>
                <p className="text-lg font-semibold text-slate-800 truncate">{currentSemester ? currentSemester.name : '未设置'}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Flag className="w-6 h-6 text-green-600" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800">学期列表</h2>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            新建学期
          </Button>
        </div>

        {/* 学期列表 */}
        <div className="space-y-4">
          {semesters.map(semester => {
          const status = getSemesterStatus(semester.startDate, semester.endDate);
          const days = calculateDays(semester.startDate, semester.endDate);
          const createdAt = new Date(semester.createdAt).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
          return <div key={semester.id} className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-all ${semester.isCurrent ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{semester.name}</h3>
                      {semester.isCurrent && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200">
                          当前
                        </span>}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                        <span className="text-slate-600">{formatDate(semester.startDate)} ~ {formatDate(semester.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                        <span className="text-slate-600">共 {days} 天</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                        <span className="text-slate-600">创建于 {createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  {!semester.isCurrent && <Button onClick={() => handleSetCurrent(semester.id)} size="sm" variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50">
                      <Flag className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                      设为当前
                    </Button>}
                  <Button onClick={() => openEditDialog(semester)} size="sm" variant="outline" className="flex-1">
                    <Edit3 className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                    编辑
                  </Button>
                  <Button onClick={() => handleDeleteSemester(semester.id)} size="sm" variant="outline" className="flex-1 border-red-300 text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                    删除
                  </Button>
                </div>
              </div>;
        })}
        </div>

        {/* 说明信息 */}
        <div className="mt-8 p-5 bg-white/60 rounded-xl border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
            使用说明
          </h3>
          <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
            <li>创建学期记录可帮助管理系统时间范围，便于成绩、分组等模块按学期筛选数据</li>
            <li>设置当前学期后，系统将默认使用该学期作为数据筛选依据</li>
            <li>学期时间不能重叠，结束日期必须晚于开始日期</li>
            <li>不能删除当前学期，请先设置其他学期为当前学期后再删除</li>
          </ul>
        </div>
      </main>

      {/* 创建学期对话框 */}
      {showCreateDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-6 h-6 text-indigo-600" strokeWidth={2.5} />
                创建学期
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">学期名称 *</label>
                <input type="text" value={newSemester.name} onChange={e => setNewSemester({
              ...newSemester,
              name: e.target.value
            })} placeholder="如：2024-2025第一学期" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">开始日期 *</label>
                <input type="date" value={newSemester.startDate} onChange={e => setNewSemester({
              ...newSemester,
              startDate: e.target.value
            })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">结束日期 *</label>
                <input type="date" value={newSemester.endDate} onChange={e => setNewSemester({
              ...newSemester,
              endDate: e.target.value
            })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
              </div>
            </div>
            
            <div className="p-6 pt-0 flex gap-3">
              <Button onClick={() => setShowCreateDialog(false)} variant="outline" className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50">
                取消
              </Button>
              <Button onClick={handleCreateSemester} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                创建
              </Button>
            </div>
          </div>
        </div>}

      {/* 编辑学期对话框 */}
      {showEditDialog && editingSemester && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-indigo-600" strokeWidth={2.5} />
                编辑学期
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">学期名称 *</label>
                <input type="text" value={editingSemester.name} onChange={e => setEditingSemester({
              ...editingSemester,
              name: e.target.value
            })} placeholder="如：2024-2025第一学期" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">开始日期 *</label>
                <input type="date" value={editingSemester.startDate} onChange={e => setEditingSemester({
              ...editingSemester,
              startDate: e.target.value
            })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">结束日期 *</label>
                <input type="date" value={editingSemester.endDate} onChange={e => setEditingSemester({
              ...editingSemester,
              endDate: e.target.value
            })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
              </div>
            </div>
            
            <div className="p-6 pt-0 flex gap-3">
              <Button onClick={() => setShowEditDialog(false)} variant="outline" className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50">
                取消
              </Button>
              <Button onClick={handleEditSemester} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                保存
              </Button>
            </div>
          </div>
        </div>}

      {/* 底部导航栏 */}
      <TabBar currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>;
}