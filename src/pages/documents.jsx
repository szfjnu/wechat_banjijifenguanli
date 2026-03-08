// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { FileText, Upload, Search, Filter, Pin, Eye, Download, Calendar, Trash2, Edit2, Share2, Shield, Clock, AlertCircle, CheckCircle, XCircle, Plus, Folder, ShieldCheck, AlertTriangle } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';

// 文件分类
const CATEGORIES = [{
  value: 'all',
  label: '全部'
}, {
  value: '规章制度',
  label: '规章制度'
}, {
  value: '安全教育',
  label: '安全教育'
}, {
  value: '课程安排',
  label: '课程安排'
}, {
  value: '活动通知',
  label: '活动通知'
}, {
  value: '家长须知',
  label: '家长须知'
}, {
  value: '其他',
  label: '其他'
}];

// 权限类型
const PERMISSIONS = [{
  value: 'public',
  label: '公开'
}, {
  value: 'student',
  label: '仅学生可见'
}, {
  value: 'parent',
  label: '仅家长可见'
}];
export default function DocumentsPage({
  className = '',
  style = {},
  $w = {
    auth: {
      currentUser: {
        userId: 'teacher001',
        name: '班主任',
        type: 'teacher'
      }
    },
    utils: {
      navigateTo: () => {},
      redirectTo: () => {},
      navigateBack: () => {}
    },
    page: {
      dataset: {
        params: {}
      }
    },
    cloud: {
      getCloudInstance: async () => ({}),
      callFunction: async () => ({})
    }
  }
}) {
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('documents');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  // 文件列表
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);

  // 筛选条件
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [permissionFilter, setPermissionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 对话框状态
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // 上传表单
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '其他',
    description: '',
    permission: 'public',
    expiryDate: '',
    file: null
  });

  // 文件操作
  const [isUploading, setIsUploading] = useState(false);

  // 加载数据
  useEffect(() => {
    loadDocuments();
  }, []);
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('policy_document').orderBy('upload_date', 'desc').limit(50).get();
      if (result.data && result.data.length > 0) {
        const transformedDocuments = result.data.map(doc => ({
          id: doc._id,
          documentId: doc.document_id,
          title: doc.title,
          category: doc.category,
          description: doc.description,
          fileName: doc.file_name,
          fileSize: doc.file_size,
          fileType: doc.file_type,
          fileUrl: doc.file_url,
          isPinned: doc.is_pinned,
          permission: doc.permission,
          uploadDate: doc.upload_date ? doc.upload_date.split('T')[0] : '',
          updateDate: doc.update_date ? doc.update_date.split('T')[0] : '',
          expiryDate: doc.expiry_date,
          uploader: doc.uploader,
          status: doc.status,
          viewCount: doc.view_count,
          downloadCount: doc.download_count,
          semesterId: doc.semester_id,
          semesterName: doc.semester_name
        }));
        setFiles(transformedDocuments);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('加载文档数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载文档数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 筛选文件
  useEffect(() => {
    let result = files;

    // 按分类筛选
    if (categoryFilter !== 'all') {
      result = result.filter(f => f.category === categoryFilter);
    }

    // 按权限筛选
    if (permissionFilter !== 'all') {
      result = result.filter(f => f.permission === permissionFilter);
    }

    // 搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => f.title.toLowerCase().includes(query) || f.description.toLowerCase().includes(query));
    }

    // 置顶文件排在前面
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.uploadDate) - new Date(a.uploadDate);
    });
    setFilteredFiles(result);
  }, [files, categoryFilter, permissionFilter, searchQuery]);

  // 上传文件
  const handleUpload = async () => {
    if (!uploadForm.title) {
      toast({
        title: '错误',
        description: '请输入文件标题',
        variant: 'destructive'
      });
      return;
    }
    if (!uploadForm.file) {
      toast({
        title: '错误',
        description: '请选择要上传的文件',
        variant: 'destructive'
      });
      return;
    }
    setIsUploading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 计算文件大小
      const fileSize = uploadForm.file.size < 1024 * 1024 ? `${(uploadForm.file.size / 1024).toFixed(0)}KB` : `${(uploadForm.file.size / (1024 * 1024)).toFixed(2)}MB`;

      // 添加文件到数据库
      const result = await db.collection('policy_document').add({
        document_id: `PD${Date.now()}`,
        title: uploadForm.title,
        category: uploadForm.category,
        description: uploadForm.description,
        file_name: uploadForm.file.name,
        file_size: fileSize,
        file_type: uploadForm.file.name.split('.').pop().toUpperCase(),
        file_url: 'https://example.com/files/' + uploadForm.file.name,
        is_pinned: false,
        permission: uploadForm.permission === 'public' ? '公开' : uploadForm.permission === 'student' ? '仅学生可见' : uploadForm.permission === 'parent' ? '仅家长可见' : '公开',
        upload_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
        expiry_date: uploadForm.expiryDate ? new Date(uploadForm.expiryDate).toISOString() : null,
        uploader: $w.auth.currentUser?.name || '管理员',
        status: '正常',
        view_count: 0,
        download_count: 0,
        semester_id: 2,
        semester_name: '2024-2025第二学期'
      });
      const newFile = {
        id: result.id || result._id,
        title: uploadForm.title,
        category: uploadForm.category,
        description: uploadForm.description,
        fileName: uploadForm.file.name,
        fileSize: fileSize,
        fileType: uploadForm.file.name.split('.').pop().toUpperCase(),
        fileUrl: 'https://example.com/files/' + uploadForm.file.name,
        isPinned: false,
        permission: uploadForm.permission,
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: uploadForm.expiryDate || null,
        uploader: $w.auth.currentUser?.name || '管理员',
        viewCount: 0,
        downloadCount: 0
      };
      setFiles([newFile, ...files]);

      // 重置表单
      setUploadForm({
        title: '',
        category: '其他',
        description: '',
        permission: 'public',
        expiryDate: '',
        file: null
      });
      setUploadDialogOpen(false);
      toast({
        title: '上传成功',
        description: `文件"${uploadForm.title}"已成功上传`
      });
    } catch (error) {
      console.error('上传文件失败:', error);
      toast({
        title: '上传失败',
        description: error.message || '文件上传失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 置顶/取消置顶
  const togglePin = async fileId => {
    try {
      const file = files.find(f => f.id === fileId);
      const newPinnedStatus = !file.isPinned;
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新数据库中的置顶状态
      await db.collection('policy_document').doc(fileId).update({
        is_pinned: newPinnedStatus,
        update_date: new Date().toISOString()
      });
      setFiles(files.map(f => f.id === fileId ? {
        ...f,
        isPinned: newPinnedStatus
      } : f));
      const status = newPinnedStatus ? '已置顶' : '已取消置顶';
      toast({
        title: '成功',
        description: `文件"${file.title}"${status}`
      });
    } catch (error) {
      console.error('置顶操作失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 删除文件
  const deleteFile = async fileId => {
    const file = files.find(f => f.id === fileId);
    if (!confirm(`确定要删除文件"${file.title}"吗？此操作不可恢复。`)) {
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 从数据库删除文件
      await db.collection('policy_document').doc(fileId).remove();
      setFiles(files.filter(f => f.id !== fileId));
      toast({
        title: '删除成功',
        description: `文件"${file.title}"已删除`
      });
    } catch (error) {
      console.error('删除文件失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 查看文件
  const viewFile = async file => {
    setSelectedFile(file);
    setViewDialogOpen(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新数据库中的查看次数
      await db.collection('policy_document').doc(file.id).update({
        view_count: (file.viewCount || 0) + 1,
        update_date: new Date().toISOString()
      });

      // 增加前端查看次数
      setFiles(files.map(f => f.id === file.id ? {
        ...f,
        viewCount: (f.viewCount || 0) + 1
      } : f));
    } catch (error) {
      console.error('更新查看次数失败:', error);
    }
  };

  // 下载文件
  const downloadFile = async file => {
    // 模拟下载
    console.log('下载文件:', file.fileUrl);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新数据库中的下载次数
      await db.collection('policy_document').doc(file.id).update({
        download_count: (file.downloadCount || 0) + 1,
        update_date: new Date().toISOString()
      });

      // 增加前端下载次数
      setFiles(files.map(f => f.id === file.id ? {
        ...f,
        downloadCount: (f.downloadCount || 0) + 1
      } : f));
      toast({
        title: '开始下载',
        description: `正在下载"${file.fileName}"...`
      });

      // 实际应用中这里会触发浏览器下载
      // window.open(file.fileUrl, '_blank');
    } catch (error) {
      console.error('更新下载次数失败:', error);
      toast({
        title: '下载失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 查看历史记录
  const viewHistory = file => {
    setSelectedFile(file);
    setHistoryDialogOpen(true);
  };

  // 获取文件类型图标颜色
  const getFileTypeColor = fileType => {
    switch (fileType) {
      case 'PDF':
        return 'text-red-600 bg-red-50';
      case 'WORD':
        return 'text-blue-600 bg-blue-50';
      case 'JPG':
      case 'PNG':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 获取权限图标颜色
  const getPermissionColor = permission => {
    switch (permission) {
      case 'public':
        return 'text-green-600 bg-green-50';
      case 'student':
        return 'text-blue-600 bg-blue-50';
      case 'parent':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 检查文件是否已过期
  const isExpired = file => {
    if (!file.expiryDate) return false;
    return new Date(file.expiryDate) < new Date();
  };

  // 统计数据
  const stats = {
    totalFiles: files.length,
    pinnedFiles: files.filter(f => f.isPinned).length,
    expiredFiles: files.filter(f => isExpired(f)).length,
    totalViews: files.reduce((sum, f) => sum + f.viewCount, 0),
    totalDownloads: files.reduce((sum, f) => sum + f.downloadCount, 0)
  };
  return <div className={`min-h-screen bg-gray-50 pb-16 ${className}`} style={style}>
      <div className="max-w-6xl mx-auto px-4 pt-4">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{
          fontFamily: 'Noto Serif SC, serif'
        }}>
            制度文件管理
          </h1>
          <p className="text-gray-600">管理班级制度性文件，支持上传、预览、下载和权限控制</p>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatCard title="文件总数" value={stats.totalFiles} icon={FileText} color="blue" />
          <StatCard title="置顶文件" value={stats.pinnedFiles} icon={Pin} color="green" />
          <StatCard title="已过期" value={stats.expiredFiles} icon={AlertCircle} color="red" />
          <StatCard title="总下载" value={stats.totalDownloads} icon={Download} color="amber" />
        </div>
        
        {/* 操作栏 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
              {/* 搜索框 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="搜索文件名称或描述..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              
              {/* 分类筛选 */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                </SelectContent>
              </Select>
              
              {/* 权限筛选 */}
              <Select value={permissionFilter} onValueChange={setPermissionFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="权限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部权限</SelectItem>
                  {PERMISSIONS.map(perm => <SelectItem key={perm.value} value={perm.value}>{perm.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            {/* 上传按钮 */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  上传文件
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>上传文件</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* 文件标题 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">文件标题 *</label>
                    <input type="text" value={uploadForm.title} onChange={e => setUploadForm({
                    ...uploadForm,
                    title: e.target.value
                  })} placeholder="请输入文件标题" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  
                  {/* 文件分类 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">文件分类</label>
                    <Select value={uploadForm.category} onValueChange={value => setUploadForm({
                    ...uploadForm,
                    category: value
                  })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter(c => c.value !== 'all').map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 文件描述 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">文件描述</label>
                    <textarea value={uploadForm.description} onChange={e => setUploadForm({
                    ...uploadForm,
                    description: e.target.value
                  })} placeholder="请输入文件描述（可选）" rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  
                  {/* 文件上传 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">选择文件 *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">点击或拖拽文件到此处上传</p>
                      <p className="text-xs text-gray-400">支持 PDF、Word、图片格式，最大10MB</p>
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => setUploadForm({
                      ...uploadForm,
                      file: e.target.files[0]
                    })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                    {uploadForm.file && <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-sm text-emerald-700">
                        已选择: {uploadForm.file.name}
                      </div>}
                  </div>
                  
                  {/* 访问权限 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">访问权限</label>
                    <Select value={uploadForm.permission} onValueChange={value => setUploadForm({
                    ...uploadForm,
                    permission: value
                  })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERMISSIONS.map(perm => <SelectItem key={perm.value} value={perm.value}>{perm.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 有效期 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">有效期至（可选）</label>
                    <input type="date" value={uploadForm.expiryDate} onChange={e => setUploadForm({
                    ...uploadForm,
                    expiryDate: e.target.value
                  })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    <p className="text-xs text-gray-400 mt-1">留空表示永久有效</p>
                  </div>
                  
                  {/* 提交按钮 */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      {isUploading ? '上传中...' : '确认上传'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* 文件列表 */}
        <div className="space-y-4">
          {filteredFiles.length === 0 ? <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-emerald-100">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">暂无符合条件的文件</p>
            </div> : filteredFiles.map(file => <div key={file.id} className={`bg-white rounded-xl p-4 shadow-sm border ${file.isPinned ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50' : 'border-emerald-100'} hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between gap-4">
                {/* 文件信息 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {/* 文件类型标签 */}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getFileTypeColor(file.fileType)}`}>
                      {file.fileType}
                    </span>
                    
                    {/* 分类标签 */}
                    <span className="px-2 py-1 rounded text-xs font-medium bg-teal-50 text-teal-700">
                      {file.category}
                    </span>
                    
                    {/* 置顶标识 */}
                    {file.isPinned && <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        置顶
                      </span>}
                    
                    {/* 已过期标识 */}
                    {isExpired(file) && <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        已过期
                      </span>}
                  </div>
                  
                  {/* 文件标题 */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{file.title}</h3>
                  
                  {/* 文件描述 */}
                  <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                  
                  {/* 文件元信息 */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {file.fileName} ({file.fileSize})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {file.uploadDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {file.viewCount}次查看
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {file.downloadCount}次下载
                    </span>
                    {file.expiryDate && <span className={`flex items-center gap-1 ${isExpired(file) ? 'text-red-600' : ''}`}>
                        <Clock className="w-3 h-3" />
                        {isExpired(file) ? '已过期' : `有效期至: ${file.expiryDate}`}
                      </span>}
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {/* 查看按钮 */}
                    <Button size="sm" variant="outline" onClick={() => viewFile(file)} className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      查看
                    </Button>
                    
                    {/* 下载按钮 */}
                    <Button size="sm" variant="outline" onClick={() => downloadFile(file)} className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      下载
                    </Button>
                  </div>
                  
                  {/* 管理操作 */}
                  <div className="flex gap-2">
                    {/* 置顶/取消置顶 */}
                    <Button size="sm" variant="outline" onClick={() => togglePin(file.id)} title={file.isPinned ? '取消置顶' : '置顶'}>
                      <Pin className={`w-4 h-4 ${file.isPinned ? 'text-amber-600' : ''}`} />
                    </Button>
                    
                    {/* 查看历史 */}
                    <Button size="sm" variant="outline" onClick={() => viewHistory(file)} title="查看历史">
                      <Clock className="w-4 h-4" />
                    </Button>
                    
                    {/* 删除 */}
                    <Button size="sm" variant="outline" onClick={() => deleteFile(file.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* 底部权限标签 */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPermissionColor(file.permission)}`}>
                    {PERMISSIONS.find(p => p.value === file.permission)?.label || '未知'}
                  </span>
                  <span className="text-xs text-gray-400">• 上传人: {file.uploader}</span>
                </div>
              </div>
            </div>)}
        </div>
        
        {/* 说明区域 */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
          <h3 className="font-semibold text-gray-800 mb-2">💡 使用说明</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 支持上传 PDF、Word、图片格式文件，最大10MB</li>
            <li>• 置顶文件会显示在列表顶部，方便快速访问</li>
            <li>• 可设置文件的访问权限（公开/仅学生/仅家长）</li>
            <li>• 可设置文件有效期，过期后将归档</li>
            <li>• 系统会记录文件的查看和下载次数，便于统计</li>
          </ul>
        </div>
      </div>
      
      {/* 文件详情对话框 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>文件详情</DialogTitle>
          </DialogHeader>
          {selectedFile && <div className="space-y-4 py-4">
              {/* 文件基本信息 */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{selectedFile.title}</h3>
                <p className="text-sm text-gray-600">{selectedFile.description}</p>
              </div>
              
              {/* 文件元数据 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">文件名:</span>
                  <p className="font-medium">{selectedFile.fileName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">文件大小:</span>
                  <p className="font-medium">{selectedFile.fileSize}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">文件类型:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getFileTypeColor(selectedFile.fileType)}`}>
                    {selectedFile.fileType}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">文件分类:</span>
                  <p className="font-medium">{selectedFile.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">上传日期:</span>
                  <p className="font-medium">{selectedFile.uploadDate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">上传人:</span>
                  <p className="font-medium">{selectedFile.uploader}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">查看次数:</span>
                  <p className="font-medium">{selectedFile.viewCount}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">下载次数:</span>
                  <p className="font-medium">{selectedFile.downloadCount}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">访问权限:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPermissionColor(selectedFile.permission)}`}>
                    {PERMISSIONS.find(p => p.value === selectedFile.permission)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">有效期:</span>
                  <p className={`font-medium ${isExpired(selectedFile) ? 'text-red-600' : ''}`}>{selectedFile.expiryDate || '永久有效'}</p>
                </div>
              </div>
              
              {/* 在线预览（模拟） */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center">在线预览功能待实现</p>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  关闭
                </Button>
                <Button onClick={() => downloadFile(selectedFile)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  下载文件
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
      
      {/* 历史记录对话框 */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>文件历史记录</DialogTitle>
          </DialogHeader>
          {selectedFile && <div className="space-y-4 py-4">
              <div className="bg-emerald-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800">{selectedFile.title}</h3>
                <p className="text-sm text-gray-600">查看和下载历史</p>
              </div>
              
              {/* 模拟历史记录列表 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">张三</p>
                      <p className="text-xs text-gray-500">学生 • 2025-03-01 10:30</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">查看</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium">李四</p>
                      <p className="text-xs text-gray-500">家长 • 2025-02-28 15:45</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">下载</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">王五</p>
                      <p className="text-xs text-gray-500">学生 • 2025-02-27 09:15</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">查看</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
                  关闭
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
      
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}