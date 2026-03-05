# 学生信息管理 - 数据模型需求说明

## 概述
学生信息管理页面需要更完整的学生基础信息数据模型。当前 `students` 集合仅包含部分字段，需要添加以下字段以支持完整的学生信息管理功能。

## 当前已有字段
从现有数据中识别到的字段：
- `_id` - 唯一标识
- `student_id` - 学号
- `name` - 姓名
- `gender` - 性别
- `class_name` - 班级名称
- `is_boarding` - 是否住宿生
- `position` - 班干部职务
- `current_score` - 当前总积分
- `initial_score` - 学期初始分
- `phone_number` - 个人手机号
- `parent_phone_number` - 家长手机号
- `created_at` - 创建时间
- `updated_at` - 更新时间
- `dorm_info` - 住宿信息对象（包含 building, room, bed）
- `dorm_score` - 住宿积分
- `dorm_initial_score` - 住宿初始分

## 需要添加的字段

### 基本信息
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `group_id` | string | 否 | 所属小组ID |
| `student_record_id` | string | 否 | 学籍信息ID |
| `id_card` | string | 否 | 身份证号（加密存储） |
| `birth_date` | date | 否 | 出生日期 |
| `family_address` | string | 否 | 家庭住址 |
| `nation` | string | 否 | 民族（默认：汉族） |
| `native_place` | string | 否 | 籍贯 |
| `political_status` | string | 否 | 政治面貌（默认：群众） |
| `postal_code` | string | 否 | 邮政编码 |
| `enrollment_date` | date | 否 | 入学日期 |
| `graduated_school` | string | 否 | 毕业学校 |
| `health_status` | string | 否 | 健康状况（良好/一般/较差/有特殊病史） |
| `height` | number | 否 | 身高(cm) |

### 家庭信息（数组）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `family_members` | array | 家庭主要成员列表 |
| - `family_members[].title` | string | 称谓（如：父亲、母亲） |
| - `family_members[].name` | string | 姓名 |
| - `family_members[].age` | number | 年龄 |
| - `family_members[].work_unit` | string | 工作单位 |
| - `family_members[].position` | string | 职务 |
| - `family_members[].phone` | string | 联系电话 |

### 个人简历（数组）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `personal_resume` | array | 个人简历列表 |
| - `personal_resume[].start_end_date` | string | 起止年月 |
| - `personal_resume[].description` | string | 在何地何校任何职 |
| - `personal_resume[].witness` | string | 证明人 |

### 奖惩与评价
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `awards_punishments` | text | 奖惩情况 |
| `class_teacher_opinion` | text | 班主任意见 |
| `school_opinion` | text | 学校意见 |
| `score_level` | string | 积分等级（A/B/C/D） |

### 住宿积分相关
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `converted_dorm_score` | number | 已折算到总积分的宿舍积分 |

## 操作历史表（新表）

### student_operation_history
用于记录学生信息的操作历史，方便追溯和审计。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `_id` | string | 是 | 唯一标识 |
| `student_id` | string | 是 | 学生学号 |
| `operation_type` | string | 是 | 操作类型（新增/修改/删除） |
| `operation_details` | text | 是 | 操作详情 |
| `operation_by` | string | 是 | 操作人姓名 |
| `created_at` | datetime | 是 | 操作时间 |

## 索引建议

### students 表
1. `student_id` - 唯一索引（学号唯一）
2. `class_name` - 普通索引（按班级查询）
3. `group_id` - 普通索引（按小组查询）
4. `is_boarding` - 普通索引（按住宿状态查询）

### student_operation_history 表
1. `student_id` - 普通索引（按学生查询）
2. `created_at` - 普通索引（按时间排序）

## 使用说明

创建这些字段后，学生信息管理页面将能够：
1. 完整记录学生的所有基本信息
2. 管理家庭成员信息和联系信息
3. 记录个人简历和教育经历
4. 管理住宿信息和积分
5. 追踪所有操作历史
6. 支持按学号、姓名、班级等多维度搜索

## 实现状态

✅ 已完成：
- 页面 UI 和交互逻辑
- 表单组件（新增/编辑）
- 详情查看组件
- 操作历史组件
- 数据加载和保存功能
- 搜索和分页功能

⚠️ 待完成（创建数据模型后）：
- 确认所有字段都已添加到 students 表
- 创建 student_operation_history 表
- 添加必要的索引
- 测试完整的增删改查功能
