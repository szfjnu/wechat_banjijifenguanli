# 教师课程表与作息时间管理 - 需要的数据模型

## 功能说明

1. **教师上课提醒**：在首页显示教师当天的课程安排，包括上课时间、地点、课程名称、班级等信息，并根据当前时间高亮显示当前课程和下一节课程。

2. **课程表管理**：教师可以维护自己的课程表，包括每周的课程安排（周一到周五，每天7节课）。

3. **作息时间管理**：维护学校的作息时间表，包括上午、中午、下午、晚上各个时段的具体时间安排。

## 需要的数据模型

### 1. teacher_schedules（教师课程表）

**用途**：存储教师的课程安排信息

**字段说明**：
- `_id`: 主键（自动生成）
- `teacher_id`: 教师ID（关联users表）
- `day_of_week`: 星期几（星期一/星期二/星期三/星期四/星期五）
- `section`: 节次（1-7）
- `course_name`: 课程名称（如：智能仓储大数据分析）
- `class_name`: 班级名称（如：2024级物流服务与管理2班）
- `room`: 教室（如：2-2703电子商务实训4室）
- `campus`: 校区（如：大坦沙校区）
- `semester_id`: 学期ID（关联semesters表）
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `_openid`: 创建者openid（用于ACL权限控制）

**示例数据**：
```json
{
  "teacher_id": "teacher_001",
  "day_of_week": "星期一",
  "section": 1,
  "course_name": "智能仓储大数据分析",
  "class_name": "2024级物流服务与管理2班",
  "room": "2-2703电子商务实训4室",
  "campus": "大坦沙校区",
  "semester_id": "semester_2025_spring"
}
```

### 2. school_timetables（学校作息时间表）

**用途**：存储学校的作息时间安排

**字段说明**：
- `_id`: 主键（自动生成）
- `school_name`: 学校名称（如：广州市财经商贸职业学校）
- `semester_id`: 学期ID（关联semesters表）
- `period`: 时段（上午/中午/下午/晚上）
- `items`: 时间段项目列表（数组）
  - `name`: 项目名称（如：起床、早餐、第一节）
  - `time`: 时间（如：06:30、07:00-07:50）
  - `note`: 备注（可选）
- `notes`: 整体备注信息（数组）
- `start_date`: 开始执行日期
- `end_date`: 结束执行日期
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `_openid`: 创建者openid（用于ACL权限控制）

**示例数据**：
```json
{
  "school_name": "广州市财经商贸职业学校",
  "semester_id": "semester_2025_spring",
  "period": "上午",
  "items": [
    { "name": "起床", "time": "06:30", "note": "" },
    { "name": "早餐", "time": "07:00-07:50", "note": "" },
    { "name": "第一节", "time": "08:50-10:10", "note": "周一1、2节实训课不安排晨读" },
    { "name": "第二节", "time": "09:10-09:50", "note": "" },
    { "name": "第三节", "time": "10:20-11:00", "note": "" },
    { "name": "第四节", "time": "11:15-11:55", "note": "" }
  ],
  "notes": [
    "本作息时间表自2026年3月2日起执行。",
    "实训室课程和体育课实施选堂上课，下课时间为11:40或15:20。"
  ],
  "start_date": "2026-03-02",
  "end_date": "2026-07-10"
}
```

## 数据查询示例

### 1. 查询教师今日课程
```javascript
// 获取当前日期的星期几
const today = new Date().getDay(); // 0-6, 0是周日
const dayOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][today];

// 查询当前教师在该学期的课程
const result = await tcb.collection('teacher_schedules')
  .where({
    teacher_id: $w.auth.currentUser.userId,
    day_of_week: dayOfWeek,
    semester_id: 'current_semester_id'
  })
  .orderBy('section', 'asc')
  .get();
```

### 2. 查询当前学期作息时间
```javascript
const result = await tcb.collection('school_timetables')
  .where({
    semester_id: 'current_semester_id',
    start_date: _.lte(new Date()),
    end_date: _.gte(new Date())
  })
  .orderBy('period', 'asc')
  .get();
```

### 3. 根据节次获取时间段
```javascript
const timetable = await tcb.collection('school_timetables')
  .where({ semester_id: 'current_semester_id', period: '上午' })
  .get();

const section = timetable.data[0].items.find(item => item.name === '第一节');
// section.time = '08:50-10:10'
```

## ACL权限设置建议

### teacher_schedules
- **读取**：所有教师可以查看自己的课程表
- **创建/更新/删除**：教师只能管理自己的课程表

### school_timetables
- **读取**：所有教师和学生可以查看
- **创建/更新/删除**：仅管理员权限

## 当前实现状态

✅ **已完成**：
1. 创建了 TeacherScheduleReminder 组件，显示教师今日课程提醒
2. 创建了 schedule-manage 页面，提供课程表和作息时间管理功能
3. 更新了首页，集成了教师上课提醒组件
4. 更新了 TabBar，添加了课程表入口
5. 使用模拟数据实现了功能演示

⚠️ **待完成**（需要创建数据模型后）：
1. 将模拟数据替换为真实数据库查询
2. 实现课程数据的增删改查功能
3. 实现作息时间数据的增删改查功能
4. 根据用户权限控制数据访问
5. 实现课程冲突检测
6. 支持多学期课程管理

## 注意事项

1. **节次映射**：课程表中的节次（1-7）需要与作息时间表中的时间范围对应
2. **学期管理**：需要支持多学期切换，每个学期的课程表和作息时间可能不同
3. **时间格式**：确保时间格式一致，建议统一使用 'HH:mm-HH:mm' 格式
4. **数据验证**：添加课程时需要验证时间段是否冲突
5. **权限控制**：使用 _openid 字段实现基于用户的数据隔离

## 实现建议

创建数据模型后，需要在以下位置进行修改：

1. **TeacherScheduleReminder.jsx**：将 loadTodaySchedule 函数中的模拟数据替换为数据库查询
2. **schedule-manage.jsx**：将 loadScheduleData 和 loadTimetableData 函数中的模拟数据替换为数据库查询
3. 添加真实的增删改查操作
4. 实现错误处理和加载状态
5. 添加数据验证逻辑
