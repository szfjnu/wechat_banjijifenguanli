// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Checkbox, Badge, toast } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Users, Target, Award } from 'lucide-react';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
const StudentComparison = ({
  students,
  semesterId,
  onBack
}) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [recordsData, setRecordsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trend');
  const [comparisonData, setComparisonData] = useState({});
  useEffect(() => {
    if (selectedStudents.length > 0) {
      loadComparisonData();
    }
  }, [selectedStudents, semesterId]);
  const loadComparisonData = async () => {
    setLoading(true);
    try {
      const tcb = await window.$w?.cloud?.getCloudInstance();
      if (!tcb) {
        console.error('无法获取云开发实例');
        return;
      }
      const db = tcb.database();
      const _ = db.command;

      // 获取所有选中学生的积分记录
      const studentIds = selectedStudents.map(s => s.student_id);
      const res = await db.collection('score_records').where({
        student_id: _.in(studentIds),
        semester_id: semesterId,
        approval_status: '已通过'
      }).orderBy('date', 'asc').get();
      const records = res.data || [];
      setRecordsData(records);

      // 分析数据
      const analysis = analyzeComparisonData(selectedStudents, records);
      setComparisonData(analysis);
    } catch (error) {
      console.error('加载对比数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const analyzeComparisonData = (students, records) => {
    const data = {};
    students.forEach(student => {
      const studentRecords = records.filter(r => r.student_id === student.student_id);

      // 计算趋势数据
      const trendData = calculateTrendData(student, studentRecords);

      // 计算统计数据
      const stats = {
        totalChange: studentRecords.reduce((sum, r) => sum + r.score_change, 0),
        positiveCount: studentRecords.filter(r => r.score_change > 0).length,
        negativeCount: studentRecords.filter(r => r.score_change < 0).length,
        recordCount: studentRecords.length,
        avgChange: studentRecords.length > 0 ? studentRecords.reduce((sum, r) => sum + r.score_change, 0) / studentRecords.length : 0
      };

      // 按来源类型统计
      const sourceStats = {};
      studentRecords.forEach(r => {
        if (!sourceStats[r.source_type]) {
          sourceStats[r.source_type] = {
            count: 0,
            totalScore: 0
          };
        }
        sourceStats[r.source_type].count++;
        sourceStats[r.source_type].totalScore += r.score_change;
      });
      data[student.student_id] = {
        student,
        records: studentRecords,
        trendData,
        stats,
        sourceStats
      };
    });
    return data;
  };
  const calculateTrendData = (student, records) => {
    let accumulatedScore = 0;
    return records.map((record, index) => {
      accumulatedScore += record.score_change;
      const date = new Date(record.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
      return {
        date,
        name: student.name,
        singleChange: record.score_change,
        accumulated: accumulatedScore
      };
    });
  };
  const toggleStudent = student => {
    setSelectedStudents(prev => {
      const exists = prev.find(s => s.student_id === student.student_id);
      if (exists) {
        return prev.filter(s => s.student_id !== student.student_id);
      } else if (prev.length < 5) {
        return [...prev, student];
      } else {
        toast({
          title: '最多选择5名学生',
          description: '为了便于对比，最多同时选择5名学生'
        });
        return prev;
      }
    });
  };
  const getTrendChartData = () => {
    if (Object.keys(comparisonData).length === 0) return [];

    // 合并所有学生的趋势数据
    const allDates = new Set();
    Object.values(comparisonData).forEach(data => {
      data.trendData.forEach(d => allDates.add(d.date));
    });
    return Array.from(allDates).sort((a, b) => {
      return new Date(a) - new Date(b);
    }).map(date => {
      const item = {
        date
      };
      Object.values(comparisonData).forEach(data => {
        const dayData = data.trendData.find(d => d.date === date);
        if (dayData) {
          item[data.student.name] = dayData.accumulated;
        }
      });
      return item;
    });
  };
  const getSourceChartData = () => {
    if (Object.keys(comparisonData).length === 0) return [];
    const allSources = new Set();
    Object.values(comparisonData).forEach(data => {
      Object.keys(data.sourceStats).forEach(source => allSources.add(source));
    });
    return Array.from(allSources).map(source => {
      const item = {
        source
      };
      Object.values(comparisonData).forEach(data => {
        if (data.sourceStats[source]) {
          item[data.student.name] = data.sourceStats[source].count;
        }
      });
      return item;
    });
  };
  const getRadarChartData = studentId => {
    const data = comparisonData[studentId];
    if (!data) return [];
    const maxCount = Math.max(...Object.values(data.sourceStats).map(s => s.count), 1);
    return Object.entries(data.sourceStats).map(([source, stats]) => ({
      source,
      value: Math.round(stats.count / maxCount * 100)
    }));
  };
  const colors = ['#f97316',
  // orange-500
  '#3b82f6',
  // blue-500
  '#22c55e',
  // green-500
  '#a855f7',
  // purple-500
  '#ef4444' // red-500
  ];
  return <div className="space-y-4">
      {/* 学生选择区域 */}
      <Card className="border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                选择对比学生
              </CardTitle>
              <CardDescription>最多选择5名学生进行对比分析</CardDescription>
            </div>
            <Badge variant="secondary">
              已选择 {selectedStudents.length} / 5
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {students.map((student, index) => {
            const isSelected = selectedStudents.find(s => s.student_id === student.student_id);
            return <Card key={student.student_id} className={`cursor-pointer transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-300'}`} onClick={() => toggleStudent(student)}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <Checkbox checked={isSelected} readOnly className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.class_name}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs" style={{
                      borderColor: colors[index]
                    }}>
                          {student.current_score}分
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </CardContent>
      </Card>

      {/* 对比分析内容 */}
      {selectedStudents.length > 0 && <>
          {/* 统计概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedStudents.map((student, index) => {
          const data = comparisonData[student.student_id];
          if (!data) return null;
          return <Card key={student.student_id} className="border-2" style={{
            borderColor: colors[index]
          }}>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      {student.name}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {data.stats.totalChange > 0 ? '+' : ''}
                      {data.stats.totalChange}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.stats.recordCount}条记录
                    </p>
                  </CardContent>
                </Card>;
        })}
          </div>

          {/* Tab 切换 */}
          <div className="flex gap-2">
            <Button variant={activeTab === 'trend' ? 'default' : 'outline'} onClick={() => setActiveTab('trend')} className={activeTab === 'trend' ? 'bg-orange-500 hover:bg-orange-600' : ''}>
              <TrendingUp className="h-4 w-4 mr-2" />
              积分趋势
            </Button>
            <Button variant={activeTab === 'source' ? 'default' : 'outline'} onClick={() => setActiveTab('source')} className={activeTab === 'source' ? 'bg-orange-500 hover:bg-orange-600' : ''}>
              <Target className="h-4 w-4 mr-2" />
              来源分布
            </Button>
            <Button variant={activeTab === 'radar' ? 'default' : 'outline'} onClick={() => setActiveTab('radar')} className={activeTab === 'radar' ? 'bg-orange-500 hover:bg-orange-600' : ''}>
              <Award className="h-4 w-4 mr-2" />
              能力雷达
            </Button>
          </div>

          {/* 图表展示 */}
          {activeTab === 'trend' && <Card>
              <CardHeader>
                <CardTitle>积分累计变化趋势</CardTitle>
                <CardDescription>对比学生积分的累计变化情况</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getTrendChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedStudents.map((student, index) => <Line key={student.student_id} type="monotone" dataKey={student.name} stroke={colors[index]} strokeWidth={2} dot={{
                r: 4
              }} />)}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>}

          {activeTab === 'source' && <Card>
              <CardHeader>
                <CardTitle>记录来源分布</CardTitle>
                <CardDescription>对比学生在不同来源类型的记录数量</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={getSourceChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedStudents.map((student, index) => <Bar key={student.student_id} dataKey={student.name} fill={colors[index]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>}

          {activeTab === 'radar' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedStudents.map((student, index) => {
          const radarData = getRadarChartData(student.student_id);
          if (!radarData || radarData.length === 0) return null;
          return <Card key={student.student_id}>
                    <CardHeader>
                      <CardTitle>{student.name}</CardTitle>
                      <CardDescription>综合能力分析</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="source" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar name={student.name} dataKey="value" stroke={colors[index]} fill={colors[index]} fillOpacity={0.3} strokeWidth={2} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>;
        })}
            </div>}

          {/* 详细对比表格 */}
          <Card>
            <CardHeader>
              <CardTitle>详细数据对比</CardTitle>
              <CardDescription>各项指标的详细对比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">指标</th>
                      {selectedStudents.map((student, index) => <th key={student.student_id} className="text-center py-3 px-2" style={{
                    color: colors[index]
                  }}>
                          {student.name}
                        </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-2">总积分变化</td>
                      {selectedStudents.map((student, index) => {
                    const data = comparisonData[student.student_id];
                    return <td key={student.student_id} className="text-center py-3 px-2">
                            <span className={`font-bold ${data?.stats.totalChange > 0 ? 'text-green-600' : data?.stats.totalChange < 0 ? 'text-red-600' : ''}`}>
                              {data?.stats.totalChange > 0 ? '+' : ''}
                              {data?.stats.totalChange || 0}
                            </span>
                          </td>;
                  })}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">正向记录</td>
                      {selectedStudents.map((student, index) => {
                    const data = comparisonData[student.student_id];
                    return <td key={student.student_id} className="text-center py-3 px-2">
                            {data?.stats.positiveCount || 0}
                          </td>;
                  })}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">负向记录</td>
                      {selectedStudents.map((student, index) => {
                    const data = comparisonData[student.student_id];
                    return <td key={student.student_id} className="text-center py-3 px-2">
                            {data?.stats.negativeCount || 0}
                          </td>;
                  })}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">平均变化</td>
                      {selectedStudents.map((student, index) => {
                    const data = comparisonData[student.student_id];
                    return <td key={student.student_id} className="text-center py-3 px-2">
                            {data?.stats.avgChange?.toFixed(1) || 0}
                          </td>;
                  })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>}

      {selectedStudents.length === 0 && <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              请选择至少一名学生开始对比分析
            </p>
          </CardContent>
        </Card>}
    </div>;
};
export default StudentComparison;