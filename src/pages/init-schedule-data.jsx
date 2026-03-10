// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

export default function InitScheduleData(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const initData = async () => {
    try {
      setLoading(true);
      const tcb = await props.$w.cloud.getCloudInstance();
      const db = tcb.database();
      const scheduleData = [{
        schedule_id: "SCH-001",
        schedule_date: "2026-03-09",
        week_day: 1,
        week_day_name: "星期一",
        schedule_type: "课程",
        section: 1,
        section_name: "第一节课",
        start_time: "08:50",
        end_time: "10:10",
        time_range: "08:50-10:10",
        subject_name: "智能仓储大数据分析",
        course_name: "智能仓储大数据分析",
        class_name: "2024级物流服务与管理2班",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-002",
        schedule_date: "2026-03-09",
        week_day: 1,
        week_day_name: "星期一",
        schedule_type: "课程",
        section: 2,
        section_name: "第二节课",
        start_time: "09:10",
        end_time: "09:50",
        time_range: "09:10-09:50",
        subject_name: "智能仓储大数据分析",
        course_name: "智能仓储大数据分析",
        class_name: "2024级物流服务与管理2班",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-003",
        schedule_date: "2026-03-11",
        week_day: 3,
        week_day_name: "星期三",
        schedule_type: "课程",
        section: 1,
        section_name: "第一节课",
        start_time: "08:50",
        end_time: "10:10",
        time_range: "08:50-10:10",
        subject_name: "人工智能基础",
        course_name: "人工智能基础",
        class_name: "2023级物流服务与管理1班（农工商三二）",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-004",
        schedule_date: "2026-03-11",
        week_day: 3,
        week_day_name: "星期三",
        schedule_type: "课程",
        section: 2,
        section_name: "第二节课",
        start_time: "09:10",
        end_time: "09:50",
        time_range: "09:10-09:50",
        subject_name: "人工智能基础",
        course_name: "人工智能基础",
        class_name: "2023级物流服务与管理1班（农工商三二）",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-005",
        schedule_date: "2026-03-11",
        week_day: 3,
        week_day_name: "星期三",
        schedule_type: "课程",
        section: 3,
        section_name: "第三节课",
        start_time: "10:20",
        end_time: "11:00",
        time_range: "10:20-11:00",
        subject_name: "智能仓储大数据分析",
        course_name: "智能仓储大数据分析",
        class_name: "2024级物流服务与管理1班（广州科贸三二）",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-006",
        schedule_date: "2026-03-11",
        week_day: 3,
        week_day_name: "星期三",
        schedule_type: "课程",
        section: 4,
        section_name: "第四节课",
        start_time: "11:15",
        end_time: "11:55",
        time_range: "11:15-11:55",
        subject_name: "智能仓储大数据分析",
        course_name: "智能仓储大数据分析",
        class_name: "2024级物流服务与管理1班（广州科贸三二）",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-007",
        schedule_date: "2026-03-12",
        week_day: 4,
        week_day_name: "星期四",
        schedule_type: "课程",
        section: 1,
        section_name: "第一节课",
        start_time: "08:50",
        end_time: "10:10",
        time_range: "08:50-10:10",
        subject_name: "智能仓储大数据分析",
        course_name: "智能仓储大数据分析",
        class_name: "2024级物流服务与管理2班",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-008",
        schedule_date: "2026-03-12",
        week_day: 4,
        week_day_name: "星期四",
        schedule_type: "课程",
        section: 2,
        section_name: "第二节课",
        start_time: "09:10",
        end_time: "09:50",
        time_range: "09:10-09:50",
        subject_name: "智能仓储大数据分析",
        course_name: "智能仓储大数据分析",
        class_name: "2024级物流服务与管理2班",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-009",
        schedule_date: "2026-03-12",
        week_day: 4,
        week_day_name: "星期四",
        schedule_type: "课程",
        section: 3,
        section_name: "第三节课",
        start_time: "10:20",
        end_time: "11:00",
        time_range: "10:20-11:00",
        subject_name: "物流管理数学应用",
        course_name: "物流管理数学应用",
        class_name: "2024级物流服务与管理2班",
        room: "2-5504",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-010",
        schedule_date: "2026-03-12",
        week_day: 4,
        week_day_name: "星期四",
        schedule_type: "课程",
        section: 4,
        section_name: "第四节课",
        start_time: "11:15",
        end_time: "11:55",
        time_range: "11:15-11:55",
        subject_name: "物流管理数学应用",
        course_name: "物流管理数学应用",
        class_name: "2024级物流服务与管理2班",
        room: "2-5504",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-011",
        schedule_date: "2026-03-12",
        week_day: 4,
        week_day_name: "星期四",
        schedule_type: "课程",
        section: 5,
        section_name: "第五节课",
        start_time: "14:00",
        end_time: "14:40",
        time_range: "14:00-14:40",
        subject_name: "人工智能基础",
        course_name: "人工智能基础",
        class_name: "2023级物流服务与管理1班（农工商三二）",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-012",
        schedule_date: "2026-03-12",
        week_day: 4,
        week_day_name: "星期四",
        schedule_type: "课程",
        section: 6,
        section_name: "第六节课",
        start_time: "14:50",
        end_time: "15:30",
        time_range: "14:50-15:30",
        subject_name: "人工智能基础",
        course_name: "人工智能基础",
        class_name: "2023级物流服务与管理1班（农工商三二）",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-013",
        schedule_date: "2026-03-13",
        week_day: 5,
        week_day_name: "星期五",
        schedule_type: "课程",
        section: 1,
        section_name: "第一节课",
        start_time: "08:50",
        end_time: "10:10",
        time_range: "08:50-10:10",
        subject_name: "中职数字素养通识",
        course_name: "中职数字素养通识",
        class_name: "2023级物流服务与管理1班（农工商三二）",
        room: "2-2504数字语音实训2室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-014",
        schedule_date: "2026-03-13",
        week_day: 5,
        week_day_name: "星期五",
        schedule_type: "课程",
        section: 2,
        section_name: "第二节课",
        start_time: "09:10",
        end_time: "09:50",
        time_range: "09:10-09:50",
        subject_name: "智能仓储大数据分析",
        course_name: "智能仓储大数据分析",
        class_name: "2024级物流服务与管理1班（广州科贸三二）",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-015",
        schedule_date: "2026-03-13",
        week_day: 5,
        week_day_name: "星期五",
        schedule_type: "课程",
        section: 3,
        section_name: "第三节课",
        start_time: "10:20",
        end_time: "11:00",
        time_range: "10:20-11:00",
        subject_name: "智能仓储大数据分析",
        course_name: "智能仓储大数据分析",
        class_name: "2024级物流服务与管理1班（广州科贸三二）",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-016",
        schedule_date: "2026-03-13",
        week_day: 5,
        week_day_name: "星期五",
        schedule_type: "课程",
        section: 4,
        section_name: "第四节课",
        start_time: "11:15",
        end_time: "11:55",
        time_range: "11:15-11:55",
        subject_name: "智能仓储大数据分析",
        course_name: "智能仓储大数据分析",
        class_name: "2024级物流服务与管理1班（广州科贸三二）",
        room: "2-2703电子商务实训4室",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周"
      }, {
        schedule_id: "SCH-017",
        schedule_date: "2026-03-09",
        week_day: 1,
        week_day_name: "星期一",
        schedule_type: "班会",
        section: 7,
        section_name: "第七节课",
        start_time: "15:40",
        end_time: "16:20",
        time_range: "15:40-16:20",
        subject_name: "班会与课外辅导",
        course_name: "班会与课外辅导（劳动教育）",
        class_name: "2023级物流服务与管理1班（农工商三二）",
        room: "2-5501",
        building: "2栋",
        campus: "大坦沙校区",
        status: "normal",
        semester_name: "2025-2026学年第二学期",
        remark: "第2周，劳动教育"
      }];

      // 批量插入数据
      let successCount = 0;
      for (const item of scheduleData) {
        try {
          await db.collection('class_schedule').add(item);
          successCount++;
        } catch (err) {
          console.error('插入失败:', item.schedule_id, err);
        }
      }
      toast({
        title: '初始化完成',
        description: `成功导入 ${successCount}/${scheduleData.length} 条课程数据`
      });
    } catch (error) {
      console.error('初始化失败:', error);
      toast({
        title: '初始化失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">初始化课表数据</h1>
          <p className="text-gray-600 mb-6">
            此页面将识别的课表图片数据批量导入到数据库中。
            包含2025-2026学年第二学期第2周的17条课程记录。
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2">数据概览：</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 学期：2025-2026学年第二学期</li>
              <li>• 周次：第2周（2026-03-09 至 2026-03-13）</li>
              <li>• 课程类型：智能仓储大数据分析、人工智能基础、物流管理数学应用等</li>
              <li>• 班级：2024级物流服务与管理2班、2023级物流服务与管理1班等</li>
              <li>• 校区：大坦沙校区</li>
            </ul>
          </div>
          <Button onClick={initData} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-500">
            {loading ? '导入中...' : '开始导入课表数据'}
          </Button>
          <p className="text-xs text-gray-500 mt-4 text-center">
            导入完成后可以访问首页查看"今日课程提醒"效果
          </p>
        </div>
      </div>
    </div>;
}