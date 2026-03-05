// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { History, Clock, User as UserIcon } from 'lucide-react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';

export function StudentHistoryDialog({
  isOpen,
  onClose,
  student,
  history
}) {
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>学生操作历史</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {student && <div className="bg-orange-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">学号：</span>
                  <span className="font-semibold">{student.student_id}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">姓名：</span>
                  <span className="font-semibold">{student.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">班级：</span>
                  <span className="font-semibold">{student.class_name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">操作记录：</span>
                  <span className="font-semibold">{history.length} 条</span>
                </div>
              </div>
            </div>}

          <div className="space-y-3">
            {history.length === 0 ? <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>暂无操作历史记录</p>
              </div> : history.map((item, index) => <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{item.operation_type}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.operation_details}</p>
                      {item.operation_by && <div className="flex items-center gap-1 text-xs text-gray-500">
                          <UserIcon className="h-3 w-3" />
                          <span>操作人：{item.operation_by}</span>
                        </div>}
                    </div>
                  </div>
                </div>)}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}