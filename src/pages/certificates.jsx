// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Award as AwardIcon, Upload, Search, Filter, Plus, FileText, Calendar, TrendingUp, Download, Eye, CheckCircle, Star } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';

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
  icon: AwardIcon
}, {
  id: 4,
  name: '特级证书',
  points: 30,
  level: 'expert',
  description: '专家级技能认证',
  icon: AwardIcon
}, {
  id: 5,
  name: '省级获奖',
  points: 25,
  level: 'competition',
  description: '省级竞赛获奖',
  icon: AwardIcon
}, {
  id: 6,
  name: '国家级获奖',
  points: 40,
  level: 'competition',
  description: '国家级竞赛获奖',
  icon: AwardIcon
}, {
  id: 7,
  name: '国际级获奖',
  points: 50,
  level: 'competition',
  description: '国际级竞赛获奖',
  icon: AwardIcon
}];

// 模拟学生数据
const MOCK_STUDENTS = [{
  id: 1,
  name: '张三',
  studentId: '202401001',
  group: '第一组',
  totalPoints: 156
}, {
  id: 2,
  name: '李四',
  studentId: '202401002',
  group: '第二组',
  totalPoints: 148
}, {
  id: 3,
  name: '王五',
  studentId: '202401003',
  group: '第一组',
  totalPoints: 132
}, {
  id: 4,
  name: '赵六',
  studentId: '202401004',
  group: '第三组',
  totalPoints: 145
}, {
  id: 5,
  name: '钱七',
  studentId: '202401005',
  group: '第二组',
  totalPoints: 138
}];

// 模拟证书数据
const MOCK_CERTIFICATES = [{
  id: 1,
  studentId: 1,
  studentName: '张三',
  certificateName: '英语四级',
  levelId: 2,
  levelName: '中级证书',
  points: 10,
  date: '2026-01-15',
  fileUrl: null,
  note: '全国大学生英语四级考试'
}, {
  id: 2,
  studentId: 2,
  studentName: '李四',
  certificateName: '计算机二级',
  levelId: 2,
  levelName: '中级证书',
  points: 10,
  date: '2026-02-20',
  fileUrl: null,
  note: '全国计算机等级考试'
}, {
  id: 3,
  studentId: 3,
  studentName: '王五',
  certificateName: '全国数学竞赛一等奖',
  levelId: 6,
  levelName: '国家级获奖',
  points: 40,
  date: '2026-02-10',
  fileUrl: null,
  note: '全国大学生数学建模竞赛'
}, {
  id: 4,
  studentId: 1,
  studentName: '张三',
  certificateName: '英语六级',
  levelId: 3,
  levelName: '高级证书',
  points: 20,
  date: '2026-02-25',
  fileUrl: null,
  note: '全国大学生英语六级考试'
}, {
  id: 5,
  studentId: 4,
  studentName: '赵六',
  certificateName: '英语四级',
  levelId: 2,
  levelName: '中级证书',
  points: 10,
  date: '2026-02-28',
  fileUrl: null,
  note: '全国大学生英语四级考试'
}];
export default function CertificatesPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [uploading, setUploading] = useState(false);
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
    date: new Date().toISOString().split('T')[0],
    note: '',
    file: null
  });
  useEffect(() => {
    loadCertificates();
  }, []);
  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, filterStudent, filterLevel]);
  const loadCertificates = async () => {
    try {
      // 模拟数据加载（后续替换为真实数据源调用）
      await new Promise(resolve => setTimeout(resolve, 300));
      setCertificates(MOCK_CERTIFICATES);
    } catch (error) {
      toast({
        title: '加载失败',
        description: '无法加载证书数据',
        variant: 'destructive'
      });
    }
  };
  const filterCertificates = () => {
    let filtered = certificates;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(cert => cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || cert.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) || cert.note.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // 学生过滤
    if (filterStudent !== 'all') {
      filtered = filtered.filter(cert => cert.studentId.toString() === filterStudent);
    }

    // 级别过滤
    if (filterLevel !== 'all') {
      if (filterLevel === 'basic') {
        filtered = filtered.filter(cert => cert.levelId === 1);
      } else if (filterLevel === 'intermediate') {
        filtered = filtered.filter(cert => cert.levelId === 2);
      } else if (filterLevel === 'advanced') {
        filtered = filtered.filter(cert => cert.levelId === 3);
      } else if (filterLevel === 'expert') {
        filtered = filtered.filter(cert => cert.levelId === 4);
      } else if (filterLevel === 'competition') {
        filtered = filtered.filter(cert => [5, 6, 7].includes(cert.levelId));
      }
    }
    setFilteredCertificates(filtered);
    updateStats(filtered);
  };
  const updateStats = certs => {
    const uniqueStudents = [...new Set(certs.map(c => c.studentId))].length;
    const thisMonthCerts = certs.filter(cert => {
      const certDate = new Date(cert.date);
      const now = new Date();
      return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
    });
    setStats({
      total: certs.length,
      totalPoints: certs.reduce((sum, c) => sum + c.points, 0),
      studentsCount: uniqueStudents,
      thisMonth: thisMonthCerts.length
    });
  };
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: '文件类型不支持',
        description: '仅支持上传 JPG、PNG、PDF 格式的文件',
        variant: 'destructive'
      });
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '文件大小不能超过 5MB',
        variant: 'destructive'
      });
      return;
    }
    try {
      setUploading(true);

      // 模拟文件上传（后续替换为云存储上传）
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormData(prev => ({
        ...prev,
        file
      }));
      toast({
        title: '上传成功',
        description: `文件 "${file.name}" 上传成功`
      });
    } catch (error) {
      toast({
        title: '上传失败',
        description: '文件上传失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.studentId || !formData.certificateName || !formData.levelId) {
      toast({
        title: '请填写完整信息',
        description: '请选择学生、填写证书名称和级别',
        variant: 'destructive'
      });
      return;
    }
    try {
      const student = MOCK_STUDENTS.find(s => s.id.toString() === formData.studentId);
      const level = CERTIFICATE_LEVELS.find(l => l.id.toString() === formData.levelId);
      const newCertificate = {
        id: certificates.length + 1,
        studentId: parseInt(formData.studentId),
        studentName: student.name,
        certificateName: formData.certificateName,
        levelId: parseInt(formData.levelId),
        levelName: level.name,
        points: level.points,
        date: formData.date,
        fileUrl: formData.file ? 'mock-url' : null,
        note: formData.note
      };
      setCertificates(prev => [newCertificate, ...prev]);

      // 更新学生积分（模拟）
      const studentIndex = MOCK_STUDENTS.findIndex(s => s.id === parseInt(formData.studentId));
      if (studentIndex !== -1) {
        MOCK_STUDENTS[studentIndex].totalPoints += level.points;
      }
      setShowAddDialog(false);
      setFormData({
        studentId: '',
        certificateName: '',
        levelId: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        file: null
      });
      toast({
        title: '证书录入成功',
        description: `已为 ${student.name} 录入证书，积分 +${level.points}`
      });

      // 模拟创建积分记录
      console.log('自动创建积分记录:', {
        studentId: student.id,
        studentName: student.name,
        itemName: `${level.name} - ${formData.certificateName}`,
        points: level.points,
        type: 'certificate',
        date: formData.date,
        note: `技能证书：${formData.note || '无备注'}`
      });
    } catch (error) {
      toast({
        title: '录入失败',
        description: '证书录入失败，请重试',
        variant: 'destructive'
      });
    }
  };
  const handleViewCertificate = cert => {
    setSelectedCertificate(cert);
  };
  const handleDownloadCertificate = cert => {
    // 模拟下载（后续替换为真实下载）
    toast({
      title: '开始下载',
      description: `正在下载 ${cert.certificateName} 证书扫描件...`
    });
  };
  const getLevelColor = levelId => {
    switch (levelId) {
      case 1:
        return 'bg-gray-100 text-gray-800';
      case 2:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-purple-100 text-purple-800';
      case 4:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };
  const getLevelIcon = levelId => {
    const level = CERTIFICATE_LEVELS.find(l => l.id === levelId);
    if (!level) return Star;
    return level.icon;
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{
              fontFamily: 'Noto Serif SC, serif'
            }}>技能证书管理</h1>
              <p className="text-emerald-100 text-sm">记录学生技能证书，奖励积分</p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="bg-white text-emerald-600 hover:bg-emerald-50" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              录入证书
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 pb-24">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-emerald-500 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">证书总数</p>
                <p className="text-2xl font-bold text-gray-900" style={{
                fontFamily: 'JetBrains Mono, monospace'
              }}>{stats.total}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <AwardIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">奖励总积分</p>
                <p className="text-2xl font-bold text-blue-600" style={{
                fontFamily: 'JetBrains Mono, monospace'
              }}>+{stats.totalPoints}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-purple-500 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">获奖学生数</p>
                <p className="text-2xl font-bold text-gray-900" style={{
                fontFamily: 'JetBrains Mono, monospace'
              }}>{stats.studentsCount}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-orange-500 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">本月新增</p>
                <p className="text-2xl font-bold text-gray-900" style={{
                fontFamily: 'JetBrains Mono, monospace'
              }}>{stats.thisMonth}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* 筛选栏 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="搜索学生、证书名称或备注..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            
            <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">所有学生</option>
              {MOCK_STUDENTS.map(student => <option key={student.id} value={student.id}>{student.name} ({student.studentId})</option>)}
            </select>
            
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">所有级别</option>
              <option value="basic">初级证书</option>
              <option value="intermediate">中级证书</option>
              <option value="advanced">高级证书</option>
              <option value="expert">特级证书</option>
              <option value="competition">竞赛获奖</option>
            </select>
          </div>
        </div>
        
        {/* 证书列表 */}
        <div className="space-y-3">
          {filteredCertificates.length === 0 ? <div className="text-center py-12 text-gray-500">
              <AwardIcon className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>暂无证书记录</p>
            </div> : filteredCertificates.map(cert => {
          const LevelIcon = getLevelIcon(cert.levelId);
          return <div key={cert.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${getLevelColor(cert.levelId)}`}>
                        <LevelIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cert.certificateName}</h3>
                        <p className="text-sm text-gray-500">{cert.studentName} · {cert.levelName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{cert.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">+{cert.points} 积分</span>
                      </div>
                      {cert.fileUrl && <div className="flex items-center gap-1 text-blue-600">
                        <FileText className="h-4 w-4" />
                        <span>已上传证书</span>
                      </div>}
                    </div>
                    
                    {cert.note && <p className="text-sm text-gray-500 mt-2">备注：{cert.note}</p>}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewCertificate(cert)}>
                      <Eye className="h-4 w-4 mr-1" />
                      查看
                    </Button>
                    {cert.fileUrl && <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(cert)}>
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>}
                  </div>
                </div>
              </div>;
        })}
        </div>
        
        {/* 说明区域 */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center">
            <AwardIcon className="h-5 w-5 mr-2" />
            积分奖励说明
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">初级证书：</span>
              <span className="text-gray-600">+5 积分</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">中级证书：</span>
              <span className="text-gray-600">+10 积分</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">高级证书：</span>
              <span className="text-gray-600">+20 积分</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">特级证书：</span>
              <span className="text-gray-600">+30 积分</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">省级获奖：</span>
              <span className="text-gray-600">+25 积分</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">国家级获奖：</span>
              <span className="text-gray-600">+40 积分</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">国际级获奖：</span>
              <span className="text-gray-600">+50 积分</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">证书录入：</span>
              <span className="text-gray-600">自动创建积分记录</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 录入证书对话框 */}
      {showAddDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{
              fontFamily: 'Noto Serif SC, serif'
            }}>录入技能证书</h2>
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowAddDialog(false)}>
                  ✕
                </Button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* 选择学生 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择学生 <span className="text-red-500">*</span>
                  </label>
                  <select name="studentId" value={formData.studentId} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">请选择学生</option>
                    {MOCK_STUDENTS.map(student => <option key={student.id} value={student.id}>{student.name} ({student.studentId}) - {student.group} - 当前积分：{student.totalPoints}</option>)}
                  </select>
                </div>
                
                {/* 证书名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    证书名称 <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="certificateName" value={formData.certificateName} onChange={handleInputChange} placeholder="例如：英语四级、计算机二级" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                
                {/* 证书级别 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    证书级别 <span className="text-red-500">*</span>
                  </label>
                  <select name="levelId" value={formData.levelId} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">请选择级别</option>
                    {CERTIFICATE_LEVELS.map(level => <option key={level.id} value={level.id}>{level.name} - 奖励积分：+{level.points}</option>)}
                  </select>
                  {formData.levelId && (() => {
                const level = CERTIFICATE_LEVELS.find(l => l.id.toString() === formData.levelId);
                return <p className="mt-2 text-sm text-emerald-600">预计获得 +{level.points} 积分奖励</p>;
              })()}
                </div>
                
                {/* 获得日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    获得日期
                  </label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                
                {/* 备注 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注
                  </label>
                  <textarea name="note" value={formData.note} onChange={handleInputChange} rows={3} placeholder="填写证书相关信息，如考试名称、竞赛名称等" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                
                {/* 上传证书扫描件 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上传证书扫描件
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                    <input type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" onChange={handleFileUpload} disabled={uploading} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">点击上传证书扫描件</p>
                      <p className="text-xs text-gray-400">支持 JPG、PNG、PDF 格式，最大 5MB</p>
                    </label>
                    {formData.file && <div className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span>{formData.file.name}</span>
                      </div>}
                  </div>
                </div>
                
                {/* 按钮组 */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    取消
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    确认录入
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>}
      
      {/* 查看证书对话框 */}
      {selectedCertificate && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{
              fontFamily: 'Noto Serif SC, serif'
            }}>证书详情</h2>
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setSelectedCertificate(null)}>
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${getLevelColor(selectedCertificate.levelId)}`}>
                    {React.createElement(getLevelIcon(selectedCertificate.levelId), {
                  className: "h-8 w-8"
                })}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedCertificate.certificateName}</h3>
                    <p className="text-gray-600">{selectedCertificate.levelName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">获得学生</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCertificate.studentName}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-sm text-emerald-600 mb-1">奖励积分</p>
                    <p className="text-2xl font-bold text-emerald-600">+{selectedCertificate.points}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">获得日期</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCertificate.date}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">证书状态</p>
                    <p className="text-lg font-semibold text-emerald-600">已录入</p>
                  </div>
                </div>
                
                {selectedCertificate.note && <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">备注</p>
                    <p className="text-gray-900">{selectedCertificate.note}</p>
                  </div>}
                
                {selectedCertificate.fileUrl ? <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                      <FileText className="h-5 w-5" />
                      <span className="font-semibold">证书扫描件</span>
                    </div>
                    <Button onClick={() => handleDownloadCertificate(selectedCertificate)} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4 mr-2" />
                      下载证书扫描件
                    </Button>
                  </div> : <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    <FileText className="mx-auto h-10 w-10 mb-2 text-gray-300" />
                    <p>未上传证书扫描件</p>
                  </div>}
              </div>
            </div>
          </div>
        </div>}
      
      {/* TabBar */}
      <TabBar />
    </div>;
}