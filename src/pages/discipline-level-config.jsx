// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { AlertTriangle, Plus, Edit2, Trash2, Save, X, Calendar, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function DisciplineLevelConfig({
  $w,
  className,
  style
}) {
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('discipline-level-config');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };

  // 数据状态
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  // 对话框状态
  const [showDialog, setShowDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);

  // 表单状态
  const [formData, setFormData] = useState({
    level_name: '',
    deduct_points: 0,
    valid_days: 30,
    description: ''
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 加载处分级别数据
      const result = await db.collection('discipline_level_config').orderBy('deduct_points', 'asc').get();
      if (result.data && result.data.length > 0) {
        setLevels(result.data);
      } else {
        setLevels([]);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载数据，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理新增
  const handleAdd = () => {
    setEditingLevel(null);
    setFormData({
      level_name: '',
      deduct_points: 0,
      valid_days: 30,
      description: ''
    });
    setShowDialog(true);
  };

  // 处理编辑
  const handleEdit = level => {
    setEditingLevel(level);
    setFormData({
      level_name: level.level_name || '',
      deduct_points: level.deduct_points || 0,
      valid_days: level.valid_days || 30,
      description: level.description || ''
    });
    setShowDialog(true);
  };

  // 处理删除
  const handleDelete = async level => {
    if (!window.confirm(`确定要删除处分级别"${level.level_name}"吗？`)) {
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 删除记录
      await db.collection('discipline_level_config').doc(level._id).remove();

      // 重新加载数据
      await loadData();
      toast({
        title: '删除成功',
        description: '处分级别已删除'
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '无法删除处分级别',
        variant: 'destructive'
      });
    }
  };

  // 处理保存
  const handleSave = async () => {
    // 验证必填字段
    if (!formData.level_name || formData.level_name.trim() === '') {
      toast({
        title: '验证失败',
        description: '请输入级别名称',
        variant: 'destructive'
      });
      return;
    }
    if (formData.deduct_points < 0) {
      toast({
        title: '验证失败',
        description: '扣分值不能为负数',
        variant: 'destructive'
      });
      return;
    }
    if (formData.valid_days < 1) {
      toast({
        title: '验证失败',
        description: '有效天数必须大于0',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      if (editingLevel) {
        // 更新现有记录
        await db.collection('discipline_level_config').doc(editingLevel._id).update({
          level_name: formData.level_name,
          deduct_points: formData.deduct_points,
          valid_days: formData.valid_days,
          description: formData.description
        });
        toast({
          title: '更新成功',
          description: '处分级别已更新'
        });
      } else {
        // 新增记录
        await db.collection('discipline_level_config').add({
          level_name: formData.level_name,
          deduct_points: formData.deduct_points,
          valid_days: formData.valid_days,
          description: formData.description
        });
        toast({
          title: '创建成功',
          description: '处分级别已创建'
        });
      }

      // 关闭对话框并重新加载数据
      setShowDialog(false);
      await loadData();
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '无法保存处分级别',
        variant: 'destructive'
      });
    }
  };

  // 根据扣分值获取严重程度样式
  const getSeverityStyle = points => {
    if (points >= 20) {
      return {
        bg: 'from-red-400 to-red-600',
        badge: 'bg-red-100 text-red-700',
        text: 'text-red-600'
      };
    } else if (points >= 10) {
      return {
        bg: 'from-orange-400 to-orange-600',
        badge: 'bg-orange-100 text-orange-700',
        text: 'text-orange-600'
      };
    } else {
      return {
        bg: 'from-yellow-400 to-yellow-600',
        badge: 'bg-yellow-100 text-yellow-700',
        text: 'text-yellow-600'
      };
    }
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => $w.utils.navigateTo({
          pageId: 'discipline',
          params: {}
        })} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">处分级别配置</h1>
              <p className="text-white/80 text-sm">管理处分级别、扣分值和有效期</p>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{levels.length}</div>
            <div className="text-white/80 text-sm">级别总数</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{levels.reduce((sum, l) => sum + (l.deduct_points || 0), 0)}</div>
            <div className="text-white/80 text-sm">最大扣分值</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{levels.reduce((max, l) => Math.max(max, l.valid_days || 0), 0)}</div>
            <div className="text-white/80 text-sm">最大有效期（天）</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Add Button */}
        <div className="mb-4">
          <button onClick={handleAdd} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-md">
            <Plus className="w-5 h-5" />
            添加处分级别
          </button>
        </div>

        {/* Loading State */}
        {loading && <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500">加载中...</p>
          </div>}

        {/* Levels List */}
        {!loading && <div className="space-y-4">
            {levels.map(level => {
          const severityStyle = getSeverityStyle(level.deduct_points);
          return <div key={level._id} className="bg-white rounded-xl shadow-sm p-4 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${severityStyle.bg} flex items-center justify-center flex-shrink-0`}>
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-800">{level.level_name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${severityStyle.badge}`}>
                              扣{level.deduct_points}分
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{level.description || '暂无描述'}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              有效期 {level.valid_days} 天
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(level)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="编辑">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(level)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="删除">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>;
        })}

            {/* Empty State */}
            {levels.length === 0 && <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">暂无处分级别</p>
                <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  <Plus className="w-5 h-5" />
                  添加第一个级别
                </button>
              </div>}
          </div>}
      </div>

      {/* Edit/Add Dialog */}
      {showDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingLevel ? '编辑处分级别' : '添加处分级别'}</h2>
                <button onClick={() => setShowDialog(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dialog Body */}
            <div className="p-6 space-y-6">
              {/* 级别名称 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  级别名称 <span className="text-red-500">*</span>
                </label>
                <input type="text" value={formData.level_name} onChange={e => setFormData({
              ...formData,
              level_name: e.target.value
            })} placeholder="例如：警告、记过等" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              {/* 扣分值 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  扣分值 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setFormData({
                ...formData,
                deduct_points: Math.max(0, formData.deduct_points - 1)
              })} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </button>
                  <input type="number" value={formData.deduct_points} onChange={e => setFormData({
                ...formData,
                deduct_points: Math.max(0, parseInt(e.target.value) || 0)
              })} className="w-20 text-center text-2xl font-bold px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <button type="button" onClick={() => setFormData({
                ...formData,
                deduct_points: formData.deduct_points + 1
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
                  <button type="button" onClick={() => setFormData({
                ...formData,
                valid_days: Math.max(1, formData.valid_days - 10)
              })} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </button>
                  <input type="number" value={formData.valid_days} onChange={e => setFormData({
                ...formData,
                valid_days: Math.max(1, parseInt(e.target.value) || 0)
              })} className="w-20 text-center text-2xl font-bold px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <button type="button" onClick={() => setFormData({
                ...formData,
                valid_days: formData.valid_days + 10
              })} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500">处分记录的有效期（天）</span>
                </div>
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  描述说明
                </label>
                <textarea value={formData.description} onChange={e => setFormData({
              ...formData,
              description: e.target.value
            })} placeholder="描述这个处分级别的具体情况" rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowDialog(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                  取消
                </button>
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-colors font-semibold flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingLevel ? '更新' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>}

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </div>;
}