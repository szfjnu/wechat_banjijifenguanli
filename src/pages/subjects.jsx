// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Plus, BookOpen, Edit, Trash2, AlertTriangle, CheckCircle2, ArrowLeft, Home, Sliders, Download, Star, GraduationCap, Calculator } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { getBeijingTimeISO, getBeijingDateString, getBeijingTime } from '@/lib/utils';

import { TabBar } from '@/components/TabBar';
import { StatCard } from '@/components/StatCard';
import { usePermission } from '@/components/PermissionGuard';
export default function Subjects(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('subjects');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };

  // 权限检查
  const {
    permission: canViewSubjects,
    loading: loadingViewSubjects
  } = usePermission($w, 'subjects', 'view');
  const {
    permission: canCreateSubjects,
    loading: loadingCreateSubjects
  } = usePermission($w, 'subjects', 'create');
  const {
    permission: canEditSubjects,
    loading: loadingEditSubjects
  } = usePermission($w, 'subjects', 'edit');
  const {
    permission: canDeleteSubjects,
    loading: loadingDeleteSubjects
  } = usePermission($w, 'subjects', 'delete');
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamSubject, setSelectedExamSubject] = useState('all');

  // 对话框状态
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    credits: '',
    isExamSubject: false
  });
  useEffect(() => {
    loadSubjectsData();
  }, []);
  useEffect(() => {
    filterSubjects();
  }, [subjects, searchQuery, selectedExamSubject]);
  const loadSubjectsData = async () => {
    try {
      setLoading(true);

      // 模拟数据加载（后续替换为真实数据源调用）
      await new Promise(resolve => setTimeout(resolve, 500));

      // 模拟科目数据
      setSubjects([{
        id: 1,
        name: '数学',
        credits: 4,
        isExamSubject: true,
        createdAt: '2024-01-15'
      }, {
        id: 2,
        name: '语文',
        credits: 3,
        isExamSubject: true,
        createdAt: '2024-01-15'
      }, {
        id: 3,
        name: '英语',
        credits: 3,
        isExamSubject: true,
        createdAt: '2024-01-15'
      }, {
        id: 4,
        name: '物理',
        credits: 4,
        isExamSubject: true,
        createdAt: '2024-01-16'
      }, {
        id: 5,
        name: '化学',
        credits: 3,
        isExamSubject: true,
        createdAt: '2024-01-16'
      }, {
        id: 6,
        name: '生物',
        credits: 2,
        isExamSubject: false,
        createdAt: '2024-01-17'
      }, {
        id: 7,
        name: '历史',
        credits: 2,
        isExamSubject: false,
        createdAt: '2024-01-17'
      }, {
        id: 8,
        name: '地理',
        credits: 2,
        isExamSubject: false,
        createdAt: '2024-01-18'
      }, {
        id: 9,
        name: '政治',
        credits: 2,
        isExamSubject: false,
        createdAt: '2024-01-18'
      }, {
        id: 10,
        name: '体育',
        credits: 1,
        isExamSubject: false,
        createdAt: '2024-01-19'
      }]);
    } catch (error) {
      toast({
        title: '加载数据失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const filterSubjects = () => {
    let result = [...subjects];

    // 搜索过滤
    if (searchQuery) {
      result = result.filter(subject => subject.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // 转段考科目过滤
    if (selectedExamSubject !== 'all') {
      if (selectedExamSubject === 'exam') {
        result = result.filter(subject => subject.isExamSubject);
      } else if (selectedExamSubject === 'non-exam') {
        result = result.filter(subject => !subject.isExamSubject);
      }
    }
    setFilteredSubjects(result);
  };
  const handleAddSubject = () => {
    // 表单验证
    if (!formData.name.trim()) {
      toast({
        title: '验证失败',
        description: '请输入科目名称',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.credits || isNaN(Number(formData.credits)) || Number(formData.credits) <= 0) {
      toast({
        title: '验证失败',
        description: '请输入有效的学分',
        variant: 'destructive'
      });
      return;
    }

    // 检查科目名称是否已存在
    if (subjects.some(s => s.name === formData.name)) {
      toast({
        title: '添加失败',
        description: '该科目名称已存在',
        variant: 'destructive'
      });
      return;
    }
    const newSubject = {
      id: getBeijingTime().getTime(),
      name: formData.name,
      credits: Number(formData.credits),
      isExamSubject: formData.isExamSubject,
      createdAt: getBeijingDateString()
    };
    setSubjects([...subjects, newSubject]);
    setShowAddDialog(false);
    setFormData({
      name: '',
      credits: '',
      isExamSubject: false
    });
    toast({
      title: '添加成功',
      description: `科目 ${newSubject.name} 已添加`
    });
  };
  const handleEditSubject = () => {
    if (!formData.name.trim()) {
      toast({
        title: '验证失败',
        description: '请输入科目名称',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.credits || isNaN(Number(formData.credits)) || Number(formData.credits) <= 0) {
      toast({
        title: '验证失败',
        description: '请输入有效的学分',
        variant: 'destructive'
      });
      return;
    }

    // 检查科目名称是否已存在（排除当前科目）
    if (subjects.some(s => s.name === formData.name && s.id !== selectedSubject.id)) {
      toast({
        title: '编辑失败',
        description: '该科目名称已存在',
        variant: 'destructive'
      });
      return;
    }
    const updatedSubject = {
      ...selectedSubject,
      name: formData.name,
      credits: Number(formData.credits),
      isExamSubject: formData.isExamSubject
    };
    setSubjects(subjects.map(s => s.id === selectedSubject.id ? updatedSubject : s));
    setShowEditDialog(false);
    setSelectedSubject(null);
    setFormData({
      name: '',
      credits: '',
      isExamSubject: false
    });
    toast({
      title: '编辑成功',
      description: `科目 ${updatedSubject.name} 已更新`
    });
  };
  const handleDeleteSubject = () => {
    setSubjects(subjects.filter(s => s.id !== selectedSubject.id));
    setShowDeleteDialog(false);
    setSelectedSubject(null);
    toast({
      title: '删除成功',
      description: `科目 ${selectedSubject.name} 已删除`
    });
  };
  const toggleExamSubject = subject => {
    const updatedSubject = {
      ...subject,
      isExamSubject: !subject.isExamSubject
    };
    setSubjects(subjects.map(s => s.id === subject.id ? updatedSubject : s));
    toast({
      title: '更新成功',
      description: `科目 ${subject.name} 已${updatedSubject.isExamSubject ? '设为' : '取消'}转段考科目`
    });
  };
  const openEditDialog = subject => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      credits: String(subject.credits),
      isExamSubject: subject.isExamSubject
    });
    setShowEditDialog(true);
  };
  const openDeleteDialog = subject => {
    setSelectedSubject(subject);
    setShowDeleteDialog(true);
  };
  const exportSubjects = () => {
    const csvContent = [['科目名称', '学分', '转段考科目', '创建时间'].join(','), ...filteredSubjects.map(s => [s.name, s.credits, s.isExamSubject ? '是' : '否', s.createdAt].join(','))].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `科目列表_${getBeijingDateString()}.csv`;
    link.click();
    toast({
      title: '导出成功',
      description: `已导出 ${filteredSubjects.length} 条科目记录`
    });
  };

  // 计算统计数据
  const totalSubjects = subjects.length;
  const examSubjectsCount = subjects.filter(s => s.isExamSubject).length;
  const averageCredits = subjects.length > 0 ? (subjects.reduce((sum, s) => sum + s.credits, 0) / subjects.length).toFixed(1) : 0;
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部导航栏 */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-4 pb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" onClick={() => $w.utils.navigateTo({
            pageId: 'home',
            params: {}
          })} />
            <h1 className="text-2xl font-bold">科目设置</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => $w.utils.navigateTo({
            pageId: 'home',
            params: {}
          })} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-white/80 text-sm">管理科目信息，设置转段考科目</p>
      </div>
      
      {/* 统计卡片 */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-2 gap-2">
          <StatCard title="总科目数" value={totalSubjects} icon={BookOpen} color="blue" />
          <StatCard title="转段考" value={examSubjectsCount} icon={GraduationCap} color="purple" />
          <StatCard title="平均学分" value={averageCredits} icon={Calculator} color="amber" />
        </div>
      </div>
      
      {/* 搜索和筛选 */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="搜索科目名称..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedExamSubject('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${selectedExamSubject === 'all' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              全部科目
            </button>
            <button onClick={() => setSelectedExamSubject('exam')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${selectedExamSubject === 'exam' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <GraduationCap className="w-3.5 h-3.5" />
              转段考
            </button>
            <button onClick={() => setSelectedExamSubject('non-exam')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${selectedExamSubject === 'non-exam' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              非转段考
            </button>
          </div>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="px-4 mt-3">
        <div className="flex gap-3">
          <Button onClick={() => {
          setFormData({
            name: '',
            credits: '',
            isExamSubject: false
          });
          setShowAddDialog(true);
        }} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 py-2.5">
            <Plus className="w-4 h-4 mr-2" />
            添加科目
          </Button>
          <Button onClick={exportSubjects} className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 py-2.5">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* 科目列表 */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">科目列表</h2>
        {filteredSubjects.length === 0 ? <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无科目数据</p>
            <Button onClick={() => {
          setFormData({
            name: '',
            credits: '',
            isExamSubject: false
          });
          setShowAddDialog(true);
        }} className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              添加第一个科目
            </Button>
          </div> : <div className="space-y-3">
            {filteredSubjects.map(subject => <div key={subject.id} className={`bg-white rounded-xl p-3 shadow-sm border-l-4 ${subject.isExamSubject ? 'border-l-purple-500' : 'border-l-gray-300'} hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${subject.isExamSubject ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                      {subject.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                        {subject.isExamSubject && <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            转段考
                          </span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calculator className="w-4 h-4" />
                          {subject.credits} 学分
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className={`w-4 h-4 ${subject.isExamSubject ? 'text-purple-500' : 'text-gray-400'}`} />
                          {subject.isExamSubject ? '转段考科目' : '普通科目'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleExamSubject(subject)} className={`p-2 rounded-lg transition ${subject.isExamSubject ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title={subject.isExamSubject ? '取消转段考' : '设为转段考'}>
                      <Star className={`w-4 h-4 ${subject.isExamSubject ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={() => openEditDialog(subject)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition" title="编辑">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDeleteDialog(subject)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>)}
          </div>}
      </div>
      
      {/* 添加科目对话框 */}
      {showAddDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">添加新科目</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">科目名称 *</label>
                <Input placeholder="例如：数学" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} className="w-full" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">学分 *</label>
                <Input type="number" placeholder="例如：4" value={formData.credits} onChange={e => setFormData({
              ...formData,
              credits: e.target.value
            })} className="w-full" />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isExamSubject} onChange={e => setFormData({
                ...formData,
                isExamSubject: e.target.checked
              })} className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm font-medium text-gray-700">设为转段考科目</span>
                </label>
              </div>
              
              <p className="text-xs text-gray-500">
                * 转段考科目将用于转段考试的成绩统计
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={() => {
            setShowAddDialog(false);
            setFormData({
              name: '',
              credits: '',
              isExamSubject: false
            });
          }} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">
                取消
              </Button>
              <Button onClick={handleAddSubject} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                添加
              </Button>
            </div>
          </div>
        </div>}
      
      {/* 编辑科目对话框 */}
      {showEditDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">编辑科目</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">科目名称 *</label>
                <Input placeholder="例如：数学" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} className="w-full" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">学分 *</label>
                <Input type="number" placeholder="例如：4" value={formData.credits} onChange={e => setFormData({
              ...formData,
              credits: e.target.value
            })} className="w-full" />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isExamSubject} onChange={e => setFormData({
                ...formData,
                isExamSubject: e.target.checked
              })} className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm font-medium text-gray-700">设为转段考科目</span>
                </label>
              </div>
              
              <p className="text-xs text-gray-500">
                * 转段考科目将用于转段考试的成绩统计
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={() => {
            setShowEditDialog(false);
            setSelectedSubject(null);
            setFormData({
              name: '',
              credits: '',
              isExamSubject: false
            });
          }} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">
                取消
              </Button>
              <Button onClick={handleEditSubject} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                保存
              </Button>
            </div>
          </div>
        </div>}
      
      {/* 删除确认对话框 */}
      {showDeleteDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">确认删除</h3>
            </div>
            
            <p className="text-gray-600 mb-3">
              确定要删除科目「{selectedSubject?.name}」吗？此操作不可撤销。
            </p>
            
            {selectedSubject?.isExamSubject && <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                <p className="text-sm text-red-600">
                  ⚠️ 该科目是转段考科目，删除后将影响转段考试统计。
                </p>
              </div>}
            
            <div className="flex gap-3">
              <Button onClick={() => {
            setShowDeleteDialog(false);
            setSelectedSubject(null);
          }} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">
                取消
              </Button>
              <Button onClick={handleDeleteSubject} className="flex-1 bg-red-500 text-white hover:bg-red-600">
                删除
              </Button>
            </div>
          </div>
        </div>}
      
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </div>;
}