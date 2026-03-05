// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Checkbox, toast } from '@/components/ui';
// @ts-ignore;
import { FileSpreadsheet, Download, CheckCircle2, AlertCircle, X } from 'lucide-react';

const ExcelExport = ({
  open,
  onOpenChange,
  data,
  fileName = '学生数据导出'
}) => {
  const [selectedFields, setSelectedFields] = React.useState(['student_id', 'name', 'class_name', 'current_score', 'dorm_score']);
  const [isExporting, setIsExporting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const availableFields = [{
    id: 'student_id',
    label: '学号'
  }, {
    id: 'name',
    label: '姓名'
  }, {
    id: 'gender',
    label: '性别'
  }, {
    id: 'class_name',
    label: '班级'
  }, {
    id: 'position',
    label: '职务'
  }, {
    id: 'is_boarding',
    label: '住宿状态'
  }, {
    id: 'current_score',
    label: '当前积分'
  }, {
    id: 'initial_score',
    label: '初始积分'
  }, {
    id: 'phone_number',
    label: '个人手机号'
  }, {
    id: 'parent_phone_number',
    label: '家长手机号'
  }, {
    id: 'dorm_info.building',
    label: '宿舍楼栋'
  }, {
    id: 'dorm_info.room',
    label: '宿舍房间'
  }, {
    id: 'dorm_score',
    label: '宿舍积分'
  }];
  const toggleField = fieldId => {
    setSelectedFields(prev => {
      if (prev.includes(fieldId)) {
        return prev.filter(id => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };
  const selectAll = () => {
    setSelectedFields(availableFields.map(f => f.id));
  };
  const selectNone = () => {
    setSelectedFields([]);
  };
  const getFieldValue = (record, fieldId) => {
    if (fieldId.includes('.')) {
      const parts = fieldId.split('.');
      let value = record;
      for (const part of parts) {
        value = value?.[part];
      }
      return value;
    }
    return record[fieldId];
  };
  const formatValue = value => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? '是' : '否';
    if (typeof value === 'object') {
      if (value.building && value.room) {
        return `${value.building}-${value.room}`;
      }
      return JSON.stringify(value);
    }
    return String(value);
  };
  const exportToExcel = () => {
    if (selectedFields.length === 0) {
      toast({
        title: '请选择至少一个字段',
        description: '需要选择至少一个字段才能导出数据',
        variant: 'destructive'
      });
      return;
    }
    setIsExporting(true);
    try {
      // 构建 CSV 内容
      const headers = selectedFields.map(fieldId => {
        const field = availableFields.find(f => f.id === fieldId);
        return field ? field.label : fieldId;
      });

      // 添加 BOM 以支持中文
      let csvContent = '\uFEFF';

      // 添加表头
      csvContent += headers.join(',') + '\n';

      // 添加数据行
      data.forEach(record => {
        const row = selectedFields.map(fieldId => {
          const value = formatValue(getFieldValue(record, fieldId));
          // 转义逗号和双引号
          return value.includes(',') || value.includes('"') || value.includes('\n') ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csvContent += row.join(',') + '\n';
      });

      // 创建 Blob 并下载
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
      }, 2000);
      toast({
        title: '导出成功',
        description: `成功导出 ${data.length} 条数据`
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-orange-500" />
            导出 Excel 文件
          </DialogTitle>
          <DialogDescription>
            选择要导出的字段，生成 CSV 文件（可在 Excel 中打开）
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 字段选择 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">选择导出字段</label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  全选
                </Button>
                <Button variant="ghost" size="sm" onClick={selectNone}>
                  清空
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
              {availableFields.map(field => <div key={field.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <Checkbox id={field.id} checked={selectedFields.includes(field.id)} onCheckedChange={() => toggleField(field.id)} />
                  <label htmlFor={field.id} className="text-sm cursor-pointer flex-1">
                    {field.label}
                  </label>
                </div>)}
            </div>
          </div>

          {/* 数据预览 */}
          <div>
            <label className="text-sm font-medium mb-2 block">数据预览（前3条）</label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {selectedFields.length > 0 ? selectedFields.map(fieldId => {
                    const field = availableFields.find(f => f.id === fieldId);
                    return <th key={fieldId} className="px-3 py-2 text-left font-medium">
                            {field?.label || fieldId}
                          </th>;
                  }) : <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        请选择字段
                      </th>}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 3).map((record, index) => <tr key={index} className="border-t">
                      {selectedFields.length > 0 ? selectedFields.map(fieldId => <td key={fieldId} className="px-3 py-2">
                            {formatValue(getFieldValue(record, fieldId))}
                          </td>) : <td className="px-3 py-2 text-muted-foreground col-span-full">
                          -
                        </td>}
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">导出说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>导出格式为 CSV，可在 Excel 中直接打开</li>
                <li>文件将包含 BOM 头，支持中文显示</li>
                <li>导出文件名：{fileName}_YYYY-MM-DD.csv</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={exportToExcel} disabled={isExporting || selectedFields.length === 0} className="bg-orange-500 hover:bg-orange-600">
            {isExporting ? <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                导出中...
              </span> : <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                导出 Excel
              </span>}
          </Button>
        </div>

        {/* 成功提示 */}
        {showSuccess && <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">导出成功！</p>
              <p className="text-sm text-gray-500 mt-1">文件已开始下载</p>
            </div>
          </div>}
      </DialogContent>
    </Dialog>;
};
export default ExcelExport;