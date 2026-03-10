// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

export const displayName = 'InitTimetableData';
export default function InitTimetableData(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const initData = async () => {
    try {
      setLoading(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();

      // 作息时间数据
      const timetableData = [
      // 上午
      {
        id: "DS-001",
        period: "上午",
        period_order: 1,
        item_name: "起床",
        item_order: 1,
        time_range: "06:30",
        note: ""
      }, {
        id: "DS-002",
        period: "上午",
        period_order: 1,
        item_name: "早餐",
        item_order: 2,
        time_range: "07:00-07:50",
        note: ""
      }, {
        id: "DS-003",
        period: "上午",
        period_order: 1,
        item_name: "教职工上班",
        item_order: 3,
        time_range: "周一 08:00 / 周二至周五 08:10",
        note: ""
      }, {
        id: "DS-004",
        period: "上午",
        period_order: 1,
        item_name: "升旗仪式",
        item_order: 4,
        time_range: "周一 08:00-08:40 / 周二至周五 08:10-08:20",
        note: ""
      }, {
        id: "DS-005",
        period: "上午",
        period_order: 1,
        item_name: "第一节",
        item_order: 5,
        time_range: "08:50-10:10",
        note: "周一1、2节实训课不安排晨读"
      }, {
        id: "DS-006",
        period: "上午",
        period_order: 1,
        item_name: "第二节",
        item_order: 6,
        time_range: "09:10-09:50",
        note: ""
      }, {
        id: "DS-007",
        period: "上午",
        period_order: 1,
        item_name: "课间操",
        item_order: 7,
        time_range: "09:50-10:10",
        note: ""
      }, {
        id: "DS-008",
        period: "上午",
        period_order: 1,
        item_name: "第三节",
        item_order: 8,
        time_range: "10:20-11:00",
        note: ""
      }, {
        id: "DS-009",
        period: "上午",
        period_order: 1,
        item_name: "眼保健操",
        item_order: 9,
        time_range: "11:00-11:05",
        note: ""
      }, {
        id: "DS-010",
        period: "上午",
        period_order: 1,
        item_name: "第四节",
        item_order: 10,
        time_range: "11:15-11:55",
        note: ""
      },
      // 中午
      {
        id: "DS-011",
        period: "中午",
        period_order: 2,
        item_name: "午餐",
        item_order: 1,
        time_range: "第一批 11:40-12:00 / 第二批 12:00-12:30",
        note: ""
      }, {
        id: "DS-012",
        period: "中午",
        period_order: 2,
        item_name: "午休",
        item_order: 2,
        time_range: "12:45-13:45",
        note: ""
      }, {
        id: "DS-013",
        period: "中午",
        period_order: 2,
        item_name: "起床",
        item_order: 3,
        time_range: "13:45",
        note: ""
      }, {
        id: "DS-014",
        period: "中午",
        period_order: 2,
        item_name: "教职工上班",
        item_order: 4,
        time_range: "13:55",
        note: ""
      },
      // 下午
      {
        id: "DS-015",
        period: "下午",
        period_order: 3,
        item_name: "第五节",
        item_order: 1,
        time_range: "14:00-14:40",
        note: ""
      }, {
        id: "DS-016",
        period: "下午",
        period_order: 3,
        item_name: "眼保健操",
        item_order: 2,
        time_range: "14:40-14:45",
        note: ""
      }, {
        id: "DS-017",
        period: "下午",
        period_order: 3,
        item_name: "第六节",
        item_order: 3,
        time_range: "14:50-15:30",
        note: ""
      }, {
        id: "DS-018",
        period: "下午",
        period_order: 3,
        item_name: "第七节",
        item_order: 4,
        time_range: "15:40-16:20",
        note: ""
      }, {
        id: "DS-019",
        period: "下午",
        period_order: 3,
        item_name: "阳光体育活动",
        item_order: 5,
        time_range: "16:30-18:00",
        note: ""
      }, {
        id: "DS-020",
        period: "下午",
        period_order: 3,
        item_name: "教职工下班",
        item_order: 6,
        time_range: "16:30",
        note: ""
      },
      // 晚上
      {
        id: "DS-021",
        period: "晚上",
        period_order: 4,
        item_name: "晚餐",
        item_order: 1,
        time_range: "17:30-18:30",
        note: ""
      }, {
        id: "DS-022",
        period: "晚上",
        period_order: 4,
        item_name: "晚自修",
        item_order: 2,
        time_range: "19:30-21:00",
        note: ""
      }, {
        id: "DS-023",
        period: "晚上",
        period_order: 4,
        item_name: "教室熄灯",
        item_order: 3,
        time_range: "22:00",
        note: ""
      }, {
        id: "DS-024",
        period: "晚上",
        period_order: 4,
        item_name: "宿舍熄灯",
        item_order: 4,
        time_range: "22:30",
        note: ""
      }];

      // 删除旧数据
      const oldData = await db.collection('daily_schedule').get();
      if (oldData.data && oldData.data.length > 0) {
        await Promise.all(oldData.data.map(item => db.collection('daily_schedule').doc(item.id).remove()));
      }

      // 批量插入新数据
      let successCount = 0;
      for (const item of timetableData) {
        try {
          await db.collection('daily_schedule').add(item);
          successCount++;
        } catch (err) {
          console.error('插入失败:', item, err);
        }
      }
      toast({
        variant: 'success',
        title: '导入成功',
        description: `成功导入 ${successCount}/${timetableData.length} 条作息时间数据`
      });
    } catch (error) {
      console.error('导入失败:', error);
      toast({
        variant: 'destructive',
        title: '导入失败',
        description: error.message || '未知错误'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">初始化作息时间数据</h1>
        <p className="text-gray-600 mb-6">
          点击下方按钮将作息时间数据导入到数据库。
          <br />
          数据包含：上午、中午、下午、晚上四个时段的24个时间项。
        </p>
        
        <Button onClick={initData} disabled={loading} className="w-full">
          {loading ? '导入中...' : '开始导入作息时间数据'}
        </Button>
        
        {loading && <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700">正在导入数据，请稍候...</p>
          </div>}
      </div>
    </div>;
}