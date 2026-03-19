// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Clock, Star, Calculator, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useToast } from '@/components/ui';

export default function VolunteerPointConfigPage(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    hours_per_point: 0.5,
    points_per_hour: 2,
    min_duration: 0.5,
    rounding_rule: 'round',
    description: '默认配置：1小时=2积分，最小服务令0.5小时，四舍五入'
  });
  useEffect(() => {
    loadConfig();
  }, []);
  const loadConfig = async () => {
    setLoading(true);
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('volunteer_point_config').where({
        is_active: true
      }).limit(1).get();
      if (result.data && result.data.length > 0) {
        const activeConfig = result.data[0];
        setConfig({
          hours_per_point: activeConfig.hours_per_point || 0.5,
          points_per_hour: activeConfig.points_per_hour || 2,
          min_duration: activeConfig.min_duration || 0.5,
          rounding_rule: activeConfig.rounding_rule || 'round',
          description: activeConfig.description || ''
        });
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: error.message || '无法加载配置信息'
      });
    } finally {
      setLoading(false);
    }
  };
  const calculatePoints = hours => {
    if (hours < config.min_duration) return 0;
    let points = hours * config.points_per_hour;
    switch (config.rounding_rule) {
      case 'up':
        points = Math.ceil(points);
        break;
      case 'down':
        points = Math.floor(points);
        break;
      case 'round':
      default:
        points = Math.round(points);
        break;
    }
    return points;
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();

      // 先将所有配置设为不活跃
      const allConfigs = await db.collection('volunteer_point_config').get();
      for (const record of allConfigs.data) {
        await db.collection('volunteer_point_config').doc(record._id).update({
          is_active: false
        });
      }

      // 检查是否已有活跃配置
      const existingActive = await db.collection('volunteer_point_config').where({
        is_active: true
      }).limit(1).get();
      const now = new Date().toISOString();
      const currentUser = props.$w.auth.currentUser;
      if (existingActive.data && existingActive.data.length > 0) {
        // 更新现有配置
        await db.collection('volunteer_point_config').doc(existingActive.data[0]._id).update({
          hours_per_point: config.hours_per_point,
          points_per_hour: config.points_per_hour,
          min_duration: config.min_duration,
          rounding_rule: config.rounding_rule,
          description: config.description,
          updated_at: now,
          updated_by: currentUser?.userId || 'unknown'
        });
      } else {
        // 创建新配置
        await db.collection('volunteer_point_config').add({
          config_id: 'volunteer_point_config_' + Date.now(),
          hours_per_point: config.hours_per_point,
          points_per_hour: config.points_per_hour,
          min_duration: config.min_duration,
          rounding_rule: config.rounding_rule,
          description: config.description,
          is_active: true,
          created_at: now,
          updated_at: now,
          created_by: currentUser?.userId || 'unknown',
          updated_by: currentUser?.userId || 'unknown'
        });
      }
      toast({
        title: '保存成功',
        description: '配置已成功保存并应用'
      });
    } catch (error) {
      console.error('保存配置失败:', error);
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: error.message || '无法保存配置'
      });
    } finally {
      setSaving(false);
    }
  };
  const handleReset = () => {
    setConfig({
      hours_per_point: 0.5,
      points_per_hour: 2,
      min_duration: 0.5,
      rounding_rule: 'round',
      description: '默认配置：1小时=2积分，最小服务令0.5小时，四舍五入'
    });
    toast({
      title: '已重置',
      description: '配置已重置为默认值'
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => props.$w.utils.navigateBack()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                志愿服务积分转换配置
              </h1>
              <p className="text-gray-600">
                设置服务令与积分的转换规则
              </p>
            </div>
          </div>
        </div>

        {loading ? <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div> : <div className="space-y-6">
            <Card className="border-2 border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl">转换比例设置</CardTitle>
                </div>
                <CardDescription>
                  配置服务令与积分的转换关系
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        每小时积分数
                      </label>
                      <div className="relative">
                        <Input type="number" step="0.1" min="0" value={config.points_per_hour} onChange={e => setConfig({
                      ...config,
                      points_per_hour: parseFloat(e.target.value) || 0
                    })} className="text-2xl font-bold text-blue-600 h-16 text-center" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          积分/小时
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 text-center">
                        即：1小时 = <span className="font-bold text-blue-600">{config.points_per_hour}</span> 积分
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        每积分所需小时数
                      </label>
                      <div className="relative">
                        <Input type="number" step="0.01" min="0" value={config.hours_per_point} onChange={e => setConfig({
                      ...config,
                      hours_per_point: parseFloat(e.target.value) || 0
                    })} className="text-2xl font-bold text-amber-600 h-16 text-center" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          小时/积分
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 text-center">
                        即：1积分 = <span className="font-bold text-amber-600">{config.hours_per_point}</span> 小时
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-xl">其他设置</CardTitle>
                </div>
                <CardDescription>
                  配置积分计算的其他规则
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      最小服务令（小时）
                    </label>
                    <div className="relative">
                      <Input type="number" step="0.1" min="0.1" value={config.min_duration} onChange={e => setConfig({
                    ...config,
                    min_duration: parseFloat(e.target.value) || 0.1
                  })} className="text-xl font-semibold h-14" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        小时
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      服务令少于该值不计算积分
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      舍入规则
                    </label>
                    <Select value={config.rounding_rule} onValueChange={value => setConfig({
                  ...config,
                  rounding_rule: value
                })}>
                      <SelectTrigger className="h-14">
                        <SelectValue placeholder="选择舍入规则" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round">四舍五入</SelectItem>
                        <SelectItem value="up">向上取整</SelectItem>
                        <SelectItem value="down">向下取整</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-sm text-gray-600">
                      计算积分时的舍入方式
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      配置说明
                    </label>
                    <textarea value={config.description} onChange={e => setConfig({
                  ...config,
                  description: e.target.value
                })} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="请输入配置说明..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl">转换示例</CardTitle>
                </div>
                <CardDescription>
                  根据当前配置，不同服务令对应的积分
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0.5, 1, 1.5, 2].map(hours => <div key={hours} className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {hours}小时
                      </div>
                      <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-xl">{calculatePoints(hours)}</span>
                        <span className="text-sm">积分</span>
                      </div>
                    </div>)}
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        配置说明
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>• 配置保存后将应用于所有新增的志愿服务记录</p>
                        <p>• 已有记录的积分不会自动重新计算</p>
                        <p>• 建议在学期开始前设置好转换规则</p>
                        <p>• 修改配置时请谨慎，避免频繁变动</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleReset} variant="outline" className="flex-1 h-12 text-base">
                重置为默认
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700">
                {saving ? <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    保存中...
                  </div> : <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    保存配置
                  </div>}
              </Button>
            </div>
          </div>}
      </div>
    </div>;
}