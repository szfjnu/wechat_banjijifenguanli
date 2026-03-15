// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Card, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Progress, Badge } from '@/components/ui';
// @ts-ignore;
import { Clock, FileText, User, CheckCircle, AlertCircle, Plus, History } from 'lucide-react';

// @ts-ignore;
import { TabBar } from '@/components/TabBar';
import { usePermission } from '@/components/PermissionGuard';

// 获取北京时间（UTC+8）
const getBeijingTime = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const beijingOffset = 8;
  return new Date(utc + 3600000 * beijingOffset);
};

// 获取北京时间字符串（YYYY-MM-DD格式）
const getBeijingDateString = () => {
  const beijingTime = getBeijingTime();
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export default function RevocationVolunteerPage(props) {
  const {
    toast
  } = useToast();
  const currentUser = props.$w.auth.currentUser;
  const [loading, setLoading] = useState(true);

  // 权限检查
  const {
    permission: canViewRevocationVolunteer,
    loading: loadingViewRevocationVolunteer
  } = usePermission($w, 'revocation_volunteer', 'view');
  const {
    permission: canCreateRevocationVolunteer,
    loading: loadingCreateRevocationVolunteer
  } = usePermission($w, 'revocation_volunteer', 'create');
  const {
    permission: canApproveRevocationVolunteer,
    loading: loadingApproveRevocationVolunteer
  } = usePermission($w, 'revocation_volunteer', 'approve');
  const {
    permission: canRejectRevocationVolunteer,
    loading: loadingRejectRevocationVolunteer
  } = usePermission($w, 'revocation_volunteer', 'reject');
  const [submitting, setSubmitting] = useState(false);
  const [disciplineRecords, setDisciplineRecords] = useState([]);
  const [volunteerRecords, setVolunteerRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [showForm, setShowForm] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    hours: '',
    serviceDate: getBeijingDateString(),
    description: '',
    witness: '',
    activityName: '',
    activityType: '',
    location: ''
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取当前用户信息
      const currentUser = props.$w.auth.currentUser;
      const userType = currentUser?.type || '';
      const userName = currentUser?.name || '';

      // 根据用户类型构建查询条件
      let disciplineQuery = {
        revocation_status: db.command.in(['考察中', '符合条件'])
      };
      let volunteerQuery = {};
      if (userType === '学生') {
        // 学生只看自己的数据
        disciplineQuery = {
          ...disciplineQuery,
          student_name: userName
        };
        volunteerQuery = {
          student_name: userName
        };
      } else if (userType === '班主任') {
        // 班主任只看自己班级学生的数据
        try {
          const userResult = await db.collection('user').where({
            name: userName,
            type: '班主任'
          }).get();
          if (userResult.data && userResult.data.length > 0) {
            const userData = userResult.data[0];
            if (userData.managed_class_name) {
              // 先获取班级中的学生姓名
              const studentsResult = await db.collection('students').where({
                class_name: userData.managed_class_name
              }).field({
                name: true
              }).get();
              const studentNames = studentsResult.data?.map(s => s.name) || [];
              if (studentNames.length > 0) {
                disciplineQuery = {
                  ...disciplineQuery,
                  student_name: db.command.in(studentNames)
                };
                volunteerQuery = {
                  student_name: db.command.in(studentNames)
                };
              } else {
                // 班级中没有学生，返回空结果
                setDisciplineRecords([]);
                setVolunteerRecords([]);
                setLoading(false);
                return;
              }
            }
          }
        } catch (err) {
          console.error('查询班主任班级信息失败:', err);
        }
      } else if (userType === '家长') {
        // 家长看自己孩子的数据（这里简化处理，实际应该从关联表获取）
        // 暂时显示所有数据
        disciplineQuery = disciplineQuery;
        volunteerQuery = volunteerQuery;
      }
      // 其他角色（管理员、教师等）查看所有数据

      // 查询用户的未撤销处分记录
      const disciplineResult = await db.collection('discipline_record').where(disciplineQuery).get();
      if (disciplineResult.data.length > 0) {
        setDisciplineRecords(disciplineResult.data);
        if (disciplineResult.data.length === 1) {
          setSelectedRecordId(disciplineResult.data[0]._id);
        }
      }

      // 查询用户的志愿服务记录
      const volunteerResult = await db.collection('revocation_volunteer').where(volunteerQuery).orderBy('service_date', 'desc').get();
      setVolunteerRecords(volunteerResult.data);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载数据失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentUser?.userId) {
      loadData();
    }
  }, [currentUser?.userId]);

  // 处理表单提交
  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedRecordId) {
      toast({
        title: '请选择处分记录',
        description: '请先选择要关联的处分记录',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.hours || !formData.serviceDate || !formData.description) {
      toast({
        title: '请填写完整信息',
        description: '服务时长、服务日期和服务内容为必填项',
        variant: 'destructive'
      });
      return;
    }
    setSubmitting(true);
    try {
      const tcb = await props.$w.cloud.getCloudInstance();

      // 创建志愿服务记录
      await tcb.collection('revocation_volunteer').add({
        student_id: currentUser.userId,
        discipline_record_id: selectedRecordId,
        hours: parseFloat(formData.hours),
        service_date: new Date(formData.serviceDate),
        description: formData.description,
        witness: formData.witness,
        activity_name: formData.activityName,
        activity_type: formData.activityType,
        location: formData.location,
        review_status: '待审核',
        created_by: currentUser.userId,
        submit_by: currentUser.userId,
        created_at: new Date(),
        updated_at: new Date()
      });

      // 更新处分记录的已完成志愿服务时长
      const selectedRecord = disciplineRecords.find(r => r._id === selectedRecordId);
      const newCompletedHours = (selectedRecord.completed_volunteer_hours || 0) + parseFloat(formData.hours);

      // 检查是否满足撤销条件
      let newRevocationStatus = selectedRecord.revocation_status;
      const requirementsMet = newCompletedHours >= (selectedRecord.volunteer_hours_required || 0) && (selectedRecord.completed_report_count || 0) >= (selectedRecord.report_count_required || 0);
      if (requirementsMet && newRevocationStatus === '考察中') {
        newRevocationStatus = '符合条件';
      }
      await tcb.collection('discipline_record').doc(selectedRecordId).update({
        completed_volunteer_hours: newCompletedHours,
        revocation_status: newRevocationStatus,
        updated_at: new Date()
      });
      toast({
        title: '提交成功',
        description: '志愿服务记录已提交，等待审核'
      });

      // 重置表单并重新加载数据
      setFormData({
        hours: '',
        serviceDate: getBeijingDateString(),
        description: '',
        witness: '',
        activityName: '',
        activityType: '',
        location: ''
      });
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error('提交失败:', error);
      toast({
        title: '提交失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 获取选中记录的信息
  const selectedRecord = disciplineRecords.find(r => r._id === selectedRecordId);

  // 计算该记录的志愿服务统计
  const selectedRecordVolunteers = volunteerRecords.filter(r => r.discipline_record_id === selectedRecordId);
  const completedHours = selectedRecordVolunteers.reduce((sum, r) => sum + (r.hours || 0), 0);
  const requiredHours = selectedRecord?.volunteer_hours_required || 0;
  const remainingHours = Math.max(0, requiredHours - completedHours);
  const progressPercent = requiredHours > 0 ? Math.min(100, completedHours / requiredHours * 100) : 0;
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            撤销处分志愿服务
          </h1>
          <p className="text-gray-600 mt-1">提交志愿服务记录，完成撤销处分要求</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div> : disciplineRecords.length === 0 ? <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">无需提交志愿服务</h3>
            <p className="text-gray-600">您当前没有需要撤销的处分记录</p>
          </Card> : <>
            {/* 处分记录选择和进度卡片 */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white/80 mb-2 block">选择处分记录</Label>
                  <Select value={selectedRecordId} onValueChange={setSelectedRecordId}>
                    <SelectTrigger className="bg-white/10 text-white border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplineRecords.map(record => <SelectItem key={record._id} value={record._id}>
                          {record.level} - {record.reason}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => setShowForm(!showForm)} className="w-full bg-white text-indigo-600 hover:bg-white/90">
                    <Plus className="w-4 h-4 mr-2" />
                    {showForm ? '取消' : '提交新记录'}
                  </Button>
                </div>
              </div>
            </Card>

            {selectedRecord && <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* 服务时长进度 */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">志愿服务时长</h3>
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {completedHours.toFixed(1)}<span className="text-lg text-gray-500">/{requiredHours}小时</span>
                  </div>
                  <Progress value={progressPercent} className="mb-2" />
                  <p className="text-sm text-gray-600">剩余 {remainingHours.toFixed(1)} 小时</p>
                </Card>

                {/* 已提交记录数 */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">已提交记录</h3>
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {selectedRecordVolunteers.length}<span className="text-lg text-gray-500">条</span>
                  </div>
                  <p className="text-sm text-gray-600">累计 {completedHours.toFixed(1)} 小时</p>
                </Card>

                {/* 考察状态 */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">考察状态</h3>
                    {selectedRecord.revocation_status === '符合条件' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {selectedRecord.revocation_status === '符合条件' ? <span className="text-green-600">符合条件</span> : <span className="text-amber-600">考察中</span>}
                  </div>
                  <Badge variant={selectedRecord.revocation_status === '符合条件' ? 'default' : 'secondary'}>
                    {selectedRecord.revocation_status === '符合条件' ? '可申请撤销' : '继续努力'}
                  </Badge>
                </Card>
              </div>}

            {/* 提交表单 */}
            {showForm && <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  提交志愿服务记录
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>活动名称 *</Label>
                      <Input value={formData.activityName} onChange={e => setFormData({
                  ...formData,
                  activityName: e.target.value
                })} placeholder="如：校园清扫活动" />
                    </div>
                    <div>
                      <Label>活动类型</Label>
                      <Select value={formData.activityType} onValueChange={value => setFormData({
                  ...formData,
                  activityType: value
                })}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择活动类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="校园服务">校园服务</SelectItem>
                          <SelectItem value="社区服务">社区服务</SelectItem>
                          <SelectItem value="志愿服务">志愿服务</SelectItem>
                          <SelectItem value="公益活动">公益活动</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>服务时长（小时）*</Label>
                      <Input type="number" step="0.1" min="0" value={formData.hours} onChange={e => setFormData({
                  ...formData,
                  hours: e.target.value
                })} placeholder="如：2.5" />
                    </div>
                    <div>
                      <Label>服务日期 *</Label>
                      <Input type="date" value={formData.serviceDate} onChange={e => setFormData({
                  ...formData,
                  serviceDate: e.target.value
                })} />
                    </div>
                    <div>
                      <Label>服务地点</Label>
                      <Input value={formData.location} onChange={e => setFormData({
                  ...formData,
                  location: e.target.value
                })} placeholder="如：学校操场" />
                    </div>
                    <div>
                      <Label>证明人</Label>
                      <Input value={formData.witness} onChange={e => setFormData({
                  ...formData,
                  witness: e.target.value
                })} placeholder="如：张老师" />
                    </div>
                  </div>
                  <div>
                    <Label>服务内容 *</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({
                ...formData,
                description: e.target.value
              })} placeholder="请详细描述您的志愿服务内容..." rows={4} />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? '提交中...' : '提交记录'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      取消
                    </Button>
                  </div>
                </form>
              </Card>}

            {/* 历史记录 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                历史志愿服务记录
              </h3>
              <div className="space-y-4">
                {selectedRecordVolunteers.length === 0 ? <p className="text-center text-gray-500 py-8">暂无志愿服务记录</p> : selectedRecordVolunteers.map((record, index) => <div key={record._id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{record.activity_name || '志愿服务'}</h4>
                        <Badge variant={record.review_status === '待审核' ? 'secondary' : record.review_status === '已通过' ? 'default' : 'destructive'}>
                          {record.review_status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{record.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {record.hours} 小时
                        </span>
                        <span>· {new Date(record.service_date).toLocaleDateString('zh-CN')}</span>
                        {record.location && <span>· {record.location}</span>}
                      </div>
                      {record.witness && <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                          <User className="w-4 h-4" />
                          证明人：{record.witness}
                        </div>}
                    </div>)}
              </div>
            </Card>
          </>}
      </main>

      <TabBar currentPage="revocation-volunteer" />
    </div>;
}