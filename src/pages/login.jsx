// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Shield, GraduationCap, Users, UserCircle, User, QrCode, LogIn, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';

export default function LoginPage({
  $w
}) {
  const {
    toast
  } = useToast();
  const [currentStep, setCurrentStep] = useState('method'); // method, credentials, role
  const [loginMethod, setLoginMethod] = useState(''); // password, wechat
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Mock 数据：测试用户
  const mockUsers = {
    'admin': {
      password: 'admin123',
      role: '管理员',
      name: '系统管理员'
    },
    'teacher': {
      password: 'teacher123',
      role: '班主任',
      name: '王老师'
    },
    'class1_teacher': {
      password: 'teacher123',
      role: '教师',
      name: '李老师'
    },
    'student': {
      password: 'student123',
      role: '学生',
      name: '张三'
    },
    'student_committee': {
      password: 'student123',
      role: '学生（班委）',
      name: '班长小明'
    },
    'parent': {
      password: 'parent123',
      role: '学生家长',
      name: '家长李四'
    }
  };

  // 角色配置 - 根据用户身份跳转到对应页面
  const roles = [{
    id: 'admin',
    name: '管理员',
    icon: Shield,
    color: 'blue',
    targetPage: 'home'
  }, {
    id: 'teacher',
    name: '班主任',
    icon: GraduationCap,
    color: 'green',
    targetPage: 'classes-manage'
  }, {
    id: 'class1_teacher',
    name: '教师',
    icon: Users,
    color: 'gray',
    targetPage: 'schedule-manage'
  }, {
    id: 'student',
    name: '学生',
    icon: UserCircle,
    color: 'orange',
    targetPage: 'home'
  }, {
    id: 'student_committee',
    name: '学生（班委）',
    icon: Users,
    color: 'red',
    targetPage: 'home'
  }, {
    id: 'parent',
    name: '学生家长',
    icon: User,
    color: 'purple',
    targetPage: 'parent-view'
  }];
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      light: 'bg-blue-50',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-500',
      hover: 'hover:bg-green-600',
      light: 'bg-green-50',
      border: 'border-green-200'
    },
    gray: {
      bg: 'bg-gray-500',
      hover: 'hover:bg-gray-600',
      light: 'bg-gray-50',
      border: 'border-gray-200'
    },
    orange: {
      bg: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      light: 'bg-orange-50',
      border: 'border-orange-200'
    },
    red: {
      bg: 'bg-red-500',
      hover: 'hover:bg-red-600',
      light: 'bg-red-50',
      border: 'border-red-200'
    },
    purple: {
      bg: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      light: 'bg-purple-50',
      border: 'border-purple-200'
    }
  };

  // 处理登录方式选择
  const handleMethodSelect = method => {
    setLoginMethod(method);
    if (method === 'password') {
      setCurrentStep('credentials');
    } else {
      // 微信登录直接跳转到角色选择
      handleWechatLogin();
    }
  };

  // 模拟微信登录
  const handleWechatLogin = async () => {
    setLoading(true);
    try {
      // 模拟扫码登录延时
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentUser({
        name: '微信用户',
        loginMethod: 'wechat'
      });
      toast({
        title: '微信登录成功',
        description: '请选择您的角色',
        variant: 'default'
      });
      setCurrentStep('role');
    } catch (error) {
      toast({
        title: '登录失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理密码登录
  const handlePasswordLogin = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // 模拟登录验证延时
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 验证用户名和密码
      const user = mockUsers[username];
      if (!user || user.password !== password) {
        toast({
          title: '登录失败',
          description: '用户名或密码错误',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      setCurrentUser({
        username,
        name: user.name,
        loginMethod: 'password'
      });

      // 创建模拟用户信息并存储到 localStorage
      const mockUserInfo = {
        userId: `USER_${Date.now()}`,
        name: user.name,
        nickName: user.role,
        avatarUrl: null,
        type: user.role,
        role: user.role
      };
      localStorage.setItem('currentUser', JSON.stringify(mockUserInfo));
      toast({
        title: '登录成功',
        description: `欢迎回来，${user.name}`,
        variant: 'default'
      });

      // 如果是系统管理员，显示角色选择页面（方便调试）
      if (username === 'admin') {
        setCurrentStep('role');
      } else {
        // 根据用户角色映射到对应的 role id
        let roleId = '';
        if (user.role === '班主任') {
          roleId = 'homeroom_teacher';
        } else if (user.role === '教师') {
          roleId = 'class_teacher';
        } else if (user.role === '学生') {
          roleId = 'student';
        } else if (user.role === '学生（班委）') {
          roleId = 'student_committee';
        } else if (user.role === '学生家长') {
          roleId = 'parent';
        } else if (user.role === '管理员') {
          roleId = 'admin';
        }

        // 其他用户直接跳转到对应角色的页面
        const role = roles.find(r => r.id === roleId);
        if (role) {
          $w.utils.navigateTo({
            pageId: role.targetPage,
            params: {
              role: roleId
            }
          });
        } else {
          // 默认跳转到首页
          $w.utils.navigateTo({
            pageId: 'home',
            params: {}
          });
        }
      }
    } catch (error) {
      toast({
        title: '登录失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理角色选择
  const handleRoleSelect = async role => {
    try {
      const targetPage = role.targetPage;

      // 创建模拟用户信息并存储到 localStorage
      const mockUser = {
        userId: `USER_${Date.now()}`,
        name: username || '张三',
        nickName: role.name,
        avatarUrl: null,
        type: role.id === 'student' ? '学生' : role.id === 'homeroom_teacher' ? '班主任' : role.id === 'parent' ? '学生家长' : role.id === 'class_teacher' ? '教师' : '管理员',
        role: role.name
      };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      toast({
        title: '角色选择成功',
        description: `正在进入${role.name}主页`,
        variant: 'default'
      });

      // 延迟一下以显示成功提示
      await new Promise(resolve => setTimeout(resolve, 500));

      // 跳转到对应页面
      $w.utils.navigateTo({
        pageId: targetPage,
        params: {
          role: role.id
        }
      });
    } catch (error) {
      toast({
        title: '跳转失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 返回上一步
  const handleBack = () => {
    if (currentStep === 'role') {
      setCurrentStep(loginMethod === 'password' ? 'credentials' : 'method');
    } else if (currentStep === 'credentials') {
      setCurrentStep('method');
    } else {
      setLoginMethod('');
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            智慧校园管理系统
          </CardTitle>
          <CardDescription className="text-center text-lg">
            登录您的账户以访问系统
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* 步骤一：选择登录方式 */}
          {currentStep === 'method' && <div className="space-y-6">
              <div className="text-center">
                <Label className="text-xl font-semibold mb-6">选择登录方式</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => handleMethodSelect('password')} className={"h-32 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"} disabled={loading}>
                  <LogIn className="w-12 h-12" />
                  <span className="text-xl font-semibold">账号密码登录</span>
                  <span className="text-sm opacity-80">使用用户名和密码</span>
                </Button>
                
                <Button onClick={() => handleMethodSelect('wechat')} className={"h-32 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"} disabled={loading}>
                  <MessageSquare className="w-12 h-12" />
                  <span className="text-xl font-semibold">微信登录</span>
                  <span className="text-sm opacity-80">使用微信扫码</span>
                </Button>
              </div>
              
              {loading && <div className="flex justify-center items-center space-x-2 text-blue-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>登录中...</span>
                </div>}
            </div>}

          {/* 步骤二：账号密码输入 */}
          {currentStep === 'credentials' && <div className="space-y-6">
              <Button variant="ghost" onClick={handleBack} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回选择登录方式
              </Button>
              
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input id="username" type="text" placeholder="请输入用户名" value={username} onChange={e => setUsername(e.target.value)} disabled={loading} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input id="password" type="password" placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required />
                </div>
                
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" disabled={loading}>
                  {loading ? <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>登录中...</span>
                    </div> : <div className="flex items-center space-x-2">
                      <LogIn className="w-5 h-5" />
                      <span>登录</span>
                    </div>}
                </Button>
              </form>
            </div>}

          {/* 步骤三：角色选择 */}
          {currentStep === 'role' && <div className="space-y-6">
              <Button variant="ghost" onClick={handleBack} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回登录
              </Button>
              
              <div className="text-center">
                <Label className="text-xl font-semibold mb-2">选择您的角色</Label>
                <p className="text-gray-600">请选择对应的角色进入相应页面</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {roles.map(role => {
              const RoleIcon = role.icon;
              const colors = colorClasses[role.color];
              return <Button key={role.id} onClick={() => handleRoleSelect(role)} className={`h-24 flex flex-col items-center justify-center space-y-2 bg-white border-2 ${colors.border} hover:shadow-lg transition-all duration-200 ${colors.hover}`} variant="outline">
                      <RoleIcon className={`w-8 h-8 ${colors.bg} text-white p-1.5 rounded-lg`} />
                      <span className="font-semibold text-gray-800">{role.name}</span>
                    </Button>;
            })}
              </div>
            </div>}

          {/* 测试账号信息提示 */}
          {currentStep === 'method' && <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">测试账号信息：</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• admin / admin123 - 管理员</p>
                <p>• teacher / teacher123 - 班主任</p>
                <p>• class1_teacher / teacher123 - 一班教师</p>
                <p>• student / student123 - 学生</p>
                <p>• student_committee / student123 - 学生（班委）</p>
                <p>• parent / parent123 - 学生家长</p>
              </div>
            </div>}
        </CardContent>
      </Card>
    </div>;
}