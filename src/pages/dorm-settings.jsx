// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Textarea, Button, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui';
// @ts-ignore;
import { Settings, Plus, Edit2, Trash2, Check, X, Calendar, Info, AlertTriangle, Save, RefreshCw, Filter, Search } from 'lucide-react';
// @ts-ignore;
import { getBeijingDateString } from '@/lib/utils';

export default function DormSettingsPage(props) {
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 积分配置状态
  const [configList, setConfigList] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configForm, setConfigForm] = useState({
    config_name: '',
    deduction_ratio: 0.5,
    addition_ratio: 1,
    semester_id: '',
    semester_name: '',
    effective_date: '',
    expiry_date: '',
    is_enabled: true,
    description: '',
    remarks: ''
  });

  // 扣分项状态
  const [deductionItems, setDeductionItems] = useState([]);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    item_name: '',
    category: '卫生',
    points: 3,
    point_type: 'deduction',
    is_enabled: true,
    description: '',
    severity: '一般',
    frequency: '每周检查'
  });

  // 筛选状态
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 加载积分配置列表
  const loadConfigList = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('dorm_point_config').get();
      setConfigList(result.data || []);
      if (result.data && result.data.length > 0) {
        const enabled = result.data.find(c => c.is_enabled);
        setSelectedConfig(enabled || result.data[0]);
      }
    } catch (error) {
      console.error('加载积分配置失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载积分配置列表',
        variant: 'destructive'
      });
    }
  };

  // 加载扣分项列表
  const loadDeductionItems = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('dorm_deduction_items').get();
      setDeductionItems(result.data || []);
    } catch (error) {
      console.error('加载扣分项失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载扣分项列表',
        variant: 'destructive'
      });
    }
  };

  // 保存积分配置
  const saveConfig = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = Date.now();
      const userId = $w.auth.currentUser?.userId || 'anonymous';
      if (editingItem) {
        // 更新现有配置
        await db.collection('dorm_point_config').doc(editingItem._id).update({
          ...configForm,
          updatedAt: now
        });
        toast({
          title: '配置已更新'
        });
      } else {
        // 创建新配置
        const config_id = `cfg_${now}`;
        await db.collection('dorm_point_config').add({
          config_id,
          ...configForm,
          creator: userId,
          createdAt: now,
          updatedAt: now
        });
        toast({
          title: '配置已创建'
        });
      }
      setShowConfigDialog(false);
      loadConfigList();
    } catch (error) {
      console.error('保存配置失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '无法保存配置',
        variant: 'destructive'
      });
    }
  };

  // 删除配置
  const deleteConfig = async configId => {
    if (!confirm('确定要删除此配置吗？')) return;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('dorm_point_config').doc(configId).remove();
      toast({
        title: '配置已删除'
      });
      loadConfigList();
    } catch (error) {
      console.error('删除配置失败:', error);
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 启用/禁用配置
  const toggleConfig = async config => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      if (config.is_enabled) {
        // 禁用当前配置
        await db.collection('dorm_point_config').doc(config._id).update({
          is_enabled: false,
          updatedAt: Date.now()
        });
      } else {
        // 先禁用所有配置
        await db.collection('dorm_point_config').where({
          is_enabled: true
        }).update({
          is_enabled: false
        });

        // 启用当前配置
        await db.collection('dorm_point_config').doc(config._id).update({
          is_enabled: true,
          updatedAt: Date.now()
        });
      }
      toast({
        title: config.is_enabled ? '配置已禁用' : '配置已启用'
      });
      loadConfigList();
    } catch (error) {
      console.error('切换配置状态失败:', error);
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 打开配置编辑对话框
  const openConfigDialog = (config = null) => {
    if (config) {
      setEditingItem(config);
      setConfigForm({
        config_name: config.config_name || '',
        deduction_ratio: config.deduction_ratio || 0.5,
        addition_ratio: config.addition_ratio || 1,
        semester_id: config.semester_id || '',
        semester_name: config.semester_name || '',
        effective_date: config.effective_date || '',
        expiry_date: config.expiry_date || '',
        is_enabled: config.is_enabled !== false,
        description: config.description || '',
        remarks: config.remarks || ''
      });
    } else {
      setEditingItem(null);
      setConfigForm({
        config_name: '',
        deduction_ratio: 0.5,
        addition_ratio: 1,
        semester_id: '',
        semester_name: '',
        effective_date: getBeijingDateString(),
        expiry_date: '',
        is_enabled: true,
        description: '',
        remarks: ''
      });
    }
    setShowConfigDialog(true);
  };

  // 保存扣分项
  const saveDeductionItem = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = Date.now();
      const configId = selectedConfig?.config_id || '';
      if (editingItem) {
        await db.collection('dorm_deduction_items').doc(editingItem._id).update({
          ...itemForm,
          config_id: configId,
          updatedAt: now
        });
        toast({
          title: '扣分项已更新'
        });
      } else {
        const item_id = `item_${now}`;
        await db.collection('dorm_deduction_items').add({
          item_id,
          config_id: configId,
          ...itemForm,
          createdAt: now,
          updatedAt: now
        });
        toast({
          title: '扣分项已添加'
        });
      }
      setShowItemDialog(false);
      loadDeductionItems();
    } catch (error) {
      console.error('保存扣分项失败:', error);
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 删除扣分项
  const deleteDeductionItem = async itemId => {
    if (!confirm('确定要删除此扣分项吗？')) return;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('dorm_deduction_items').doc(itemId).remove();
      toast({
        title: '扣分项已删除'
      });
      loadDeductionItems();
    } catch (error) {
      console.error('删除扣分项失败:', error);
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 打开扣分项编辑对话框
  const openItemDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        item_name: item.item_name || '',
        category: item.category || '卫生',
        points: item.points || 3,
        point_type: item.point_type || 'deduction',
        is_enabled: item.is_enabled !== false,
        description: item.description || '',
        severity: item.severity || '一般',
        frequency: item.frequency || '每周检查'
      });
    } else {
      setEditingItem(null);
      setItemForm({
        item_name: '',
        category: '卫生',
        points: 3,
        point_type: 'deduction',
        is_enabled: true,
        description: '',
        severity: '一般',
        frequency: '每周检查'
      });
    }
    setShowItemDialog(true);
  };

  // 筛选扣分项
  const filteredItems = deductionItems.filter(item => {
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchType = filterType === 'all' || item.point_type === filterType;
    const matchSearch = searchTerm === '' || item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchType && matchSearch;
  });

  // 类别列表
  const categories = [...new Set(deductionItems.map(item => item.category))];
  useEffect(() => {
    loadConfigList();
    loadDeductionItems();
  }, []);
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-['Noto_Sans_SC']">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white py-8 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-8 h-8" strokeWidth={2} />
                <h1 className="text-3xl font-bold tracking-tight">宿舍管理设置</h1>
              </div>
              <p className="text-slate-300 text-lg">配置积分转换规则和管理扣分项目</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 text-white" onClick={() => {
              loadConfigList();
              loadDeductionItems();
              toast({
                title: '数据已刷新'
              });
            }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新数据
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6" onClick={() => openConfigDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                新增配置
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 当前生效配置卡片 */}
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" strokeWidth={2} />
                <CardTitle className="text-xl text-slate-800">当前生效配置</CardTitle>
              </div>
              {selectedConfig && <Badge className="bg-emerald-500 hover:bg-emerald-600">
                  <Check className="w-3 h-3 mr-1" />
                  已启用
                </Badge>}
            </div>
            <CardDescription className="text-slate-600">
              当前正在使用的积分转换规则，所有新的宿舍评分将按此规则计算
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {selectedConfig ? <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2} />
                      <span className="font-semibold text-slate-800">扣分转换比例</span>
                    </div>
                    <div className="text-3xl font-bold text-red-600 font-['Space_Mono']">
                      1 : {selectedConfig.deduction_ratio}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">宿舍扣1分 = 综合积分扣{selectedConfig.deduction_ratio}分</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                      <span className="font-semibold text-slate-800">加分转换比例</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-600 font-['Space_Mono']">
                      1 : {selectedConfig.addition_ratio}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">宿舍加1分 = 综合积分加{selectedConfig.addition_ratio}分</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="text-slate-600 mb-1">配置名称</div>
                    <div className="font-semibold text-slate-800">{selectedConfig.config_name}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="text-slate-600 mb-1">生效日期</div>
                    <div className="font-semibold text-slate-800">{selectedConfig.effective_date}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="text-slate-600 mb-1">失效日期</div>
                    <div className="font-semibold text-slate-800">{selectedConfig.expiry_date || '未设置'}</div>
                  </div>
                </div>

                {selectedConfig.description && <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <strong className="mr-2">说明：</strong>
                      {selectedConfig.description}
                    </div>
                  </div>}
              </div> : <div className="text-center py-8 text-slate-500">
                <Settings className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>暂无生效配置，请新增配置并启用</p>
              </div>}
          </CardContent>
        </Card>

        {/* 配置历史列表 */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
            <CardTitle className="text-xl text-slate-800">配置历史</CardTitle>
            <CardDescription>
              所有的积分配置历史记录，可以编辑或删除
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">配置名称</TableHead>
                  <TableHead className="font-semibold text-slate-700">扣分比例</TableHead>
                  <TableHead className="font-semibold text-slate-700">加分比例</TableHead>
                  <TableHead className="font-semibold text-slate-700">生效日期</TableHead>
                  <TableHead className="font-semibold text-slate-700">状态</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configList.map(config => <TableRow key={config._id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-800">{config.config_name}</TableCell>
                    <TableCell className="text-red-600 font-mono">{config.deduction_ratio}</TableCell>
                    <TableCell className="text-emerald-600 font-mono">{config.addition_ratio}</TableCell>
                    <TableCell className="text-slate-600">{config.effective_date}</TableCell>
                    <TableCell>
                      <Badge className={config.is_enabled ? 'bg-emerald-500' : 'bg-slate-400'}>
                        {config.is_enabled ? '已启用' : '已禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => openConfigDialog(config)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className={config.is_enabled ? 'text-slate-400' : 'text-emerald-600 hover:bg-emerald-50'} onClick={() => toggleConfig(config)} disabled={config.is_enabled}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => deleteConfig(config._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 扣分项管理 */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800">扣分项管理</CardTitle>
                <CardDescription>
                  管理宿舍卫生、纪律等扣分项目，支持添加、编辑和删除
                </CardDescription>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6" onClick={() => openItemDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                添加扣分项
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 筛选工具栏 */}
            <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600" strokeWidth={2} />
                <span className="text-sm font-medium text-slate-700">筛选：</span>
              </div>
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="deduction">扣分</SelectItem>
                    <SelectItem value="addition">加分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex items-center gap-2 ml-4">
                <Search className="w-4 h-4 text-slate-400" strokeWidth={2} />
                <Input placeholder="搜索扣分项名称或描述..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />
              </div>
            </div>

            {/* 扣分项表格 */}
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">项目名称</TableHead>
                  <TableHead className="font-semibold text-slate-700">类别</TableHead>
                  <TableHead className="font-semibold text-slate-700">积分值</TableHead>
                  <TableHead className="font-semibold text-slate-700">类型</TableHead>
                  <TableHead className="font-semibold text-slate-700">严重程度</TableHead>
                  <TableHead className="font-semibold text-slate-700">检查频率</TableHead>
                  <TableHead className="font-semibold text-slate-700">状态</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => <TableRow key={item._id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-800">{item.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono font-semibold ${item.point_type === 'deduction' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {item.point_type === 'deduction' ? '-' : '+'}{item.points}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={item.point_type === 'deduction' ? 'bg-red-500' : 'bg-emerald-500'}>
                        {item.point_type === 'deduction' ? '扣分' : '加分'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.severity === '严重' ? 'destructive' : item.severity === '一般' ? 'secondary' : 'outline'}>
                        {item.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{item.frequency}</TableCell>
                    <TableCell>
                      <Badge className={item.is_enabled ? 'bg-emerald-500' : 'bg-slate-400'}>
                        {item.is_enabled ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => openItemDialog(item)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => deleteDeductionItem(item._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 配置编辑对话框 */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingItem ? '编辑积分配置' : '新增积分配置'}
            </DialogTitle>
            <DialogDescription>
              配置宿舍扣分/加分转换为综合积分的比例和生效时间
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>配置名称 *</Label>
                <Input value={configForm.config_name} onChange={e => setConfigForm({
                ...configForm,
                config_name: e.target.value
              })} placeholder="如：2024-2025学年第一学期宿舍积分配置" />
              </div>
              <div>
                <Label>学期名称</Label>
                <Input value={configForm.semester_name} onChange={e => setConfigForm({
                ...configForm,
                semester_name: e.target.value
              })} placeholder="如：2024-2025学年第一学期" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                <Label className="font-semibold text-slate-800 mb-2 block">扣分转换比例</Label>
                <div className="flex items-center gap-3">
                  <span className="text-lg text-slate-700">宿舍扣</span>
                  <Input type="number" step="0.1" value={1} disabled className="w-16 text-center" />
                  <span className="text-lg text-slate-700">分 = 综合积分扣</span>
                  <Input type="number" step="0.1" min="0" value={configForm.deduction_ratio} onChange={e => setConfigForm({
                  ...configForm,
                  deduction_ratio: parseFloat(e.target.value) || 0
                })} className="w-20 text-center" />
                  <span className="text-lg text-slate-700">分</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">建议设置在 0.5-1 之间</p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                <Label className="font-semibold text-slate-800 mb-2 block">加分转换比例</Label>
                <div className="flex items-center gap-3">
                  <span className="text-lg text-slate-700">宿舍加</span>
                  <Input type="number" step="0.1" value={1} disabled className="w-16 text-center" />
                  <span className="text-lg text-slate-700">分 = 综合积分加</span>
                  <Input type="number" step="0.1" min="0" value={configForm.addition_ratio} onChange={e => setConfigForm({
                  ...configForm,
                  addition_ratio: parseFloat(e.target.value) || 0
                })} className="w-20 text-center" />
                  <span className="text-lg text-slate-700">分</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">建议设置在 1-2 之间</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>生效日期 *</Label>
                <Input type="date" value={configForm.effective_date} onChange={e => setConfigForm({
                ...configForm,
                effective_date: e.target.value
              })} />
              </div>
              <div>
                <Label>失效日期</Label>
                <Input type="date" value={configForm.expiry_date} onChange={e => setConfigForm({
                ...configForm,
                expiry_date: e.target.value
              })} />
              </div>
            </div>

            <div>
              <Label>配置说明</Label>
              <Textarea value={configForm.description} onChange={e => setConfigForm({
              ...configForm,
              description: e.target.value
            })} placeholder="描述此配置的适用范围和注意事项" rows={3} />
            </div>

            <div>
              <Label>备注</Label>
              <Textarea value={configForm.remarks} onChange={e => setConfigForm({
              ...configForm,
              remarks: e.target.value
            })} placeholder="其他备注信息" rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              取消
            </Button>
            <Button onClick={saveConfig} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 扣分项编辑对话框 */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingItem ? '编辑扣分项' : '添加扣分项'}
            </DialogTitle>
            <DialogDescription>
              配置宿舍卫生、纪律等扣分或加分项目的详细规则
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>项目名称 *</Label>
              <Input value={itemForm.item_name} onChange={e => setItemForm({
              ...itemForm,
              item_name: e.target.value
            })} placeholder="如：卫生未打扫、宿舍内吸烟等" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>类别</Label>
                <Select value={itemForm.category} onValueChange={val => setItemForm({
                ...itemForm,
                category: val
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="卫生">卫生</SelectItem>
                    <SelectItem value="纪律">纪律</SelectItem>
                    <SelectItem value="安全">安全</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>积分类型</Label>
                <Select value={itemForm.point_type} onValueChange={val => setItemForm({
                ...itemForm,
                point_type: val
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deduction">扣分</SelectItem>
                    <SelectItem value="addition">加分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
              <Label className="font-semibold text-slate-800 mb-3 block">积分值 *</Label>
              <div className="flex items-center gap-3">
                <span className="text-lg text-slate-700">此项目</span>
                <Select value={itemForm.point_type} onValueChange={val => setItemForm({
                ...itemForm,
                point_type: val
              })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deduction">扣分</SelectItem>
                    <SelectItem value="addition">加分</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" step="0.5" min="0" value={itemForm.points} onChange={e => setItemForm({
                ...itemForm,
                points: parseFloat(e.target.value) || 0
              })} className="w-24 text-center" />
                <span className="text-lg text-slate-700">分</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">一般项目：3-10分，严重项目：10-20分</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>严重程度</Label>
                <Select value={itemForm.severity} onValueChange={val => setItemForm({
                ...itemForm,
                severity: val
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="一般">一般</SelectItem>
                    <SelectItem value="中等">中等</SelectItem>
                    <SelectItem value="严重">严重</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>检查频率</Label>
                <Select value={itemForm.frequency} onValueChange={val => setItemForm({
                ...itemForm,
                frequency: val
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="每周检查">每周检查</SelectItem>
                    <SelectItem value="每月检查">每月检查</SelectItem>
                    <SelectItem value="随机检查">随机检查</SelectItem>
                    <SelectItem value="随时检查">随时检查</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>描述</Label>
              <Textarea value={itemForm.description} onChange={e => setItemForm({
              ...itemForm,
              description: e.target.value
            })} placeholder="详细描述此扣分项的标准和要求" rows={3} />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={itemForm.is_enabled} onCheckedChange={checked => setItemForm({
              ...itemForm,
              is_enabled: checked
            })} />
              <Label>启用此项目</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              取消
            </Button>
            <Button onClick={saveDeductionItem} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              保存项目
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}