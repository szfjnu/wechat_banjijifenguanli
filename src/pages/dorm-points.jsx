// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Bed, AlertTriangle, Search, Filter, TrendingDown, Shield, ShieldAlert, FileText, Upload, Users, Camera, RefreshCw, Settings, Calendar, Image as ImageIcon, X, Eye, Trash2, Plus, Edit2, Save } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { getBeijingTime, getBeijingTimeISO, getBeijingDateString } from '@/lib/utils';

// 格式化积分显示
const formatPoints = points => {
  if (points === null || points === undefined) return '0.00';
  return Number(points).toFixed(2);
};
import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
import { usePermission } from '@/components/PermissionGuard';

// 折算比例配置（默认30%）
const CONVERSION_RATE = 0.3;
export default function DormPointsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('dorm-points');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);
  const [selectedDeductionItem, setSelectedDeductionItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [deductionHistory, setDeductionHistory] = useState([]);
  const [conversionRate, setConversionRate] = useState(CONVERSION_RATE);
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showItemManager, setShowItemManager] = useState(false);
  const [newConversionRate, setNewConversionRate] = useState(CONVERSION_RATE);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [deductionItems, setDeductionItems] = useState([]);
  const [loadingDeductionItems, setLoadingDeductionItems] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    id: null,
    name: '',
    points: 0,
    category: '卫生'
  });

  // 项目分类
  const itemCategories = ['卫生', '纪律', '安全'];

  // 加载当前学期配置
  const loadCurrentSemesterConfig = async () => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('semesters').where({
        is_current: true
      }).get();
      if (result.data && result.data.length > 0) {
        const semester = result.data[0];
        setConversionRate(semester.dorm_conversion_ratio !== undefined ? semester.dorm_conversion_ratio : CONVERSION_RATE);
        setNewConversionRate(semester.dorm_conversion_ratio !== undefined ? semester.dorm_conversion_ratio : CONVERSION_RATE);
        setCurrentSemester({
          id: semester._id,
          name: semester.semester_name || '未知学期'
        });
      }
    } catch (error) {
      console.error('加载学期配置失败:', error);
    }
  };

  // 加载扣分项目数据
  const loadDeductionItems = async () => {
    try {
      setLoadingDeductionItems(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('dorm_deduction_items').where({
        is_enabled: true
      }).orderBy('priority', 'asc').get();
      const items = result.data.map(item => ({
        id: item.item_id,
        name: item.item_name,
        points: item.points,
        category: item.item_category,
        description: item.description,
        icon_name: item.icon_name,
        priority: item.priority,
        item_code: item.item_code
      }));
      setDeductionItems(items);
    } catch (error) {
      console.error('加载扣分项目失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载扣分项目数据，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoadingDeductionItems(false);
    }
  };
  useEffect(() => {
    loadDeductionItems();
    loadDormStudentsData();
    loadDeductionHistory();
    loadCurrentSemesterConfig();
  }, []);

  // 项目管理函数
  const handleAddItem = () => {
    setEditingItem(null);
    setShowAddForm(true);
    setItemFormData({
      id: null,
      name: '',
      points: 0,
      category: '卫生',
      description: '',
      priority: 5
    });
  };
  const handleRefreshItems = () => {
    loadDeductionItems();
    toast({
      title: '刷新成功',
      description: '扣分项目列表已更新'
    });
  };
  const handleEditItem = item => {
    setEditingItem(item);
    setShowAddForm(false);
    setItemFormData({
      ...item
    });
  };
  const handleSaveItem = async () => {
    if (!itemFormData.name || itemFormData.points === 0) {
      toast({
        title: '请填写完整信息',
        description: '项目名称和分数不能为空',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      if (editingItem) {
        // 编辑
        await db.collection('dorm_deduction_items').doc(editingItem.id).update({
          item_name: itemFormData.name,
          points: itemFormData.points,
          item_category: itemFormData.category,
          description: itemFormData.description,
          priority: itemFormData.priority,
          update_date: getBeijingDateString()
        });
        toast({
          title: '保存成功',
          description: '项目已更新到数据库'
        });
      } else {
        // 新增
        const newItem = {
          item_id: `DDI${getBeijingTime().getTime()}`,
          item_code: `D${String(deductionItems.length + 1).padStart(3, '0')}`,
          item_name: itemFormData.name,
          item_category: itemFormData.category,
          description: itemFormData.description,
          points: itemFormData.points,
          is_enabled: true,
          priority: itemFormData.priority || 5,
          icon_name: 'AlertTriangle',
          creator: '系统管理员',
          created_date: getBeijingDateString(),
          update_date: getBeijingDateString()
        };
        await db.collection('dorm_deduction_items').add(newItem);
        toast({
          title: '添加成功',
          description: '新项目已添加到数据库'
        });
      }
      await loadDeductionItems();
      setEditingItem(null);
      setShowAddForm(false);
      setItemFormData({
        id: null,
        name: '',
        points: 0,
        category: '卫生',
        description: '',
        priority: 5
      });
    } catch (error) {
      console.error('保存扣分项目失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '操作失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleDeleteItem = async id => {
    if (confirm('确定要删除这个项目吗？')) {
      try {
        const tcb = await props.$w.cloud.getCloudInstance();
        const db = tcb.database();
        await db.collection('dorm_deduction_items').doc(id).update({
          is_enabled: false
        });
        await loadDeductionItems();
        toast({
          title: '删除成功',
          description: '项目已禁用'
        });
      } catch (error) {
        console.error('删除扣分项目失败:', error);
        toast({
          title: '删除失败',
          description: error.message || '删除失败，请稍后重试',
          variant: 'destructive'
        });
      }
    }
  };
  const loadDormStudentsData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 从数据库加载住宿生数据
      const result = await db.collection('students').where({
        is_boarding: true
      }).get();
      if (result.data && result.data.length > 0) {
        const transformedStudents = result.data.map(student => ({
          id: student._id,
          studentId: student.student_id,
          name: student.name,
          group: student.group_id || student.group || '未分组',
          dormRoom: student.dorm_info?.room ? `${student.dorm_info.building || ''}${student.dorm_info.room}` : '未分配',
          isBoarding: student.is_boarding,
          dormPoints: parseFloat(student.dorm_score) || 100,
          convertedPoints: ((parseFloat(student.dorm_score) || 100) - 100) * conversionRate,
          totalPoints: parseFloat(student.current_score) || 0
        }));
        setStudents(transformedStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('加载住宿生数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载住宿生数据，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const loadDeductionHistory = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 从宿舍扣分记录表加载历史记录
      const result = await db.collection('dorm_deduction_record').orderBy('deduction_date', 'desc').limit(50).get();
      if (result.data && result.data.length > 0) {
        const transformedHistory = result.data.map(record => ({
          id: record._id,
          studentId: record.student_id || '',
          studentName: record.student_name || '未知',
          itemName: record.item_name || '宿舍扣分',
          points: record.score_change,
          originalDormPoints: record.original_score || 100,
          convertedPoints: parseFloat(record.converted_points) || 0,
          date: record.deduction_date ? new Date(record.deduction_date).toLocaleString('zh-CN') : '',
          operator: record.recorder_name || '宿管员',
          remark: record.reason || '',
          images: record.evidence_images || []
        }));
        setDeductionHistory(transformedHistory);
      } else {
        setDeductionHistory([]);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      setDeductionHistory([]);
    }
  };

  // 扣分处理
  const handleDeduction = async (student, deductionItem, remark) => {
    try {
      console.log('开始扣分操作，学生信息:', student);
      console.log('扣分项目:', deductionItem);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const convertedPoints = deductionItem.points * conversionRate;
      const newDormPoints = student.dormPoints + deductionItem.points;
      const newTotalPoints = student.totalPoints + convertedPoints;

      // 1. 添加扣分记录到宿舍扣分记录表
      const recordResult = await db.collection('dorm_deduction_record').add({
        record_id: `DP${getBeijingTime().getTime()}`,
        student_id: student.studentId || '',
        student_name: student.name,
        student_id_number: student.studentId,
        dorm_room: student.dormRoom || '未分配',
        item_name: deductionItem.name,
        item_category: deductionItem.category || '其他',
        score_change: deductionItem.points,
        converted_points: convertedPoints,
        original_score: student.dormPoints,
        reason: remark || deductionItem.name,
        evidence_images: uploadedImages.map(img => img.url),
        deduction_date: getBeijingTimeISO(),
        recorder_name: $w?.auth?.currentUser?.name || '宿管员',
        semester_id: currentSemester?.id || 2,
        semester_name: currentSemester?.name || '未设置学期',
        approval_status: '已通过',
        remark: remark || ''
      });
      console.log('扣分记录添加成功:', recordResult);

      // 2. 更新学生的宿舍积分
      const updateQuery = {
        student_id: student.studentId
      };
      const updateData = {
        dorm_score: newDormPoints,
        current_score: newTotalPoints
      };
      console.log('更新学生积分，查询条件:', updateQuery, '更新数据:', updateData);
      const updateResult = await db.collection('students').where(updateQuery).update(updateData);
      console.log('更新结果:', updateResult);
      if (!updateResult || updateResult.updated === 0) {
        throw new Error('更新学生积分失败');
      }

      // 3. 更新前端状态
      const updatedStudents = students.map(s => s.id === student.id ? {
        ...s,
        dormPoints: newDormPoints,
        convertedPoints: (parseFloat(student.convertedPoints) || 0) + convertedPoints,
        totalPoints: newTotalPoints
      } : s);
      setStudents(updatedStudents);

      // 4. 添加到前端历史记录
      const newHistory = {
        id: recordResult.id || recordResult._id,
        studentId: student.studentId,
        studentName: student.name,
        itemName: deductionItem.name,
        points: deductionItem.points,
        originalDormPoints: student.dormPoints,
        convertedPoints: convertedPoints,
        date: getBeijingTime().toLocaleString('zh-CN'),
        operator: $w?.auth?.currentUser?.name || '宿管员',
        remark: remark || '',
        images: uploadedImages.map(img => ({
          name: img.name,
          url: img.url
        }))
      };
      setDeductionHistory([newHistory, ...deductionHistory]);

      // 检查预警级别
      if (newDormPoints < 40) {
        toast({
          title: '严重预警：勒令退宿',
          description: `${student.name}的宿舍积分已降至${newDormPoints}分，低于40分警戒线！`,
          variant: 'destructive'
        });
      } else if (newDormPoints < 60) {
        toast({
          title: '预警：留宿察看',
          description: `${student.name}的宿舍积分已降至${newDormPoints}分，低于60分警戒线`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: '扣分成功',
          description: `${student.name}宿舍积分已更新`
        });
      }
      setShowDeductionDialog(false);
      setSelectedStudent(null);
      setSelectedDeductionItem(null);
      setUploadedImages([]);
    } catch (error) {
      console.error('扣分失败:', error);
      toast({
        title: '操作失败',
        description: `扣分操作失败：${error.message || '请重试'}`,
        variant: 'destructive'
      });
    }
  };

  // 查看历史记录图片
  const viewHistoryImages = record => {
    if (!record.images || record.images.length === 0) return;

    // 创建图片预览
    const imageWindow = window.open('', '_blank', 'width=800,height=600');
    imageWindow.document.write(`
      <html>
        <head>
          <title>违规证明材料</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            h2 { margin-bottom: 20px; color: #333; }
            .images { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
            .image-item { text-align: center; }
            .image-item img { width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .image-name { margin-top: 8px; color: #666; font-size: 14px; }
            .info { background: #f0f9ff; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
            .info p { margin: 5px 0; color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>违规证明材料</h2>
            <div class="info">
              <p><strong>学生：</strong>${record.studentName}</p>
              <p><strong>违规项目：</strong>${record.itemName}</p>
              <p><strong>时间：</strong>${record.date}</p>
              <p><strong>备注：</strong>${record.remark || '无'}</p>
            </div>
            <div class="images">
              ${record.images.map(img => `
                <div class="image-item">
                  <img src="${img.url}" alt="${img.name}" />
                  <p class="image-name">${img.name}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `);
  };

  // 获取预警级别
  const getWarningLevel = dormPoints => {
    if (dormPoints < 40) return {
      level: 'danger',
      icon: ShieldAlert,
      text: '勒令退宿',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-300'
    };
    if (dormPoints < 60) return {
      level: 'warning',
      icon: AlertTriangle,
      text: '留宿察看',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300'
    };
    return null;
  };

  // 过滤学生列表
  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.includes(searchTerm) || student.studentId.includes(searchTerm);
    const matchRoom = !selectedRoom || student.dormRoom === selectedRoom;
    return matchSearch && matchRoom;
  });

  // 获取宿舍列表
  const dormRooms = [...new Set(students.map(s => s.dormRoom))].sort();

  // 打开扣分对话框
  const openDeductionDialog = student => {
    setSelectedStudent(student);
    setShowDeductionDialog(true);
    setUploadedImages([]);
  };

  // 图片上传处理
  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 4) {
      toast({
        title: '上传失败',
        description: '最多只能上传4张图片',
        variant: 'destructive'
      });
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        setUploadedImages(prev => [...prev, {
          id: getBeijingTime().getTime() + Math.random(),
          name: file.name,
          url: event.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 删除上传的图片
  const handleDeleteImage = imageId => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // 学期初重置积分
  const handleResetSemester = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取当前学期的初始积分配置
      let initialScore = 100;
      const semesterResult = await db.collection('semesters').where({
        is_current: true
      }).get();
      if (semesterResult.data && semesterResult.data.length > 0) {
        const semester = semesterResult.data[0];
        initialScore = semester.dorm_initial_score !== undefined ? semester.dorm_initial_score : 100;
      }

      // 批量更新所有住宿生的宿舍积分为学期配置的初始积分
      const boardingStudents = students.filter(s => s.isBoarding);
      for (const student of boardingStudents) {
        const updateResult = await db.collection('students').where({
          student_id: student.studentId
        }).update({
          dorm_score: initialScore,
          current_score: student.totalPoints - student.convertedPoints // 恢复到不含宿舍积分的状态
        });
        if (!updateResult || updateResult.updated === 0) {
          console.warn(`更新学生 ${student.name} 失败`);
        }
      }

      // 清空宿舍扣分记录表中的所有记录
      const dormRecords = await db.collection('dorm_deduction_record').get();
      for (const record of dormRecords.data || []) {
        await db.collection('dorm_deduction_record').doc(record._id).remove();
      }

      // 更新前端状态
      const updatedStudents = students.map(s => s.isBoarding ? {
        ...s,
        dormPoints: initialScore,
        convertedPoints: 0,
        totalPoints: s.totalPoints - s.convertedPoints
      } : s);
      setStudents(updatedStudents);

      // 清空历史记录
      setDeductionHistory([]);
      toast({
        title: '重置成功',
        description: `所有住宿生宿舍积分已重置为${initialScore}分，历史记录已清空`,
        variant: 'default'
      });
      setShowResetConfirm(false);
    } catch (error) {
      console.error('重置失败:', error);
      toast({
        title: '重置失败',
        description: error.message || '重置操作失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 更新折算比例
  const handleUpdateConversionRate = async () => {
    if (newConversionRate < 0 || newConversionRate > 1) {
      toast({
        title: '无效的折算比例',
        description: '折算比例必须在0到1之间',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取当前学期并更新折算比例
      const result = await db.collection('semesters').where({
        is_current: true
      }).get();
      if (result.data && result.data.length > 0) {
        const semester = result.data[0];
        await db.collection('semesters').doc(semester._id).update({
          dorm_conversion_ratio: newConversionRate,
          updated_at: getBeijingTimeISO()
        });
      }
      setConversionRate(newConversionRate);
      toast({
        title: '设置已更新',
        description: `折算比例已更新为${(newConversionRate * 100).toFixed(0)}%`,
        variant: 'default'
      });
      setShowSettingsModal(false);
    } catch (error) {
      console.error('更新折算比例失败:', error);
      toast({
        title: '更新失败',
        description: error.message || '无法更新折算比例',
        variant: 'destructive'
      });
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-sm">加载中...</p>
          </div>
        </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
        {/* 页面头部 - 紧凑 */}
        <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">宿舍积分管理</h1>
              <p className="text-xs text-gray-500">仅管理住宿生宿舍积分</p>
            </div>
            <div className="flex gap-1">
              <Button onClick={() => setShowSettingsModal(true)} variant="outline" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowResetConfirm(true)} variant="outline" size="icon" className="h-8 w-8">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-3 py-2">
          {/* 统计概览 - 紧凑 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <StatCard title="住宿生总数" value={students.length} icon={Bed} color="blue" />
            <StatCard title="正常状态" value={students.filter(s => s.dormPoints >= 60).length} icon={Shield} color="green" />
            <StatCard title="留宿察看" value={students.filter(s => s.dormPoints < 60 && s.dormPoints >= 40).length} icon={AlertTriangle} color="amber" />
            <StatCard title="勒令退宿" value={students.filter(s => s.dormPoints < 40).length} icon={ShieldAlert} color="rose" />
          </div>

          {/* 筛选栏 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="搜索..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
                <option value="">全部宿舍</option>
                {dormRooms.map(room => <option key={room} value={room}>{room}室</option>)}
              </select>
            </div>
          </div>

          {/* 住宿生列表 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                住宿生列表
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredStudents.map(student => {
            const warning = getWarningLevel(student.dormPoints);
            const WarningIcon = warning?.icon;
            return <div key={student.id} className={`p-2.5 hover:bg-gray-50 transition-colors ${warning?.bgColor || ''}`}>
                    <div className="flex items-center justify-between gap-2">
                      {/* 学生信息 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {student.name[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-medium text-gray-800 text-sm">{student.name}</h3>
                              {warning && <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-medium rounded-full ${warning.bgColor} ${warning.textColor} ${warning.borderColor} border`}>
                                  <WarningIcon className="w-2.5 h-2.5" />
                                  {warning.text}
                                </span>}
                            </div>
                            <p className="text-xs text-gray-500">{student.studentId} · {student.group}</p>
                          </div>
                        </div>
                      </div>

                      {/* 积分信息 - 紧凑 */}
                      <div className="flex gap-2 text-xs">
                        <div>
                          <p className="text-[10px] text-gray-500">原始</p>
                          <p className={`text-sm font-bold ${student.dormPoints < 60 ? 'text-red-600' : 'text-gray-800'}`}>
                            {formatPoints(student.dormPoints)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">折算</p>
                          <p className={`text-sm font-bold ${student.convertedPoints < 0 ? 'text-orange-600' : 'text-gray-800'}`}>
                            {(parseFloat(student.convertedPoints) || 0).toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">比例</p>
                          <p className="text-sm font-bold text-gray-800">{(conversionRate * 100).toFixed(0)}%</p>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <Button onClick={() => openDeductionDialog(student)} className="h-7 px-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg">
                        扣分
                      </Button>
                    </div>
                  </div>;
          })}
            </div>
          </div>

          {/* 折算比例说明 - 紧凑 */}
          <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200 mb-3">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <div>
                <h3 className="font-medium text-gray-800 text-xs mb-1">双重账本说明</h3>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  <li>• 宿舍积分每学期初重置为100分</li>
                  <li>• 按{(conversionRate * 100).toFixed(0)}%比例折算到日常积分</li>
                  <li>• 预警：&lt;60分留宿察看，&lt;40分勒令退宿</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 历史记录 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gray-600" />
                扣分历史
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {deductionHistory.length === 0 ? <div className="p-6 text-center text-gray-500 text-xs">
                  暂无历史记录
                </div> : deductionHistory.slice(0, 10).map(record => <div key={record.id} className="p-2.5 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-medium text-gray-800 text-sm">{record.studentName}</span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${record.points < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {record.points > 0 ? '+' : ''}{record.points}分
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{record.itemName}</p>
                        {record.images && record.images.length > 0 && <button onClick={() => viewHistoryImages(record)} className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800">
                            <ImageIcon className="w-2.5 h-2.5" />
                            查看图片
                          </button>}
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-gray-500">{record.date}</p>
                        <p className={`font-medium ${record.convertedPoints < 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                          折算：{(parseFloat(record.convertedPoints) || 0).toFixed(1)}分
                        </p>
                      </div>
                    </div>
                  </div>)}
            </div>
          </div>
        </main>

        {/* 扣分对话框 */}
        {showDeductionDialog && selectedStudent && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-xl">
                <h3 className="text-xl font-bold">宿舍扣分</h3>
                <p className="text-red-100 text-sm mt-1">{selectedStudent.name} · {selectedStudent.dormRoom}室</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择扣分项目</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={selectedDeductionItem?.id || ''} onChange={e => setSelectedDeductionItem(deductionItems.find(item => item.id === e.target.value))}>
                    <option value="">请选择扣分项目</option>
                    {deductionItems.map(item => <option key={item.id} value={item.id}>
                        {item.name}（{item.points > 0 ? '+' : ''}{item.points}分）
                      </option>)}
                  </select>
                </div>

                {selectedDeductionItem && <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">预计变化</span>
                      <span className={`text-lg font-bold ${selectedDeductionItem.points < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedDeductionItem.points > 0 ? '+' : ''}{selectedDeductionItem.points}分
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>折算到总积分</span>
                      <span className={`font-medium ${selectedDeductionItem.points * conversionRate < 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {(selectedDeductionItem.points * conversionRate).toFixed(1)}分
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                      <span>扣分后宿舍积分</span>
                      <span className={`font-medium ${selectedStudent.dormPoints + selectedDeductionItem.points < 60 ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatPoints(selectedStudent.dormPoints + selectedDeductionItem.points)}分
                      </span>
                    </div>
                  </div>}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" rows={3} placeholder="输入备注信息..." id="deduction-remark" />
                </div>

                {/* 上传违规证明 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">违规证明材料（可选）</label>
                  <div className="space-y-3">
                    {uploadedImages.length > 0 && <div className="grid grid-cols-2 gap-3">
                        {uploadedImages.map(image => <div key={image.id} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                              <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                            </div>
                            <button type="button" onClick={() => handleDeleteImage(image.id)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600">
                              <X className="w-3 h-3" />
                            </button>
                            <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                          </div>)}
                      </div>}

                    {uploadedImages.length < 4 && <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">点击上传图片</span>
                        <span className="text-xs text-gray-400 mt-1">最多4张</span>
                      </label>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => {
              setShowDeductionDialog(false);
              setSelectedStudent(null);
              setSelectedDeductionItem(null);
            }} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                    取消
                  </Button>
                  <Button onClick={() => {
              if (!selectedDeductionItem) {
                toast({
                  title: '请选择扣分项目',
                  variant: 'destructive'
                });
                return;
              }
              const remark = document.getElementById('deduction-remark')?.value || '';
              handleDeduction(selectedStudent, selectedDeductionItem, remark);
            }} disabled={!selectedDeductionItem} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition-colors">
                    确认扣分
                  </Button>
                </div>
              </div>
            </div>
          </div>}

        {/* 设置对话框 */}
        {showSettingsModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl">
                <h3 className="text-xl font-bold">折算比例设置</h3>
                <p className="text-blue-100 text-sm mt-1">设置宿舍积分折算到日常积分的比例</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    折算比例（当前：{(conversionRate * 100).toFixed(0)}%）
                  </label>
                  <input type="number" min="0" max="1" step="0.01" value={newConversionRate} onChange={e => setNewConversionRate(parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例如：0.3 表示30%" />
                  <p className="text-xs text-gray-500 mt-2">输入 0-1 之间的数字，0.3 表示30%</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>预览：</strong>宿舍扣分 10 分，将折算 {(10 * newConversionRate).toFixed(1)} 分到日常积分
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => {
              setShowSettingsModal(false);
              setNewConversionRate(conversionRate);
            }} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                    取消
                  </Button>
                  <Button onClick={handleUpdateConversionRate} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    保存设置
                  </Button>
                </div>

                {/* 加减分项目管理 */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">加减分项目</h4>
                    <Button onClick={() => {
                setShowItemManager(true);
              }} className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      管理项目
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    共 {deductionItems.length} 个项目：
                    {deductionItems.slice(0, 3).map((item, index) => <span key={item.id} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] mr-1">
                        {item.name}（{item.points}）
                      </span>)}
                    {deductionItems.length > 3 && <span className="text-gray-400">...</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>}

        {/* 学期重置确认对话框 */}
        {showResetConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-t-xl">
                <h3 className="text-xl font-bold">学期重置确认</h3>
                <p className="text-orange-100 text-sm mt-1">此操作将重置所有宿舍积分</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">确认重置？</h4>
                      <p className="text-sm text-gray-600">
                        此操作将会：
                      </p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• 将所有住宿生的宿舍积分重置为 100 分</li>
                        <li>• 清空已折算的积分记录</li>
                        <li>• 清空所有扣分历史记录</li>
                      </ul>
                      <p className="text-xs text-red-600 mt-3 font-medium">此操作不可撤销，请谨慎操作！</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setShowResetConfirm(false)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                    取消
                  </Button>
                  <Button onClick={handleResetSemester} disabled={loading} className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg transition-colors">
                    {loading ? '重置中...' : '确认重置'}
                  </Button>
                </div>

                {/* 加减分项目管理 */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">加减分项目</h4>
                    <Button onClick={() => {
                setShowItemManager(true);
              }} className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      管理项目
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    共 {deductionItems.length} 个项目：
                    {deductionItems.slice(0, 3).map((item, index) => <span key={item.id} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] mr-1">
                        {item.name}（{item.points}）
                      </span>)}
                    {deductionItems.length > 3 && <span className="text-gray-400">...</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>}

          {/* 项目管理模态框 */}
          {showItemManager && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-t-xl">
                  <h3 className="text-xl font-bold">加减分项目管理</h3>
                  <p className="text-purple-100 text-sm mt-1">管理宿舍积分的加减分项目</p>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="flex gap-2 mb-4">
                    <Button onClick={handleAddItem} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      添加项目
                    </Button>
                  </div>

                  {(editingItem !== null || showAddForm) && <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3">{editingItem ? '编辑项目' : '添加新项目'}</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                          <input type="text" value={itemFormData.name} onChange={e => setItemFormData({
                  ...itemFormData,
                  name: e.target.value
                })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="例如：宿舍卫生不合格" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">分数</label>
                          <input type="number" value={itemFormData.points} onChange={e => setItemFormData({
                  ...itemFormData,
                  points: parseInt(e.target.value) || 0
                })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="负数表示扣分" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                          <select value={itemFormData.category} onChange={e => setItemFormData({
                  ...itemFormData,
                  category: e.target.value
                })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                            {itemCategories.map(cat => <option key={cat} value={cat}>
                                {cat}
                              </option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                          <input type="number" value={itemFormData.priority || 5} onChange={e => setItemFormData({
                  ...itemFormData,
                  priority: parseInt(e.target.value)
                })} min="1" max="10" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="1-10，越小越优先" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                          <textarea value={itemFormData.description || ''} onChange={e => setItemFormData({
                  ...itemFormData,
                  description: e.target.value
                })} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="请输入项目描述" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => {
                  setEditingItem(null);
                  setShowAddForm(false);
                }} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                            取消
                          </Button>
                          <Button onClick={handleSaveItem} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                            <Save className="w-4 h-4 mr-1" />
                            保存
                          </Button>
                        </div>
                      </div>
                    </div>}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 text-sm">项目列表</h4>
                    {deductionItems.map(item => <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-0.5 rounded text-xs font-semibold ${item.category === '卫生' ? 'bg-green-100 text-green-700' : item.category === '纪律' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                            {item.category}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{item.name}</div>
                            <div className={`text-xs font-semibold ${item.points < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.points > 0 ? '+' : ''}{item.points} 分
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleEditItem(item)} variant="outline" size="icon" className="h-8 w-8">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleDeleteItem(item.id)} variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:border-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>)}
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <Button onClick={() => {
            setShowItemManager(false);
          }} className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                    关闭
                  </Button>
                </div>
              </div>
            </div>}

        <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>;
}