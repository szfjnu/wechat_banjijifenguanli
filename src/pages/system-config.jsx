// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Settings, Database, Bell, Shield, Server, Save, RefreshCw, AlertTriangle, CheckCircle, XCircle, Globe, Clock, FileText, Key, Lock, Users, Mail } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Badge, Switch, useToast, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Label } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { usePermission } from '@/components/PermissionGuard';
// 系统配置模拟数据
const MOCK_CONFIG = {
  // 基本设置
  basic: {
    systemName: '学校管理系统',
    schoolName: '示例中学',
    schoolCode: 'SCH001',
    principal: '张校长',
    principalPhone: '13800138000',
    address: 'XX省XX市XX区XX街道123号',
    website: 'https://www.example.edu',
    email: 'admin@example.edu'
  },
  // 安全设置
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    sessionTimeout: 7200,
    // 2小时
    maxLoginAttempts: 5,
    lockoutDuration: 1800,
    // 30分钟
    twoFactorAuth: false
  },
  // 通知设置
  notification: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    dailyReport: true,
    weeklyReport: false
  },
  // 系统设置
  system: {
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    language: 'zh-CN',
    backupSchedule: 'daily',
    retentionDays: 30,
    logRetentionDays: 90
  },
  // 功能开关
  features: {
    aiReview: true,
    pointExchange: true,
    volunteerManagement: true,
    parentAccess: true,
    examMonitoring: true,
    disciplineTracking: true,
    growthRecords: true,
    certificateGeneration: true
  }
};
export default function SystemConfigPage(props) {
  const {
    toast
  } = useToast();
  const [config, setConfig] = useState(MOCK_CONFIG);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 权限检查
  const {
    permission: canViewSystem,
    loading: loadingViewSystem
  } = usePermission($w, 'system', 'view');
  const {
    permission: canEditSystem,
    loading: loadingEditSystem
  } = usePermission($w, 'system', 'edit');
  const {
    permission: canBackupData,
    loading: loadingBackupData
  } = usePermission($w, 'system', 'backup');
  const {
    permission: canRestoreData,
    loading: loadingRestoreData
  } = usePermission($w, 'system', 'restore');
  const {
    permission: canViewLogs,
    loading: loadingViewLogs
  } = usePermission($w, 'system', 'view_logs');

  // 更新配置
  const updateConfig = (category, field, value) => {
    if (!canEditSystem) {
      toast({
        title: '权限不足',
        description: '您没有修改系统配置的权限',
        variant: 'destructive'
      });
      return;
    }
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  // 保存配置
  const handleSaveConfig = async () => {
    if (!canEditSystem) {
      toast({
        title: '权限不足',
        description: '您没有修改系统配置的权限',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      toast({
        title: '保存成功',
        description: '系统配置已成功保存'
      });
    } catch (error) {
      toast({
        title: '保存失败',
        description: error.message || '保存系统配置时发生错误',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 重置配置
  const handleResetConfig = () => {
    if (!canEditSystem) {
      toast({
        title: '权限不足',
        description: '您没有重置系统配置的权限',
        variant: 'destructive'
      });
      return;
    }
    if (window.confirm('确定要重置为默认配置吗？')) {
      setConfig(MOCK_CONFIG);
      setHasChanges(false);
      toast({
        title: '重置成功',
        description: '系统配置已重置为默认值'
      });
    }
  };

  // 数据备份
  const handleBackup = async () => {
    if (!canBackupData) {
      toast({
        title: '权限不足',
        description: '您没有备份数据的权限',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      // 模拟备份
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: '备份成功',
        description: '系统数据已成功备份'
      });
    } catch (error) {
      toast({
        title: '备份失败',
        description: error.message || '备份数据时发生错误',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 数据恢复
  const handleRestore = () => {
    if (!canRestoreData) {
      toast({
        title: '权限不足',
        description: '您没有恢复数据的权限',
        variant: 'destructive'
      });
      return;
    }
    if (window.confirm('确定要恢复数据吗？此操作将覆盖当前数据！')) {
      toast({
        title: '功能开发中',
        description: '数据恢复功能正在开发中'
      });
    }
  };

  // 加载状态
  const isLoading = loadingViewSystem || loadingEditSystem || loadingBackupData || loadingRestoreData || loadingViewLogs;
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>;
  }

  // 权限检查
  if (!canViewSystem) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <Alert className="max-w-md bg-red-900/50 border-red-500">
          <AlertDescription className="text-white">
            您没有访问系统配置的权限，请联系管理员
          </AlertDescription>
        </Alert>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-400" />
                系统配置
              </h1>
              <p className="text-slate-400">管理系统设置、安全配置和功能开关</p>
            </div>
            <div className="flex gap-3">
              {canBackupData && <Button variant="outline" onClick={handleBackup} disabled={loading} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Database className="w-4 h-4 mr-2" />
                  备份数据
                </Button>}
              {canRestoreData && <Button variant="outline" onClick={handleRestore} className="border-red-600 text-red-400 hover:bg-red-900/20">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  恢复数据
                </Button>}
            </div>
          </div>
        </div>

        {/* 配置状态提示 */}
        {hasChanges && <Alert className="mb-6 bg-yellow-900/50 border-yellow-500">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200 ml-2">
              配置已修改但未保存，请及时保存更改
            </AlertDescription>
          </Alert>}

        {/* 配置选项卡 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-slate-700">
          <TabsList className="grid w-full grid-cols-5 border-b border-slate-700 bg-slate-900/50">
            <TabsTrigger value="basic" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              基本设置
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              安全设置
            </TabsTrigger>
            <TabsTrigger value="notification" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              通知设置
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Server className="w-4 h-4 mr-2" />
              系统设置
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Lock className="w-4 h-4 mr-2" />
              功能开关
            </TabsTrigger>
          </TabsList>

          {/* 基本设置 */}
          <TabsContent value="basic" className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-white">系统名称</Label>
                <Input value={config.basic.systemName} onChange={e => updateConfig('basic', 'systemName', e.target.value)} className="mt-1 bg-slate-700 border-slate-600 text-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">学校名称</Label>
                  <Input value={config.basic.schoolName} onChange={e => updateConfig('basic', 'schoolName', e.target.value)} className="mt-1 bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">学校代码</Label>
                  <Input value={config.basic.schoolCode} onChange={e => updateConfig('basic', 'schoolCode', e.target.value)} className="mt-1 bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">校长姓名</Label>
                  <Input value={config.basic.principal} onChange={e => updateConfig('basic', 'principal', e.target.value)} className="mt-1 bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">校长电话</Label>
                  <Input value={config.basic.principalPhone} onChange={e => updateConfig('basic', 'principalPhone', e.target.value)} className="mt-1 bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>

              <div>
                <Label className="text-white">学校地址</Label>
                <Textarea value={config.basic.address} onChange={e => updateConfig('basic', 'address', e.target.value)} className="mt-1 bg-slate-700 border-slate-600 text-white" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">学校网站</Label>
                  <Input value={config.basic.website} onChange={e => updateConfig('basic', 'website', e.target.value)} className="mt-1 bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">联系邮箱</Label>
                  <Input value={config.basic.email} onChange={e => updateConfig('basic', 'email', e.target.value)} className="mt-1 bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 安全设置 */}
          <TabsContent value="security" className="p-6 space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  密码策略
                </h3>
                <div className="space-y-4 bg-slate-700 bg-opacity-30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">最小密码长度</Label>
                      <p className="text-slate-400 text-sm">密码最少需要的字符数</p>
                    </div>
                    <Input type="number" value={config.security.passwordMinLength} onChange={e => updateConfig('security', 'passwordMinLength', parseInt(e.target.value))} className="w-20 bg-slate-600 border-slate-500 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">必须包含大写字母</Label>
                      <p className="text-slate-400 text-sm">密码必须包含至少一个大写字母</p>
                    </div>
                    <Switch checked={config.security.passwordRequireUppercase} onCheckedChange={checked => updateConfig('security', 'passwordRequireUppercase', checked)} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">必须包含小写字母</Label>
                      <p className="text-slate-400 text-sm">密码必须包含至少一个小写字母</p>
                    </div>
                    <Switch checked={config.security.passwordRequireLowercase} onCheckedChange={checked => updateConfig('security', 'passwordRequireLowercase', checked)} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">必须包含数字</Label>
                      <p className="text-slate-400 text-sm">密码必须包含至少一个数字</p>
                    </div>
                    <Switch checked={config.security.passwordRequireNumbers} onCheckedChange={checked => updateConfig('security', 'passwordRequireNumbers', checked)} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">必须包含特殊字符</Label>
                      <p className="text-slate-400 text-sm">密码必须包含至少一个特殊字符</p>
                    </div>
                    <Switch checked={config.security.passwordRequireSpecial} onCheckedChange={checked => updateConfig('security', 'passwordRequireSpecial', checked)} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  会话管理
                </h3>
                <div className="space-y-4 bg-slate-700 bg-opacity-30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">会话超时时间（秒）</Label>
                      <p className="text-slate-400 text-sm">用户会话保持的最长时间</p>
                    </div>
                    <Input type="number" value={config.security.sessionTimeout} onChange={e => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))} className="w-20 bg-slate-600 border-slate-500 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">最大登录尝试次数</Label>
                      <p className="text-slate-400 text-sm">账户锁定前的失败尝试次数</p>
                    </div>
                    <Input type="number" value={config.security.maxLoginAttempts} onChange={e => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))} className="w-20 bg-slate-600 border-slate-500 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">锁定时长（秒）</Label>
                      <p className="text-slate-400 text-sm">账户被锁定后的解锁时间</p>
                    </div>
                    <Input type="number" value={config.security.lockoutDuration} onChange={e => updateConfig('security', 'lockoutDuration', parseInt(e.target.value))} className="w-20 bg-slate-600 border-slate-500 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notification" className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <Label className="text-white">邮件通知</Label>
                    <p className="text-slate-400 text-sm">通过邮件发送系统通知</p>
                  </div>
                </div>
                <Switch checked={config.notification.emailNotifications} onCheckedChange={checked => updateConfig('notification', 'emailNotifications', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-green-400" />
                  <div>
                    <Label className="text-white">短信通知</Label>
                    <p className="text-slate-400 text-sm">通过短信发送重要通知</p>
                  </div>
                </div>
                <Switch checked={config.notification.smsNotifications} onCheckedChange={checked => updateConfig('notification', 'smsNotifications', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <div>
                    <Label className="text-white">推送通知</Label>
                    <p className="text-slate-400 text-sm">通过系统消息发送通知</p>
                  </div>
                </div>
                <Switch checked={config.notification.pushNotifications} onCheckedChange={checked => updateConfig('notification', 'pushNotifications', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <Label className="text-white">系统警报</Label>
                    <p className="text-slate-400 text-sm">接收系统异常警报通知</p>
                  </div>
                </div>
                <Switch checked={config.notification.systemAlerts} onCheckedChange={checked => updateConfig('notification', 'systemAlerts', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <div>
                    <Label className="text-white">每日报告</Label>
                    <p className="text-slate-400 text-sm">每日发送系统运行报告</p>
                  </div>
                </div>
                <Switch checked={config.notification.dailyReport} onCheckedChange={checked => updateConfig('notification', 'dailyReport', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-pink-400" />
                  <div>
                    <Label className="text-white">每周报告</Label>
                    <p className="text-slate-400 text-sm">每周发送系统统计报告</p>
                  </div>
                </div>
                <Switch checked={config.notification.weeklyReport} onCheckedChange={checked => updateConfig('notification', 'weeklyReport', checked)} />
              </div>
            </div>
          </TabsContent>

          {/* 系统设置 */}
          <TabsContent value="system" className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-white">时区</Label>
                <select value={config.system.timezone} onChange={e => updateConfig('system', 'timezone', e.target.value)} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-lg p-2">
                  <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">日期格式</Label>
                  <select value={config.system.dateFormat} onChange={e => updateConfig('system', 'dateFormat', e.target.value)} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-lg p-2">
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white">时间格式</Label>
                  <select value={config.system.timeFormat} onChange={e => updateConfig('system', 'timeFormat', e.target.value)} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-lg p-2">
                    <option value="HH:mm:ss">24小时制</option>
                    <option value="hh:mm:ss a">12小时制</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label className="text-white">语言</Label>
                <select value={config.system.language} onChange={e => updateConfig('system', 'language', e.target.value)} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-lg p-2">
                  <option value="zh-CN">简体中文</option>
                  <option value="zh-TW">繁体中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>
              
              <div>
                <Label className="text-white">备份计划</Label>
                <select value={config.system.backupSchedule} onChange={e => updateConfig('system', 'backupSchedule', e.target.value)} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-lg p-2">
                  <option value="daily">每日</option>
                  <option value="weekly">每周</option>
                  <option value="monthly">每月</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">数据保留天数</Label>
                  <Input type="number" value={config.system.retentionDays} onChange={e => updateConfig('system', 'retentionDays', parseInt(e.target.value))} className="mt-1 bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">日志保留天数</Label>
                  <Input type="number" value={config.system.logRetentionDays} onChange={e => updateConfig('system', 'logRetentionDays', parseInt(e.target.value))} className="mt-1 bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 功能开关 */}
          <TabsContent value="features" className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div>
                  <Label className="text-white">AI智能复核</Label>
                  <p className="text-slate-400 text-sm">使用AI进行智能内容审核</p>
                </div>
                <Switch checked={config.features.aiReview} onCheckedChange={checked => updateConfig('features', 'aiReview', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div>
                  <Label className="text-white">积分兑换系统</Label>
                  <p className="text-slate-400 text-sm">允许学生使用积分兑换奖励</p>
                </div>
                <Switch checked={config.features.pointExchange} onCheckedChange={checked => updateConfig('features', 'pointExchange', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div>
                  <Label className="text-white">志愿者管理</Label>
                  <p className="text-slate-400 text-sm">管理志愿者活动和记录</p>
                </div>
                <Switch checked={config.features.volunteerManagement} onCheckedChange={checked => updateConfig('features', 'volunteerManagement', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div>
                  <Label className="text-white">家长访问</Label>
                  <p className="text-slate-400 text-sm">允许家长访问学生信息</p>
                </div>
                <Switch checked={config.features.parentAccess} onCheckedChange={checked => updateConfig('features', 'parentAccess', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div>
                  <Label className="text-white">考试监控</Label>
                  <p className="text-slate-400 text-sm">启用考试监控功能</p>
                </div>
                <Switch checked={config.features.examMonitoring} onCheckedChange={checked => updateConfig('features', 'examMonitoring', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div>
                  <Label className="text-white">纪律跟踪</Label>
                  <p className="text-slate-400 text-sm">跟踪和管理学生纪律记录</p>
                </div>
                <Switch checked={config.features.disciplineTracking} onCheckedChange={checked => updateConfig('features', 'disciplineTracking', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div>
                  <Label className="text-white">成长记录</Label>
                  <p className="text-slate-400 text-sm">记录和追踪学生成长数据</p>
                </div>
                <Switch checked={config.features.growthRecords} onCheckedChange={checked => updateConfig('features', 'growthRecords', checked)} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 bg-opacity-30 rounded-lg">
                <div>
                  <Label className="text-white">证书生成</Label>
                  <p className="text-slate-400 text-sm">自动生成学生证书和荣誉</p>
                </div>
                <Switch checked={config.features.certificateGeneration} onCheckedChange={checked => updateConfig('features', 'certificateGeneration', checked)} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 底部操作栏 */}
        <div className="mt-6 flex items-center justify-between bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-4 text-slate-400">
            {hasChanges && <span className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                有未保存的更改
              </span>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleResetConfig} disabled={loading} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              重置
            </Button>
            <Button onClick={handleSaveConfig} disabled={loading || !hasChanges} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              保存配置
            </Button>
          </div>
        </div>

        {/* TabBar */}
        <TabBar />
      </div>
    </div>;
}