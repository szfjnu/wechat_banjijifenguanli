// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { Maximize2, RefreshCw, Save, UserPlus, UserMinus, Search, Filter, Download, Upload, Grid3X3, Info, Users, Settings, Plus, Minus } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, useToast, Input, Label } from '@/components/ui';

import { StatCard } from '@/components/StatCard';
import { TabBar } from '@/components/TabBar';

// 学生预设数据
const MOCK_STUDENTS = [{
  id: 1,
  studentId: '2024001',
  name: '张三',
  gender: '男',
  group: '第一组',
  seatId: null,
  avatar: null
}, {
  id: 2,
  studentId: '2024002',
  name: '李四',
  gender: '女',
  group: '第一组',
  seatId: null,
  avatar: null
}, {
  id: 3,
  studentId: '2024003',
  name: '王五',
  gender: '男',
  group: '第二组',
  seatId: null,
  avatar: null
}, {
  id: 4,
  studentId: '2024004',
  name: '赵六',
  gender: '女',
  group: '第二组',
  seatId: null,
  avatar: null
}, {
  id: 5,
  studentId: '2024005',
  name: '钱七',
  gender: '男',
  group: '第三组',
  seatId: null,
  avatar: null
}, {
  id: 6,
  studentId: '2024006',
  name: '孙八',
  gender: '女',
  group: '第三组',
  seatId: null,
  avatar: null
}, {
  id: 7,
  studentId: '2024007',
  name: '周九',
  gender: '男',
  group: '第一组',
  seatId: null,
  avatar: null
}, {
  id: 8,
  studentId: '2024008',
  name: '吴十',
  gender: '女',
  group: '第一组',
  seatId: null,
  avatar: null
}, {
  id: 9,
  studentId: '2024009',
  name: '郑十一',
  gender: '男',
  group: '第二组',
  seatId: null,
  avatar: null
}, {
  id: 10,
  studentId: '2024010',
  name: '冯十二',
  gender: '女',
  group: '第二组',
  seatId: null,
  avatar: null
}, {
  id: 11,
  studentId: '2024011',
  name: '陈十三',
  gender: '男',
  group: '第三组',
  seatId: null,
  avatar: null
}, {
  id: 12,
  studentId: '2024012',
  name: '褚十四',
  gender: '女',
  group: '第三组',
  seatId: null,
  avatar: null
}];

// 座位预设数据（已有座位的）
const INITIAL_SEATS = {
  'A1': MOCK_STUDENTS[0],
  'B2': MOCK_STUDENTS[1],
  'C3': MOCK_STUDENTS[2],
  'D4': MOCK_STUDENTS[3]
};
export default function SeatingChart(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('seating-chart');
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [seats, setSeats] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showStudentInfo, setShowStudentInfo] = useState(false);
  const [draggedStudent, setDraggedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 动态行数和列数
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(8);
  const [tempRows, setTempRows] = useState(6);
  const [tempCols, setTempCols] = useState(8);

  // 动态生成行标签和列号
  const ROWS = useMemo(() => {
    return Array.from({
      length: rows
    }, (_, i) => String.fromCharCode(65 + i));
  }, [rows]);
  const COLS = useMemo(() => {
    return Array.from({
      length: cols
    }, (_, i) => i + 1);
  }, [cols]);
  useEffect(() => {
    loadData();
  }, []);

  // 计算统计数据
  const totalSeats = useMemo(() => rows * cols, [rows, cols]);
  const assignedCount = useMemo(() => Object.keys(seats).length, [seats]);
  const unassignedStudents = useMemo(() => {
    return students.filter(student => {
      const hasSeat = !!student.seatId;
      if (hasSeat) return false;
      const matchesSearch = searchQuery === '' || student.name.includes(searchQuery) || student.studentId.includes(searchQuery);
      const matchesGroup = selectedGroup === 'all' || student.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [students, searchQuery, selectedGroup]);
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();

      // 1. 加载座位配置
      try {
        const configResult = await tcb.database().collection('seat').where({
          classroom_id: 1
        }).orderBy('total_rows', 'asc').limit(1).get();
        if (configResult.data && configResult.data.length > 0) {
          const config = configResult.data[0];
          // 使用数据库中的配置
          setRows(config.total_rows || 6);
          setCols(config.total_cols || 8);
          setTempRows(config.total_rows || 6);
          setTempCols(config.total_cols || 8);
        } else {
          // 如果没有配置记录，使用默认值
          setRows(6);
          setCols(8);
          setTempRows(6);
          setTempCols(8);
        }
      } catch (error) {
        console.error('加载座位配置失败:', error);
        // 使用默认值
        setRows(6);
        setCols(8);
        setTempRows(6);
        setTempCols(8);
      }

      // 2. 模拟学生数据加载
      await new Promise(resolve => setTimeout(resolve, 500));
      const studentsData = MOCK_STUDENTS.map(student => ({
        ...student
      }));

      // 3. 设置已有座位的学生ID
      Object.keys(INITIAL_SEATS).forEach(seatId => {
        const student = INITIAL_SEATS[seatId];
        const foundStudent = studentsData.find(s => s.id === student.id);
        if (foundStudent) {
          foundStudent.seatId = seatId;
        }
      });
      setStudents(studentsData);
      setSeats({
        ...INITIAL_SEATS
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载座位数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDragStart = student => {
    setDraggedStudent(student);
  };
  const handleDragOver = e => {
    e.preventDefault();
  };
  const handleDrop = seatId => {
    if (!draggedStudent) return;

    // 如果座位已有学生，先移除原座位的学生的seatId
    if (seats[seatId]) {
      const originalStudent = students.find(s => s.id === seats[seatId].id);
      if (originalStudent) {
        originalStudent.seatId = null;
      }
    }

    // 清除学生的原座位（如果有）
    if (draggedStudent.seatId) {
      const newSeats = {
        ...seats
      };
      delete newSeats[draggedStudent.seatId];
      setSeats(newSeats);
    }

    // 更新学生座位
    const updatedStudents = students.map(s => s.id === draggedStudent.id ? {
      ...s,
      seatId: seatId
    } : s);
    setStudents(updatedStudents);

    // 更新座位映射
    const newSeats = {
      ...seats
    };
    newSeats[seatId] = draggedStudent;
    setSeats(newSeats);
    setDraggedStudent(null);
    toast({
      title: '座位分配成功',
      description: `${draggedStudent.name} 已分配到 ${seatId} 号座位`,
      variant: 'default'
    });
  };
  const handleRemoveStudent = seatId => {
    if (!seats[seatId]) return;
    const student = seats[seatId];
    const updatedStudents = students.map(s => s.id === student.id ? {
      ...s,
      seatId: null
    } : s);
    setStudents(updatedStudents);
    const newSeats = {
      ...seats
    };
    delete newSeats[seatId];
    setSeats(newSeats);
    toast({
      title: '座位已清空',
      description: `${student.name} 已从 ${seatId} 号座位移除`,
      variant: 'default'
    });
  };
  const handleSeatClick = seatId => {
    if (!seats[seatId]) return;
    setSelectedStudent(seats[seatId]);
    setSelectedSeat(seatId);
    setShowStudentInfo(true);
  };
  const handleStudentClick = student => {
    setSelectedStudent(student);
    setSelectedSeat(student.seatId);
    setShowStudentInfo(true);
  };
  const handleSaveLayout = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 1. 删除该教室的所有现有座位记录
      try {
        const existingSeats = await db.collection('seat').where({
          classroom_id: 1
        }).get();
        if (existingSeats.data && existingSeats.data.length > 0) {
          // 逐条删除座位记录
          for (const seat of existingSeats.data) {
            await db.collection('seat').doc(seat._id).remove();
          }
        }
      } catch (error) {
        console.error('删除旧座位记录失败:', error);
      }

      // 2. 保存当前座位布局
      const seatPromises = [];
      Object.keys(seats).forEach(seatId => {
        const student = seats[seatId];
        const seatRecord = {
          seat_id: seatId,
          classroom_id: 1,
          classroom_name: '主教室',
          row: seatId.charAt(0),
          // 行号（A, B, C...）
          col: parseInt(seatId.substring(1)),
          // 列号（1, 2, 3...）
          student_id: student.id,
          student_name: student.name,
          is_available: false,
          total_rows: rows,
          total_cols: cols
        };
        seatPromises.push(db.collection('seat').add(seatRecord));
      });

      // 3. 并发保存所有座位
      await Promise.all(seatPromises);
      toast({
        title: '座位布局已保存',
        description: `已保存 ${Object.keys(seats).length} 个座位信息`,
        variant: 'default'
      });
    } catch (error) {
      console.error('保存座位布局失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '无法保存座位布局',
        variant: 'destructive'
      });
    }
  };
  const handleApplySettings = async () => {
    // 检查是否有改变
    if (tempRows === rows && tempCols === cols) {
      setShowSettings(false);
      return;
    }

    // 检查是否有学生需要重新分配
    const hasAssignedStudents = Object.keys(seats).length > 0;
    if (hasAssignedStudents && !window.confirm('调整布局会清空当前座位安排，是否继续？')) {
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 1. 保存座位配置到数据库
      try {
        // 查询现有配置
        const existingConfig = await db.collection('seat').where({
          classroom_id: 1
        }).get();
        if (existingConfig.data && existingConfig.data.length > 0) {
          // 更新现有配置
          const configId = existingConfig.data[0]._id;
          await db.collection('seat').doc(configId).update({
            total_rows: tempRows,
            total_cols: tempCols
          });
        } else {
          // 创建新配置
          await db.collection('seat').add({
            classroom_id: 1,
            classroom_name: '主教室',
            total_rows: tempRows,
            total_cols: tempCols
          });
        }
      } catch (error) {
        console.error('保存座位配置失败:', error);
        toast({
          title: '保存失败',
          description: '无法保存座位配置',
          variant: 'destructive'
        });
        return;
      }

      // 2. 应用新设置
      setRows(tempRows);
      setCols(tempCols);

      // 3. 清空座位
      setSeats({});

      // 4. 更新所有学生的座位ID为空
      const updatedStudents = students.map(s => ({
        ...s,
        seatId: null
      }));
      setStudents(updatedStudents);
      setShowSettings(false);
      toast({
        title: '布局已更新',
        description: `座位布局已调整为 ${tempRows} × ${tempCols}，${hasAssignedStudents ? '座位已重置' : ''}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('应用设置失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    }
  };
  const handleResetLayout = () => {
    // 清空所有座位
    const updatedStudents = students.map(s => ({
      ...s,
      seatId: null
    }));
    setStudents(updatedStudents);
    setSeats({});
    toast({
      title: '座位已重置',
      description: '所有座位已清空',
      variant: 'default'
    });
  };
  const handleAutoAssign = () => {
    // 自动分配未分配座位的学生
    const studentsToAssign = students.filter(s => !s.seatId);
    const availableSeats = ROWS.flatMap(row => COLS.map(col => `${row}${col}`)).filter(seatId => !seats[seatId]);
    const newSeats = {
      ...seats
    };
    const updatedStudents = [...students];
    studentsToAssign.forEach((student, index) => {
      if (index < availableSeats.length) {
        const seatId = availableSeats[index];
        newSeats[seatId] = student;
        const studentIndex = updatedStudents.findIndex(s => s.id === student.id);
        if (studentIndex !== -1) {
          updatedStudents[studentIndex] = {
            ...student,
            seatId
          };
        }
      }
    });
    setStudents(updatedStudents);
    setSeats(newSeats);
    toast({
      title: '自动分配完成',
      description: `已为 ${Math.min(studentsToAssign.length, availableSeats.length)} 名学生分配座位`,
      variant: 'default'
    });
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 font-serif">教室座位管理</h1>
              <p className="text-sm text-slate-600 mt-1">拖拽学生到座位 · 可视化管理</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <Maximize2 className="w-4 h-4 mr-2" />
                全屏预览
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetLayout}>
                <RefreshCw className="w-4 h-4 mr-2" />
                重置
              </Button>
              <Button onClick={handleSaveLayout}>
                <Save className="w-4 h-4 mr-2" />
                保存布局
              </Button>
            </div>
          </div>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <StatCard title="总座位" value={totalSeats} icon={Grid3X3} color="blue" />
            <StatCard title="已分配" value={assignedCount} icon={Users} color="green" />
            <StatCard title="未分配" value={unassignedStudents.length} icon={UserPlus} color="orange" />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="px-4 py-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-3">
          {/* 学生列表 - 左侧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              {/* 搜索和筛选 */}
              <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  未分配学生
                </h3>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="搜索姓名或学号..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                  </div>
                  <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white">
                    <option value="all">所有小组</option>
                    <option value="第一组">第一组</option>
                    <option value="第二组">第二组</option>
                    <option value="第三组">第三组</option>
                  </select>
                </div>
              </div>
              
              {/* 学生列表 */}
              <div className="p-3 max-h-[400px] overflow-y-auto">
                {unassignedStudents.length === 0 ? <div className="text-center py-8 text-slate-500">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>所有学生都已分配座位</p>
                  </div> : <div className="space-y-2">
                    {unassignedStudents.map(student => <div key={student.id} draggable={true} onDragStart={() => handleDragStart(student)} onClick={() => handleStudentClick(student)} className="flex items-center gap-2 p-2 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-md transition-all group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${student.gender === '男' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.studentId}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{student.group}</span>
                      </div>)}
                  </div>}
              </div>
            </div>
          </div>
          
          {/* 座位图 - 右侧 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Grid3X3 className="w-5 h-5 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-800">座位图</h3>
                  <span className="text-sm text-slate-600">（可拖拽学生到座位）</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowSettings(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    设置行列
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleAutoAssign}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    自动分配
                  </Button>
                </div>
              </div>
              
              {/* 讲台指示 */}
              <div className="p-3 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
                <div className="text-center py-4 px-8 bg-white rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-lg font-bold text-slate-700">📚 讲台</p>
                </div>
              </div>
              
              {/* 座位网格 */}
              <div className="p-6">
                <div className="grid gap-4">
                  {ROWS.map(row => <div key={row} className="flex items-center gap-4">
                      {/* 行标签 */}
                      <div className="w-8 h-16 flex items-center justify-center font-bold text-slate-600 bg-slate-100 rounded-lg">
                        {row}
                      </div>
                      
                      {/* 座位列 */}
                      <div className="flex flex-1 gap-3">
                        {COLS.map(col => {
                      const seatId = `${row}${col}`;
                      const student = seats[seatId];
                      return <div key={col} onDragOver={handleDragOver} onDrop={() => handleDrop(seatId)} onClick={() => handleSeatClick(seatId)} className={`relative flex-1 aspect-square rounded-xl border-2 transition-all cursor-pointer ${student ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300 hover:border-emerald-500 hover:shadow-lg' : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-300 hover:border-blue-400 hover:shadow-md'}`}>
                              <div className="absolute top-0.5 left-0.5 text-[10px] font-semibold text-slate-500">
                                {col}
                              </div>
                              
                              {student ? <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs mb-0.5 ${student.gender === '男' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                    {student.name.charAt(0)}
                                  </div>
                                  <p className="text-xs font-semibold text-slate-800 truncate w-full text-center">{student.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate w-full text-center">{student.group}</p>
                                </div> : <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                  <Grid3X3 className="w-6 h-6 text-slate-400" />
                                </div>}
                              
                              {/* 座位号 */}
                              <div className="absolute bottom-1 left-1 text-xs font-semibold text-slate-400">
                                {seatId}
                              </div>
                            </div>;
                    })}
                      </div>
                    </div>)}
                </div>
              </div>
            </div>
            
            {/* 说明卡片 */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">操作说明</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• 从左侧学生列表拖拽学生到右侧座位</li>
                    <li>• 点击已分配的座位可查看学生详情</li>
                    <li>• 点击"自动分配"可自动为未分配的学生分配座位</li>
                    <li>• 点击"保存布局"可保存当前座位安排</li>
                    <li>• 点击"重置"可清空所有座位</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* 学生详情对话框 */}
      <Dialog open={showStudentInfo} onOpenChange={setShowStudentInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>学生详情</DialogTitle>
          </DialogHeader>
          {selectedStudent && <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${selectedStudent.gender === '男' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h3>
                  <p className="text-slate-600">{selectedStudent.studentId}</p>
                  <p className="text-sm text-slate-500">{selectedStudent.gender} · {selectedStudent.group}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">当前座位</p>
                  <p className="text-lg font-bold text-slate-800">{selectedSeat || '未分配'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">所在小组</p>
                  <p className="text-lg font-bold text-slate-800">{selectedStudent.group}</p>
                </div>
              </div>
              
              {selectedSeat && <Button variant="destructive" onClick={() => {
            handleRemoveStudent(selectedSeat);
            setShowStudentInfo(false);
          }} className="w-full">
                  <UserMinus className="w-4 h-4 mr-2" />
                  清空此座位
                </Button>}
            </div>}
        </DialogContent>
      </Dialog>
      
      {/* 全屏预览对话框 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>座位预览</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {/* 讲台指示 */}
            <div className="mb-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg p-4">
              <div className="text-center py-6 px-8 bg-white rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-2xl font-bold text-slate-700">📚 讲台</p>
              </div>
            </div>
            
            {/* 座位网格 */}
            <div className="grid gap-4">
              {ROWS.map(row => <div key={row} className="flex items-center gap-4">
                  <div className="w-12 h-20 flex items-center justify-center font-bold text-slate-600 bg-slate-100 rounded-lg text-xl">
                    {row}
                  </div>
                  <div className="flex flex-1 gap-4">
                    {COLS.map(col => {
                  const seatId = `${row}${col}`;
                  const student = seats[seatId];
                  return <div key={col} className={`relative flex-1 aspect-square rounded-xl border-2 ${student ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300' : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-300'}`}>
                          <div className="absolute top-2 left-2 text-sm font-semibold text-slate-500">
                            {col}
                          </div>
                          {student ? <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-xl mb-2 ${student.gender === '男' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                {student.name.charAt(0)}
                              </div>
                              <p className="text-sm font-semibold text-slate-800 truncate w-full text-center">{student.name}</p>
                              <p className="text-xs text-slate-500 truncate w-full text-center">{student.group}</p>
                            </div> : <div className="absolute inset-0 flex items-center justify-center opacity-30">
                              <Grid3X3 className="w-8 h-8 text-slate-400" />
                            </div>}
                          <div className="absolute bottom-2 left-2 text-sm font-semibold text-slate-400">
                            {seatId}
                          </div>
                        </div>;
                })}
                  </div>
                </div>)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 设置对话框 - 调整行列 */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>座位布局设置</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 行数设置 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">行数</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setTempRows(Math.max(2, tempRows - 1))} disabled={tempRows <= 2}>
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 flex items-center justify-center">
                  <Input type="number" value={tempRows} onChange={e => setTempRows(Math.max(2, Math.min(10, parseInt(e.target.value) || 6)))} min="2" max="10" className="w-20 text-center text-2xl font-bold h-12" />
                </div>
                <Button variant="outline" size="icon" onClick={() => setTempRows(Math.min(10, tempRows + 1))} disabled={tempRows >= 10}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">座位行数（2-10行）</p>
            </div>
            
            {/* 列数设置 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">列数</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setTempCols(Math.max(2, tempCols - 1))} disabled={tempCols <= 2}>
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 flex items-center justify-center">
                  <Input type="number" value={tempCols} onChange={e => setTempCols(Math.max(2, Math.min(12, parseInt(e.target.value) || 8)))} min="2" max="12" className="w-20 text-center text-2xl font-bold h-12" />
                </div>
                <Button variant="outline" size="icon" onClick={() => setTempCols(Math.min(12, tempCols + 1))} disabled={tempCols >= 12}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">座位列数（2-12列）</p>
            </div>
            
            {/* 预览信息 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-600">当前座位</p>
                  <p className="text-2xl font-bold text-slate-800">{rows} × {cols}</p>
                  <p className="text-xs text-slate-500">共 {rows * cols} 个座位</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">调整后座位</p>
                  <p className="text-2xl font-bold text-blue-600">{tempRows} × {tempCols}</p>
                  <p className="text-xs text-slate-500">共 {tempRows * tempCols} 个座位</p>
                </div>
              </div>
              {(tempRows !== rows || tempCols !== cols) && <div className="mt-3 text-center text-xs text-orange-600 font-medium">
                  ⚠️ 调整布局可能会清空当前座位安排
                </div>}
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => {
              setTempRows(rows);
              setTempCols(cols);
              setShowSettings(false);
            }} className="flex-1">
                取消
              </Button>
              <Button onClick={handleApplySettings} className="flex-1">
                确认应用
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <TabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>;
}