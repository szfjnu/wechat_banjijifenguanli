// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button, Checkbox, Badge, Card, CardContent, toast } from '@/components/ui';
// @ts-ignore;
import { FileText, Download, CheckCircle2, Loader2, Calendar, TrendingUp, Target, Award, AlertCircle } from 'lucide-react';

const ReportGenerator = ({
  open,
  onOpenChange,
  studentData,
  growthData
}) => {
  const [selectedSections, setSelectedSections] = useState(['basic', 'growth', 'statistics', 'timeline', 'suggestions']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const sections = [{
    id: 'basic',
    label: '基本信息',
    icon: FileText
  }, {
    id: 'growth',
    label: '成长轨迹',
    icon: TrendingUp
  }, {
    id: 'statistics',
    label: '数据统计',
    icon: Target
  }, {
    id: 'timeline',
    label: '详细记录',
    icon: Calendar
  }, {
    id: 'suggestions',
    label: '改进建议',
    icon: Award
  }];
  const toggleSection = sectionId => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };
  const calculateScoreLevel = score => {
    if (score >= 120) return {
      level: '优秀',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
    if (score >= 100) return {
      level: '良好',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    };
    if (score >= 80) return {
      level: '中等',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    };
    if (score >= 60) return {
      level: '及格',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    };
    return {
      level: '需努力',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    };
  };
  const generateReport = () => {
    if (selectedSections.length === 0) {
      toast({
        title: '请选择至少一个章节',
        description: '需要选择至少一个章节才能生成报告',
        variant: 'destructive'
      });
      return;
    }
    setIsGenerating(true);
    try {
      // 创建报告内容
      const reportContent = generateReportContent();

      // 创建打印窗口
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>学生成长报告 - ${studentData?.name || '未知'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
              font-size: 14px;
              line-height: 1.8;
              color: #333;
              background: white;
              padding: 40px;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none !important;
              }
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #f97316;
            }
            
            .header h1 {
              font-size: 28px;
              color: #f97316;
              margin-bottom: 10px;
            }
            
            .header p {
              color: #666;
              font-size: 14px;
            }
            
            .section {
              margin-bottom: 30px;
            }
            
            .section h2 {
              font-size: 18px;
              color: #f97316;
              margin-bottom: 15px;
              padding-left: 12px;
              border-left: 4px solid #f97316;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              background: #f9f9f9;
              padding: 15px;
              border-radius: 4px;
            }
            
            .info-item {
              display: flex;
            }
            
            .info-label {
              font-weight: bold;
              color: #666;
              min-width: 80px;
            }
            
            .info-value {
              flex: 1;
            }
            
            .score-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-weight: bold;
            }
            
            .positive {
              color: #16a34a;
              font-weight: bold;
            }
            
            .negative {
              color: #dc2626;
              font-weight: bold;
            }
            
            .timeline-item {
              border-left: 2px solid #f97316;
              padding-left: 15px;
              margin-bottom: 15px;
            }
            
            .timeline-date {
              font-size: 12px;
              color: #999;
              margin-bottom: 5px;
            }
            
            .timeline-content {
              background: #f9f9f9;
              padding: 10px;
              border-radius: 4px;
            }
            
            .stat-card {
              display: inline-block;
              background: #f9f9f9;
              padding: 12px 20px;
              margin-right: 10px;
              margin-bottom: 10px;
              border-radius: 4px;
              min-width: 120px;
            }
            
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #f97316;
            }
            
            .stat-label {
              font-size: 12px;
              color: #666;
            }
            
            .suggestion-box {
              background: #fff7ed;
              border: 1px solid #fed7aa;
              padding: 15px;
              border-radius: 4px;
            }
            
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e5e5;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          ${reportContent}
          
          <div class="footer no-print">
            <p>报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();

      // 等待页面加载后打印
      setTimeout(() => {
        printWindow.print();
      }, 500);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
      }, 2000);
      toast({
        title: '报告生成成功',
        description: '已打开打印窗口，请选择保存为PDF'
      });
    } catch (error) {
      console.error('生成报告失败:', error);
      toast({
        title: '生成失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const generateReportContent = () => {
    const scoreLevel = calculateScoreLevel(studentData?.current_score || 0);
    const content = [];

    // 基本信息
    if (selectedSections.includes('basic')) {
      content.push(`
        <div class="section">
          <h2>基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">姓名：</span>
              <span class="info-value">${studentData?.name || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">学号：</span>
              <span class="info-value">${studentData?.student_id || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">班级：</span>
              <span class="info-value">${studentData?.class_name || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">职务：</span>
              <span class="info-value">${studentData?.position || '无'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">住宿状态：</span>
              <span class="info-value">${studentData?.is_boarding ? '住宿' : '走读'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">当前积分：</span>
              <span class="info-value"><span class="score-badge" style="background: ${scoreLevel.bgColor}; color: ${scoreLevel.color}">${studentData?.current_score || 0}分</span></span>
            </div>
            <div class="info-item">
              <span class="info-label">积分等级：</span>
              <span class="info-value">${scoreLevel.level}</span>
            </div>
            <div class="info-item">
              <span class="info-label">宿舍信息：</span>
              <span class="info-value">${studentData?.dorm_info ? `${studentData.dorm_info.building}-${studentData.dorm_info.room}` : '无'}</span>
            </div>
          </div>
        </div>
      `);
    }

    // 数据统计
    if (selectedSections.includes('statistics') && growthData?.length > 0) {
      const totalChange = growthData.reduce((sum, r) => sum + r.score_change, 0);
      const positiveCount = growthData.filter(r => r.score_change > 0).length;
      const negativeCount = growthData.filter(r => r.score_change < 0).length;
      const avgChange = growthData.length > 0 ? (totalChange / growthData.length).toFixed(1) : 0;
      content.push(`
        <div class="section">
          <h2>数据统计</h2>
          <div class="stat-card">
            <div class="stat-value">${growthData.length}</div>
            <div class="stat-label">总记录数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value ${totalChange > 0 ? 'positive' : totalChange < 0 ? 'negative' : ''}">${totalChange > 0 ? '+' : ''}${totalChange}</div>
            <div class="stat-label">总积分变化</div>
          </div>
          <div class="stat-card">
            <div class="stat-value positive">${positiveCount}</div>
            <div class="stat-label">正向记录</div>
          </div>
          <div class="stat-card">
            <div class="stat-value negative">${negativeCount}</div>
            <div class="stat-label">负向记录</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${avgChange}</div>
            <div class="stat-label">平均变化</div>
          </div>
        </div>
      `);
    }

    // 成长轨迹
    if (selectedSections.includes('growth') && growthData?.length > 0) {
      let accumulatedScore = 0;
      const timelineContent = growthData.map((record, index) => {
        accumulatedScore += record.score_change;
        const date = new Date(record.date).toLocaleDateString('zh-CN');
        return `
          <div class="timeline-item">
            <div class="timeline-date">${date}</div>
            <div class="timeline-content">
              <div style="margin-bottom: 5px;">
                <strong>${record.reason_detail}</strong>
                <span style="margin-left: 10px; font-weight: ${record.score_change > 0 ? 'bold' : ''}" class="${record.score_change > 0 ? 'positive' : 'negative'}">
                  ${record.score_change > 0 ? '+' : ''}${record.score_change}分
                </span>
              </div>
              <div style="font-size: 12px; color: #666;">
                类型：${record.source_type || '未知'} &nbsp;|&nbsp; 记录人：${record.recorder_name || '-'}
              </div>
            </div>
          </div>
        `;
      }).join('');
      content.push(`
        <div class="section">
          <h2>成长轨迹</h2>
          ${timelineContent}
        </div>
      `);
    }

    // 详细记录
    if (selectedSections.includes('timeline') && growthData?.length > 0) {
      const tableRows = growthData.map(record => {
        const date = new Date(record.date).toLocaleDateString('zh-CN');
        const approvalBadge = record.approval_status === '已通过' ? '✅' : record.approval_status === '已拒绝' ? '❌' : '⏳';
        return `
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 8px;">${date}</td>
            <td style="padding: 8px;">${record.reason_detail || '-'}</td>
            <td style="padding: 8px;">${record.source_type || '-'}</td>
            <td style="padding: 8px; text-align: center;">${record.score_change > 0 ? '+' : ''}${record.score_change}</td>
            <td style="padding: 8px; text-align: center;">${approvalBadge}</td>
          </tr>
        `;
      }).join('');
      content.push(`
        <div class="section">
          <h2>详细记录</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">日期</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">原因</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">类型</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">积分</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">状态</th>
            </tr>
            ${tableRows}
          </table>
        </div>
      `);
    }

    // 改进建议
    if (selectedSections.includes('suggestions')) {
      const suggestions = generateSuggestions();
      const suggestionItems = suggestions.map(s => `<li style="margin-bottom: 8px;">${s}</li>`).join('');
      content.push(`
        <div class="section">
          <h2>改进建议</h2>
          <div class="suggestion-box">
            <ul style="padding-left: 20px; margin: 0;">
              ${suggestionItems}
            </ul>
          </div>
        </div>
      `);
    }
    return content.join('\n');
  };
  const generateSuggestions = () => {
    const suggestions = [];
    const currentScore = studentData?.current_score || 0;
    const growthRecords = growthData || [];
    const negativeRecords = growthRecords.filter(r => r.score_change < 0);
    const positiveRecords = growthRecords.filter(r => r.score_change > 0);

    // 基于分数等级给出建议
    if (currentScore < 60) {
      suggestions.push('当前积分偏低，建议重点关注课堂纪律和作业完成情况');
      suggestions.push('需要制定个人改进计划，明确短期和长期目标');
    } else if (currentScore < 80) {
      suggestions.push('积分处于及格线附近，建议继续保持正向表现');
    } else if (currentScore < 100) {
      suggestions.push('积分表现良好，建议在原有基础上进一步提升');
    } else {
      suggestions.push('积分表现优秀，建议继续保持并发扬榜样作用');
    }

    // 基于负向记录给出建议
    if (negativeRecords.length > 0) {
      const commonIssues = {};
      negativeRecords.forEach(record => {
        const reason = record.reason_detail;
        commonIssues[reason] = (commonIssues[reason] || 0) + 1;
      });
      Object.entries(commonIssues).forEach(([reason, count]) => {
        if (count >= 2) {
          suggestions.push(`"${reason}"问题出现${count}次，建议针对性改进`);
        }
      });
    }

    // 基于正向记录给出建议
    if (positiveRecords.length > 0) {
      suggestions.push('保持良好的学习习惯和表现，继续积极参与各项活动');
    }

    // 通用建议
    suggestions.push('建议定期查看自己的成长轨迹，及时调整学习和行为习惯');
    suggestions.push('遇到困难时，及时与老师沟通寻求帮助');
    return suggestions;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            生成成长报告
          </DialogTitle>
          <DialogDescription>
            选择要包含在报告中的章节，生成可打印的 PDF 成长报告
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 学生信息卡片 */}
          {studentData && <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">{studentData.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {studentData.class_name} · {studentData.student_id}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {growthData?.length || 0} 条记录
                  </Badge>
                </div>
              </CardContent>
            </Card>}

          {/* 章节选择 */}
          <div>
            <label className="text-sm font-medium mb-3 block">选择报告章节</label>
            <div className="space-y-2">
              {sections.map(section => {
              const Icon = section.icon;
              return <div key={section.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedSections.includes(section.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => toggleSection(section.id)}>
                    <Checkbox checked={selectedSections.includes(section.id)} readOnly className="flex-shrink-0" />
                    <Icon className={`h-5 w-5 flex-shrink-0 ${selectedSections.includes(section.id) ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className="flex-1 font-medium">{section.label}</span>
                  </div>;
            })}
            </div>
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">报告说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>报告将在新窗口中打开，可直接打印或保存为 PDF</li>
                <li>报告包含学生信息、成长轨迹、统计分析等内容</li>
                <li>建议定期生成报告，用于家长沟通和学生档案管理</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={generateReport} disabled={isGenerating || selectedSections.length === 0} className="bg-orange-500 hover:bg-orange-600">
            {isGenerating ? <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                生成中...
              </span> : <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                生成报告
              </span>}
          </Button>
        </div>

        {/* 成功提示 */}
        {showSuccess && <div className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">生成成功！</p>
              <p className="text-sm text-gray-500 mt-1">请在打印窗口选择保存为 PDF</p>
            </div>
          </div>}
      </DialogContent>
    </Dialog>;
};
export default ReportGenerator;