// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Gift, Search, Filter, TrendingUp, Clock, AlertCircle, Trophy, CheckCircle, XCircle, Users, Calendar, Eye, Tag, Download } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, StatCard } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
export default function ExchangePage({
  $w
}) {
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('exchange');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [items, setItems] = useState([]);
  const [biddings, setBiddings] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredBiddings, setFilteredBiddings] = useState([]);
  const [filteredExchanges, setFilteredExchanges] = useState([]);
  const [selectedMode, setSelectedMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);

  // 对话框状态
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [biddingRecordsDialogOpen, setBiddingRecordsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemBiddings, setItemBiddings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 表单状态
  const [bidPoints, setBidPoints] = useState('');
  const [exchangeReason, setExchangeReason] = useState('');

  // 筛选选项
  const categories = ['all', ...new Set(items.map(item => item.category))];

  // 加载数据
  useEffect(() => {
    loadExchangeData();
  }, []);
  const loadExchangeData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 加载物品列表
      const itemsResult = await db.collection('redemption_items').get();
      if (itemsResult.data && itemsResult.data.length > 0) {
        const transformedItems = itemsResult.data.map(item => ({
          id: item._id,
          name: item.name,
          description: item.description,
          imageUrl: item.image_url,
          pointsRequired: item.required_score,
          mode: item.redemption_mode === '投标竞拍' ? 'bidding' : 'direct',
          status: item.status === '可兑换' ? 'available' : item.status === '竞拍中' ? 'bidding' : item.status === '投标中' ? 'bidding' : 'unavailable',
          category: '其他',
          createdAt: item.created_at?.substring(0, 10) || '',
          quantity: item.quantity,
          biddingStartTime: item.bid_start_time,
          biddingEndTime: item.bid_end_time,
          currentHighestPoints: item.winner_bid_score || 0,
          biddingCount: 0
        }));
        setItems(transformedItems);
      }

      // 加载兑换记录
      const exchangesResult = await db.collection('redemption_requests').orderBy('redemption_time', 'desc').limit(100).get();
      if (exchangesResult.data && exchangesResult.data.length > 0) {
        const transformedExchanges = exchangesResult.data.map(record => ({
          id: record._id,
          itemId: record.item_id,
          itemName: record.item_name || '未知物品',
          studentId: record.student_id,
          studentName: record.student_name || '未知',
          pointsUsed: record.points_required,
          exchangeDate: record.redemption_time?.substring(0, 10) || '',
          status: record.status === '已兑换' ? 'completed' : 'pending'
        }));
        setExchanges(transformedExchanges);
      }

      // 加载当前学生信息（使用第一个学生作为示例）
      const studentsResult = await db.collection('students').limit(1).get();
      if (studentsResult.data && studentsResult.data.length > 0) {
        const student = studentsResult.data[0];
        setCurrentStudent({
          id: student._id,
          studentId: student.student_id,
          name: student.name,
          group: student.group || '未分组',
          totalPoints: student.current_score || 0
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('加载兑换数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载兑换数据',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // 筛选物品
  useEffect(() => {
    let filtered = items;
    if (selectedMode !== 'all') {
      filtered = filtered.filter(item => item.mode === selectedMode);
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredItems(filtered);
  }, [items, selectedMode, selectedCategory, searchQuery]);

  // 筛选投标记录
  useEffect(() => {
    let filtered = biddings;
    if (selectedStudent) {
      filtered = filtered.filter(bidding => bidding.studentId === selectedStudent.studentId);
    }
    setFilteredBiddings(filtered);
  }, [biddings, selectedStudent]);

  // 筛选兑换记录
  useEffect(() => {
    let filtered = exchanges;
    if (selectedStudent) {
      filtered = filtered.filter(exchange => exchange.studentId === selectedStudent.studentId);
    }
    setFilteredExchanges(filtered);
  }, [exchanges, selectedStudent]);

  // 获取物品投标记录
  const getItemBiddings = itemId => {
    return biddings.filter(bidding => bidding.itemId === itemId).sort((a, b) => b.points - a.points || a.biddingTime.localeCompare(b.biddingTime));
  };

  // 打开投标记录对话框
  const handleOpenBiddingRecords = item => {
    setSelectedItem(item);
    setItemBiddings(getItemBiddings(item.id));
    setBiddingRecordsDialogOpen(true);
  };

  // 关闭投标记录对话框
  const handleCloseBiddingRecordsDialog = () => {
    setSelectedItem(null);
    setBiddingRecordsDialogOpen(false);
  };

  // 打开投标对话框
  const handleOpenBidDialog = item => {
    if (item.status !== 'bidding') return;
    setSelectedItem(item);
    setBidPoints('');
    setBidDialogOpen(true);
  };

  // 关闭投标对话框
  const handleCloseBidDialog = () => {
    setSelectedItem(null);
    setBidDialogOpen(false);
  };

  // 提交投标
  const handleSubmitBid = async () => {
    // 保存当前选中项和学生信息的副本，避免异步操作中被清空
    const item = selectedItem;
    const student = currentStudent;
    if (!bidPoints || !item || !item.name) {
      toast({
        title: '提示',
        description: '请填写投标积分',
        variant: 'destructive'
      });
      return;
    }
    const points = parseInt(bidPoints);
    if (points > student.totalPoints) {
      toast({
        title: '积分不足',
        description: '您的当前积分不足',
        variant: 'destructive'
      });
      return;
    }
    if (points <= (item.currentHighestPoints || 0)) {
      toast({
        title: '投标失败',
        description: '投标积分必须高于当前最高分',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 创建投标兑换申请记录
      const result = await db.collection('redemption_requests').add({
        request_id: `RR${Date.now()}`,
        student_id: student.studentId,
        student_name: student.name,
        item_id: item.id,
        item_name: item.name,
        points_required: points,
        redemption_mode: '投标竞拍',
        status: '待审核',
        redemption_time: new Date().toISOString(),
        semester_id: 2,
        semester_name: '2024-2025第二学期',
        is_winner: false
      });

      // 更新物品的最高投标分
      await db.collection('redemption_items').where({
        item_id: item.id
      }).update({
        winner_bid_score: points
      });

      // 创建新投标记录
      const newBidding = {
        id: result.id || result._id,
        itemId: item.id,
        studentId: student.studentId,
        studentName: student.name,
        points: points,
        biddingTime: new Date().toLocaleString('zh-CN')
      };
      setBiddings([...biddings, newBidding]);

      // 更新物品当前最高分
      setItems(items.map(i => i.id === item.id ? {
        ...i,
        currentHighestPoints: points,
        biddingCount: i.biddingCount + 1
      } : i));
      toast({
        title: '投标成功',
        description: `您已成功参与"${item?.name || '该物品'}"的投标，投标积分：${points}分`
      });
      setBidDialogOpen(false);
    } catch (error) {
      console.error('投标失败:', error);
      toast({
        title: '投标失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 打开兑换对话框
  const handleOpenExchangeDialog = item => {
    if (item.mode !== 'direct') return;
    if (item.pointsRequired > currentStudent.totalPoints) {
      toast({
        title: '积分不足',
        description: `您需要${item.pointsRequired}积分，当前只有${currentStudent.totalPoints}积分`,
        variant: 'destructive'
      });
      return;
    }
    setSelectedItem(item);
    setExchangeReason('');
    setExchangeDialogOpen(true);
  };

  // 关闭兑换对话框
  const handleCloseExchangeDialog = () => {
    setSelectedItem(null);
    setExchangeDialogOpen(false);
  };

  // 提交兑换申请
  const handleSubmitExchange = async () => {
    // 保存当前选中项和学生信息的副本，避免异步操作中被清空
    const item = selectedItem;
    const student = currentStudent;
    if (!item || !item.name || !student) {
      toast({
        title: '提示',
        description: '请选择要兑换的物品',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const newTotalPoints = student.totalPoints - (item.pointsRequired || 0);

      // 添加兑换记录到数据库
      const result = await db.collection('redemption_requests').add({
        request_id: `RR${Date.now()}`,
        student_id: student.studentId,
        student_name: student.name,
        item_id: item.id,
        item_name: item.name,
        points_required: item.pointsRequired,
        redemption_mode: '直接兑换',
        status: '已兑换',
        redemption_time: new Date().toISOString(),
        approver_name: '系统',
        approval_time: new Date().toISOString(),
        approval_comment: '直接兑换自动审核通过',
        semester_id: 2,
        semester_name: '2024-2025第二学期',
        is_winner: null
      });

      // 更新学生积分
      await db.collection('students').doc(student.id).update({
        current_score: newTotalPoints
      });

      // 创建兑换记录
      const newExchange = {
        id: result.id || result._id,
        itemId: item.id,
        itemName: item.name,
        studentId: student.studentId,
        studentName: student.name,
        pointsUsed: item.pointsRequired,
        exchangeDate: new Date().toLocaleDateString('zh-CN'),
        status: 'completed'
      };
      setExchanges([...exchanges, newExchange]);

      // 更新当前学生积分
      setCurrentStudent({
        ...student,
        totalPoints: newTotalPoints
      });

      // 更新物品库存和状态
      if (item.quantity) {
        const newQuantity = item.quantity - 1;
        setItems(items.map(i => i.id === item.id ? {
          ...i,
          quantity: newQuantity,
          status: newQuantity <= 0 ? 'exchanged' : i.status
        } : i));
      } else {
        setItems(items.map(i => i.id === item.id ? {
          ...i,
          status: 'exchanged'
        } : i));
      }
      toast({
        title: '兑换成功',
        description: `您已成功兑换"${item?.name || '该物品'}"，消耗${item?.pointsRequired || 0}积分`
      });
      setExchangeDialogOpen(false);
    } catch (error) {
      console.error('创建兑换记录失败:', error);
      toast({
        title: '兑换失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };

  // 获取物品状态标签
  const getStatusBadge = item => {
    if (item.status === 'exchanged') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <XCircle className="w-3 h-3 mr-1" />
        已兑换
      </span>;
    }
    if (item.status === 'bidding') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <Clock className="w-3 h-3 mr-1" />
        投标中
      </span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle className="w-3 h-3 mr-1" />
      可兑换
    </span>;
  };

  // 获取模式标签
  const getModeBadge = item => {
    if (item.mode === 'bidding') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
        <Trophy className="w-3 h-3 mr-1" />
        投标模式
      </span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
      <Gift className="w-3 h-3 mr-1" />
      直接兑换
    </span>;
  };

  // 获取剩余时间
  const getRemainingTime = endTime => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    if (days > 0) {
      return `${days}天${hours}小时`;
    }
    return `${hours}小时`;
  };

  // 导出CSV
  const handleExportCSV = () => {
    const headers = ['学号', '姓名', '物品名称', '使用积分', '兑换日期', '状态'];
    const data = filteredExchanges.map(e => [e.studentId, e.studentName, e.itemName, e.pointsUsed, e.exchangeDate, e.status]);
    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '兑换记录.csv';
    link.click();
    toast({
      title: '导出成功',
      description: '兑换记录已导出为CSV文件'
    });
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 头部 - 紧凑 */}
      <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">积分兑换中心</h1>
          <Button onClick={handleExportCSV} variant="outline" size="icon" className="h-8 w-8">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="px-3 py-2">
        {/* 学生信息卡片 - 紧凑 */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg p-3 text-white mb-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-0.5">{currentStudent.name}</div>
              <div className="text-xs opacity-90">学号：{currentStudent.studentId}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-90 mb-0.5">可用积分</div>
              <div className="text-2xl font-bold">{currentStudent.totalPoints}</div>
            </div>
          </div>
        </div>
        
        {/* 统计卡片 - 紧凑 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatCard title="可兑换物品" value={filteredItems.length} icon={Gift} color="orange" />
          <StatCard title="投标物品" value={filteredItems.filter(i => i.mode === 'bidding').length} icon={Trophy} color="amber" />
          <StatCard title="投标记录" value={filteredBiddings.length} icon={Users} color="blue" />
          <StatCard title="兑换成功" value={filteredExchanges.length} icon={CheckCircle} color="green" />
        </div>
        
        {/* 学生信息卡片 */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold mb-1">{currentStudent.name}</div>
              <div className="text-sm opacity-90">学号：{currentStudent.studentId} | {currentStudent.group}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">当前可用积分</div>
              <div className="text-4xl font-bold">{currentStudent.totalPoints}</div>
            </div>
          </div>
        </div>
        
        {/* 物品列表 - 紧凑 */}
        <div className="">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">可兑换物品</h2>
            <div className="flex items-center gap-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="搜索..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs w-32" />
              </div>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="w-24 h-7">
                  <SelectValue placeholder="模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部模式</SelectItem>
                  <SelectItem value="direct">直接兑换</SelectItem>
                  <SelectItem value="bidding">投标模式</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-24 h-7">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat === 'all' ? '全部分类' : cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredItems.length === 0 ? <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-600">暂无符合条件的物品</div>
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {getStatusBadge(item)}
                      {getModeBadge(item)}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{item.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-orange-600">{item.pointsRequired} 积分</span>
                      {item.mode === 'bidding' && item.status === 'bidding' && <div className="text-sm">
                          <div className="text-gray-500">当前最高：{item.currentHighestPoints}分</div>
                          <div className="text-gray-400 text-xs">剩余{getRemainingTime(item.biddingEndTime)}</div>
                        </div>}
                    </div>
                    <div className="flex gap-2">
                      {item.mode === 'direct' && item.status === 'available' && <Button onClick={() => handleOpenExchangeDialog(item)} className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white" disabled={item.pointsRequired > currentStudent.totalPoints}>
                          立即兑换
                        </Button>}
                      {item.mode === 'bidding' && item.status === 'bidding' && <div className="flex gap-2 w-full">
                          <Button onClick={() => handleOpenBidDialog(item)} className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white" disabled={item.status !== 'bidding'}>
                            参与投标
                          </Button>
                          <Button onClick={() => handleOpenBiddingRecords(item)} variant="outline" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>}
                      {item.status === 'exchanged' && <Button disabled className="flex-1">
                          已兑换
                        </Button>}
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>
        
        {/* 我的投标记录部分 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">我的投标记录</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredBiddings.length === 0 ? <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600">暂无投标记录</div>
              </div> : <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">物品名称</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">投标积分</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">投标时间</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBiddings.map(bidding => {
                const item = items.find(i => i.id === bidding.itemId);
                const isHighest = item && bidding.points === item.currentHighestPoints;
                return <tr key={bidding.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item ? item.name : '未知物品'}</div>
                        <div className="text-sm text-gray-500">{item ? item.category : ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${isHighest ? 'text-green-600' : 'text-gray-900'}`}>{bidding.points} 分</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{bidding.biddingTime}</td>
                      <td className="px-6 py-4">
                        {isHighest ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            暂时领先
                          </span> : <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            已被超越
                          </span>}
                      </td>
                    </tr>;
              })}
                </tbody>
              </table>}
          </div>
        </div>
        
        {/* 兑换历史部分 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">兑换历史</h2>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Tag className="w-4 h-4 mr-2" />
              导出CSV
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredExchanges.length === 0 ? <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600">暂无兑换记录</div>
              </div> : <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">物品名称</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">使用积分</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">兑换日期</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredExchanges.map(exchange => <tr key={exchange.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{exchange.itemName}</div>
                        {exchange.isWinner && <div className="text-sm text-purple-600 flex items-center">
                            <Trophy className="w-3 h-3 mr-1" />
                            投标中标
                          </div>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-orange-600">-{exchange.pointsUsed} 积分</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exchange.exchangeDate}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          兑换成功
                        </span>
                      </td>
                    </tr>)}
                </tbody>
              </table>}
          </div>
        </div>
        
        {/* 说明卡片 */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            兑换说明
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>直接兑换</strong>：积分足够即可直接兑换，先到先得</li>
            <li><strong>投标模式</strong>：多个学生竞争，投标积分最高者获得（积分相同时按时间先后）</li>
            <li>投标截止后系统自动确定中标者并扣除相应积分</li>
            <li>投标截止前可以撤销投标并释放积分</li>
            <li>兑换后物品会标记为已兑换，不可重复兑换</li>
          </ul>
        </div>
      </div>
      
      {/* 投标对话框 */}
      <Dialog open={bidDialogOpen} onOpenChange={open => {
      if (!open) handleCloseBidDialog();else setBidDialogOpen(open);
    }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>参与投标</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && selectedItem.name && <div>
                <div className="text-sm text-gray-600 mb-1">物品名称</div>
                <div className="font-semibold text-gray-900 mb-2">{selectedItem.name}</div>
                
                <div className="text-sm text-gray-600 mb-1">当前最高分</div>
                <div className="text-lg font-bold text-orange-600 mb-2">{selectedItem.currentHighestPoints || 0} 分</div>
                
                <div className="text-sm text-gray-600 mb-1">投标截止时间</div>
                <div className="text-sm text-gray-900 mb-4">{selectedItem.biddingEndTime || '-'}</div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">投标积分 *</label>
                  <input type="number" value={bidPoints} onChange={e => setBidPoints(e.target.value)} placeholder="请输入投标积分" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <p className="text-xs text-gray-500">投标积分必须高于当前最高分 {selectedItem.currentHighestPoints || 0}分</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="text-sm text-gray-600 mb-1">您的当前积分</div>
                  <div className="text-lg font-bold text-gray-900">{currentStudent.totalPoints} 分</div>
                </div>
              </div>}
            
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmitBid} className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">
                提交投标
              </Button>
              <Button onClick={() => setBidDialogOpen(false)} variant="outline">
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 兑换对话框 */}
      <Dialog open={exchangeDialogOpen} onOpenChange={open => {
      if (!open) handleCloseExchangeDialog();else setExchangeDialogOpen(open);
    }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认兑换</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && selectedItem.name && <div>
                <div className="text-sm text-gray-600 mb-1">物品名称</div>
                <div className="font-semibold text-gray-900 mb-2">{selectedItem.name}</div>
                
                <div className="text-sm text-gray-600 mb-1">所需积分</div>
                <div className="text-lg font-bold text-orange-600 mb-4">-{selectedItem.pointsRequired || 0} 积分</div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">兑换备注</label>
                  <textarea value={exchangeReason} onChange={e => setExchangeReason(e.target.value)} placeholder="请输入兑换备注（可选）" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24" />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="text-sm text-gray-600 mb-1">兑换后剩余积分</div>
                  <div className="text-lg font-bold text-gray-900">{currentStudent && selectedItem ? currentStudent.totalPoints - (selectedItem.pointsRequired || 0) : 0} 分</div>
                </div>
              </div>}
            
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmitExchange} className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                确认兑换
              </Button>
              <Button onClick={() => setExchangeDialogOpen(false)} variant="outline">
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 投标记录对话框 */}
      <Dialog open={biddingRecordsDialogOpen} onOpenChange={open => {
      if (!open) handleCloseBiddingRecordsDialog();else setBiddingRecordsDialogOpen(open);
    }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>投标记录</DialogTitle>
          </DialogHeader>
          <div>
            {selectedItem && selectedItem.name && <div className="mb-4">
                <div className="font-semibold text-gray-900">{selectedItem.name}</div>
                <div className="text-sm text-gray-500">当前投标人数：{itemBiddings.length}人</div>
              </div>}
            
            {itemBiddings.length === 0 ? <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600">暂无投标记录</div>
              </div> : <div className="space-y-2 max-h-96 overflow-y-auto">
                  {itemBiddings.map((bidding, index) => <div key={bidding.id} className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        <div>
                          <div className="font-medium text-gray-900">{bidding.studentName}</div>
                          <div className="text-xs text-gray-500">{bidding.biddingTime}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${index === 0 ? 'text-green-600' : 'text-gray-900'}`}>{bidding.points} 分</div>
                    </div>)}
                </div>}
          </div>
        </DialogContent>
      </Dialog>
      
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}