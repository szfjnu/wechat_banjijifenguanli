// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Plus, Calendar, Clock, Search, Filter, ChevronDown, CheckCircle, XCircle, TrendingUp, TrendingDown, FileText } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { getBeijingTime, getBeijingTimeISO, getBeijingDateString } from '@/lib/utils';

import { TabBar } from '@/components/TabBar';
export default function PointsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('points');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [students, setStudents] = useState([]);
  const [pointRules, setPointRules] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recordType, setRecordType] = useState('add');

  // 新增积分记录表单
  const [formData, setFormData] = useState({
    studentId: '',
    itemId: '',
    points: 0,
    time: getBeijingTime().toISOString().slice(0, 16),
    note: ''
  });
  useEffect(() => {
    loadPointsData();
  }, []);
  const loadPointsData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();

      // 加载积分规则（从 point_rule 数据模型）
      const rulesResult = await tcb.database().collection('point_rule').where({
        is_enabled: true
      }).get();
      if (rulesResult.data && rulesResult.data.length > 0) {
        const transformedRules = rulesResult.data.map(rule => ({
          _id: rule._id,
          id: rule.rule_id,
          name: rule.rule_name,
          points: rule.score_value,
          type: rule.rule_type === '加分' ? 'add' : 'deduct',
          category: rule.rule_category || '通用',
          description: rule.description,
          priority: rule.priority || 0
        })).sort((a, b) => b.priority - a.priority);
        setPointRules(transformedRules);
      } else {
        setPointRules([]);
      }

      // 加载积分记录（从 point_record 数据模型）
      const recordsResult = await tcb.database().collection('point_record').orderBy('record_date', 'desc').limit(50).get();
      if (recordsResult.data && recordsResult.data.length > 0) {
        const transformedRecords = recordsResult.data.map(record => ({
          id: record._id,
          studentId: record.student_id,
          studentName: record.student_name || '未知',
          itemName: record.item_name || '未知项目',
          points: record.point_change,
          category: record.item_category || '日常',
          time: record.record_date || new Date().toISOString(),
          note: record.reason || '',
          status: record.status === '已生效' ? 'approved' : record.status === '待审核' ? 'pending' : 'rejected'
        }));
        setHistoryRecords(transformedRecords);
      } else {
        setHistoryRecords([]);
      }

      // 加载学生数据
      const studentsResult = await tcb.database().collection('student').get();
      if (studentsResult.data && studentsResult.data.length > 0) {
        const transformedStudents = studentsResult.data.map(student => ({
          id: student._id,
          studentId: student.student_id,
          name: student.name,
          group: student.group || '未分组',
          totalPoints: student.current_score || 0
        }));
        setStudents(transformedStudents);
      } else {
        setStudents([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('加载积分数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '积分记录加载失败，请重试',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };
  const handleAddRecord = async () => {
    if (!formData.studentId || !formData.itemId) {
      toast({
        title: '请填写完整信息',
        description: '学生和积分项目为必填项',
        variant: 'destructive'
      });
      return;
    }
    try {
      const student = students.find(s => s.id === formData.studentId);
      const rule = pointRules.find(r => r.id === formData.itemId);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 添加积分记录到 point_record 数据模型
      const result = await db.collection('point_record').add({
        record_id: `SR${getBeijingTime().getTime()}`,
        record_date: formData.time,
        item_id: formData.itemId,
        item_name: rule.name,
        item_category: rule.category,
        point_type: rule.points > 0 ? '加分' : '扣分',
        point_change: formData.points,
        student_id: student.studentId,
        student_name: student.name,
        student_id_number: student.studentId,
        score_before: student.totalPoints,
        score_after: student.totalPoints + formData.points,
        reason: formData.note || rule.name,
        status: '待审核',
        operator_name: '教师',
        operator_type: '教师',
        semester_id: 1,
        semester_name: '2024-2025第二学期',
        remark: ''
      });

      // 更新前端状态
      const newRecord = {
        id: result.id || result._id,
        studentId: student.studentId,
        studentName: student.name,
        itemName: rule.name,
        points: formData.points,
        category: rule.category,
        time: new Date(formData.time).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        note: formData.note,
        status: 'pending'
      };
      setHistoryRecords([newRecord, ...historyRecords]);
      setShowAddModal(false);
      resetForm();
      toast({
        title: '记录添加成功',
        description: `${student.name}的${rule.name}积分已添加，待审核`
      });
    } catch (error) {
      console.error('添加积分记录失败:', error);
      toast({
        title: '添加失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };
  const handleApprove = async recordId => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新数据库记录
      await db.collection('point_record').doc(recordId).update({
        status: '已生效'
      });

      // 更新前端状态
      setHistoryRecords(records => records.map(r => r.id === recordId ? {
        ...r,
        status: 'approved'
      } : r));
      toast({
        title: '审核通过',
        description: '积分记录已生效'
      });
    } catch (error) {
      console.error('审核失败:', error);
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handleReject = async recordId => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新数据库记录
      await db.collection('point_record').doc(recordId).update({
        status: '已驳回'
      });

      // 更新前端状态
      setHistoryRecords(records => records.map(r => r.id === recordId ? {
        ...r,
        status: 'rejected'
      } : r));
      toast({
        title: '已拒绝',
        description: '积分记录已驳回'
      });
    } catch (error) {
      console.error('操作失败:', error);
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const resetForm = () => {
    setFormData({
      studentId: '',
      itemId: '',
      points: 0,
      time: getBeijingTime().toISOString().slice(0, 16),
      note: ''
    });
    setRecordType('add');
  };
  const handleItemChange = itemId => {
    const rule = pointRules.find(r => r.id === itemId);
    setFormData({
      ...formData,
      itemId,
      points: rule ? rule.points : 0
    });
  };
  const handlePointsChange = e => {
    const value = parseInt(e.target.value) || 0;
    setFormData({
      ...formData,
      points: value
    });
  };
  const handlePointsChangeInput = e => {
    const value = parseInt(e.target.value) || 0;
    setFormData({
      ...formData,
      points: value
    });
  };
  const filteredRules = pointRules.filter(rule => {
    if (recordType === 'add') {
      return rule.points > 0;
    } else {
      return rule.points < 0;
    }
  });

  // 添加调试日志
  console.log('points.jsx 调试信息:', {
    pointRulesCount: pointRules.length,
    studentsCount: students.length,
    historyRecordsCount: historyRecords.length,
    recordType,
    filteredRulesCount: filteredRules.length
  });
  const filteredRecords = historyRecords.filter(record => {
    const matchCategory = filterCategory === 'all' || record.category === filterCategory;
    const matchSearch = !searchKeyword || record.studentName.includes(searchKeyword) || record.itemName.includes(searchKeyword);
    return matchCategory && matchSearch;
  });
  const categories = ['all', '学习', '品德', '纪律', '卫生', '通用'];
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 头部 - 紧凑风格 */}
      <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">积分管理</h1>
          <Button onClick={() => {
          setShowAddModal(true);
          setRecordType('add');
        }} className="bg-blue-500 text-white h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              添加记录
            </Button>
        </div>
      </header>

      <div className="px-3 py-2">
        <div className="grid grid-cols-3 gap-2">
            <button onClick={() => {
          setShowAddModal(true);
          setRecordType('add');
        }} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all text-left">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">加分</span>
              </div>
              <p className="text-xs text-gray-500">记录优秀表现</p>
            </button>
            <button onClick={() => {
          setShowAddModal(true);
          setRecordType('deduct');
        }} className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all text-left">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">扣分</span>
              </div>
              <p className="text-xs text-gray-500">记录违纪行为</p>
            </button>
            <button onClick={() => setShowHistory(true)} className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all text-left">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">历史记录</span>
              </div>
              <p className="text-xs text-gray-500">查看所有记录</p>
            </button>
          </div>

        {/* 积分历史记录 */}
        {showHistory && <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">积分历史</h2>
              <div className="flex gap-2">
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 border-0 focus:ring-2 focus:ring-blue-500">
                  {categories.map(cat => <option key={cat} value={cat}>
                      {cat === 'all' ? '全部' : cat}
                    </option>)}
                </select>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="搜索学生姓名或积分项目..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>

            {/* 记录列表 */}
            <div className="space-y-3">
              {filteredRecords.length === 0 ? <div className="text-center py-8 text-gray-500">
                  {loading ? '加载中...' : '暂无记录'}
                </div> : filteredRecords.map(record => <div key={record.id} className={`p-4 rounded-xl border-2 transition-all ${record.status === 'approved' ? 'bg-emerald-50 border-emerald-200' : record.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800">{record.studentName}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${record.category === '学习' ? 'bg-blue-100 text-blue-700' : record.category === '品德' ? 'bg-emerald-100 text-emerald-700' : record.category === '纪律' ? 'bg-amber-100 text-amber-700' : record.category === '卫生' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                            {record.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${record.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : record.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {record.status === 'approved' ? '已生效' : record.status === 'rejected' ? '已驳回' : '待审核'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{record.itemName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{record.time}</span>
                          {record.note && <span className="text-gray-400">·</span>}
                          {record.note && <span className="text-gray-600">{record.note}</span>}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${record.points > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {record.points > 0 ? '+' : ''}{record.points}
                      </div>
                    </div>

                    {/* 审核按钮 */}
                    {record.status === 'pending' && <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                        <Button size="sm" variant="ghost" className="bg-emerald-500 text-white hover:bg-emerald-600" onClick={() => handleApprove(record.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          通过
                        </Button>
                        <Button size="sm" variant="ghost" className="bg-red-500 text-white hover:bg-red-600" onClick={() => handleReject(record.id)}>
                          <XCircle className="w-4 h-4 mr-1" />
                          驳回
                        </Button>
                      </div>}
                  </div>)}
            </div>
          </div>}
      </div>

      {/* 添加积分记录弹窗 */}
      {showAddModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">{recordType === 'add' ? '添加加分记录' : '添加扣分记录'}</h3>
                <button onClick={() => {
              setShowAddModal(false);
              resetForm();
            }} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* 选择学生 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择学生 <span className="text-red-500">*</span>
                  </label>
                  <select value={formData.studentId} onChange={e => setFormData({
                ...formData,
                studentId: e.target.value
              })} className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500">
                    <option value="">请选择学生</option>
                    {students.map(student => <option key={student.id} value={student.id}>
                        {student.name} ({student.group}) - 当前积分: {student.totalPoints}
                      </option>)}
                  </select>
                </div>

                {/* 选择积分项目 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    积分项目 <span className="text-red-500">*</span>
                  </label>
                  <select value={formData.itemId} onChange={e => handleItemChange(e.target.value)} className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500">
                    <option value="">请选择积分项目</option>
                    {filteredRules.map(rule => <option key={rule.id} value={rule.id}>
                        {rule.name} ({rule.points > 0 ? '+' : ''}{rule.points}分)
                      </option>)}
                  </select>
                </div>

                {/* 显示和修改分值 */}
                {formData.itemId && <div className={`p-4 rounded-xl ${formData.points > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className="text-center mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">分值（可修改）</label>
                      <input type="number" value={formData.points} onChange={handlePointsChangeInput} className={`w-24 text-center text-3xl font-bold bg-transparent border-b-2 focus:outline-none ${formData.points > 0 ? 'text-emerald-600 border-emerald-300' : 'text-red-600 border-red-300'}`} />
                      <p className="text-sm text-gray-600 mt-1">积分</p>
                    </div>
                  </div>}

                {/* 发生时间 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    发生时间
                  </label>
                  <input type="datetime-local" value={formData.time} onChange={e => setFormData({
                ...formData,
                time: e.target.value
              })} className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* 备注 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注
                  </label>
                  <textarea value={formData.note} onChange={e => setFormData({
                ...formData,
                note: e.target.value
              })} placeholder="请输入备注信息（可选）" rows={3} className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => {
              setShowAddModal(false);
              resetForm();
            }} variant="outline" className="flex-1">
                  取消
                </Button>
                <Button onClick={handleAddRecord} className="flex-1 bg-gradient-to-r from-blue-500 to-amber-500 text-white hover:shadow-lg transition-all">
                  确认添加
                </Button>
              </div>
            </div>
          </div>
        </div>}

      {/* 底部导航栏 */}
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}