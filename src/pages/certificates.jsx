// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Award, Upload, Search, Filter, Plus, FileText, Calendar, TrendingUp, Download, Eye, CheckCircle, Star, Trophy, Medal } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { getBeijingDateString, getBeijingTimeISO, getBeijingTime } from '@/lib/utils';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
import { usePermission } from '@/components/PermissionGuard';
// 格式化积分：整数显示整数，小数最多显示两位
const formatPoints = points => {
  if (points === undefined || points === null || isNaN(points)) return '0';
  const num = Number(points);
  const rounded = Math.round(num * 100) / 100;
  // 如果小数部分为0，显示整数；否则最多显示两位小数
  return rounded === Math.floor(rounded) ? String(Math.floor(rounded)) : rounded.toFixed(2);
};

// 证书级别预设数据（包含奖励积分）
const CERTIFICATE_LEVELS = [{
  id: 1,
  name: '初级证书',
  points: 5,
  level: 'basic',
  description: '基础技能认证',
  icon: Star
}, {
  id: 2,
  name: '中级证书',
  points: 10,
  level: 'intermediate',
  description: '熟练技能认证',
  icon: Star
}, {
  id: 3,
  name: '高级证书',
  points: 20,
  level: 'advanced',
  description: '高级技能认证',
  icon: Award
}, {
  id: 4,
  name: '特级证书',
  points: 30,
  level: 'expert',
  description: '专家级技能认证',
  icon: Award
}, {
  id: 5,
  name: '省级获奖',
  points: 25,
  level: 'competition',
  description: '省级竞赛获奖',
  icon: Trophy
}, {
  id: 6,
  name: '国家级获奖',
  points: 40,
  level: 'competition',
  description: '国家级竞赛获奖',
  icon: Trophy
}, {
  id: 7,
  name: '国际级获奖',
  points: 50,
  level: 'competition',
  description: '国际级竞赛获奖',
  icon: Medal
}];
export default function CertificatesPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('certificates');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // 权限检查
  const {
    permission: canViewCertificates,
    loading: loadingViewCertificates
  } = usePermission($w, 'certificates', 'view');
  const {
    permission: canAddCertificates,
    loading: loadingAddCertificates
  } = usePermission($w, 'certificates', 'create');
  const {
    permission: canEditCertificates,
    loading: loadingEditCertificates
  } = usePermission($w, 'certificates', 'edit');
  const {
    permission: canDeleteCertificates,
    loading: loadingDeleteCertificates
  } = usePermission($w, 'certificates', 'delete');
  const {
    permission: canVerifyCertificates,
    loading: loadingVerifyCertificates
  } = usePermission($w, 'certificates', 'approve');
  const [exportRange, setExportRange] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    totalPoints: 0,
    studentsCount: 0,
    thisMonth: 0
  });

  // 表单状态
  const [formData, setFormData] = useState({
    studentId: '',
    certificateName: '',
    levelId: '',
    date: getBeijingDateString(),
    note: '',
    file: null
  });
  useEffect(() => {
    loadCertificates();
    loadStudents();
  }, []);
  const loadStudents = async () => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('students').get();
      if (result.data && result.data.length > 0) {
        const transformedStudents = result.data.map(student => ({
          id: student._id,
          name: student.name,
          studentId: student.student_id,
          group: student.group_id || student.group || '未分组',
          totalPoints: student.current_score || 0
        }));
        setStudents(transformedStudents);
      }
    } catch (error) {
      console.error('加载学生数据失败:', error);
    }
  };
  useEffect(() => {
    filterCertificates();
    calculateStats();
  }, [certificates, searchTerm, filterStudent, filterLevel, filterStatus]);
  const loadCertificates = async () => {
    try {
      setLoading(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('certificate').orderBy('issue_date', 'desc').limit(50).get();
      if (result.data && result.data.length > 0) {
        const transformedCertificates = result.data.map(cert => ({
          id: cert._id,
          studentId: cert.student_id || '',
          studentName: cert.student_name || '未知',
          certificateName: cert.certificate_name || '',
          levelId: cert.level_id || 0,
          levelName: cert.level_name || '未知',
          points: cert.points || 0,
          date: cert.issue_date || '',
          expiryDate: cert.expiry_date || '',
          category: cert.category || '',
          issuingOrganization: cert.issuing_organization || '',
          imageAttachment: cert.image_attachment || '',
          status: cert.status || 'pending',
          note: cert.note || ''
        }));
        setCertificates(transformedCertificates);
      }
    } catch (error) {
      console.error('加载证书数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载证书数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const filterCertificates = () => {
    let result = certificates;
    // 搜索过滤
    if (searchTerm) {
      result = result.filter(cert => cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || cert.certificateName.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    // 学生过滤
    if (filterStudent !== 'all') {
      result = result.filter(cert => cert.studentId === filterStudent);
    }
    // 级别过滤
    if (filterLevel !== 'all') {
      result = result.filter(cert => cert.levelId === parseInt(filterLevel));
    }
    // 状态过滤
    if (filterStatus !== 'all') {
      result = result.filter(cert => cert.status === filterStatus);
    }
    setFilteredCertificates(result);
  };
  const calculateStats = () => {
    const now = getBeijingTime();
    const thisMonthCerts = certificates.filter(cert => {
      const certDate = new Date(cert.date);
      return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
    });
    const uniqueStudents = [...new Set(certificates.map(cert => cert.studentId))];
    const totalPoints = certificates.reduce((sum, cert) => sum + cert.points, 0);
    setStats({
      total: certificates.length,
      totalPoints: totalPoints,
      studentsCount: uniqueStudents.length,
      thisMonth: thisMonthCerts.length
    });
  };
  // 获取级别样式
  const getLevelStyles = levelId => {
    const level = CERTIFICATE_LEVELS.find(l => l.id === levelId);
    if (!level) return {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300'
    };
    switch (level.level) {
      case 'expert':
      case 'competition':
        return {
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-300'
        };
      case 'advanced':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300'
        };
      case 'intermediate':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-300'
        };
      case 'basic':
      default:
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-300'
        };
    }
  };
  // 获取状态样式
  const getStatusStyles = status => {
    switch (status) {
      case 'verified':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: CheckCircle
        };
      case 'pending':
        return {
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          icon: Award
        };
      case 'rejected':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          icon: FileText
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: FileText
        };
    }
  };
  // 添加证书
  const handleAddCertificate = async () => {
    if (!formData.studentId || !formData.certificateName || !formData.levelId) {
      toast({
        title: '填写不完整',
        description: '请填写所有必填项',
        variant: 'destructive'
      });
      return;
    }
    try {
      setUploading(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const student = students.find(s => s.id === formData.studentId);
      const level = CERTIFICATE_LEVELS.find(l => l.id === parseInt(formData.levelId));

      // 添加证书到数据库
      const result = await db.collection('certificate').add({
        student_id: formData.studentId || '',
        student_name: student.name,
        certificate_name: formData.certificateName,
        category: '其他',
        level_id: level.id,
        level_name: level.name,
        points: level.points,
        issuing_organization: '教务处',
        issue_date: formData.date,
        expiry_date: null,
        image_attachment: '',
        status: 'pending',
        note: formData.note
      });
      const newCertificate = {
        id: result.id || result.ids?.[0] || `CERT${getBeijingTime().getTime()}`,
        studentId: formData.studentId,
        studentName: student.name,
        certificateName: formData.certificateName,
        levelId: level.id,
        levelName: level.name,
        points: level.points,
        date: formData.date,
        status: 'pending',
        note: formData.note
      };
      setCertificates([...certificates, newCertificate]);
      setShowAddDialog(false);
      setFormData({
        studentId: '',
        certificateName: '',
        levelId: '',
        date: getBeijingDateString(),
        note: '',
        file: null
      });
      toast({
        title: '添加成功',
        description: '证书记录已添加'
      });
    } catch (error) {
      console.error('添加失败:', error);
      toast({
        title: '添加失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  // 查看详情
  const handleViewDetail = certificate => {
    setSelectedCertificate(certificate);
    setShowDetailDialog(true);
  };
  // 导出数据
  const handleExportData = async () => {
    try {
      let exportData = filteredCertificates;
      if (exportRange === 'current_month') {
        const now = getBeijingTime();
        exportData = filteredCertificates.filter(cert => {
          const certDate = new Date(cert.date);
          return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
        });
      } else if (exportRange === 'last_month') {
        const now = getBeijingTime();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        exportData = filteredCertificates.filter(cert => {
          const certDate = new Date(cert.date);
          return certDate.getMonth() === lastMonth.getMonth() && certDate.getFullYear() === lastMonth.getFullYear();
        });
      }
      // 模拟导出
      const csvContent = `学生姓名,学号,证书名称,级别,积分,日期,状态,备注\n${exportData.map(c => {
        const student = students.find(s => s.id === c.studentId);
        return `${c.studentName},${student ? student.studentId : ''},${c.certificateName},${c.levelName},${c.points},${c.date},${c.status},${c.note}`;
      }).join('\n')}`;
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `证书记录_${getBeijingDateString()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setShowExportDialog(false);
      toast({
        title: '导出成功',
        description: '证书记录已导出'
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  // 获取状态文本
  const getStatusText = status => {
    switch (status) {
      case 'verified':
        return '已认证';
      case 'pending':
        return '待审核';
      case 'rejected':
        return '已拒绝';
      default:
        return status;
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-sm">加载中...</p>
          </div>
        </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
        {/* 页面头部 - 紧凑 */}
        <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">证书管理</h1>
              <p className="text-xs text-gray-500">学生获奖与证书管理</p>
            </div>
            <div className="flex gap-1">
              <Button onClick={() => setShowExportDialog(true)} variant="outline" size="icon" className="h-8 w-8">
                <Download className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowAddDialog(true)} variant="outline" size="icon" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-3 py-2">
          {/* 统计概览 - 紧凑 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <StatCard title="证书总数" value={stats.total} icon={Award} color="purple" />
            <StatCard title="总积分" value={formatPoints(stats.totalPoints)} icon={TrendingUp} color="blue" />
            <StatCard title="获奖学生" value={stats.studentsCount} icon={CheckCircle} color="green" />
            <StatCard title="本月新增" value={stats.thisMonth} icon={Calendar} color="amber" />
          </div>

          {/* 筛选栏 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="搜索学生、证书..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
                <option value="all">全部学生</option>
                {students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </div>
          </div>

          {/* 证书列表 - 紧凑 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                证书列表
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredCertificates.length === 0 ? <div className="p-6 text-center text-gray-500 text-sm">
                  暂无证书记录
                </div> : filteredCertificates.map(certificate => {
            const levelStyles = getLevelStyles(certificate.levelId);
            const statusStyles = getStatusStyles(certificate.status);
            const StatusIcon = statusStyles.icon;
            return <div key={certificate.id} className={`p-2.5 hover:bg-gray-50 transition-colors ${certificate.status === 'pending' ? 'bg-amber-50/50' : ''}`}>
                    <div className="flex items-start gap-2">
                      {/* 学生头像 */}
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {certificate.studentName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="font-medium text-gray-800 text-sm">{certificate.studentName}</h3>
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${levelStyles.bgColor} ${levelStyles.textColor} ${levelStyles.borderColor} border`}>
                            {certificate.levelName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 mb-1 truncate">{certificate.certificateName}</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${statusStyles.textColor}`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {getStatusText(certificate.status)}
                          </span>
                          <span className={`text-[10px] font-medium ${certificate.points > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            +{formatPoints(certificate.points)}分
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {certificate.date}
                          </span>
                        </div>
                      </div>
                      {/* 操作按钮 */}
                      <div className="flex gap-1">
                        <Button onClick={() => handleViewDetail(certificate)} variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>;
          })}
            </div>
          </div>
        </main>

        {/* 添加证书对话框 */}
        {showAddDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">添加证书</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学生</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" value={formData.studentId} onChange={e => setFormData({
              ...formData,
              studentId: e.target.value
            })}>
                    <option value="">请选择学生</option>
                    {students.map(student => <option key={student.id} value={student.id}>{student.name} ({student.studentId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">证书名称</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" value={formData.certificateName} onChange={e => setFormData({
              ...formData,
              certificateName: e.target.value
            })} placeholder="请输入证书名称" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">证书级别</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" value={formData.levelId} onChange={e => setFormData({
              ...formData,
              levelId: e.target.value
            })}>
                    <option value="">请选择证书级别</option>
                    {CERTIFICATE_LEVELS.map(level => <option key={level.id} value={level.id}>{level.name} ({formatPoints(level.points)}分)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">获得日期</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" value={formData.date} onChange={e => setFormData({
              ...formData,
              date: e.target.value
            })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" rows={2} value={formData.note} onChange={e => setFormData({
              ...formData,
              note: e.target.value
            })} placeholder="可选备注" />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <Button onClick={() => setShowAddDialog(false)} variant="outline" className="px-4 py-2">
                  取消
                </Button>
                <Button onClick={handleAddCertificate} disabled={uploading} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2">
                  {uploading ? '添加中...' : '添加'}
                </Button>
              </div>
            </div>
          </div>}

        {/* 详情对话框 */}
        {showDetailDialog && selectedCertificate && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">证书详情</h3>
                <Button onClick={() => {
            setShowDetailDialog(false);
            setSelectedCertificate(null);
          }} variant="ghost" size="icon" className="h-8 w-8">
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedCertificate.studentName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedCertificate.studentName}</p>
                    <p className="text-sm text-gray-500">{MOCK_STUDENTS.find(s => s.id === selectedCertificate.studentId)?.studentId}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">证书名称</span>
                    <span className="text-sm font-medium text-gray-800">{selectedCertificate.certificateName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">级别</span>
                    <span className={`text-sm font-medium ${getLevelStyles(selectedCertificate.levelId).textColor}`}>
                      {selectedCertificate.levelName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">积分</span>
                    <span className={`text-sm font-medium ${selectedCertificate.points > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      +{selectedCertificate.points}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">获得日期</span>
                    <span className="text-sm text-gray-800">{selectedCertificate.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">状态</span>
                    <span className={`text-sm font-medium ${getStatusStyles(selectedCertificate.status).textColor}`}>
                      {getStatusText(selectedCertificate.status)}
                    </span>
                  </div>
                  {selectedCertificate.note && <div className="border-t border-gray-200 pt-2">
                      <span className="text-sm text-gray-600">备注</span>
                      <p className="text-sm text-gray-800 mt-1">{selectedCertificate.note}</p>
                    </div>}
                </div>
              </div>
            </div>
          </div>}

        {/* 导出对话框 */}
        {showExportDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">导出证书记录</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">导出范围</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportRange" value="all" checked={exportRange === 'all'} onChange={e => setExportRange(e.target.value)} className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">全部记录</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportRange" value="current_month" checked={exportRange === 'current_month'} onChange={e => setExportRange(e.target.value)} className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">本月记录</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportRange" value="last_month" checked={exportRange === 'last_month'} onChange={e => setExportRange(e.target.value)} className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">上月记录</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <Button onClick={() => setShowExportDialog(false)} variant="outline" className="px-4 py-2">
                  取消
                </Button>
                <Button onClick={handleExportData} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2">
                  导出
                </Button>
              </div>
            </div>
          </div>}

        {/* 底部导航栏 */}
        <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>;
}