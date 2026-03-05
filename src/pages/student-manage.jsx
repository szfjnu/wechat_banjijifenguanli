// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Plus, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Users, Home, User, History } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@/components/ui';

import TabBar from '@/components/TabBar';
import { StudentFormDialog } from '@/components/StudentFormDialog';
import { StudentViewDialog } from '@/components/StudentViewDialog';
import { StudentHistoryDialog } from '@/components/StudentHistoryDialog';
export default function StudentManagePage({
  $w
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState('student-manage');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [operationHistory, setOperationHistory] = useState([]);
  const {
    toast
  } = useToast();
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [formData, setFormData] = useState({});
  const loadStudents = async () => {
    setLoading(true);
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'students',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {}
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize,
          pageNumber: currentPageNum,
          orderBy: [{
            student_id: 'asc'
          }]
        }
      });
      setStudents(result.records || []);
      setTotal(result.total || 0);
    } catch (error) {
      toast({
        title: '错误',
        description: '加载学生数据失败：' + error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const loadOperationHistory = async student => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'student_operation_history',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                student_id: {
                  $eq: student.student_id
                }
              }]
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            created_at: 'desc'
          }],
          pageSize: 50
        }
      });
      setOperationHistory(result.records || []);
    } catch (error) {
      setOperationHistory([]);
    }
  };
  useEffect(() => {
    loadStudents();
  }, [currentPageNum]);
  const handleSearch = async () => {
    if (!searchText.trim()) {
      loadStudents();
      return;
    }
    setLoading(true);
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'students',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $or: [{
                name: {
                  $eq: searchText
                }
              }, {
                student_id: {
                  $eq: searchText
                }
              }, {
                class_name: {
                  $eq: searchText
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize,
          pageNumber: 1
        }
      });
      setStudents(result.records || []);
      setTotal(result.total || 0);
      setCurrentPageNum(1);
    } catch (error) {
      toast({
        title: '错误',
        description: '搜索失败：' + error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAdd = () => {
    setFormData({
      student_id: '',
      name: '',
      gender: '男',
      class_name: '',
      group_id: '',
      is_boarding: false,
      position: '',
      student_record_id: '',
      current_score: 100,
      initial_score: 100,
      id_card_number: '',
      date_of_birth: '',
      phone_number: '',
      parent_phone_number: '',
      home_address: '',
      ethnicity: '汉族',
      native_place: '',
      political_status: '群众',
      postal_code: '',
      enrollment_date: '',
      graduated_from: '',
      health_status: '良好',
      height: '',
      family_members: [],
      resume: [],
      awards_and_punishments: '',
      head_teacher_opinion: '',
      school_opinion: '',
      score_level: 'A',
      dorm_info: {
        building: '',
        room: '',
        bed: ''
      },
      dorm_score: 100,
      dorm_initial_score: 100,
      dorm_converted_score: 0
    });
    setIsAddDialogOpen(true);
  };
  const handleEdit = student => {
    setSelectedStudent(student);
    setFormData({
      ...student
    });
    setIsEditDialogOpen(true);
  };
  const handleView = student => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };
  const handleHistory = student => {
    setSelectedStudent(student);
    loadOperationHistory(student);
    setIsHistoryDialogOpen(true);
  };
  const handleDelete = async student => {
    if (!confirm('确定要删除学生吗？此操作不可恢复。')) {
      return;
    }
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'students',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: student._id
                }
              }]
            }
          }
        }
      });
      await recordOperationHistory(student.student_id, '删除', `删除学生：${student.name}（学号：${student.student_id}）`);
      toast({
        title: '成功',
        description: '删除成功'
      });
      loadStudents();
    } catch (error) {
      toast({
        title: '错误',
        description: '删除失败：' + error.message,
        variant: 'destructive'
      });
    }
  };
  const checkStudentIdUnique = async studentId => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'students',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                student_id: {
                  $eq: studentId
                }
              }]
            }
          },
          select: {
            _id: true,
            student_id: true
          },
          getCount: true
        }
      });
      return (result.total || 0) === 0;
    } catch (error) {
      return false;
    }
  };
  const recordOperationHistory = async (studentId, operationType, operationDetails) => {
    try {
      const currentUser = $w.auth.currentUser || {};
      await $w.cloud.callDataSource({
        dataSourceName: 'student_operation_history',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            student_id: studentId,
            operation_type: operationType,
            operation_details: operationDetails,
            operation_by: currentUser.name || currentUser.userId || '未知用户',
            created_at: Date.now()
          }
        }
      });
    } catch (error) {
      console.error('记录操作历史失败：', error);
    }
  };
  const handleSaveAdd = async () => {
    if (!formData.student_id) {
      toast({
        title: '错误',
        description: '学号不能为空',
        variant: 'destructive'
      });
      return;
    }
    const isUnique = await checkStudentIdUnique(formData.student_id);
    if (!isUnique) {
      toast({
        title: '错误',
        description: '学号已存在，请使用其他学号',
        variant: 'destructive'
      });
      return;
    }
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'students',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            ...formData,
            created_at: Date.now(),
            updated_at: Date.now(),
            created_by: ($w.auth.currentUser || {}).userId || 'unknown',
            updated_by: ($w.auth.currentUser || {}).userId || 'unknown'
          }
        }
      });
      await recordOperationHistory(formData.student_id, '新增', `新增学生：${formData.name}（学号：${formData.student_id}）`);
      toast({
        title: '成功',
        description: '添加成功'
      });
      setIsAddDialogOpen(false);
      loadStudents();
    } catch (error) {
      toast({
        title: '错误',
        description: '添加失败：' + error.message,
        variant: 'destructive'
      });
    }
  };
  const handleSaveEdit = async () => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'students',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            ...formData,
            updated_at: Date.now(),
            updated_by: ($w.auth.currentUser || {}).userId || 'unknown'
          },
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: selectedStudent._id
                }
              }]
            }
          }
        }
      });
      await recordOperationHistory(formData.student_id, '编辑', `编辑学生：${formData.name}（学号：${formData.student_id}）`);
      toast({
        title: '成功',
        description: '更新成功'
      });
      setIsEditDialogOpen(false);
      loadStudents();
    } catch (error) {
      toast({
        title: '错误',
        description: '更新失败：' + error.message,
        variant: 'destructive'
      });
    }
  };
  const addFamilyMember = () => {
    setFormData({
      ...formData,
      family_members: [...(formData.family_members || []), {
        title: '',
        name: '',
        age: '',
        work_unit: '',
        position: '',
        phone: ''
      }]
    });
  };
  const removeFamilyMember = index => {
    const newMembers = [...(formData.family_members || [])];
    newMembers.splice(index, 1);
    setFormData({
      ...formData,
      family_members: newMembers
    });
  };
  const addResumeItem = () => {
    setFormData({
      ...formData,
      resume: [...(formData.resume || []), {
        start_end_date: '',
        description: '',
        witness: ''
      }]
    });
  };
  const removeResumeItem = index => {
    const newResume = [...(formData.resume || [])];
    newResume.splice(index, 1);
    setFormData({
      ...formData,
      resume: newResume
    });
  };
  const recordOperation = async (studentId, operationType, details) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'student_operation_history',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            student_id: studentId,
            operation_type: operationType,
            operation_details: details,
            operation_by: $w.auth.currentUser?.name || '系统',
            created_at: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('记录操作历史失败：', error);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-20">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">学生基础信息管理</h1>
        <p className="text-orange-100">管理学生基本信息、学籍信息、住宿信息等</p>
      </div>

      <div className="px-6 py-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="搜索学号、姓名、班级..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" value={searchText} onChange={e => setSearchText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <Button onClick={handleSearch} className="bg-orange-600 hover:bg-orange-700 text-white">
              搜索
            </Button>
            <Button onClick={handleAdd} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="h-5 w-5 mr-2" />
              新增学生
            </Button>
          </div>

          <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <span className="text-gray-600">总数：</span>
              <span className="font-bold text-orange-600">{total}</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-600" />
              <span className="text-gray-600">住宿生：</span>
              <span className="font-bold text-orange-600">
                {students.filter(s => s.is_boarding).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-600" />
              <span className="text-gray-600">通校生：</span>
              <span className="font-bold text-orange-600">
                {students.filter(s => !s.is_boarding).length}
              </span>
            </div>
          </div>
        </div>

        {loading ? <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            加载中...
          </div> : students.length === 0 ? <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">暂无学生数据</p>
          </div> : <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">学号</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">姓名</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">性别</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">班级</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">积分</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">职务</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">住宿</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => <tr key={student._id} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.gender}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.class_name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-orange-600">
                      {student.current_score}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {student.position || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {student.is_boarding ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          住宿
                        </span> : <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          通校
                        </span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleView(student)} className="text-blue-600 hover:text-blue-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(student)} className="text-orange-600 hover:text-orange-700">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleHistory(student)} className="text-green-600 hover:text-green-700">
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(student)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                显示 {(currentPageNum - 1) * pageSize + 1}-{Math.min(currentPageNum * pageSize, total)} 条，共 {total} 条
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPageNum(currentPageNum - 1)} disabled={currentPageNum === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 py-1 text-sm">第 {currentPageNum} 页</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPageNum(currentPageNum + 1)} disabled={currentPageNum * pageSize >= total}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>}
      </div>

      <StudentFormDialog isOpen={isAddDialogOpen || isEditDialogOpen} onClose={() => {
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
    }} onSave={isAddDialogOpen ? handleSaveAdd : handleSaveEdit} formData={formData} setFormData={setFormData} isAdd={isAddDialogOpen} />

      <StudentViewDialog isOpen={isViewDialogOpen} onClose={() => setIsViewDialogOpen(false)} student={selectedStudent} />

      <StudentHistoryDialog isOpen={isHistoryDialogOpen} onClose={() => setIsHistoryDialogOpen(false)} student={selectedStudent} history={operationHistory} />

      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}