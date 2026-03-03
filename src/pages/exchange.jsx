// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Gift, Search, Filter, TrendingUp, Clock, AlertCircle, Trophy, CheckCircle, XCircle, Users, Calendar, Eye, Tag } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

import { TabBar } from '@/components/TabBar';

// 模拟学生数据
const MOCK_STUDENTS = [{
  id: 1,
  studentId: '2024001',
  name: '张三',
  group: '第一组',
  totalPoints: 156
}, {
  id: 2,
  studentId: '2024002',
  name: '李四',
  group: '第一组',
  totalPoints: 143
}, {
  id: 3,
  studentId: '2024003',
  name: '王五',
  group: '第二组',
  totalPoints: 138
}, {
  id: 4,
  studentId: '2024004',
  name: '赵六',
  group: '第二组',
  totalPoints: 165
}, {
  id: 5,
  studentId: '2024005',
  name: '钱七',
  group: '第三组',
  totalPoints: 132
}];

// 模拟可兑换物品数据
const MOCK_ITEMS = [{
  id: 1,
  name: '学习用品礼包',
  description: '包含笔记本、签字笔、铅笔套装等',
  imageUrl: 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=400',
  pointsRequired: 30,
  mode: 'direct',
  status: 'available',
  category: '学习用品',
  createdAt: '2025-01-15'
}, {
  id: 2,
  name: '图书借阅卡',
  description: '可借阅班级图书角任意图书一个月',
  imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
  pointsRequired: 20,
  mode: 'direct',
  status: 'available',
  category: '学习用品',
  createdAt: '2025-01-18'
}, {
  id: 3,
  name: '周末影院套票',
  description: '周末下午在教室观看精选电影',
  imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
  pointsRequired: 25,
  mode: 'direct',
  status: 'available',
  category: '娱乐活动',
  createdAt: '2025-01-20'
}, {
  id: 4,
  name: '特殊座位券',
  description: '获得优先选择座位的权利',
  imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
  pointsRequired: 40,
  mode: 'bidding',
  status: 'bidding',
  category: '特权',
  biddingStartTime: '2025-03-01 08:00:00',
  biddingEndTime: '2025-03-15 18:00:00',
  currentHighestPoints: 35,
  biddingCount: 3,
  createdAt: '2025-02-25'
}, {
  id: 5,
  name: '班长体验周',
  description: '获得一周班长体验机会',
  imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  pointsRequired: 50,
  mode: 'bidding',
  status: 'bidding',
  category: '特权',
  biddingStartTime: '2025-02-28 08:00:00',
  biddingEndTime: '2025-03-10 18:00:00',
  currentHighestPoints: 45,
  biddingCount: 5,
  createdAt: '2025-02-20'
}, {
  id: 6,
  name: '免作业券',
  description: '可免除一次作业',
  imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
  pointsRequired: 35,
  mode: 'direct',
  status: 'available',
  category: '特权',
  createdAt: '2025-02-15'
}, {
  id: 7,
  name: '自习室使用权',
  description: '午休时间使用自习室一周',
  imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
  pointsRequired: 45,
  mode: 'bidding',
  status: 'bidding',
  category: '特权',
  biddingStartTime: '2025-03-05 08:00:00',
  biddingEndTime: '2025-03-20 18:00:00',
  currentHighestPoints: 40,
  biddingCount: 2,
  createdAt: '2025-02-28'
}];

// 模拟投标记录数据
const MOCK_BIDDINGS = [{
  id: 1,
  itemId: 4,
  studentId: '2024004',
  studentName: '赵六',
  points: 35,
  biddingTime: '2025-03-02 10:30:00'
}, {
  id: 2,
  itemId: 4,
  studentId: '2024001',
  studentName: '张三',
  points: 30,
  biddingTime: '2025-03-01 15:20:00'
}, {
  id: 3,
  itemId: 4,
  studentId: '2024002',
  studentName: '李四',
  points: 28,
  biddingTime: '2025-03-01 09:15:00'
}, {
  id: 4,
  itemId: 5,
  studentId: '2024001',
  studentName: '张三',
  points: 45,
  biddingTime: '2025-03-01 16:45:00'
}, {
  id: 5,
  itemId: 5,
  studentId: '2024004',
  studentName: '赵六',
  points: 42,
  biddingTime: '2025-03-01 14:20:00'
}, {
  id: 6,
  itemId: 5,
  studentId: '2024003',
  studentName: '王五',
  points: 40,
  biddingTime: '2025-03-01 11:30:00'
}];

// 模拟兑换记录数据
const MOCK_EXCHANGES = [{
  id: 1,
  itemId: 1,
  itemName: '学习用品礼包',
  studentId: '2024004',
  studentName: '赵六',
  pointsUsed: 30,
  exchangeDate: '2025-02-20',
  status: 'completed'
}, {
  id: 2,
  itemId: 2,
  itemName: '图书借阅卡',
  studentId: '2024001',
  studentName: '张三',
  pointsUsed: 20,
  exchangeDate: '2025-02-22',
  status: 'completed'
}, {
  id: 3,
  itemId: 4,
  itemName: '特殊座位券',
  studentId: '2024004',
  studentName: '赵六',
  pointsUsed: 35,
  exchangeDate: '2025-02-25',
  status: 'completed',
  isWinner: true
}];
export default function ExchangePage({
  $w
}) {
  const {
    toast
  } = useToast();
  const [items, setItems] = useState(MOCK_ITEMS);
  const [biddings, setBiddings] = useState(MOCK_BIDDINGS);
  const [exchanges, setExchanges] = useState(MOCK_EXCHANGES);
  const [filteredItems, setFilteredItems] = useState(MOCK_ITEMS);
  const [filteredBiddings, setFilteredBiddings] = useState(MOCK_BIDDINGS);
  const [filteredExchanges, setFilteredExchanges] = useState(MOCK_EXCHANGES);
  const [selectedMode, setSelectedMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 对话框状态
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [biddingRecordsDialogOpen, setBiddingRecordsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemBiddings, setItemBiddings] = useState([]);

  // 表单状态
  const [bidPoints, setBidPoints] = useState('');
  const [exchangeReason, setExchangeReason] = useState('');

  // 筛选选项
  const categories = ['all', ...new Set(items.map(item => item.category))];

  // 获取当前登录学生
  const currentStudent = MOCK_STUDENTS[0]; // 假设第一个是当前学生

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

  // 打开投标对话框
  const handleOpenBidDialog = item => {
    if (item.status !== 'bidding') return;
    setSelectedItem(item);
    setBidPoints('');
    setBidDialogOpen(true);
  };

  // 提交投标
  const handleSubmitBid = () => {
    if (!bidPoints || !selectedItem) {
      toast({
        title: '提示',
        description: '请填写投标积分',
        variant: 'destructive'
      });
      return;
    }
    const points = parseInt(bidPoints);
    if (points > currentStudent.totalPoints) {
      toast({
        title: '积分不足',
        description: '您的当前积分不足',
        variant: 'destructive'
      });
      return;
    }
    if (points <= selectedItem.currentHighestPoints) {
      toast({
        title: '投标失败',
        description: '投标积分必须高于当前最高分',
        variant: 'destructive'
      });
      return;
    }

    // 创建新投标记录
    const newBidding = {
      id: biddings.length + 1,
      itemId: selectedItem.id,
      studentId: currentStudent.studentId,
      studentName: currentStudent.name,
      points: points,
      biddingTime: new Date().toLocaleString('zh-CN')
    };
    setBiddings([...biddings, newBidding]);

    // 更新物品当前最高分
    setItems(items.map(item => item.id === selectedItem.id ? {
      ...item,
      currentHighestPoints: points,
      biddingCount: item.biddingCount + 1
    } : item));
    toast({
      title: '投标成功',
      description: `您已成功参与"${selectedItem.name}"的投标，投标积分：${points}分`
    });
    setBidDialogOpen(false);
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

  // 提交兑换申请
  const handleSubmitExchange = () => {
    if (!selectedItem) {
      toast({
        title: '提示',
        description: '请选择要兑换的物品',
        variant: 'destructive'
      });
      return;
    }

    // 创建兑换记录
    const newExchange = {
      id: exchanges.length + 1,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      studentId: currentStudent.studentId,
      studentName: currentStudent.name,
      pointsUsed: selectedItem.pointsRequired,
      exchangeDate: new Date().toLocaleDateString('zh-CN'),
      status: 'completed'
    };
    setExchanges([...exchanges, newExchange]);

    // 扣除积分（模拟）
    currentStudent.totalPoints -= selectedItem.pointsRequired;

    // 更新物品状态为已兑换
    setItems(items.map(item => item.id === selectedItem.id ? {
      ...item,
      status: 'exchanged'
    } : item));
    toast({
      title: '兑换成功',
      description: `您已成功兑换"${selectedItem.name}"，消耗${selectedItem.pointsRequired}积分`
    });
    setExchangeDialogOpen(false);
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 页面头部 */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900 mb-2">积分兑换中心</h1>
          <p className="text-gray-600">使用积分兑换心仪的物品，或参与投标竞拍</p>
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
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Gift className="w-8 h-8 text-orange-500" />
              <span className="text-base font-bold text-gray-900">{filteredItems.length}</span>
            </div>
            <div className="text-sm text-gray-600">可兑换物品</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-purple-500" />
              <span className="text-base font-bold text-gray-900">{filteredItems.filter(i => i.mode === 'bidding').length}</span>
            </div>
            <div className="text-sm text-gray-600">投标物品</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-base font-bold text-gray-900">{filteredBiddings.length}</span>
            </div>
            <div className="text-sm text-gray-600">投标记录</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-base font-bold text-gray-900">{filteredExchanges.length}</span>
            </div>
            <div className="text-sm text-gray-600">兑换成功</div>
          </div>
        </div>
        
        {/* 物品列表部分 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">可兑换物品</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="搜索物品..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-48" />
              </div>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部模式</SelectItem>
                  <SelectItem value="direct">直接兑换</SelectItem>
                  <SelectItem value="bidding">投标模式</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-36">
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
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>参与投标</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && <div>
                <div className="text-sm text-gray-600 mb-1">物品名称</div>
                <div className="font-semibold text-gray-900 mb-2">{selectedItem.name}</div>
                
                <div className="text-sm text-gray-600 mb-1">当前最高分</div>
                <div className="text-lg font-bold text-orange-600 mb-2">{selectedItem.currentHighestPoints} 分</div>
                
                <div className="text-sm text-gray-600 mb-1">投标截止时间</div>
                <div className="text-sm text-gray-900 mb-4">{selectedItem.biddingEndTime}</div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">投标积分 *</label>
                  <input type="number" value={bidPoints} onChange={e => setBidPoints(e.target.value)} placeholder="请输入投标积分" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <p className="text-xs text-gray-500">投标积分必须高于当前最高分 {selectedItem.currentHighestPoints}分</p>
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
      <Dialog open={exchangeDialogOpen} onOpenChange={setExchangeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认兑换</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && <div>
                <div className="text-sm text-gray-600 mb-1">物品名称</div>
                <div className="font-semibold text-gray-900 mb-2">{selectedItem.name}</div>
                
                <div className="text-sm text-gray-600 mb-1">所需积分</div>
                <div className="text-lg font-bold text-orange-600 mb-4">-{selectedItem.pointsRequired} 积分</div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">兑换备注</label>
                  <textarea value={exchangeReason} onChange={e => setExchangeReason(e.target.value)} placeholder="请输入兑换备注（可选）" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24" />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="text-sm text-gray-600 mb-1">兑换后剩余积分</div>
                  <div className="text-lg font-bold text-gray-900">{currentStudent.totalPoints - selectedItem.pointsRequired} 分</div>
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
      <Dialog open={biddingRecordsDialogOpen} onOpenChange={setBiddingRecordsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>投标记录</DialogTitle>
          </DialogHeader>
          <div>
            {selectedItem && <div className="mb-4">
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
      
      <TabBar currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>;
}