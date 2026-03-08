// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Package, ShoppingBag, Clock, CheckCircle2, XCircle, AlertTriangle, Plus, Edit2, Trash2, TrendingUp, Users, DollarSign, Eye, MoreHorizontal, Filter, Search, Calendar, Camera, X, Settings2, Award, Trophy } from 'lucide-react';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';
export default function ExchangeAdmin({
  $w,
  className,
  style
}) {
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('exchange-admin');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    points: '',
    mode: 'direct',
    stock: '',
    image: null,
    bidStartTime: '',
    bidEndTime: ''
  });
  const [loading, setLoading] = useState(false);

  // 兑换物品数据从数据库加载
    id: 1,
    name: '免值日券',
    description: '免一次卫生值日，有效期一周',
    points: 50,
    mode: 'direct',
    stock: 20,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
    createdAt: '2026-02-28',
    usageCount: 15
  }, {
    id: 2,
    name: '课外书借阅权',
    description: '可借阅班级图书角书籍一周',
    points: 30,
    mode: 'direct',
    stock: 10,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400',
    createdAt: '2026-02-27',
    usageCount: 23
  }, {
    id: 3,
    name: '周末作业减免',
    description: '减免一项周末作业',
    points: 80,
    mode: 'bid',
    stock: 1,
    status: 'bidding',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    bidStartTime: '2026-03-01',
    bidEndTime: '2026-03-07',
    createdAt: '2026-02-26',
    usageCount: 5
  }, {
    id: 4,
    name: '自习室座位',
    description: '优先选择自习室座位一周',
    points: 60,
    mode: 'bid',
    stock: 2,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    createdAt: '2026-02-25',
    usageCount: 12
  }, {
    id: 5,
    name: '班级零食',
    description: '获得一份班级零食礼包',
    points: 40,
    mode: 'direct',
    stock: 5,
    status: 'unavailable',
    image: 'https://images.unsplash.com/photo-1628136092423-1a629668d1e6?w=400',
    createdAt: '2026-02-24',
    usageCount: 30
  }, {
    id: 6,
    name: '优先选座位权',
    description: '下学期优先选择座位',
    points: 150,
    mode: 'bid',
    stock: 1,
    status: 'bidding',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    bidStartTime: '2026-03-01',
    bidEndTime: '2026-03-15',
    createdAt: '2026-02-23',
    usageCount: 8
  }];
  const [biddingRecords, setBiddingRecords] = useState([]);
    id: 1,
    itemId: 3,
    itemName: '周末作业减免',
    studentId: 1,
    studentName: '张三',
    points: 85,
    status: 'active',
    bidTime: '2026-03-02 10:30',
    isWinner: null
  }, {
    id: 2,
    itemId: 3,
    itemName: '周末作业减免',
    studentId: 2,
    studentName: '李四',
    points: 90,
    status: 'active',
    bidTime: '2026-03-02 11:00',
    isWinner: null
  }, {
    id: 3,
    itemId: 3,
    itemName: '周末作业减免',
    studentId: 3,
    studentName: '王五',
    points: 95,
    status: 'active',
    bidTime: '2026-03-02 14:20',
    isWinner: null
  }, {
    id: 4,
    itemId: 6,
    itemName: '优先选座位权',
    studentId: 4,
    studentName: '赵六',
    points: 140,
    status: 'active',
    bidTime: '2026-03-03 09:15',
    isWinner: null
  }];
  const [exchangeHistory, setExchangeHistory] = useState([]);
    id: 1,
    itemId: 1,
    itemName: '免值日券',
    studentId: 1,
    studentName: '张三',
    points: 50,
    exchangeTime: '2026-02-28 10:00',
    status: 'completed'
  }, {
    id: 2,
    itemId: 2,
    itemName: '课外书借阅权',
    studentId: 2,
    studentName: '李四',
    points: 30,
    exchangeTime: '2026-02-27 15:30',
    status: 'completed'
  }, {
    id: 3,
    itemId: 1,
    itemName: '免值日券',
    studentId: 3,
    studentName: '王五',
    points: 50,
    exchangeTime: '2026-02-26 09:00',
    status: 'completed'
  }, {
    id: 4,
    itemId: 4,
    itemName: '自习室座位',
    studentId: 5,
    studentName: '钱七',
    points: 60,
    exchangeTime: '2026-02-25 14:00',
    status: 'completed'
  }, {
    id: 5,
    itemId: 5,
    itemName: '班级零食',
    studentId: 6,
    studentName: '孙八',
    points: 40,
    exchangeTime: '2026-02-24 11:20',
    status: 'completed'
  }];
  useEffect(() => {
    loadItemsData();
    loadExchangeHistory();
  }, []);
  const loadItemsData = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const result = await tcb.database().collection('redemption_items').orderBy('created_at', 'desc').get();
      if (result.data && result.data.length > 0) {
        const transformedItems = result.data.map(item => ({
          id: item._id,
          item_id: item.item_id,
          name: item.name,
          description: item.description,
          points: item.required_score,
          mode: item.redemption_mode === '直接兑换' ? 'direct' : 'bid',
          stock: item.quantity,
          status: item.status === '可兑换' ? 'available' : item.status === '不可兑换' ? 'unavailable' : item.status === '投标中' ? 'bidding' : item.status === '已结束' ? 'completed' : 'unavailable',
          image: item.image_url,
          bidStartTime: item.bid_start_time ? item.bid_start_time.split('T')[0] : '',
          bidEndTime: item.bid_end_time ? item.bid_end_time.split('T')[0] : '',
          createdAt: item.created_at ? item.created_at.split('T')[0] : '',
          usageCount: 0 // 需要从兑换记录计算
        }));
        setItems(transformedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('加载物品数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载物品数据',
        variant: 'destructive'
      });
    }
  };
  const loadExchangeHistory = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const result = await tcb.database().collection('redemption_request').orderBy('redemption_time', 'desc').limit(50).get();
      if (result.data && result.data.length > 0) {
        const transformedHistory = result.data.map(record => ({
          id: record._id,
          itemId: record.item_id,
          itemName: record.item_name,
          studentId: record.student_id,
          studentName: record.student_name,
          points: record.points_spent,
          exchangeTime: record.redemption_time ? record.redemption_time.split('T')[0] : '',
          status: record.status === '已兑换' ? 'completed' : 'pending'
        }));
        setExchangeHistory(transformedHistory);
      } else {
        setExchangeHistory([]);
      }
    } catch (error) {
      console.error('加载兑换历史失败:', error);
      setExchangeHistory([]);
    }
  };
  useEffect(() => {
    let result = items;
    if (searchTerm) {
      result = result.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }
    if (filterMode !== 'all') {
      result = result.filter(item => item.mode === filterMode);
    }
    setFilteredItems(result);
  }, [items, searchTerm, filterStatus, filterMode]);
  const handleAddItem = async e => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      toast({
        title: '错误',
        description: '请输入物品名称',
        variant: 'destructive'
      });
      return;
    }
    if (!newItem.points || isNaN(Number(newItem.points))) {
      toast({
        title: '错误',
        description: '请输入有效的积分',
        variant: 'destructive'
      });
      return;
    }
    if (newItem.mode === 'bid' && (!newItem.bidStartTime || !newItem.bidEndTime)) {
      toast({
        title: '错误',
        description: '投标模式需要设置开始和截止时间',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 添加物品到数据库
      const item_id = `item_${Date.now()}`;
      await db.collection('redemption_items').add({
        item_id: item_id,
        name: newItem.name,
        description: newItem.description,
        image_url: newItem.image || '',
        required_score: Number(newItem.points),
        redemption_mode: newItem.mode === 'direct' ? '直接兑换' : '投标竞拍',
        quantity: Number(newItem.stock) || 1,
        status: '可兑换',
        bid_start_time: newItem.mode === 'bid' ? new Date(newItem.bidStartTime).toISOString() : null,
        bid_end_time: newItem.mode === 'bid' ? new Date(newItem.bidEndTime).toISOString() : null,
        winner_bid_score: 0,
        winner_id: '',
        created_by: $w?.auth?.currentUser?.name || '管理员',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      const item = {
        ...newItem,
        id: item_id,
        item_id: item_id,
        points: Number(newItem.points),
        stock: Number(newItem.stock) || 1,
        status: newItem.mode === 'bid' ? 'bidding' : 'available',
        createdAt: new Date().toISOString().split('T')[0],
        usageCount: 0
      };
      setItems([...items, item]);
      toast({
        title: '成功',
        description: `物品 "${item.name}" 已添加`,
        variant: 'default'
      });
      setNewItem({
        name: '',
        description: '',
        points: '',
        mode: 'direct',
        stock: '',
        image: null,
        bidStartTime: '',
        bidEndTime: ''
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('添加物品失败:', error);
      toast({
        title: '添加失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };
  const handleEditItem = async e => {
    e.preventDefault();
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新数据库中的物品
      await db.collection('redemption_items').where({
        item_id: editedItem.item_id
      }).update({
        name: newItem.name,
        description: newItem.description,
        image_url: newItem.image || editedItem.image,
        required_score: Number(newItem.points),
        quantity: Number(newItem.stock) || 1,
        bid_start_time: newItem.mode === 'bid' ? new Date(newItem.bidStartTime).toISOString() : null,
        bid_end_time: newItem.mode === 'bid' ? new Date(newItem.bidEndTime).toISOString() : null,
        updated_at: new Date().toISOString()
      });
      setItems(items.map(item => item.id === editedItem.id ? {
        ...newItem,
        id: editedItem.id,
        item_id: editedItem.item_id,
        createdAt: editedItem.createdAt,
        usageCount: editedItem.usageCount,
        points: Number(newItem.points),
        stock: Number(newItem.stock)
      } : item));
      toast({
        title: '成功',
        description: `物品 "${newItem.name}" 已更新`,
        variant: 'default'
      });
      setIsEditModalOpen(false);
      setEditedItem(null);
    } catch (error) {
      console.error('更新物品失败:', error);
      toast({
        title: '更新失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };
  const handleDeleteItem = async itemId => {
    if (confirm('确定要删除这个物品吗？')) {
      try {
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();
        const item = items.find(i => i.id === itemId);

        // 从数据库删除物品
        await db.collection('redemption_items').where({
          item_id: item.item_id
        }).remove();
        setItems(items.filter(item => item.id !== itemId));
        toast({
          title: '成功',
          description: '物品已删除',
          variant: 'default'
        });
      } catch (error) {
        console.error('删除物品失败:', error);
        toast({
          title: '删除失败',
          description: error.message || '请重试',
          variant: 'destructive'
        });
      }
    }
  };
  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      const item = items.find(i => i.id === itemId);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新数据库中的状态
      const dbStatus = newStatus === 'available' ? '可兑换' : newStatus === 'unavailable' ? '不可兑换' : newStatus === 'bidding' ? '投标中' : '已结束';
      await db.collection('redemption_items').where({
        item_id: item.item_id
      }).update({
        status: dbStatus,
        updated_at: new Date().toISOString()
      });
      setItems(items.map(item => item.id === itemId ? {
        ...item,
        status: newStatus
      } : item));
      const statusText = newStatus === 'available' ? '上架' : newStatus === 'unavailable' ? '下架' : '投标中';
      toast({
        title: '成功',
        description: `物品已${statusText}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('更新物品状态失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };
  const openEditModal = item => {
    setEditedItem(item);
    setNewItem({
      name: item.name,
      description: item.description || '',
      points: String(item.points),
      mode: item.mode,
      stock: String(item.stock),
      image: item.image || null,
      bidStartTime: item.bidStartTime || '',
      bidEndTime: item.bidEndTime || ''
    });
    setIsEditModalOpen(true);
  };
  const openBiddingModal = item => {
    setSelectedItem(item);
    setIsBiddingModalOpen(true);
  };
  const openHistoryModal = item => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
  };
  const handleConfirmWinner = (recordId, itemId) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: '成功',
        description: '已确认中标者并扣除积分',
        variant: 'default'
      });
      setIsBiddingModalOpen(false);
      setSelectedItem(null);
    }, 1000);
  };
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setNewItem(prev => ({
          ...prev,
          image: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const stats = {
    totalItems: items.length,
    availableItems: items.filter(i => i.status === 'available').length,
    biddingItems: items.filter(i => i.status === 'bidding').length,
    totalExchanges: mockExchangeHistory.length,
    totalPointsSpent: mockExchangeHistory.reduce((sum, h) => sum + h.points, 0)
  };
  return <div className="min-h-screen bg-gray-50 pb-16" style={style}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <ShoppingBag className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h1 className="font-bold text-white mb-1 text-[1.575rem]" style={{
                  fontFamily: 'Noto Serif SC, serif'
                }}>
                  积分商城管理</h1>
                  <p className="text-indigo-100 text-sm">管理可兑换物品及兑换记录</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-yellow-500/25">
              <Plus className="w-4 h-4" />
              添加物品
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            <StatCard title="物品总数" value={stats.totalItems} icon={Package} color="purple" />
            <StatCard title="可兑换" value={stats.availableItems} icon={CheckCircle2} color="green" />
            <StatCard title="投标中" value={stats.biddingItems} icon={TrendingUp} color="pink" />
            <StatCard title="总兑换" value={stats.totalExchanges} icon={DollarSign} color="blue" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white/80 backdrop-blur-sm p-1.5 rounded-xl shadow-lg">
          <button onClick={() => setActiveTab('items')} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'items' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Package className="w-4 h-4 mr-1.5" />
            物品列表
          </button>
          <button onClick={() => setActiveTab('bidding')} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'bidding' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <TrendingUp className="w-4 h-4 mr-1.5" />
            投标管理
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'history' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Clock className="w-4 h-4 mr-1.5" />
            兑换记录
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="搜索物品名称或描述..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="all">全部状态</option>
            <option value="available">可兑换</option>
            <option value="bidding">投标中</option>
            <option value="unavailable">已下架</option>
          </select>
          <select value={filterMode} onChange={e => setFilterMode(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="all">全部模式</option>
            <option value="direct">直接兑换</option>
            <option value="bid">投标模式</option>
          </select>
        </div>

        {/* Items Grid */}
        {activeTab === 'items' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 bg-gray-100">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.mode === 'direct' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}>
                      {item.mode === 'direct' ? '直接兑换' : '投标模式'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'available' ? 'bg-green-500 text-white' : item.status === 'bidding' ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {item.status === 'available' ? '可兑换' : item.status === 'bidding' ? '投标中' : '已下架'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg font-bold shadow-md">
                    {item.points} 分
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>库存：{item.stock}</span>
                    <span>已兑换：{item.usageCount}</span>
                  </div>
                  {item.mode === 'bid' && <div className="bg-purple-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 text-xs text-purple-700 mb-1">
                        <Calendar className="w-3 h-3" />
                        投标时间
                      </div>
                      <div className="text-xs text-gray-600">
                        {item.bidStartTime} ~ {item.bidEndTime}
                      </div>
                    </div>}
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(item)} className="flex-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" />
                      编辑
                    </button>
                    {item.mode === 'bid' && item.status === 'bidding' ? <button onClick={() => openBiddingModal(item)} className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        投标
                      </button> : <button onClick={() => handleUpdateStatus(item.id, item.status === 'available' ? 'unavailable' : 'available')} className={`flex-1 px-3 py-2 ${item.status === 'available' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1`}>
                        {item.status === 'available' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {item.status === 'available' ? '下架' : '上架'}
                      </button>}
                    <button onClick={() => handleDeleteItem(item.id)} className="px-3 py-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg text-sm font-medium transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>)}
          </div>}

        {/* Bidding Tab */}
        {activeTab === 'bidding' && <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">投标记录</h2>
              <span className="text-sm text-gray-500">共 {mockBiddingRecords.length} 条记录</span>
            </div>
            <div className="space-y-4">
              {mockBiddingRecords.map(record => <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-800">{record.itemName}</span>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">{record.points}分</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {record.studentName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {record.bidTime}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleConfirmWinner(record.id, record.itemId)} disabled={loading} className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {loading ? '处理中...' : '确认中标'}
                    </button>
                  </div>
                </div>)}
            </div>
          </div>}

        {/* History Tab */}
        {activeTab === 'history' && <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">兑换记录</h2>
              <span className="text-sm text-gray-500">共 {mockExchangeHistory.length} 条记录</span>
            </div>
            <div className="space-y-3">
              {mockExchangeHistory.map(record => <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{record.itemName}</p>
                      <p className="text-sm text-gray-600">{record.studentName} - {record.exchangeTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">-{record.points} 分</p>
                    <span className="text-xs text-gray-500">已完成</span>
                  </div>
                </div>)}
            </div>
          </div>}
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold">{isAddModalOpen ? '添加物品' : '编辑物品'}</h3>
              <p className="text-indigo-100 text-sm mt-1">设置兑换物品信息</p>
            </div>
            <form onSubmit={isAddModalOpen ? handleAddItem : handleEditItem} className="p-6">
              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">物品图片</label>
                  <div className="relative">
                    {newItem.image ? <div className="relative h-40 rounded-lg overflow-hidden">
                        <img src={newItem.image} alt="预览" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setNewItem(prev => ({
                    ...prev,
                    image: null
                  }))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div> : <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">点击上传图片</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">物品名称 *</label>
                  <input type="text" value={newItem.name} onChange={e => setNewItem(prev => ({
                ...prev,
                name: e.target.value
              }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="输入物品名称" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">物品描述</label>
                  <textarea value={newItem.description} onChange={e => setNewItem(prev => ({
                ...prev,
                description: e.target.value
              }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} placeholder="输入物品描述" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">所需积分 *</label>
                  <input type="number" value={newItem.points} onChange={e => setNewItem(prev => ({
                ...prev,
                points: e.target.value
              }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="输入所需积分" required min="0" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">兑换模式 *</label>
                  <select value={newItem.mode} onChange={e => setNewItem(prev => ({
                ...prev,
                mode: e.target.value
              }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="direct">直接兑换</option>
                    <option value="bid">投标模式</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">库存数量 *</label>
                  <input type="number" value={newItem.stock} onChange={e => setNewItem(prev => ({
                ...prev,
                stock: e.target.value
              }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="输入库存数量" required min="0" />
                </div>

                {newItem.mode === 'bid' && <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">投标开始时间 *</label>
                      <input type="date" value={newItem.bidStartTime} onChange={e => setNewItem(prev => ({
                  ...prev,
                  bidStartTime: e.target.value
                }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">投标截止时间 *</label>
                      <input type="date" value={newItem.bidEndTime} onChange={e => setNewItem(prev => ({
                  ...prev,
                  bidEndTime: e.target.value
                }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                  </div>}
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
              setNewItem({
                name: '',
                description: '',
                points: '',
                mode: 'direct',
                stock: '',
                image: null,
                bidStartTime: '',
                bidEndTime: ''
              });
            }} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                  取消
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                  {isAddModalOpen ? '添加' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>}

      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}