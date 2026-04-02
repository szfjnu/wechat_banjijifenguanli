// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { BarChart3, TrendingUp, RefreshCw, Download, Filter, Calendar, Search, TrendingDown, FileText, Award } from 'lucide-react';

// @ts-ignore;
import { PointsChart, GrowthChart } from '@/components';
// @ts-ignore;
import StatCard from '@/components/StatCard';
export default function DormStatisticsPage(props) {
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 统计数据状态
  const [records, setRecords] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // 筛选状态
  const [filterDorm, setFilterDorm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // 统计数据
  const stats = {
    totalDeduction: records.filter(r => r.score_change < 0).reduce((sum, r) => sum + Math.abs(r.score_change), 0),
    totalAddition: records.filter(r => r.score_change > 0).reduce((sum, r) => sum + r.score_change, 0),
    convertedPoints: records.reduce((sum, r) => sum + (r.converted_points || 0), 0),
    totalRecords: records.length
  };

  // 宿舍统计
  const dormStats = React.useMemo(() => {
    const dormMap = {};
    records.forEach(record => {
      if (!dormMap[record.dorm_room]) {
        dormMap[record.dorm_room] = {
          dorm_room: record.dorm_room,
          deduction: 0,
          addition: 0,
          converted: 0,
          count: 0
        };
      }
      dormMap[record.dorm_room].deduction += record.score_change < 0 ? Math.abs(record.score_change) : 0;
      dormMap[record.dorm_room].addition += record.score_change > 0 ? record.score_change : 0;
      dormMap[record.dorm_room].converted += record.converted_points || 0;
      dormMap[record.dorm_room].count += 1;
    });
    return Object.values(dormMap).sort((a, b) => b.converted - a.converted);
  }, [records]);

  // 时间趋势数据
  const trendData = React.useMemo(() => {
    const monthMap = {};
    records.forEach(record => {
      const date = new Date(record.deduction_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) {
        monthMap[key] = {
          month: key,
          deduction: 0,
          addition: 0,
          converted: 0
        };
      }
      monthMap[key].deduction += record.score_change < 0 ? Math.abs(record.score_change) : 0;
      monthMap[key].addition += record.score_change > 0 ? record.score_change : 0;
      monthMap[key].converted += record.converted_points || 0;
    });
    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
  }, [records]);

  // 筛选后的记录
  const filteredRecords = React.useMemo(() => {
    return records.filter(record => {
      if (filterDorm && !record.dorm_room.includes(filterDorm)) return false;
      if (filterCategory !== 'all' && record.item_category !== filterCategory) return false;
      if (filterType !== 'all') {
        if (filterType === 'deduction' && record.score_change >= 0) return false;
        if (filterType === 'addition' && record.score_change < 0) return false;
      }
      if (dateRange.start && new Date(record.deduction_date) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(record.deduction_date) > new Date(dateRange.end)) return false;
      return true;
    });
  }, [records, filterDorm, filterCategory, filterType, dateRange]);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 加载扣分记录
      const recordsResult = await db.collection('dorm_deduction_record').get();
      setRecords(recordsResult.data || []);

      // 加载积分配置
      const configResult = await db.collection('dorm_point_config').where({
        is_enabled: true
      }).limit(1).get();
      if (configResult.data.length > 0) {
        setConfig(configResult.data[0]);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载宿舍统计数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">宿舍评分统计</h1>
              <p className="text-blue-200 text-sm">宿舍积分统计、排名和报表分析</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新数据
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Download className="w-4 h-4 mr-2" />
                导出报表
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="总扣分数" value={`${stats.totalDeduction}分`} subtitle="宿舍扣分总计" icon={TrendingDown} color="red" />
          <StatCard title="总加分数" value={`${stats.totalAddition}分`} subtitle="宿舍加分总计" icon={TrendingUp} color="green" />
          <StatCard title="折算综合积分" value={`${stats.convertedPoints}分`} subtitle="折算后的综合积分" icon={Award} color="indigo" />
          <StatCard title="记录总数" value={`${stats.totalRecords}条`} subtitle="宿舍评分记录" icon={FileText} color="blue" />
        </div>
        
        {/* 配置信息卡片 */}
        {config && <Card className="mb-8 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">当前生效配置</CardTitle>
              <CardDescription>宿舍积分转换规则</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-red-500" strokeWidth={2} />
                      <span className="text-sm font-medium text-gray-700">扣分转换</span>
                    </div>
                    <span className="text-xl font-bold text-red-600 font-['Space_Mono']">1:{config.deduction_ratio}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">宿舍扣1分 = 综合积分扣{config.deduction_ratio}分</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" strokeWidth={2} />
                      <span className="text-sm font-medium text-gray-700">加分转换</span>
                    </div>
                    <span className="text-xl font-bold text-green-600 font-['Space_Mono']">1:{config.addition_ratio}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">宿舍加1分 = 综合积分加{config.addition_ratio}分</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" strokeWidth={2} />
                    <span className="text-sm font-medium text-gray-700">配置名称</span>
                  </div>
                  <p className="text-xs text-gray-600">{config.config_name}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" strokeWidth={2} />
                    <span className="text-sm font-medium text-gray-700">生效日期</span>
                  </div>
                  <p className="text-xs text-gray-600">{config.effective_date} ~ {config.expiry_date}</p>
                </div>
              </div>
              {config.description && <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">{config.description}</p>
                </div>}
            </CardContent>
          </Card>}
        
        {/* 筛选工具栏 */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input placeholder="搜索宿舍号..." value={filterDorm} onChange={e => setFilterDorm(e.target.value)} className="w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="全部类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
                    <SelectItem value="卫生">卫生</SelectItem>
                    <SelectItem value="纪律">纪律</SelectItem>
                    <SelectItem value="安全">安全</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="全部类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="deduction">扣分</SelectItem>
                    <SelectItem value="addition">加分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <Input type="date" placeholder="开始日期" value={dateRange.start} onChange={e => setDateRange({
                ...dateRange,
                start: e.target.value
              })} className="w-40" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <Input type="date" placeholder="结束日期" value={dateRange.end} onChange={e => setDateRange({
                ...dateRange,
                end: e.target.value
              })} className="w-40" />
              </div>
              <Button variant="outline" size="sm" onClick={() => {
              setFilterDorm('');
              setFilterCategory('all');
              setFilterType('all');
              setDateRange({
                start: '',
                end: ''
              });
            }} className="ml-auto">
                重置筛选
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">宿舍排名</CardTitle>
              <CardDescription>按宿舍统计的积分排名</CardDescription>
            </CardHeader>
            <CardContent>
              {dormStats.length > 0 ? <PointsChart data={dormStats.slice(0, 10).map(d => ({
              name: d.dorm_room,
              value: d.converted
            }))} height={300} /> : <div className="flex items-center justify-center h-64 text-gray-500">
                  暂无数据
                </div>}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">时间趋势</CardTitle>
              <CardDescription>宿舍积分变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? <GrowthChart data={trendData} height={300} /> : <div className="flex items-center justify-center h-64 text-gray-500">
                  暂无数据
                </div>}
            </CardContent>
          </Card>
        </div>
        
        {/* 详细记录列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">详细记录</CardTitle>
            <CardDescription>共 {filteredRecords.length} 条记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>宿舍号</TableHead>
                    <TableHead>学生姓名</TableHead>
                    <TableHead>学号</TableHead>
                    <TableHead>项目名称</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>积分变化</TableHead>
                    <TableHead>折算积分</TableHead>
                    <TableHead>原因</TableHead>
                    <TableHead>记录日期</TableHead>
                    <TableHead>记录人</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                          加载中...
                        </div>
                      </TableCell>
                    </TableRow> : filteredRecords.length === 0 ? <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                        暂无数据
                      </TableCell>
                    </TableRow> : filteredRecords.map((record, index) => <TableRow key={record._id || index}>
                        <TableCell className="font-medium">{record.dorm_room}</TableCell>
                        <TableCell>{record.student_name}</TableCell>
                        <TableCell className="font-mono text-xs">{record.student_id_number}</TableCell>
                        <TableCell>{record.item_name}</TableCell>
                        <TableCell>
                          <Badge variant={record.item_category === '卫生' ? 'default' : record.item_category === '纪律' ? 'destructive' : record.item_category === '安全' ? 'secondary' : 'outline'}>
                            {record.item_category}
                          </Badge>
                        </TableCell>
                        <TableCell className={record.score_change > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {record.score_change > 0 ? '+' : ''}{record.score_change}
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-indigo-600">
                          {record.converted_points > 0 ? '+' : ''}{record.converted_points}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{record.reason}</TableCell>
                        <TableCell>{new Date(record.deduction_date).toLocaleDateString('zh-CN')}</TableCell>
                        <TableCell>{record.recorder_name}</TableCell>
                        <TableCell>
                          <Badge variant={record.approval_status === 'approved' ? 'default' : record.approval_status === 'pending' ? 'secondary' : 'outline'}>
                            {record.approval_status === 'approved' ? '已审核' : record.approval_status === 'pending' ? '待审核' : '已拒绝'}
                          </Badge>
                        </TableCell>
                      </TableRow>)}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}