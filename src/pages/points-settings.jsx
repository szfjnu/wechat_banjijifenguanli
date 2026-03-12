// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Settings2, Target, Plus, Edit2, Trash2, Save, X, TrendingUp, Star, Shield, BookOpen, Heart, Award, Zap, ChevronUp, ChevronDown, CheckCircle, Database, AlertTriangle, Calendar } from 'lucide-react';
// @ts-ignore;
import { getBeijingTimeISO, getBeijingDateString, getBeijingTime } from '@/lib/utils';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
export default function PointsSettings({
  $w,
  className,
  style
}) {
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('points-settings');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };

  // 标签页切换
  const [activeTab, setActiveTab] = useState('points'); // 'points' or 'discipline'

  // 积分项目数据状态
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 处分级别数据状态
  const [disciplineLevels, setDisciplineLevels] = useState([]);
  const [disciplineLoading, setDisciplineLoading] = useState(false);

  // 积分项目对话框状态
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // 处分级别对话框状态
  const [showDisciplineDialog, setShowDisciplineDialog] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState(null);

  // 积分项目表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: 0,
    category: 'positive',
    icon: 'Star',
    enabled: true
  });

  // 处分级别表单状态
  const [disciplineFormData, setDisciplineFormData] = useState({
    level_name: '',
    deduct_points: 0,
    valid_days: 30,
    description: ''
  });

  // 分类选项
  // 分类选项
  const categories = [{
    id: 'positive',
    name: '加分项',
    color: 'green',
    icon: TrendingUp
  }, {
    id: 'negative',
    name: '扣分项',
    color: 'red',
    icon: TrendingUp
  }, {
    id: 'academic',
    name: '学习表现',
    color: 'blue',
    icon: BookOpen
  }, {
    id: 'behavior',
    name: '行为表现',
    color: 'purple',
    icon: Shield
  }, {
    id: 'activity',
    name: '活动参与',
    color: 'orange',
    icon: Heart
  }, {
    id: 'other',
    name: '其他',
    color: 'gray',
    icon: Star
  }];

  // 图标选项
  // 图标选项
  const iconOptions = [{
    id: 'Star',
    icon: Star
  }, {
    id: 'TrendingUp',
    icon: TrendingUp
  }, {
    id: 'BookOpen',
    icon: BookOpen
  }, {
    id: 'Shield',
    icon: Shield
  }, {
    id: 'Heart',
    icon: Heart
  }, {
    id: 'Award',
    icon: Award
  }, {
    id: 'Zap',
    icon: Zap
  }, {
    id: 'Target',
    icon: Target
  }];

  // 加载积分项目数据
  useEffect(() => {
    loadScoreItems();
    loadDisciplineLevels();
  }, []);
  const loadScoreItems = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const result = await tcb.database().collection('score_items').get();
      if (result.data && result.data.length > 0) {
        const transformedItems = result.data.map(item => ({
          id: item._id,
          name: item.item_name,
          description: item.description || '',
          points: item.score_value,
          category: item.item_type === '加分' ? item.score_value > 0 ? 'positive' : 'negative' : 'negative',
          icon: item.icon_name || 'Star',
          enabled: item.is_enabled !== false,
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-CN') : '',
          usageCount: 0 // 需要从 score_records 计算后续添加
        }));
        setItems(transformedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('加载积分项目失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载积分项目',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载处分级别数据
  const loadDisciplineLevels = async () => {
    try {
      setDisciplineLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const result = await tcb.database().collection('discipline_level_config').get();
      if (result.data && result.data.length > 0) {
        // 按扣分值升序排序
        const sortedData = result.data.sort((a, b) => a.deduct_points - b.deduct_points);
        setDisciplineLevels(sortedData);
      } else {
        setDisciplineLevels([]);
      }
    } catch (error) {
      console.error('加载处分级别失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载处分级别',
        variant: 'destructive'
      });
    } finally {
      setDisciplineLoading(false);
    }
  };

  // 打开新增对话框
  // 打开新增对话框
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      points: 0,
      category: 'positive',
      icon: 'Star',
      enabled: true
    });
    setShowEditDialog(true);
  };

  // 打开编辑对话框
  // 打开编辑对话框
  const handleEdit = item => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      points: item.points,
      category: item.category,
      icon: item.icon,
      enabled: item.enabled
    });
    setShowEditDialog(true);
  };

  // 删除项目
  // 删除项目
  const handleDelete = item => {
    if (window.confirm(`确定要删除「${item.name}」这个积分项目吗？`)) {
      setItems(items.filter(i => i.id !== item.id));
      toast({
        title: '删除成功',
        description: '积分项目已删除',
        variant: 'default'
      });
    }
  };

  // 保存项目
  // 保存项目
  const handleSave = async () => {
    // 验证
    if (!formData.name.trim()) {
      toast({
        title: '验证失败',
        description: '请输入项目名称',
        variant: 'destructive'
      });
      return;
    }
    if (formData.points === 0) {
      toast({
        title: '验证失败',
        description: '请设置积分值',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      if (editingItem) {
        // 更新数据库
        await db.collection('score_items').doc(editingItem.id).update({
          item_name: formData.name,
          description: formData.description,
          score_value: formData.points,
          icon_name: formData.icon,
          is_enabled: formData.enabled,
          updated_at: getBeijingTimeISO()
        });

        // 更新前端
        setItems(items.map(item => item.id === editingItem.id ? {
          ...item,
          ...formData,
          updatedAt: getBeijingTimeISO()
        } : item));
        toast({
          title: '更新成功',
          description: '积分项目已更新',
          variant: 'default'
        });
      } else {
        // 新增到数据库
        const result = await db.collection('score_items').add({
          item_name: formData.name,
          description: formData.description,
          score_value: formData.points,
          item_type: formData.points > 0 ? '加分' : '扣分',
          icon_name: formData.icon,
          is_enabled: formData.enabled,
          created_at: getBeijingTimeISO(),
          updated_at: getBeijingTimeISO()
        });

        // 更新前端
        const newItem = {
          id: result.id || result._id,
          ...formData,
          createdAt: getBeijingDateString(),
          usageCount: 0
        };
        setItems([...items, newItem]);
        toast({
          title: '添加成功',
          description: '积分项目已添加',
          variant: 'default'
        });
      }
      setShowEditDialog(false);
    } catch (error) {
      console.error('保存积分项目失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 切换启用状态
  // 切换启用状态
  const handleToggleEnabled = async item => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新数据库中的启用状态
      await db.collection('score_items').doc(item.id).update({
        is_enabled: !item.enabled,
        updated_at: getBeijingTimeISO()
      });

      // 更新前端
      setItems(items.map(i => i.id === item.id ? {
        ...i,
        enabled: !i.enabled
      } : i));
      toast({
        title: '状态已更新',
        description: `项目「${item.name}」已${item.enabled ? '禁用' : '启用'}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('切换启用状态失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 处分级别相关方法
  // 添加处分级别
  const handleAddDiscipline = () => {
    setEditingDiscipline(null);
    setDisciplineFormData({
      level_name: '',
      deduct_points: 0,
      valid_days: 30,
      description: ''
    });
    setShowDisciplineDialog(true);
  };

  // 编辑处分级别
  const handleEditDiscipline = level => {
    setEditingDiscipline(level);
    setDisciplineFormData({
      level_name: level.level_name,
      deduct_points: level.deduct_points,
      valid_days: level.valid_days,
      description: level.description || ''
    });
    setShowDisciplineDialog(true);
  };

  // 删除处分级别
  const handleDeleteDiscipline = async level => {
    console.log('删除处分级别:', level);
    if (!window.confirm(`确定要删除「${level.level_name}」这个处分级别吗？`)) {
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      console.log('删除数据库记录, ID:', level._id);
      await db.collection('discipline_level_config').doc(level._id).remove();
      console.log('删除成功, 更新前端列表');
      setDisciplineLevels(disciplineLevels.filter(l => l._id !== level._id));
      toast({
        title: '删除成功',
        description: '处分级别已删除',
        variant: 'default'
      });
    } catch (error) {
      console.error('删除处分级别失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 保存处分级别
  const handleSaveDiscipline = async () => {
    console.log('开始保存处分级别:', disciplineFormData, editingDiscipline);
    if (!disciplineFormData.level_name.trim()) {
      toast({
        title: '验证失败',
        description: '请输入级别名称',
        variant: 'destructive'
      });
      return;
    }
    if (disciplineFormData.deduct_points === 0) {
      toast({
        title: '验证失败',
        description: '请设置扣分值',
        variant: 'destructive'
      });
      return;
    }
    if (disciplineFormData.valid_days <= 0) {
      toast({
        title: '验证失败',
        description: '请设置有效天数',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      if (editingDiscipline) {
        console.log('更新处分级别, ID:', editingDiscipline._id);
        // 更新数据库
        await db.collection('discipline_level_config').doc(editingDiscipline._id).update({
          level_name: disciplineFormData.level_name,
          deduct_points: disciplineFormData.deduct_points,
          valid_days: disciplineFormData.valid_days,
          description: disciplineFormData.description
        });

        // 更新前端
        const updatedLevels = disciplineLevels.map(level => level._id === editingDiscipline._id ? {
          ...level,
          ...disciplineFormData
        } : level);
        // 按扣分值重新排序
        const sortedLevels = updatedLevels.sort((a, b) => a.deduct_points - b.deduct_points);
        setDisciplineLevels(sortedLevels);
        toast({
          title: '更新成功',
          description: '处分级别已更新',
          variant: 'default'
        });
      } else {
        console.log('新增处分级别');
        // 新增到数据库
        const result = await db.collection('discipline_level_config').add({
          level_name: disciplineFormData.level_name,
          deduct_points: disciplineFormData.deduct_points,
          valid_days: disciplineFormData.valid_days,
          description: disciplineFormData.description
        });
        console.log('新增结果:', result);

        // 更新前端
        const newLevel = {
          _id: result.id || result._id,
          ...disciplineFormData,
          createdAt: getBeijingDateString()
        };
        console.log('新增级别数据:', newLevel);
        // 按扣分值排序后添加
        const sortedLevels = [...disciplineLevels, newLevel].sort((a, b) => a.deduct_points - b.deduct_points);
        setDisciplineLevels(sortedLevels);
        toast({
          title: '添加成功',
          description: '处分级别已添加',
          variant: 'default'
        });
      }
      setShowDisciplineDialog(false);
    } catch (error) {
      console.error('保存处分级别失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 获取分类信息
  // 获取分类信息
  const getCategory = categoryId => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  // 获取图标组件
  // 获取图标组件
  const getIcon = iconId => {
    const iconOption = iconOptions.find(o => o.id === iconId);
    return iconOption ? iconOption.icon : Star;
  };

  // 获取颜色样式
  // 获取颜色样式
  const getColorClasses = category => {
    const colorMap = {
      green: {
        bg: 'from-green-400 to-emerald-500',
        text: 'text-green-600',
        bgLight: 'bg-green-50',
        border: 'border-green-200'
      },
      red: {
        bg: 'from-red-400 to-rose-500',
        text: 'text-red-600',
        bgLight: 'bg-red-50',
        border: 'border-red-200'
      },
      blue: {
        bg: 'from-blue-400 to-indigo-500',
        text: 'text-blue-600',
        bgLight: 'bg-blue-50',
        border: 'border-blue-200'
      },
      purple: {
        bg: 'from-purple-400 to-violet-500',
        text: 'text-purple-600',
        bgLight: 'bg-purple-50',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'from-orange-400 to-amber-500',
        text: 'text-orange-600',
        bgLight: 'bg-orange-50',
        border: 'border-orange-200'
      },
      gray: {
        bg: 'from-gray-400 to-slate-500',
        text: 'text-gray-600',
        bgLight: 'bg-gray-50',
        border: 'border-gray-200'
      }
    };
    return colorMap[category] || colorMap.gray;
  };

  // 统计数据
  const stats = {
    total: items.length,
    enabled: items.filter(i => i.enabled).length,
    positive: items.filter(i => i.points > 0).length,
    negative: items.filter(i => i.points < 0).length,
    totalUsage: items.reduce((sum, i) => sum + (i.usageCount || 0), 0)
  };

  // 处分级别统计
  const disciplineStats = {
    total: disciplineLevels.length,
    avgDeductPoints: disciplineLevels.length > 0 ? Math.round(disciplineLevels.reduce((sum, l) => sum + l.deduct_points, 0) / disciplineLevels.length) : 0,
    avgValidDays: disciplineLevels.length > 0 ? Math.round(disciplineLevels.reduce((sum, l) => sum + l.valid_days, 0) / disciplineLevels.length) : 0
  };
  return <div className="min-h-screen bg-gray-50 pb-16" style={style}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white pt-6 pb-8 px-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Settings2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">系统设置</h1>
                <p className="text-sm text-white/80">管理积分项目和处分级别</p>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 flex gap-1">
            <button onClick={() => setActiveTab('points')} className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${activeTab === 'points' ? 'bg-white text-emerald-600 shadow-md' : 'text-white/80 hover:text-white'}`}>
              积分项目
            </button>
            <button onClick={() => setActiveTab('discipline')} className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${activeTab === 'discipline' ? 'bg-white text-emerald-600 shadow-md' : 'text-white/80 hover:text-white'}`}>
              处分级别
            </button>
          </div>
          
          {/* Stats Cards - 积分项目 */}
          {activeTab === 'points' && <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              <StatCard title="项目总数" value={stats.total} icon={Database} color="teal" />
              <StatCard title="已启用" value={stats.enabled} icon={CheckCircle} color="green" />
              <StatCard title="加分项" value={stats.positive} icon={TrendingUp} color="amber" />
              <StatCard title="使用次数" value={stats.totalUsage} icon={Shield} color="blue" />
            </div>}
          
          {/* Stats Cards - 处分级别 */}
          {activeTab === 'discipline' && <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              <StatCard title="级别总数" value={disciplineStats.total} icon={AlertTriangle} color="orange" />
              <StatCard title="平均扣分" value={disciplineStats.avgDeductPoints} icon={Shield} color="red" />
              <StatCard title="平均天数" value={disciplineStats.avgValidDays} icon={Calendar} color="blue" />
            </div>}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 积分项目内容 */}
        {activeTab === 'points' && <>
            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-600">筛选：</span>
                <div className="flex items-center gap-2">
                  {categories.map(cat => {
                const Icon = cat.icon;
                return <button key={cat.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${cat.id === 'all' ? 'bg-gray-100 text-gray-700' : ''}`}>
                      <Icon className={`w-4 h-4 ${cat.id === 'positive' ? 'text-green-600' : cat.id === 'negative' ? 'text-red-600' : 'text-gray-500'}`} />
                      <span>{cat.name}</span>
                    </button>;
              })}
                </div>
              </div>
            </div>
            
            {/* Add Button */}
            <div className="mb-4">
              <button onClick={handleAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors shadow-md">
                <Plus className="w-5 h-5" />
                添加积分项目
              </button>
            </div>
            
            {/* Items List */}
            <div className="space-y-4">
              {items.map(item => {
            const category = getCategory(item.category);
            const Icon = getIcon(item.icon);
            const colors = getColorClasses(category.color);
            return <div key={item.id} className={`bg-white rounded-xl shadow-sm p-4 transition-all duration-200 hover:shadow-md ${!item.enabled ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${category.id === 'positive' ? 'bg-green-100 text-green-700' : category.id === 'negative' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {item.points > 0 ? `+${item.points}` : item.points} 分
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              使用 {item.usageCount} 次
                            </span>
                            <span>创建于 {item.createdAt}</span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleEnabled(item)} className={`p-2 rounded-lg transition-colors ${item.enabled ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title={item.enabled ? '禁用' : '启用'}>
                            {item.enabled ? <Shield className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleEdit(item)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>;
          })}
              
              {items.length === 0 && <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">暂无积分项目</p>
                  <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors">
                    <Plus className="w-5 h-5" />
                    添加第一个项目
                  </button>
                </div>}
            </div>
          </>}
        
        {/* 处分级别内容 */}
        {activeTab === 'discipline' && <>
            {/* Add Button */}
            <div className="mb-4">
              <button onClick={handleAddDiscipline} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-md">
                <Plus className="w-5 h-5" />
                添加处分级别
              </button>
            </div>
            
            {/* Discipline Levels List */}
            <div className="space-y-4">
              {disciplineLevels.map(level => {
            return <div key={level._id} className="bg-white rounded-xl shadow-sm p-4 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0`}>
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-800">{level.level_name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700`}>
                                扣{level.deduct_points}分
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{level.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                有效期 {level.valid_days} 天
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditDiscipline(level)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteDiscipline(level)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>;
          })}
              
              {disciplineLevels.length === 0 && <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">暂无处分级别</p>
                  <button onClick={handleAddDiscipline} className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                    <Plus className="w-5 h-5" />
                    添加第一个级别
                  </button>
                </div>}
            </div>
          </>}
      </div>
      
      {/* Edit/Add Dialog */}
      {showEditDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingItem ? '编辑积分项目' : '添加积分项目'}</h2>
                <button onClick={() => setShowEditDialog(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  项目名称 <span className="text-red-500">*</span>
                </label>
                <input type="text" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} placeholder="输入项目名称" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              
              {/* 描述 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  描述说明
                </label>
                <textarea value={formData.description} onChange={e => setFormData({
              ...formData,
              description: e.target.value
            })} placeholder="描述这个积分项目的具体内容" rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              
              {/* 积分值 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  积分值 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setFormData({
                ...formData,
                points: formData.points - 1
              })} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </button>
                  <input type="number" value={formData.points} onChange={e => setFormData({
                ...formData,
                points: parseInt(e.target.value) || 0
              })} className="w-20 text-center text-2xl font-bold px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button type="button" onClick={() => setFormData({
                ...formData,
                points: formData.points + 1
              })} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500">正数为加分，负数为扣分</span>
                </div>
              </div>
              
              {/* 分类 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  所属分类
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => {
                const Icon = cat.icon;
                return <button key={cat.id} type="button" onClick={() => setFormData({
                  ...formData,
                  category: cat.id
                })} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${formData.category === cat.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <Icon className={`w-4 h-4 ${cat.id === 'positive' ? 'text-green-600' : cat.id === 'negative' ? 'text-red-600' : 'text-gray-500'}`} />
                      <span className="text-sm">{cat.name}</span>
                    </button>;
              })}
                </div>
              </div>
              
              {/* 图标 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  选择图标
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(iconOpt => {
                const Icon = iconOpt.icon;
                return <button key={iconOpt.id} type="button" onClick={() => setFormData({
                  ...formData,
                  icon: iconOpt.id
                })} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${formData.icon === iconOpt.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <Icon className={`w-5 h-5 ${formData.icon === iconOpt.id ? 'text-emerald-600' : 'text-gray-500'}`} />
                    </button>;
              })}
                </div>
              </div>
              
              {/* 启用开关 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-700">立即启用</div>
                  <div className="text-sm text-gray-500">是否在积分记录中使用此项目</div>
                </div>
                <button type="button" onClick={() => setFormData({
              ...formData,
              enabled: !formData.enabled
            })} className={`w-12 h-6 rounded-full transition-colors relative ${formData.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${formData.enabled ? 'left-6.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowEditDialog(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                  取消
                </button>
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-colors font-semibold flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingItem ? '更新' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>}
      
      {/* Edit/Add Dialog - 处分级别 */}
      {showDisciplineDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingDiscipline ? '编辑处分级别' : '添加处分级别'}</h2>
                <button onClick={() => setShowDisciplineDialog(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 级别名称 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  级别名称 <span className="text-red-500">*</span>
                </label>
                <input type="text" value={disciplineFormData.level_name} onChange={e => setDisciplineFormData({
              ...disciplineFormData,
              level_name: e.target.value
            })} placeholder="例如：警告、记过等" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              
              {/* 扣分值 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  扣分值 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setDisciplineFormData({
                ...disciplineFormData,
                deduct_points: Math.max(0, disciplineFormData.deduct_points - 1)
              })} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </button>
                  <input type="number" value={disciplineFormData.deduct_points} onChange={e => setDisciplineFormData({
                ...disciplineFormData,
                deduct_points: Math.max(0, parseInt(e.target.value) || 0)
              })} className="w-20 text-center text-2xl font-bold px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <button type="button" onClick={() => setDisciplineFormData({
                ...disciplineFormData,
                deduct_points: disciplineFormData.deduct_points + 1
              })} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500">该处分级别对应的扣分值</span>
                </div>
              </div>
              
              {/* 有效天数 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  有效天数 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setDisciplineFormData({
                ...disciplineFormData,
                valid_days: Math.max(1, disciplineFormData.valid_days - 1)
              })} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </button>
                  <input type="number" value={disciplineFormData.valid_days} onChange={e => setDisciplineFormData({
                ...disciplineFormData,
                valid_days: Math.max(1, parseInt(e.target.value) || 0)
              })} className="w-20 text-center text-2xl font-bold px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <button type="button" onClick={() => setDisciplineFormData({
                ...disciplineFormData,
                valid_days: disciplineFormData.valid_days + 10
              })} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500">处分记录的有效期</span>
                </div>
              </div>
              
              {/* 描述 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  描述说明
                </label>
                <textarea value={disciplineFormData.description} onChange={e => setDisciplineFormData({
              ...disciplineFormData,
              description: e.target.value
            })} placeholder="描述这个处分级别的具体情况" rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowDisciplineDialog(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                  取消
                </button>
                <button onClick={handleSaveDiscipline} className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingDiscipline ? '更新' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>}
      
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        {/* 底部导航栏 */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </div>;
}