# 权限系统数据模型需求文档

## 概述
本文档说明了权限控制系统所需的数据模型结构。在创建数据模型之前，请仔细阅读本文档，确保数据结构符合系统需求。

## 数据模型清单

### 1. users（用户表）

**用途**：存储系统用户信息（管理员、教师、家长、学生）

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "user_id": "用户唯一标识（字符串）",
  "name": "用户姓名（字符串）",
  "nick_name": "用户昵称（字符串，可选）",
  "type": "用户类型（字符串）- 枚举值：admin/teacher/parent/student",
  "avatar_url": "用户头像URL（字符串，可选）",
  "phone": "手机号（字符串，可选）",
  "email": "邮箱（字符串，可选）",
  "status": "账号状态（字符串）- 枚举值：active/disabled/deleted",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- user_id（唯一索引）
- type
- status

**说明**：
- `user_id` 是用户的唯一标识，用于关联其他数据
- `type` 字段决定用户的角色和权限
- `status` 用于管理账号的启用/禁用状态

---

### 2. students（学生表）

**用途**：存储学生详细信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "student_id": "学生唯一标识（字符串）",
  "name": "学生姓名（字符串）",
  "gender": "性别（字符串）- 枚举值：male/female",
  "class_id": "班级ID（字符串）",
  "group_id": "分组ID（字符串，可选）",
  "seat_number": "座位号（字符串，可选）",
  "position": "职务（字符串，可选）",
  "phone": "联系电话（字符串，可选）",
  "address": "家庭住址（字符串，可选）",
  "parent_id": "关联家长用户ID（字符串，可选）",
  "enrollment_date": "入学日期（时间戳，可选）",
  "status": "学生状态（字符串）- 枚举值：active/graduated/transferred/suspended",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- student_id（唯一索引）
- class_id
- group_id
- parent_id
- status

**说明**：
- `parent_id` 关联到 users 表中的家长用户
- `class_id` 和 `group_id` 用于班级和分组管理

---

### 3. parents（家长关联表）

**用途**：存储家长与学生的关联关系

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "parent_id": "家长用户ID（字符串）",
  "student_id": "学生ID（字符串）",
  "relationship": "关系类型（字符串）- 枚举值：father/mother/grandparent/guardian",
  "is_primary": "是否主监护人（布尔值）",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- parent_id
- student_id
- parent_id + student_id（复合唯一索引）

**说明**：
- 一个家长可以关联多个学生
- 一个学生可以有多个家长
- `is_primary` 标识主监护人，用于默认联系

---

### 4. semesters（学期表）

**用途**：存储学期信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "semester_id": "学期唯一标识（字符串）",
  "name": "学期名称（字符串）- 如：2024-2025 第一学期",
  "start_date": "开始日期（时间戳）",
  "end_date": "结束日期（时间戳）",
  "is_active": "是否当前学期（布尔值）",
  "status": "状态（字符串）- 枚举值：active/archived",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- semester_id（唯一索引）
- is_active
- status

**说明**：
- 同一时间只有一个学期的 `is_active` 为 true
- `status` 用于学期归档管理

---

### 5. score_records（积分记录表）

**用途**：存储学生的积分变动记录

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "record_id": "记录唯一标识（字符串）",
  "student_id": "学生ID（字符串）",
  "points": "积分数值（整数）",
  "source_type": "来源类型（字符串）- 枚举值：academic/dorm/behavior/volunteer/other",
  "source_detail": "来源详情（字符串）",
  "description": "详细描述（字符串）",
  "semester_id": "所属学期ID（字符串）",
  "operator_id": "操作人用户ID（字符串）",
  "audit_status": "审核状态（字符串）- 枚举值：pending/approved/rejected",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- record_id（唯一索引）
- student_id
- semester_id
- operator_id
- audit_status
- created_at

**说明**：
- `points` 可以为正数或负数
- `source_type` 用于统计不同类型的积分
- `audit_status` 用于积分审核流程

---

### 6. classes（班级表）

**用途**：存储班级信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "class_id": "班级唯一标识（字符串）",
  "name": "班级名称（字符串）- 如：高一(1)班",
  "grade": "年级（字符串）",
  "head_teacher_id": "班主任用户ID（字符串）",
  "classroom": "教室（字符串，可选）",
  "status": "状态（字符串）- 枚举值：active/graduated",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- class_id（唯一索引）
- grade
- head_teacher_id
- status

**说明**：
- `head_teacher_id` 关联到 users 表中的教师
- `grade` 用于年级统计和筛选

---

### 7. groups（分组表）

**用途**：存储学生分组信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "group_id": "分组唯一标识（字符串）",
  "name": "分组名称（字符串）- 如：第一组、第二组",
  "class_id": "所属班级ID（字符串）",
  "leader_id": "组长学生ID（字符串，可选）",
  "member_count": "成员数量（整数）",
  "status": "状态（字符串）- 枚举值：active/inactive",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- group_id（唯一索引）
- class_id
- leader_id
- status

**说明**：
- 分组通常按班级组织
- `leader_id` 关联到 students 表

---

### 8. schedules（课程表表）

**用途**：存储课程安排信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "schedule_id": "课程表唯一标识（字符串）",
  "class_id": "班级ID（字符串）",
  "semester_id": "学期ID（字符串）",
  "week_day": "星期（整数）- 1-7",
  "period": "节次（整数）- 1-8",
  "subject_id": "科目ID（字符串，可选）",
  "teacher_id": "教师用户ID（字符串，可选）",
  "classroom": "教室（字符串，可选）",
  "status": "状态（字符串）- 枚举值：active/cancelled",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- schedule_id（唯一索引）
- class_id
- semester_id
- week_day + period（复合索引）
- teacher_id

**说明**：
- `week_day` 表示星期几（1=周一，7=周日）
- `period` 表示第几节课
- 同一时间同一教室只能有一节课

---

### 9. subjects（科目表）

**用途**：存储科目信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "subject_id": "科目唯一标识（字符串）",
  "name": "科目名称（字符串）- 如：语文、数学、英语",
  "code": "科目代码（字符串）- 如：CH、MA、EN",
  "description": "科目描述（字符串，可选）",
  "status": "状态（字符串）- 枚举值：active/inactive",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- subject_id（唯一索引）
- code（唯一索引）
- status

**说明**：
- `code` 用于简短标识科目

---

### 10. duty_records（值日记录表）

**用途**：存储学生值日记录

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "duty_id": "值日记录唯一标识（字符串）",
  "student_id": "学生ID（字符串）",
  "date": "值日日期（时间戳）",
  "type": "值日类型（字符串）- 枚举值：morning/afternoon/daily/weekly",
  "area": "值日区域（字符串）- 如：教室、走廊、卫生间",
  "status": "完成状态（字符串）- 枚举值：pending/completed/skipped",
  "score": "评分（整数，可选）",
  "remark": "备注（字符串，可选）",
  "checker_id": "检查人用户ID（字符串，可选）",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- duty_id（唯一索引）
- student_id
- date
- status

**说明**：
- `type` 用于区分不同类型的值日
- `checker_id` 关联到检查的老师或班干部

---

### 11. exchange_items（兑换物品表）

**用途**：存储积分兑换物品信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "item_id": "物品唯一标识（字符串）",
  "name": "物品名称（字符串）",
  "description": "物品描述（字符串，可选）",
  "points_required": "所需积分（整数）",
  "stock": "库存数量（整数）",
  "image_url": "物品图片URL（字符串，可选）",
  "category": "物品分类（字符串，可选）",
  "status": "状态（字符串）- 枚举值：active/out_of_stock/discontinued",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- item_id（唯一索引）
- category
- status

**说明**：
- `points_required` 是兑换该物品需要的积分
- `stock` 管理物品库存

---

### 12. exchange_records（兑换记录表）

**用途**：存储积分兑换记录

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "record_id": "兑换记录唯一标识（字符串）",
  "student_id": "学生ID（字符串）",
  "item_id": "物品ID（字符串）",
  "item_name": "物品名称（字符串）",
  "points_spent": "消费积分（整数）",
  "exchange_date": "兑换日期（时间戳）",
  "status": "状态（字符串）- 枚举值：pending/completed/cancelled",
  "operator_id": "操作人用户ID（字符串，可选）",
  "remark": "备注（字符串，可选）",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- record_id（唯一索引）
- student_id
- item_id
- exchange_date
- status

**说明**：
- 兑换成功后应扣减对应学生的积分
- `status` 用于兑换流程管理

---

### 13. grades（成绩表）

**用途**：存储学生成绩信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "grade_id": "成绩记录唯一标识（字符串）",
  "student_id": "学生ID（字符串）",
  "exam_id": "考试ID（字符串，可选）",
  "subject_id": "科目ID（字符串）",
  "score": "分数（浮点数）",
  "full_score": "满分（浮点数，可选）",
  "semester_id": "学期ID（字符串）",
  "exam_type": "考试类型（字符串）- 枚举值：midterm/final/monthly/quiz",
  "rank": "排名（整数，可选）",
  "remark": "备注（字符串，可选）",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- grade_id（唯一索引）
- student_id
- exam_id
- subject_id
- semester_id
- exam_type

**说明**：
- `exam_type` 区分不同类型的考试
- `rank` 可以在成绩录入后计算

---

### 14. certificates（证书表）

**用途**：存储学生获得的证书信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "certificate_id": "证书唯一标识（字符串）",
  "student_id": "学生ID（字符串）",
  "name": "证书名称（字符串）",
  "type": "证书类型（字符串）- 枚举值：academic/behavior/volunteer/other",
  "description": "证书描述（字符串，可选）",
  "award_date": "颁发日期（时间戳）",
  "issuer": "颁发机构（字符串，可选）",
  "image_url": "证书图片URL（字符串，可选）",
  "status": "状态（字符串）- 枚举值：active/revoked",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- certificate_id（唯一索引）
- student_id
- type
- award_date
- status

**说明**：
- `type` 用于证书分类统计
- `status` 可以用于证书撤销

---

### 15. volunteer_records（志愿时长记录表）

**用途**：存储学生志愿服务时长记录

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "record_id": "记录唯一标识（字符串）",
  "student_id": "学生ID（字符串）",
  "activity_name": "活动名称（字符串）",
  "duration": "服务时长（小时，浮点数）",
  "date": "服务日期（时间戳）",
  "description": "活动描述（字符串，可选）",
  "semester_id": "学期ID（字符串，可选）",
  "status": "状态（字符串）- 枚举值：pending/verified/rejected",
  "verifier_id": "审核人用户ID（字符串，可选）",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- record_id（唯一索引）
  - student_id
- semester_id
- date
- status

**说明**：
- `duration` 以小时为单位
- `verifier_id` 关联到审核的老师

---

### 16. discipline_records（违纪记录表）

**用途**：存储学生违纪记录

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "record_id": "记录唯一标识（字符串）",
  "student_id": "学生ID（字符串）",
  "type": "违纪类型（字符串）- 枚举值：minor/serious/severe",
  "description": "违纪描述（字符串）",
  "date": "违纪日期（时间戳）",
  "points_deducted": "扣除积分（整数，可选）",
  "punishment": "处罚措施（字符串，可选）",
  "recorder_id": "记录人用户ID（字符串）",
  "semester_id": "学期ID（字符串，可选）",
  "status": "状态（字符串）- 枚举值：active/appealed/resolved",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- record_id（唯一索引）
- student_id
- date
- semester_id
- type
- status

**说明**：
- `type` 表示违纪严重程度
- `points_deducted` 可与积分系统联动

---

### 17. documents（文档表）

**用途**：存储系统文档信息

**字段结构**：
```json
{
  "_id": "自动生成的唯一ID",
  "document_id": "文档唯一标识（字符串）",
  "name": "文档名称（字符串）",
  "type": "文档类型（字符串）- 枚举值：notice/rule/guide/other",
  "description": "文档描述（字符串，可选）",
  "file_url": "文件URL（字符串）",
  "file_size": "文件大小（字节，整数）",
  "uploader_id": "上传人用户ID（字符串）",
  "semester_id": "学期ID（字符串，可选）",
  "access_level": "访问级别（字符串）- 枚举值：public/teacher/admin",
  "download_count": "下载次数（整数）",
  "status": "状态（字符串）- 枚举值：active/archived",
  "created_at": "创建时间（时间戳）",
  "updated_at": "更新时间（时间戳）"
}

**索引**：
- document_id（唯一索引）
- type
- semester_id
- uploader_id
- access_level
- status

**说明**：
- `access_level` 控制文档的访问权限
- `download_count` 用于统计文档受欢迎程度

---

## 权限系统集成

### 用户角色与权限映射

系统通过 `users` 表中的 `type` 字段识别用户角色，然后根据 `lib/permissions.js` 中定义的权限规则控制访问。

**角色权限说明**：
1. **管理员（admin）**：拥有所有权限
2. **教师（teacher）**：拥有学生查看、成绩管理、班级事务等权限
3. **家长（parent）**：只能查看自己孩子的信息
4. **学生（student）**：只能查看自己的成绩和积分

### 权限检查流程

1. 用户登录时，从 `users` 表获取用户信息（包括 `type` 字段）
2. 根据用户角色确定可访问的页面列表
3. 导航栏根据权限过滤显示的菜单项
4. 页面加载时进行二次权限验证
5. 每个操作（增删改）前检查具体权限

### 家长端数据隔离

家长端通过 `parents` 表建立家长与学生的关联关系，家长登录后只能查看：
- 自己的孩子列表（通过 `parents` 表查询）
- 自己孩子的成绩、积分、证书等信息（通过 `student_id` 关联查询）

## 数据一致性要求

1. **主键关联**：所有表的 ID 字段（如 `student_id`, `user_id` 等）必须建立正确的关联关系
2. **软删除**：使用 `status` 字段标记删除状态，而不是物理删除数据
3. **时间戳**：所有表的 `created_at` 和 `updated_at` 字段必须正确维护
4. **枚举值**：严格按照文档中的枚举值定义数据，避免不一致
5. **索引优化**：为常用查询字段建立索引，提高查询性能

## 下一步操作

在创建数据模型时，请按照以下顺序创建：

1. **基础表**（优先级最高）
   - users
   - classes
   - semesters
   - subjects

2. **业务表**（核心功能）
   - students
   - parents
   - groups
   - score_records
   - schedules
   - grades

3. **扩展表**（增强功能）
   - duty_records
   - exchange_items
   - exchange_records
   - certificates
   - volunteer_records
   - discipline_records
   - documents

请严格按照本文档的数据结构创建数据模型，确保字段类型、枚举值和索引设置正确无误。