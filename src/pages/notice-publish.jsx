// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Button, Card, Tabs, TabsContent, TabsList, TabsTrigger, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Bell, Send, Clock, Users, UserCheck, X, ChevronRight } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
import { useForm } from 'react-hook-form';
export default function NoticePublish(props) {
  const {
    toast
  } = useToast();
  const $w = props.$w;
  const [currentPage, setCurrentPage] = useState('notice-publish');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [publishedNotices, setPublishedNotices] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedGroups, setGroupsSelected] = useState([]);
  const [activeTab, setActiveTab] = useState('publish');
  const [targetType, setTargetType] = useState('all');
  const [noticeHistory, setNoticeHistory] = useState([]);
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };

  // 表单管理
  const form = useForm({
    defaultValues: {
      title: '',
      content: '',
      publishTime: new Date().toISOString().slice(0, 16)
    }
  });

  // 加载学生和分组数据
  useEffect(() => {
    loadStudents();
    loadGroups();
    loadNoticeHistory();
  }, []);
  const loadStudents = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('students').field({
        _id: true,
        name: true,
        student_id: true,
        group_id: true
      }).get();
      if (result.data && result.data.length > 0) {
        const transformedStudents = result.data.map(student => ({
          id: student._id,
          name: student.name,
          studentId: student.student_id,
          group: student.group_id || '未分组'
        }));
        setStudents(transformedStudents);
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载学生数据',
        variant: 'destructive'
      });
    }
  };
  const loadGroups = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('students').get();
      if (result.data && result.data.length > 0) {
        const uniqueGroups = [...new Set(result.data.map(s => s.group_id).filter(Boolean))];
        const groupList = uniqueGroups.map((groupName, index) => ({
          id: `group_${index}`,
          name: groupName
        }));
        setGroups(groupList);
      }
    } catch (error) {
      console.error('加载分组数据失败:', error);
    }
  };
  const loadNoticeHistory = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('notice').orderBy('publish_time', 'desc').limit(20).get();
      if (result.data && result.data.length > 0) {
        const transformedNotices = result.data.map(notice => ({
          id: notice._id,
          title: notice.title,
          content: notice.content,
          publisher: notice.publisher,
          publishTime: notice.publish_time,
          targetType: notice.target_type,
          targetIds: notice.target_ids || [],
          targetNames: notice.target_names || [],
          status: notice.status
        }));
        setNoticeHistory(transformedNotices);
      }
    } catch (error) {
      console.error('加载通知历史失败:', error);
    }
  };

  // 发布通知
  const handlePublish = async data => {
    try {
      setLoading(true);

      // 验证发布对象
      let targetIds = [];
      let targetNames = [];
      if (targetType === 'all') {
        targetIds = ['all'];
        targetNames = ['全体学生'];
      } else if (targetType === 'group') {
        if (selectedGroups.length === 0) {
          toast({
            title: '请选择分组',
            description: '请至少选择一个分组',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        targetIds = selectedGroups.map(g => g.id);
        targetNames = selectedGroups.map(g => g.name);
      } else if (targetType === 'student') {
        if (selectedStudents.length === 0) {
          toast({
            title: '请选择学生',
            description: '请至少选择一名学生',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        targetIds = selectedStudents.map(s => s.id);
        targetNames = selectedStudents.map(s => s.name);
      }
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const noticeData = {
        title: data.title,
        content: data.content,
        publisher: props.$w.auth.currentUser?.name || '管理员',
        publish_time: new Date(data.publishTime).toISOString(),
        target_type: targetType,
        target_ids: targetIds,
        target_names: targetNames,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const result = await db.collection('notice').add(noticeData);
      toast({
        title: '发布成功',
        description: `通知已发送给 ${targetNames.join('、')}`
      });

      // 清空表单
      form.reset({
        title: '',
        content: '',
        publishTime: new Date().toISOString().slice(0, 16)
      });
      setSelectedStudents([]);
      setGroupsSelected([]);
      setTargetType('all');

      // 重新加载通知历史
      loadNoticeHistory();
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 切换学生选择
  const toggleStudent = student => {
    if (selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  // 切换分组选择
  const toggleGroup = group => {
    if (selectedGroups.find(g => g.id === group.id)) {
      setGroupsSelected(selectedGroups.filter(g => g.id !== group.id));
    } else {
      setGroupsSelected([...selectedGroups, group]);
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2A52BE] to-blue-600 text-white px-4 py-3 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold">通知发布</h1>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{new Date().toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
        <p className="text-blue-100 text-xs">发布班级通知和管理信息</p>
      </div>

      <div className="px-4 pb-24 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/80 backdrop-blur-sm shadow-sm rounded-lg p-1">
            <TabsTrigger value="publish" className="data-[state=active]:bg-[#FF8C00] data-[state=active]:text-white rounded-md">
              <Send className="w-4 h-4 mr-1" />
              发布通知
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#FF8C00] data-[state=active]:text-white rounded-md">
              <Bell className="w-4 h-4 mr-1" />
              通知记录
            </TabsTrigger>
          </TabsList>

          <TabsContent value="publish" className="space-y-4">
            {/* 发布表单 */}
            <Card className="p-4 shadow-sm border-0 bg-white rounded-xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePublish)} className="space-y-4">
                  {/* 通知标题 */}
                  <FormField control={form.control} name="title" rules={{
                  required: '请输入通知标题'
                }} render={({
                  field
                }) => <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">
                          <Bell className="w-4 h-4 inline mr-1 text-[#FF8C00]" />
                          通知标题
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="请输入通知标题" {...field} className="border-slate-200 focus:border-[#2A52BE] focus:ring-[#2A52BE]/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  {/* 发布时间 */}
                  <FormField control={form.control} name="publishTime" rules={{
                  required: '请选择发布时间'
                }} render={({
                  field
                }) => <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">
                          <Clock className="w-4 h-4 inline mr-1 text-[#FF8C00]" />
                          发布时间
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} className="border-slate-200 focus:border-[#2A52BE] focus:ring-[#2A52BE]/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  {/* 通知内容 */}
                  <FormField control={form.control} name="content" rules={{
                  required: '请输入通知内容'
                }} render={({
                  field
                }) => <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">
                          通知内容
                        </FormLabel>
                        <FormControl>
                          <textarea placeholder="请输入通知内容..." {...field} rows={6} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/20 focus:border-[#2A52BE] resize-none text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  {/* 发布对象选择 */}
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-medium text-slate-700">
                      <Users className="w-4 h-4 inline mr-1 text-[#FF8C00]" />
                      发布对象
                    </label>

                    {/* 目标类型选择 */}
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => setTargetType('all')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${targetType === 'all' ? 'bg-[#2A52BE] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <UserCheck className="w-4 h-4 inline mr-1" />
                        全体学生
                      </button>
                      <button type="button" onClick={() => setTargetType('group')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${targetType === 'group' ? 'bg-[#2A52BE] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <Users className="w-4 h-4 inline mr-1" />
                        按分组
                      </button>
                      <button type="button" onClick={() => setTargetType('student')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${targetType === 'student' ? 'bg-[#2A52BE] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        用户
                      </button>
                    </div>

                    {/* 分组选择 */}
                    {targetType === 'group' && <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                        <p className="text-xs text-slate-500 mb-2">已选择 {selectedGroups.length} 个分组</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {groups.map(group => <label key={group.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white transition-colors">
                              <input type="checkbox" checked={selectedGroups.find(g => g.id === group.id)} onChange={() => toggleGroup(group)} className="w-4 h-4 rounded text-[#2A52BE] focus:ring-[#2A52BE]/20" />
                              <span className="text-sm text-slate-700">{group.name}</span>
                            </label>)}
                          {groups.length === 0 && <p className="text-xs text-slate-400 text-center py-4">暂无分组数据</p>}
                        </div>
                      </div>}

                    {/* 学生选择 */}
                    {targetType === 'student' && <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                        <p className="text-xs text-slate-500 mb-2">已选择 {selectedStudents.length} 名学生</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {students.map(student => <label key={student.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white transition-colors">
                              <input type="checkbox" checked={selectedStudents.find(s => s.id === student.id)} onChange={() => toggleStudent(student)} className="w-4 h-4 rounded text-[#2A52BE] focus:ring-[#2A52BE]/20" />
                              <span className="text-sm text-slate-700">{student.name}</span>
                              <Badge variant="outline" className="ml-auto text-xs">{student.group}</Badge>
                            </label>)}
                          {students.length === 0 && <p className="text-xs text-slate-400 text-center py-4">暂无学生数据</p>}
                        </div>
                      </div>}

                    {/* 已选对象展示 */}
                    {(targetType === 'group' && selectedGroups.length > 0 || targetType === 'student' && selectedStudents.length > 0) && <div className="flex flex-wrap gap-2">
                        {targetType === 'group' && selectedGroups.map(group => <Badge key={group.id} className="bg-[#2A52BE] text-white hover:bg-[#2A52BE]/80">
                            {group.name}
                            <button type="button" onClick={() => toggleGroup(group)} className="ml-1 hover:text-red-200">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>)}
                        {targetType === 'student' && selectedStudents.map(student => <Badge key={student.id} className="bg-[#FF8C00] text-white hover:bg-[#FF8C00]/80">
                            {student.name}
                            <button type="button" onClick={() => toggleStudent(student)} className="ml-1 hover:text-red-200">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>)}
                      </div>}
                  </div>

                  {/* 提交按钮 */}
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#2A52BE] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md">
                    {loading ? '发布中...' : <span>
                        <Send className="w-4 h-4 inline mr-2" />
                        立即发布
                      </span>}
                  </Button>
                </form>
              </Form>
            </Card>

            {/* 使用说明 */}
            <Card className="p-4 shadow-sm border-0 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
              <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Bell className="w-4 h-4 mr-1 text-[#FF8C00]" />
                使用说明
              </h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• 全体学生：通知将发送给所有学生</li>
                <li>• 按分组：可选择一个或多个分组发送通知</li>
                <li>• 指定学生：可选择一个或多个学生发送通知</li>
                <li>• 发布时间：可设置未来时间定时发布</li>
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* 通知记录列表 */}
            <Card className="shadow-sm border-0 bg-white rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-medium text-slate-700 flex items-center">
                  <Bell className="w-4 h-4 mr-1 text-[#FF8C00]" />
                  通知记录
                </h3>
              </div>

              {noticeHistory.length === 0 ? <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">暂无通知记录</p>
                </div> : <div className="divide-y divide-slate-100">
                  {noticeHistory.map(notice => <div key={notice.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-slate-800 flex-1">{notice.title}</h4>
                        <Badge className={`ml-2 text-xs ${notice.status === 'published' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {notice.status === 'published' ? '已发布' : '草稿'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 line-clamp-2">{notice.content}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center space-x-2">
                          <span>发布人: {notice.publisher}</span>
                          <span>•</span>
                          <span>{notice.targetNames.join('、')}</span>
                        </div>
                        <span>{new Date(notice.publishTime).toLocaleString('zh-CN')}</span>
                      </div>
                    </div>)}
                </div>}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}