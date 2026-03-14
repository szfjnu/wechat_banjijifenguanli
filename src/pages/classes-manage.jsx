// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Plus, Search, Edit, Trash2, Users, School, MapPin, Calendar, User, MoreVertical, ArrowRight, TrendingUp, Award, Star, BookOpen } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Badge, useToast, Alert, AlertDescription, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { usePermission } from '@/components/PermissionGuard';
// 模拟班级数据
const MOCK_CLASSES = [{
  id: 'class-001',
  name: '高一(1)班',
  grade: '高一',
  classNumber: 1,
  headTeacher: '李老师',
  headTeacherId: 'teacher001',
  classroom: 'A栋101室',
  studentCount: 45,
  maleStudents: 23,
  femaleStudents: 22,
  monitor: '张同学',
  createdAt: '2026-09-01',
  status: 'active'
}, {
  id: 'class-002',
  name: '高一(2)班',
  grade: '高一',
  classNumber: 2,
  headTeacher: '王老师',
  headTeacherId: 'teacher002',
  classroom: 'A栋102室',
  studentCount: 44,
  maleStudents: 21,
  femaleStudents: 23,
  monitor: '李同学',
  createdAt: '2026-09-01',
  status: 'active'
}, {
  id: 'class-003',
  name: '高二(1)班',
  grade: '高二',
  classNumber: 1,
  headTeacher: '赵老师',
  headTeacherId: 'teacher003',
  classroom: 'B栋201室',
  studentCount: 46,
  maleStudents: 24,
  femaleStudents: 22,
  monitor: '王同学',
  createdAt: '2025-09-01',
  status: 'active'
}, {
  id: 'class-004',
  name: '高二(2)班',
  grade: '高二',
  classNumber: 2,
  headTeacher: '孙老师',
  headTeacherId: 'teacher004',
  classroom: 'B栋202室',
  studentCount: 45,
  maleStudents: 22,
  femaleStudents: 23,
  monitor: '刘同学',
  createdAt: '2025-09-01',
  status: 'active'
}, {
  id: 'class-005',
  name: '高三(1)班',
  grade: '高三',
  classNumber: 1,
  headTeacher: '周老师',
  headTeacherId: 'teacher005',
  classroom: 'C栋301室',
  studentCount: 48,
  maleStudents: 25,
  femaleStudents: 23,
  monitor: '陈同学',
  createdAt: '2024-09-01',
  status: 'active'
}, {
  id: 'class-006',
  name: '高三(2)班',
  grade: '高三',
  classNumber: 2,
  headTeacher: '吴老师',
  headTeacherId: 'teacher006',
  classroom: 'C栋302室',
  studentCount: 47,
  maleStudents: 23,
  femaleStudents: 24,
  monitor: '赵同学',
  createdAt: '2024-09-01',
  status: 'active'
}];

// 年级定义
const GRADES = [{
  id: 'all',
  name: '全部年级'
}, {
  id: '高一',
  name: '高一'
}, {
  id: '高二',
  name: '高二'
}, {
  id: '高三',
  name: '高三'
}];
export default function ClassesManagePage(props) {
  const {
    toast
  } = useToast();
  const [classes, setClasses] = useState(MOCK_CLASSES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  // 加载班级数据
  React.useEffect(() => {
    loadClassesData();
  }, []);
  const loadClassesData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取当前用户信息
      const currentUser = $w.auth.currentUser;
      const userType = currentUser?.type || '';
      const userName = currentUser?.name || '';
      const userId = currentUser?.userId || '';

      // 根据用户类型筛选班级数据
      let filteredClasses = MOCK_CLASSES;
      if (userType === '班主任') {
        // 班主任只看自己管理的班级
        filteredClasses = MOCK_CLASSES.filter(cls => cls.headTeacher === userName);

        // 如果班主任没有管理的班级，显示提示
        if (filteredClasses.length === 0) {
          toast({
            title: '提示',
            description: '您还未管理任何班级，请联系管理员分配班级。',
            variant: 'info'
          });
        }
      } else if (userType === '学生' || userType === '学生班委') {
        // 学生只看自己所在的班级
        // 从学生数据中获取班级名称
        const studentResult = await db.collection('students').where({
          name: userName
        }).get();
        if (studentResult.data && studentResult.data.length > 0) {
          const studentClassName = studentResult.data[0].class_name;
          filteredClasses = MOCK_CLASSES.filter(cls => cls.name === studentClassName);
        }
      }
      setClasses(filteredClasses);
      console.log('classes-manage.jsx 加载班级数据:', {
        用户类型: userType,
        用户名称: userName,
        班级总数: filteredClasses.length
      });
    } catch (error) {
      console.error('加载班级数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '加载班级数据失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 权限检查
  const {
    permission: canViewClasses,
    loading: loadingViewClasses
  } = usePermission($w, 'classes', 'view');
  const {
    permission: canCreateClasses,
    loading: loadingCreateClasses
  } = usePermission($w, 'classes', 'create');
  const {
    permission: canEditClasses,
    loading: loadingEditClasses
  } = usePermission($w, 'classes', 'edit');
  const {
    permission: canDeleteClasses,
    loading: loadingDeleteClasses
  } = usePermission($w, 'classes', 'delete');
  const {
    permission: canManageStudents,
    loading: loadingManageStudents
  } = usePermission($w, 'classes', 'manage_students');

  // 过滤班级
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || cls.headTeacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || cls.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  // 统计数据
  const stats = {
    total: classes.length,
    totalStudents: classes.reduce((sum, cls) => sum + cls.studentCount, 0),
    grade1: classes.filter(c => c.grade === '高一').length,
    grade2: classes.filter(c => c.grade === '高二').length,
    grade3: classes.filter(c => c.grade === '高三').length
  };

  // 创建新班级
  const handleCreateClass = () => {
    if (!canCreateClasses) {
      toast({
        title: '权限不足',
        description: '您没有创建班级的权限',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: '功能开发中',
      description: '创建班级功能正在开发中'
    });
  };

  // 编辑班级
  const handleEditClass = classData => {
    if (!canEditClasses) {
      toast({
        title: '权限不足',
        description: '您没有编辑班级的权限',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: '功能开发中',
      description: `编辑班级 ${classData.name} 功能正在开发中`
    });
  };

  // 删除班级
  const handleDeleteClass = classId => {
    if (!canDeleteClasses) {
      toast({
        title: '权限不足',
        description: '您没有删除班级的权限',
        variant: 'destructive'
      });
      return;
    }
    if (window.confirm('确定要删除此班级吗？此操作不可撤销。')) {
      setClasses(classes.filter(cls => cls.id !== classId));
      toast({
        title: '删除成功',
        description: '班级已成功删除'
      });
    }
  };

  // 管理学生
  const handleManageStudents = classData => {
    if (!canManageStudents) {
      toast({
        title: '权限不足',
        description: '您没有管理学生的权限',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: '功能开发中',
      description: `管理班级 ${classData.name} 学生功能正在开发中`
    });
  };

  // 加载状态
  const isLoading = loadingViewClasses || loadingCreateClasses || loadingEditClasses || loadingDeleteClasses || loadingManageStudents;
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>;
  }

  // 权限检查
  if (!canViewClasses) {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Alert className="max-w-md bg-red-900/50 border-red-500">
          <AlertDescription className="text-white">
            您没有访问班级管理的权限，请联系管理员
          </AlertDescription>
        </Alert>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <School className="w-8 h-8 text-blue-400" />
                班级管理
              </h1>
              <p className="text-indigo-200">管理班级信息、学生分配和班级事务</p>
            </div>
            <div className="flex gap-3">
              {canCreateClasses && <Button onClick={handleCreateClass} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  添加班级
                </Button>}
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-blue-100 text-sm mt-1">班级总数</div>
              </div>
              <School className="w-12 h-12 text-blue-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
                <div className="text-green-100 text-sm mt-1">学生总数</div>
              </div>
              <Users className="w-12 h-12 text-green-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.grade1 + stats.grade2}</div>
                <div className="text-purple-100 text-sm mt-1">高一高二班级</div>
              </div>
              <BookOpen className="w-12 h-12 text-purple-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.grade3}</div>
                <div className="text-orange-100 text-sm mt-1">高三班级</div>
              </div>
              <Award className="w-12 h-12 text-orange-300 opacity-50" />
            </div>
          </div>
        </div>

        {/* 年级选择 */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white" />
            <span className="text-white font-medium mr-4">按年级筛选:</span>
            {GRADES.map(grade => <button key={grade.id} onClick={() => setSelectedGrade(grade.id)} className={`px-4 py-2 rounded-lg transition-all ${selectedGrade === grade.id ? 'bg-blue-600 text-white' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'}`}>
                {grade.name}
              </button>)}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input placeholder="搜索班级名称或班主任..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400" />
          </div>
        </div>

        {/* 班级列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(classData => <div key={classData.id} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-opacity-15 transition-all shadow-lg">
              {/* 班级头部 */}
              <div className={`p-6 ${classData.grade === '高一' ? 'bg-blue-600' : classData.grade === '高二' ? 'bg-purple-600' : 'bg-orange-600'} bg-opacity-80`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{classData.name}</h3>
                    <p className="text-white text-opacity-90 text-sm mt-1">{classData.headTeacher}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEditClasses && <DropdownMenuItem onClick={() => handleEditClass(classData)}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑班级
                        </DropdownMenuItem>}
                      {canManageStudents && <DropdownMenuItem onClick={() => handleManageStudents(classData)}>
                          <Users className="w-4 h-4 mr-2" />
                          管理学生
                        </DropdownMenuItem>}
                      {canDeleteClasses && <DropdownMenuItem onClick={() => handleDeleteClass(classData.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除班级
                        </DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* 班级信息 */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* 学生人数 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">学生人数</span>
                    </div>
                    <span className="text-white font-semibold">{classData.studentCount}人</span>
                  </div>

                  {/* 性别分布 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <User className="w-4 h-4" />
                      <span className="text-sm">性别分布</span>
                    </div>
                    <div className="flex gap-3">
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        男 {classData.maleStudents}
                      </Badge>
                      <Badge variant="outline" className="border-pink-500 text-pink-400">
                        女 {classData.femaleStudents}
                      </Badge>
                    </div>
                  </div>

                  {/* 教室位置 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">教室位置</span>
                    </div>
                    <span className="text-white text-sm">{classData.classroom}</span>
                  </div>

                  {/* 班长 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Star className="w-4 h-4" />
                      <span className="text-sm">班长</span>
                    </div>
                    <span className="text-white text-sm">{classData.monitor}</span>
                  </div>

                  {/* 创建时间 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">创建时间</span>
                    </div>
                    <span className="text-white text-sm">{classData.createdAt}</span>
                  </div>
                </div>

                {/* 快捷操作 */}
                {canManageStudents && <div className="mt-4 pt-4 border-t border-slate-700">
                    <Button variant="outline" onClick={() => handleManageStudents(classData)} className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                      <Users className="w-4 h-4 mr-2" />
                      查看学生名单
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>}
              </div>
            </div>)}
        </div>

        {filteredClasses.length === 0 && <div className="text-center py-12">
            <School className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">没有找到符合条件的班级</p>
          </div>}

        {/* TabBar */}
        <TabBar />
      </div>
    </div>;
}