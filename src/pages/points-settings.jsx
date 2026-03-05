// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Settings2, Target, Plus, Edit2, Trash2, Save, X, TrendingUp, Star, Shield, BookOpen, Heart, Award, Zap, ChevronUp, ChevronDown, CheckCircle, Database } from 'lucide-react';

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

  // 数据状态
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 对话框状态
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: 0,
    category: 'positive',
    icon: 'Star',
    enabled: true
  });

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

  // 初始化示例数据
  useEffect(() => {
    loadInitialData();
  }, []);
  const loadInitialData = () => {
    const initialItems = [{
      id: 1,
      name: '课堂表现优秀',
      description: '积极发言、认真听讲、完成课堂任务',
      points: 2,
      category: 'positive',
      icon: 'Star',
      enabled: true,
      createdAt: '2026-03-03',
      usageCount: 45
    }, {
      id: 2,
      name: '作业完成',
      description: '按时、高质量完成作业',
      points: 1,
      category: 'academic',
      icon: 'BookOpen',
      enabled: true,
      createdAt: '2026-03-03',
      usageCount: 128
    }, {
      id: 3,
      name: '迟到',
      description: '上课迟到，每次扣分',
      points: -1,
      category: 'negative',
      icon: 'TrendingUp',
      enabled: true,
      createdAt: '2026-03-03',
      usageCount: 23
    }, {
      id: 4,
      name: '志愿活动参与',
      description: '参与班级或学校志愿活动',
      points: 3,
      category: 'activity',
      icon: 'Heart',
      enabled: true,
      createdAt: '2026-03-03',
      usageCount: 67
    }, {
      id: 5,
      name: '违纪行为',
      description: '违反课堂纪律或校规校纪',
      points: -2,
      category: 'negative',
      icon: 'Shield',
      enabled: true,
      createdAt: '2026-03-03',
      usageCount: 15
    }, {
      id: 6,
      name: '优秀作业',
      description: '作业被评为优秀',
      points: 2,
      category: 'academic',
      icon: 'Award',
      enabled: true,
      createdAt: '2026-03-03',
      usageCount: 89
    }, {
      id: 7,
      name: '积极参与讨论',
      description: '在讨论环节积极参与并贡献观点',
      points: 1,
      category: 'positive',
      icon: 'Zap',
      enabled: true,
      createdAt: '2026-03-03',
      usageCount: 156
    }, {
      id: 8,
      name: '帮助同学',
      description: '主动帮助同学解决问题',
      points: 2,
      category: 'positive',
      icon: 'Heart',
      enabled: true,
      createdAt: '2026-03-03',
      usageCount: 34
    }];
    setItems(initialItems);
  };

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
  const handleSave = () => {
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
    if (editingItem) {
      // 更新
      setItems(items.map(item => item.id === editingItem.id ? {
        ...item,
        ...formData,
        updatedAt: new Date().toISOString()
      } : item));
      toast({
        title: '更新成功',
        description: '积分项目已更新',
        variant: 'default'
      });
    } else {
      // 新增
      const newItem = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
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
  };

  // 切换启用状态
  const handleToggleEnabled = item => {
    setItems(items.map(i => i.id === item.id ? {
      ...i,
      enabled: !i.enabled
    } : i));
    toast({
      title: '状态已更新',
      description: `项目「${item.name}」已${item.enabled ? '禁用' : '启用'}`,
      variant: 'default'
    });
  };

  // 获取分类信息
  const getCategory = categoryId => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  // 获取图标组件
  const getIcon = iconId => {
    const iconOption = iconOptions.find(o => o.id === iconId);
    return iconOption ? iconOption.icon : Star;
  };

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
                <h1 className="text-2xl font-bold">积分项目设置</h1>
                <p className="text-sm text-white/80">管理日常积分项目及其规则</p>
              </div>
            </div>
            <button onClick={handleAdd} className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-md">
              <Plus className="w-5 h-5" />
              添加项目
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <StatCard title="项目总数" value={stats.total} icon={Database} color="teal" />
            <StatCard title="已启用" value={stats.enabled} icon={CheckCircle} color="green" />
            <StatCard title="加分项" value={stats.positive} icon={TrendingUp} color="amber" />
            <StatCard title="使用次数" value={stats.totalUsage} icon={Shield} color="blue" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
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
      
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        {/* 底部导航栏 */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </div>;
}