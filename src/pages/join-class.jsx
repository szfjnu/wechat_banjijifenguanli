// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, User, Users, GraduationCap, CheckCircle, ArrowLeft, ArrowRight, Plus, Phone } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

export { JoinClassPage };
export default function JoinClassPage({
  $w,
  className,
  style
}) {
  const {
    currentUser
  } = $w.auth;
  const {
    navigateTo,
    navigateBack
  } = $w.utils;
  const {
    toast
  } = useToast();

  // 当前步骤：1-查找班级，2-选择身份，3-填写信息，4-加入成功
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 查找班级相关状态
  const [searchType, setSearchType] = useState('code'); // code 或 phone
  const [searchValue, setSearchValue] = useState('');
  const [foundClass, setFoundClass] = useState(null);

  // 身份选择
  const [selectedRole, setSelectedRole] = useState(''); // parent 或 student 或 teacher

  // 家长相关
  const [searchStudentName, setSearchStudentName] = useState('');
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [relationship, setRelationship] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  // 老师相关
  const [teacherName, setTeacherName] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');

  // 查找班级
  const handleSearchClass = async () => {
    if (!searchValue.trim()) {
      toast({
        variant: 'destructive',
        title: '请输入搜索内容',
        description: searchType === 'code' ? '请输入班级代码' : '请输入老师手机号'
      });
      return;
    }
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      let query = {};
      if (searchType === 'code') {
        query = {
          class_code: searchValue.toUpperCase()
        };
      } else {
        query = {
          head_teacher_phone: searchValue
        };
      }
      const result = await db.collection('classes').where(query).limit(1).get();
      if (!result.data || result.data.length === 0) {
        toast({
          variant: 'destructive',
          title: '未找到班级',
          description: searchType === 'code' ? '请检查班级代码是否正确' : '请检查老师手机号是否正确'
        });
        setFoundClass(null);
      } else {
        setFoundClass(result.data[0]);
        setStep(2);
      }
    } catch (error) {
      console.error('查找班级失败:', error);
      toast({
        variant: 'destructive',
        title: '查找失败',
        description: error.message || '无法查找班级'
      });
    } finally {
      setLoading(false);
    }
  };

  // 搜索学生
  const handleSearchStudents = async () => {
    if (!searchStudentName.trim()) {
      toast({
        variant: 'destructive',
        title: '请输入学生姓名',
        description: '请输入要关联的学生姓名'
      });
      return;
    }
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('students').where({
        class_name: foundClass.class_name,
        name: searchStudentName
      }).limit(5).get();
      setStudentsList(result.data || []);
    } catch (error) {
      console.error('搜索学生失败:', error);
      toast({
        variant: 'destructive',
        title: '搜索失败',
        description: error.message || '无法搜索学生'
      });
    } finally {
      setLoading(false);
    }
  };

  // 添加新学生
  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      toast({
        variant: 'destructive',
        title: '请输入学生姓名',
        description: '学生姓名不能为空'
      });
      return;
    }
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const studentId = 'student_' + Date.now();
      await db.collection('students').add({
        student_id: studentId,
        name: newStudentName,
        gender: '未知',
        group: '',
        is_boarding: false,
        position: '',
        current_score: 100,
        dorm_score: 100,
        avatar_url: '',
        birthday: '',
        class_name: foundClass.class_name,
        phone_number: newStudentPhone,
        parent_phone_number: '',
        academic_records: [],
        certificates: [],
        note: ''
      });
      setSelectedStudent({
        student_id: studentId,
        name: newStudentName,
        phone_number: newStudentPhone
      });
      setShowAddStudent(false);
      toast({
        title: '添加成功',
        description: `学生 ${newStudentName} 已添加到班级`
      });
    } catch (error) {
      console.error('添加学生失败:', error);
      toast({
        variant: 'destructive',
        title: '添加失败',
        description: error.message || '无法添加学生'
      });
    } finally {
      setLoading(false);
    }
  };

  // 提交加入班级
  const handleSubmitJoin = async () => {
    // 验证必填项
    if (selectedRole === 'parent') {
      if (!selectedStudent) {
        toast({
          variant: 'destructive',
          title: '请选择或添加学生',
          description: '请选择要关联的学生'
        });
        return;
      }
      if (!relationship) {
        toast({
          variant: 'destructive',
          title: '请选择关系',
          description: '请选择您与学生的关系'
        });
        return;
      }
    } else if (selectedRole === 'teacher') {
      if (!teacherName.trim()) {
        toast({
          variant: 'destructive',
          title: '请输入姓名',
          description: '请输入您的姓名'
        });
        return;
      }
      if (!teacherSubject) {
        toast({
          variant: 'destructive',
          title: '请选择任教科目',
          description: '请选择您任教的科目'
        });
        return;
      }
      if (!teacherPhone.trim()) {
        toast({
          variant: 'destructive',
          title: '请输入联系电话',
          description: '请输入您的联系电话'
        });
        return;
      }
    }
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 检查是否已经加入
      const existingResult = await db.collection('user_class_relation').where({
        user_id: currentUser?.userId,
        class_id: foundClass.class_id
      }).get();
      if (existingResult.data && existingResult.data.length > 0) {
        toast({
          variant: 'warning',
          title: '已加入',
          description: '您已经是这个班级的成员了'
        });
        return;
      }

      // 添加班级关联
      await db.collection('user_class_relation').add({
        user_id: currentUser?.userId,
        user_name: currentUser?.name,
        class_id: foundClass.class_id,
        class_name: foundClass.class_name,
        role: selectedRole === 'student' ? 'student' : selectedRole,
        is_owner: false,
        student_id: selectedStudent?.student_id,
        student_name: selectedStudent?.name,
        relationship: selectedRole === 'parent' ? relationship : '',
        subject: selectedRole === 'teacher' ? teacherSubject : '',
        phone: selectedRole === 'teacher' ? teacherPhone : '',
        joined_at: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setStep(4);
      toast({
        title: '加入成功',
        description: `成功加入 ${foundClass.class_name}`
      });
    } catch (error) {
      console.error('加入班级失败:', error);
      toast({
        variant: 'destructive',
        title: '加入失败',
        description: error.message || '无法加入班级'
      });
    } finally {
      setLoading(false);
    }
  };

  // 返回上一步
  const handleBack = () => {
    if (step === 1) {
      navigateBack();
    } else {
      setStep(step - 1);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" style={style}>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map(s => <React.Fragment key={s}>
              <div className={`w-3 h-3 rounded-full transition-all ${s <= step ? 'bg-blue-600' : 'bg-gray-300'}`} />
              {s < 4 && <div className={`w-12 h-0.5 transition-all ${s < step ? 'bg-blue-600' : 'bg-gray-300'}`} />}
            </React.Fragment>)}
        </div>
        
        <Card className="bg-white shadow-lg rounded-xl p-6">
          {/* 步骤 1: 查找班级 */}
          {step === 1 && <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">查找班级</h2>
                <p className="text-gray-600">请输入班级代码或老师手机号</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setSearchType('code')} className={`flex-1 py-2 px-4 rounded-lg transition-colors ${searchType === 'code' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    班级代码
                  </button>
                  <button onClick={() => setSearchType('phone')} className={`flex-1 py-2 px-4 rounded-lg transition-colors ${searchType === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    老师手机号
                  </button>
                </div>
                
                <Input type={searchType === 'code' ? 'text' : 'tel'} placeholder={searchType === 'code' ? '请输入班级代码（如：CLASS-ABC123）' : '请输入老师手机号'} value={searchValue} onChange={e => setSearchValue(e.target.value)} onKeyPress={e => {
              if (e.key === 'Enter') {
                handleSearchClass();
              }
            }} className="text-lg" />
                
                <Button onClick={handleSearchClass} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" size="lg">
                  {loading ? '查找中...' : '查找班级'}
                </Button>
              </div>
            </div>}
          
          {/* 步骤 2: 选择身份 */}
          {step === 2 && foundClass && <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">找到班级</h2>
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-lg text-blue-800">{foundClass.class_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    班主任：{foundClass.head_teacher_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    学生：{foundClass.student_count || 0} 人
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-700 font-medium mb-3 text-center">
                  请选择您的身份
                </p>
                <div className="space-y-3">
                  <button onClick={() => setSelectedRole('parent')} className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedRole === 'parent' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <Users className={`w-6 h-6 ${selectedRole === 'parent' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div>
                        <div className="font-semibold text-gray-800">家长</div>
                        <div className="text-sm text-gray-600">查看孩子的学习和表现</div>
                      </div>
                    </div>
                  </button>
                  
                  <button onClick={() => setSelectedRole('student')} className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedRole === 'student' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <GraduationCap className={`w-6 h-6 ${selectedRole === 'student' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div>
                        <div className="font-semibold text-gray-800">学生</div>
                        <div className="text-sm text-gray-600">管理学习和参与活动</div>
                      </div>
                    </div>
                  </button>
                  
                  <button onClick={() => setSelectedRole('teacher')} className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedRole === 'teacher' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <User className={`w-6 h-6 ${selectedRole === 'teacher' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div>
                        <div className="font-semibold text-gray-800">老师</div>
                        <div className="text-sm text-gray-600">教学管理和班级管理</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  返回
                </Button>
                <Button onClick={() => setStep(3)} disabled={!selectedRole} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  下一步
                </Button>
              </div>
            </div>}
          
          {/* 步骤 3: 填写信息 */}
          {step === 3 && <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">填写信息</h2>
                <p className="text-gray-600">
                  {selectedRole === 'parent' && '请选择或添加要关联的学生'}
                  {selectedRole === 'student' && '确认加入班级'}
                  {selectedRole === 'teacher' && '请填写您的教师信息'}
                </p>
              </div>
              
              {/* 家长身份：选择/添加学生 */}
              {selectedRole === 'parent' && <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      搜索学生
                    </label>
                    <div className="flex gap-2">
                      <Input placeholder="请输入学生姓名" value={searchStudentName} onChange={e => setSearchStudentName(e.target.value)} onKeyPress={e => {
                  if (e.key === 'Enter') {
                    handleSearchStudents();
                  }
                }} />
                      <Button onClick={handleSearchStudents} disabled={loading} variant="outline">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* 搜索结果 */}
                  {studentsList.length > 0 && <div className="space-y-2">
                      {studentsList.map((student, index) => <button key={index} onClick={() => {
                setSelectedStudent(student);
                setStudentsList([]);
                setSearchStudentName('');
              }} className={`w-full p-3 rounded-lg border-2 transition-all text-left ${selectedStudent?.student_id === student.student_id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-800">{student.name}</div>
                              {student.phone_number && <div className="text-sm text-gray-600">{student.phone_number}</div>}
                            </div>
                            {selectedStudent?.student_id === student.student_id && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                        </button>)}
                    </div>}
                  
                  {/* 添加新学生按钮 */}
                  <button onClick={() => setShowAddStudent(true)} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Plus className="w-5 h-5" />
                      <span>添加新学生</span>
                    </div>
                  </button>
                  
                  {/* 添加新学生表单 */}
                  {showAddStudent && <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          学生姓名 *
                        </label>
                        <Input placeholder="请输入学生姓名" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          学生电话（选填）
                        </label>
                        <Input type="tel" placeholder="请输入学生电话" value={newStudentPhone} onChange={e => setNewStudentPhone(e.target.value)} />
                      </div>
                      <Button onClick={handleAddStudent} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                        {loading ? '添加中...' : '添加学生'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                setShowAddStudent(false);
                setNewStudentName('');
                setNewStudentPhone('');
              }} className="w-full">
                        取消
                      </Button>
                    </div>}
                  
                  {/* 已选择学生 */}
                  {selectedStudent && <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-semibold text-blue-800">{selectedStudent.name}</div>
                          {selectedStudent.phone_number && <div className="text-sm text-blue-600">{selectedStudent.phone_number}</div>}
                        </div>
                      </div>
                    </div>}
                  
                  {/* 选择关系 */}
                  {selectedStudent && <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        与学生的关系 *
                      </label>
                      <Select onValueChange={setRelationship}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择关系" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="father">父亲</SelectItem>
                          <SelectItem value="mother">母亲</SelectItem>
                          <SelectItem value="grandfather">祖父</SelectItem>
                          <SelectItem value="grandmother">祖母</SelectItem>
                          <SelectItem value="guardian">监护人</SelectItem>
                          <SelectItem value="other">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>}
                </div>}
              
              {/* 老师身份：填写信息 */}
              {selectedRole === 'teacher' && <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 *
                    </label>
                    <Input placeholder="请输入您的姓名" value={teacherName} onChange={e => setTeacherName(e.target.value)} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      任教科目 *
                    </label>
                    <Select onValueChange={setTeacherSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择任教科目" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="语文">语文</SelectItem>
                        <SelectItem value="数学">数学</SelectItem>
                        <SelectItem value="英语">英语</SelectItem>
                        <SelectItem value="物理">物理</SelectItem>
                        <SelectItem value="化学">化学</SelectItem>
                        <SelectItem value="生物">生物</SelectItem>
                        <SelectItem value="历史">历史</SelectItem>
                        <SelectItem value="地理">地理</SelectItem>
                        <SelectItem value="政治">政治</SelectItem>
                        <SelectItem value="音乐">音乐</SelectItem>
                        <SelectItem value="美术">美术</SelectItem>
                        <SelectItem value="体育">体育</SelectItem>
                        <SelectItem value="信息技术">信息技术</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      联系电话 *
                    </label>
                    <Input type="tel" placeholder="请输入联系电话" value={teacherPhone} onChange={e => setTeacherPhone(e.target.value)} />
                  </div>
                </div>}
              
              {/* 学生身份：确认信息 */}
              {selectedRole === 'student' && <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">加入班级信息</h3>
                    <p className="text-gray-700">班级：{foundClass.class_name}</p>
                    <p className="text-gray-700">班主任：{foundClass.head_teacher_name}</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    加入后，您将可以查看班级信息、参与班级活动和管理学习。
                  </p>
                </div>}
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  返回
                </Button>
                <Button onClick={handleSubmitJoin} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {loading ? '加入中...' : '加入班级'}
                </Button>
              </div>
            </div>}
          
          {/* 步骤 4: 加入成功 */}
          {step === 4 && <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">加入成功!</h2>
                <p className="text-gray-600">您已成功加入班级</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-lg text-blue-800">{foundClass.class_name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRole === 'parent' && `已关联学生：${selectedStudent?.name}`}
                  {selectedRole === 'teacher' && `任教科目：${teacherSubject}`}
                  {selectedRole === 'student' && '身份：学生'}
                </p>
              </div>
              
              <div className="space-y-3">
                <Button onClick={() => navigateTo({
              pageId: 'home',
              params: {
                classId: foundClass.class_id,
                className: foundClass.class_name
              }
            })} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" size="lg">
                  进入班级
                </Button>
                <Button variant="outline" onClick={() => navigateTo({
              pageId: 'welcome',
              params: {}
            })} className="w-full">
                  返回欢迎页
                </Button>
              </div>
            </div>}
        </Card>
      </div>
    </div>;
}