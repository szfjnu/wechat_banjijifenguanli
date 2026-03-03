// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Bed, AlertTriangle, Search, Filter, TrendingDown, Shield, ShieldAlert, FileText, Upload, Users, Camera, RefreshCw, Settings, Calendar, Image as ImageIcon, X, Eye, Trash2 } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';

// 宿舍扣分项目预设数据
const DEDUCTION_ITEMS = [{
  id: 1,
  name: '宿舍卫生不合格',
  points: -5,
  category: '卫生'
}, {
  id: 2,
  name: '晚归',
  points: -3,
  category: '纪律'
}, {
  id: 3,
  name: '夜不归宿',
  points: -10,
  category: '纪律'
}, {
  id: 4,
  name: '使用违规电器',
  points: -8,
  category: '安全'
}, {
  id: 5,
  name: '宿舍内吸烟',
  points: -15,
  category: '纪律'
}, {
  id: 6,
  name: '干扰他人休息',
  points: -4,
  category: '纪律'
}, {
  id: 7,
  name: '私接电线',
  points: -6,
  category: '安全'
}, {
  id: 8,
  name: '宿舍内饮酒',
  points: -12,
  category: '纪律'
}, {
  id: 9,
  name: '床位整理不规范',
  points: -2,
  category: '卫生'
}, {
  id: 10,
  name: '未按时熄灯',
  points: -3,
  category: '纪律'
}];

// 模拟住宿生数据（仅包含住宿生）
const MOCK_DORM_STUDENTS = [{
  id: 1,
  name: '张三',
  studentId: '202401001',
  group: '第一组',
  dormRoom: '301',
  isBoarding: true,
  dormPoints: 100,
  convertedPoints: 0,
  // 默认折算比例30%
  totalPoints: 156
}, {
  id: 2,
  name: '李四',
  studentId: '202401002',
  group: '第二组',
  dormRoom: '301',
  isBoarding: true,
  dormPoints: 85,
  convertedPoints: -4.5,
  totalPoints: 148
}, {
  id: 3,
  name: '王五',
  studentId: '202401003',
  group: '第一组',
  dormRoom: '302',
  isBoarding: true,
  dormPoints: 70,
  convertedPoints: -9,
  totalPoints: 142
}, {
  id: 4,
  name: '赵六',
  studentId: '202401004',
  group: '第三组',
  dormRoom: '303',
  isBoarding: true,
  dormPoints: 55,
  convertedPoints: -13.5,
  totalPoints: 135
}, {
  id: 5,
  name: '孙七',
  studentId: '202401005',
  group: '第二组',
  dormRoom: '304',
  isBoarding: true,
  dormPoints: 100,
  convertedPoints: 0,
  totalPoints: 130
}, {
  id: 6,
  name: '周八',
  studentId: '202401006',
  group: '第三组',
  dormRoom: '305',
  isBoarding: true,
  dormPoints: 90,
  convertedPoints: -3,
  totalPoints: 125
}, {
  id: 7,
  name: '吴九',
  studentId: '202401007',
  group: '第一组',
  dormRoom: '306',
  isBoarding: true,
  dormPoints: 38,
  convertedPoints: -18.6,
  totalPoints: 118
}, {
  id: 8,
  name: '郑十',
  studentId: '202401008',
  group: '第二组',
  dormRoom: '307',
  isBoarding: true,
  dormPoints: 100,
  convertedPoints: 0,
  totalPoints: 145
}];

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
  const [newConversionRate, setNewConversionRate] = useState(CONVERSION_RATE);
  useEffect(() => {
    loadDormStudentsData();
    loadDeductionHistory();
  }, []);
  const loadDormStudentsData = async () => {
    try {
      setLoading(true);

      // 模拟数据加载（后续替换为真实数据源调用）
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudents(MOCK_DORM_STUDENTS);
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
      // 模拟历史记录
      const history = [{
        id: 1,
        studentId: 2,
        studentName: '李四',
        itemName: '宿舍卫生不合格',
        points: -5,
        originalDormPoints: 85,
        convertedPoints: -1.5,
        date: '2026-02-28 10:30',
        operator: '宿管员',
        remark: '地面不整洁'
      }, {
        id: 2,
        studentId: 3,
        studentName: '王五',
        itemName: '晚归',
        points: -3,
        originalDormPoints: 73,
        convertedPoints: -8.1,
        date: '2026-02-27 23:15',
        operator: '宿管员',
        remark: '超过门禁时间'
      }, {
        id: 3,
        studentId: 4,
        studentName: '赵六',
        itemName: '使用违规电器',
        points: -8,
        originalDormPoints: 63,
        convertedPoints: -11.1,
        date: '2026-02-26 21:45',
        operator: '宿管员',
        remark: '发现电热水壶'
      }, {
        id: 4,
        studentId: 7,
        studentName: '吴九',
        itemName: '宿舍内吸烟',
        points: -15,
        originalDormPoints: 53,
        convertedPoints: -14.1,
        date: '2026-02-25 20:30',
        operator: '宿管员',
        remark: '室内有烟味'
      }, {
        id: 5,
        studentId: 6,
        studentName: '周八',
        itemName: '晚归',
        points: -3,
        originalDormPoints: 90,
        convertedPoints: -3,
        date: '2026-02-24 23:20',
        operator: '宿管员',
        remark: '超过门禁时间10分钟'
      }, {
        id: 6,
        studentId: 4,
        studentName: '赵六',
        itemName: '夜不归宿',
        points: -10,
        originalDormPoints: 73,
        convertedPoints: -8.1,
        date: '2026-02-23 22:00',
        operator: '宿管员',
        remark: '查寝未归'
      }];
      setDeductionHistory(history);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  };

  // 扣分处理
  const handleDeduction = async (student, deductionItem, remark) => {
    try {
      const convertedPoints = deductionItem.points * conversionRate;
      const newDormPoints = student.dormPoints + deductionItem.points;
      const newTotalPoints = student.totalPoints + convertedPoints;

      // 更新学生数据
      const updatedStudents = students.map(s => s.id === student.id ? {
        ...s,
        dormPoints: newDormPoints,
        convertedPoints: student.convertedPoints + convertedPoints,
        totalPoints: newTotalPoints
      } : s);
      setStudents(updatedStudents);

      // 添加到历史记录
      const newHistory = {
        id: Date.now(),
        studentId: student.id,
        studentName: student.name,
        itemName: deductionItem.name,
        points: deductionItem.points,
        originalDormPoints: student.dormPoints,
        convertedPoints: convertedPoints,
        date: new Date().toLocaleString('zh-CN'),
        operator: '当前用户',
        remark: remark || '',
        images: uploadedImages.length > 0 ? uploadedImages.map(img => ({
          name: img.name,
          url: img.url
        })) : null
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
        description: '扣分操作失败，请重试',
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
          id: Date.now() + Math.random(),
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

      // 模拟重置操作
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 重置所有住宿生的宿舍积分为100分
      const updatedStudents = students.map(s => ({
        ...s,
        dormPoints: 100,
        convertedPoints: 0
      }));
      setStudents(updatedStudents);

      // 清空历史记录
      setDeductionHistory([]);
      toast({
        title: '重置成功',
        description: '所有住宿生宿舍积分已重置为100分',
        variant: 'default'
      });
      setShowResetConfirm(false);
    } catch (error) {
      console.error('重置失败:', error);
      toast({
        title: '重置失败',
        description: '重置操作失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 更新折算比例
  const handleUpdateConversionRate = () => {
    if (newConversionRate < 0 || newConversionRate > 1) {
      toast({
        title: '无效的折算比例',
        description: '折算比例必须在0到1之间',
        variant: 'destructive'
      });
      return;
    }
    setConversionRate(newConversionRate);
    toast({
      title: '设置已更新',
      description: `折算比例已更新为${(newConversionRate * 100).toFixed(0)}%`,
      variant: 'default'
    });
    setShowSettingsModal(false);
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
        {/* 页面头部 */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-3 shadow-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-bold mb-2" style={{
              fontFamily: 'Noto Serif SC, serif'
            }}>宿舍积分管理</h1>
                <p className="text-blue-100 text-sm">仅管理住宿生宿舍积分与折算</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">设置</span>
                </button>
                <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">学期重置</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">
          {/* 统计概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">住宿生总数</p>
                  <p className="text-base font-bold text-gray-800">{students.length}</p>
                </div>
                <Bed className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">正常状态</p>
                  <p className="text-base font-bold text-gray-800">{students.filter(s => s.dormPoints >= 60).length}</p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">留宿察看</p>
                  <p className="text-base font-bold text-gray-800">{students.filter(s => s.dormPoints < 60 && s.dormPoints >= 40).length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">勒令退宿</p>
                  <p className="text-base font-bold text-gray-800">{students.filter(s => s.dormPoints < 40).length}</p>
                </div>
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* 筛选栏 */}
          <div className="bg-white rounded-xl p-4 shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="搜索姓名或学号..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
                <option value="">全部宿舍</option>
                {dormRooms.map(room => <option key={room} value={room}>{room}室</option>)}
              </select>
            </div>
          </div>

          {/* 住宿生列表 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                住宿生列表
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredStudents.map(student => {
            const warning = getWarningLevel(student.dormPoints);
            const WarningIcon = warning?.icon;
            return <div key={student.id} className={`p-4 hover:bg-gray-50 transition-colors ${warning?.bgColor || ''}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* 学生信息 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {student.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-800">{student.name}</h3>
                              {warning && <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${warning.bgColor} ${warning.textColor} ${warning.borderColor} border`}>
                                  <WarningIcon className="w-3 h-3" />
                                  {warning.text}
                                </span>}
                            </div>
                            <p className="text-sm text-gray-500">{student.studentId} · {student.group}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{student.dormRoom}室</span>
                        </div>
                      </div>

                      {/* 积分信息 */}
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">宿舍原始积分</p>
                          <p className={`text-lg font-bold ${student.dormPoints < 60 ? 'text-red-600' : 'text-gray-800'}`}>
                            {student.dormPoints}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">已折算积分</p>
                          <p className={`text-lg font-bold ${student.convertedPoints < 0 ? 'text-orange-600' : 'text-gray-800'}`}>
                            {student.convertedPoints.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">折算比例</p>
                          <p className="text-lg font-bold text-gray-800">{(conversionRate * 100).toFixed(0)}%</p>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <Button onClick={() => openDeductionDialog(student)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                        扣分
                      </Button>
                    </div>
                  </div>;
          })}
            </div>
          </div>

          {/* 折算比例说明 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 shadow-md border border-amber-200 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">双重账本说明</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 宿舍原始积分：直接记录宿舍行为积分，每学期初重置为100分</li>
                  <li>• 已折算积分：按{(conversionRate * 100).toFixed(0)}%比例折算到日常积分账本中</li>
                  <li>• 预警机制：宿舍积分&lt;60分留宿察看，&lt;40分勒令退宿</li>
                  <li>• 折算比例可由管理员修改，修改后按新比例计算</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 历史记录 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                扣分历史记录
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {deductionHistory.length === 0 ? <div className="p-8 text-center text-gray-500">
                  暂无历史记录
                </div> : deductionHistory.slice(0, 10).map(record => <div key={record.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">{record.studentName}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${record.points < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {record.points > 0 ? '+' : ''}{record.points}分
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{record.itemName}</p>
                        {record.remark && <p className="text-xs text-gray-500 mt-1">备注：{record.remark}</p>}
                        {record.images && record.images.length > 0 && <button onClick={() => viewHistoryImages(record)} className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                            <ImageIcon className="w-3 h-3" />
                            查看图片（{record.images.length}张）
                          </button>}
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-gray-500">{record.date}</p>
                        <p className="text-gray-400">{record.operator}</p>
                        <p className={`font-medium ${record.convertedPoints < 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                          折算：{record.convertedPoints.toFixed(1)}分
                        </p>
                      </div>
                    </div>
                  </div>)}
            </div>
          </div>
        </main>

        {/* 扣分对话框 */}
        {showDeductionDialog && selectedStudent && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-xl">
                <h3 className="text-xl font-bold">宿舍扣分</h3>
                <p className="text-red-100 text-sm mt-1">{selectedStudent.name} · {selectedStudent.dormRoom}室</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择扣分项目</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={selectedDeductionItem?.id || ''} onChange={e => setSelectedDeductionItem(DEDUCTION_ITEMS.find(item => item.id === parseInt(e.target.value)))}>
                    <option value="">请选择扣分项目</option>
                    {DEDUCTION_ITEMS.map(item => <option key={item.id} value={item.id}>
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
                        {selectedStudent.dormPoints + selectedDeductionItem.points}分
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
        {showSettingsModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              </div>
            </div>
          </div>}

        {/* 学期重置确认对话框 */}
        {showResetConfirm && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              </div>
            </div>
          </div>}

        <TabBar currentPage={currentPage} onPageChange={setCurrentPage} />
      pageId,
      params: {}
    })} />
      </div>;
}