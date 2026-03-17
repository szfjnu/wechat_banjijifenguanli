// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { GraduationCap, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Card, useToast, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui';

// @ts-ignore;
import { useForm } from 'react-hook-form';
export default function CreateClassPage({
  $w
}) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [createdClass, setCreatedClass] = useState(null);
  const currentUser = $w?.auth?.currentUser;
  const form = useForm({
    defaultValues: {
      className: '',
      gradeLevel: '高一',
      semester: '2024-2025第一学期',
      description: '',
      headTeacherName: currentUser?.name || '',
      phone: '',
      email: ''
    }
  });
  const onSubmitStep1 = data => {
    setStep(2);
  };
  const onSubmitStep2 = async data => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 检查班级名称是否已存在
      const existingResult = await db.collection('classes').where({
        class_name: data.className
      }).limit(1).get();
      if (existingResult.data && existingResult.data.length > 0) {
        toast({
          variant: 'destructive',
          title: '班级已存在',
          description: '该班级名称已被使用，请更换名称'
        });
        setLoading(false);
        return;
      }

      // 生成班级ID和代码
      const classId = 'class_' + Date.now();
      const classCode = 'CLASS-' + Date.now().toString(36).toUpperCase();

      // 创建班级
      const classResult = await db.collection('classes').add({
        class_id: classId,
        class_name: data.className,
        class_code: classCode,
        grade_level: data.gradeLevel,
        semester: data.semester,
        description: data.description || '',
        head_teacher_id: currentUser?.userId,
        head_teacher_name: data.headTeacherName,
        head_teacher_phone: data.phone,
        head_teacher_email: data.email,
        student_count: 0,
        teacher_count: 1,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // 创建班级关联（班主任，自动成为管理员）
      await db.collection('user_class_relation').add({
        user_id: currentUser?.userId,
        user_name: data.headTeacherName,
        class_id: classId,
        class_name: data.className,
        role: 'teacher',
        is_owner: true,
        phone: data.phone,
        email: data.email,
        joined_at: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setCreatedClass({
        classId,
        className: data.className,
        classCode
      });
      toast({
        title: '创建成功',
        description: `班级 ${data.className} 已成功创建！您已成为班级管理员`
      });
      setStep(3);
    } catch (error) {
      console.error('创建班级失败:', error);
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: error.message || '无法创建班级，请重试'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleBackToWelcome = () => {
    $w.utils.navigateTo({
      pageId: 'welcome',
      params: {}
    });
  };
  const handleGoToClass = () => {
    if (createdClass) {
      $w.utils.navigateTo({
        pageId: 'home',
        params: {
          classId: createdClass.classId,
          className: createdClass.className
        }
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button onClick={handleBackToWelcome} className="text-blue-100 hover:text-white transition-colors">
                ← 返回
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-200">
                  步骤 {step}/3
                </span>
                {step < 3 && <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-white' : 'bg-blue-400'}`} />
                    <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-white' : 'bg-blue-400'}`} />
                    <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-white' : 'bg-blue-400'}`} />
                  </div>}
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {step === 1 && '创建班级'}
              {step === 2 && '填写班主任信息'}
              {step === 3 && '创建成功'}
            </h1>
            <p className="text-blue-100">
              {step === 1 && '填写班级的基本信息'}
              {step === 2 && '完善您的身份信息'}
              {step === 3 && '您的班级已准备就绪'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: 班级信息 */}
          {step === 1 && <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">班级信息</h2>
                  <p className="text-gray-500 text-sm">请填写班级的基本信息</p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-6">
                  <FormField control={form.control} name="className" rules={{
                required: '班级名称不能为空'
              }} render={({
                field
              }) => <FormItem>
                        <FormLabel>班级名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder="例如：高一(1)班" {...field} />
                        </FormControl>
                        <FormDescription>
                          班级名称将在系统中作为唯一标识
                        </FormDescription>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="gradeLevel" render={({
                field
              }) => <FormItem>
                        <FormLabel>年级</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="高一">高一</option>
                            <option value="高二">高二</option>
                            <option value="高三">高三</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="semester" render={({
                field
              }) => <FormItem>
                        <FormLabel>学期</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="2024-2025第一学期">2024-2025 第一学期</option>
                            <option value="2024-2025第二学期">2024-2025 第二学期</option>
                            <option value="2025-2026第一学期">2025-2026 第一学期</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="description" render={({
                field
              }) => <FormItem>
                        <FormLabel>班级描述（可选）</FormLabel>
                        <FormControl>
                          <textarea {...field} placeholder="简要介绍班级情况" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        </FormControl>
                        <FormDescription>
                          用于班级介绍和备注
                        </FormDescription>
                        <FormMessage />
                      </FormItem>} />

                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      下一步
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </div>}

          {/* Step 2: 班主任信息 */}
          {step === 2 && <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">班主任信息</h2>
                  <p className="text-gray-500 text-sm">完善您的身份信息</p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitStep2)} className="space-y-6">
                  <FormField control={form.control} name="headTeacherName" rules={{
                required: '班主任姓名不能为空'
              }} render={({
                field
              }) => <FormItem>
                        <FormLabel>班主任姓名 *</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入您的姓名" {...field} />
                        </FormControl>
                        <FormDescription>
                          您将成为这个班级的管理员
                        </FormDescription>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="phone" rules={{
                required: '联系电话不能为空',
                pattern: {
                  value: /^1[3-9]\d{9}$/,
                  message: '请输入有效的手机号码'
                }
              }} render={({
                field
              }) => <FormItem>
                        <FormLabel>联系电话 *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input placeholder="请输入手机号码" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          用于联系和管理班级事务
                        </FormDescription>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="email" rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '请输入有效的邮箱地址'
                }
              }} render={({
                field
              }) => <FormItem>
                        <FormLabel>邮箱地址（可选）</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input placeholder="请输入邮箱地址" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          用于接收通知和重要信息
                        </FormDescription>
                        <FormMessage />
                      </FormItem>} />

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      上一步
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                      {loading ? '创建中...' : '创建班级'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>}

          {/* Step 3: 创建成功 */}
          {step === 3 && createdClass && <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                班级创建成功！
              </h2>
              
              <p className="text-gray-600 mb-6">
                恭喜您成功创建 <span className="font-bold text-blue-600">{createdClass.className}</span>
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">班级代码</p>
                <p className="text-2xl font-bold text-blue-600 tracking-wider mb-2">
                  {createdClass.classCode}
                </p>
                <p className="text-xs text-gray-500">
                  请将此代码分享给学生和其他老师
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    您已成为班级管理员
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  您现在可以管理班级成员、发布通知、查看学生信息等
                </p>
              </div>
              
              <div className="space-y-3">
                <Button onClick={handleGoToClass} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  进入班级管理
                </Button>
                
                <Button onClick={handleBackToWelcome} variant="outline" className="w-full">
                  返回欢迎页面
                </Button>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}