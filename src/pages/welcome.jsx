// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { School, Users, Plus, LogIn, ArrowRight, Crown, UserGraduation, UserCircle, CheckCircle } from 'lucide-react';
// @ts-ignore;
import { Card, Button, useToast } from '@/components/ui';

export default function WelcomePage({
  $w
}) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const currentUser = $w.auth.currentUser;
  useEffect(() => {
    loadUserClasses();
  }, []);
  const loadUserClasses = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取用户班级关联
      const result = await db.collection('user_class_relation').where({
        user_id: currentUser?.userId
      }).get();
      if (result.data && result.data.length > 0) {
        setClasses(result.data);
      }
    } catch (error) {
      console.error('加载班级列表失败:', error);
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: error.message || '无法加载班级列表'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSelectClass = classInfo => {
    $w.utils.navigateTo({
      pageId: 'home',
      params: {
        classId: classInfo.class_id,
        className: classInfo.class_name
      }
    });
  };

  // 获取用户身份对应的图标
  const getUserIcon = () => {
    const userType = currentUser?.type || 'student';
    switch (userType) {
      case 'teacher':
        return <Crown className="w-12 h-12" />;
      case 'parent':
        return <UserCircle className="w-12 h-12" />;
      default:
        return <UserGraduation className="w-12 h-12" />;
    }
  };

  // 获取用户身份文本
  const getUserTypeText = () => {
    const userType = currentUser?.type || 'student';
    switch (userType) {
      case 'teacher':
        return '班主任/教师';
      case 'parent':
        return '家长';
      default:
        return '学生';
    }
  };

  // 获取操作按钮
  const getActionButtons = () => {
    const userType = currentUser?.type || 'student';
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* 创建班级 - 仅班主任可用 */}
        {userType === 'teacher' && <Button onClick={() => $w.utils.navigateTo({
        pageId: 'create-class',
        params: {}
      })} className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            创建班级
          </Button>}
        
        {/* 加入班级 - 学生/家长/教师可用 */}
        <Button onClick={() => $w.utils.navigateTo({
        pageId: 'join-class',
        params: {}
      })} className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700" size="lg">
          <LogIn className="w-5 h-5 mr-2" />
          加入班级
        </Button>
      </div>;
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <School className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              欢迎使用班级管理系统
            </h1>
            <p className="text-blue-100 text-lg">
              {currentUser?.name}，您好！欢迎来到智慧班级管理平台
            </p>
            <div className="mt-4 inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              {getUserIcon()}
              <span className="ml-2 font-medium">{getUserTypeText()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 已加入的班级 */}
        {classes.length > 0 && <Card className="mb-8 border-2 border-blue-100 bg-white shadow-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">已加入的班级</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map(classItem => <div key={classItem._id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-400 transition-all cursor-pointer" onClick={() => handleSelectClass(classItem)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-blue-900 mb-1">
                          {classItem.class_name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs mr-2">
                            {classItem.role === 'teacher' ? '班主任' : '成员'}
                          </span>
                          {classItem.is_owner && <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs">
                              班级管理员
                            </span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          加入时间: {new Date(classItem.joined_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>)}
              </div>
            </div>
          </Card>}

        {/* 欢迎卡片 - 无班级时显示 */}
        {classes.length === 0 && <Card className="mb-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <School className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                开始您的班级管理之旅
              </h2>
              <p className="text-gray-600 mb-6">
                您还没有加入任何班级，赶快创建或加入班级吧！
              </p>
              {getActionButtons()}
            </div>
          </Card>}

        {/* 快速开始指南 */}
        <Card className="bg-white shadow-lg">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              快速开始指南
            </h3>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-800">加入或创建班级</p>
                  <p className="text-sm text-gray-600">班主任可创建班级，学生和老师可加入班级</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-800">探索班级功能</p>
                  <p className="text-sm text-gray-600">查看学生信息、积分管理、课程安排等</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-800">管理班级事务</p>
                  <p className="text-sm text-gray-600">使用积分系统、发布通知、安排课程</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>遇到问题？请联系班级管理员或系统技术支持</p>
        </div>
      </div>

    </div>;
}