// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { User, Phone, Mail, MapPin, GraduationCap, Home, Award, Activity } from 'lucide-react';

export function StudentDetail({
  student,
  onEdit,
  onClose
}) {
  if (!student) return null;
  const calculateScoreLevel = score => {
    if (score >= 90) return {
      label: '优秀',
      color: 'bg-green-500'
    };
    if (score >= 80) return {
      label: '良好',
      color: 'bg-blue-500'
    };
    if (score >= 70) return {
      label: '中等',
      color: 'bg-yellow-500'
    };
    if (score >= 60) return {
      label: '及格',
      color: 'bg-orange-500'
    };
    return {
      label: '需努力',
      color: 'bg-red-500'
    };
  };
  const scoreLevel = calculateScoreLevel(student.current_score || 0);
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold text-2xl">
                {student.name ? student.name.charAt(0) : '学'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-orange-100">学号: {student.student_id}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-white text-orange-500">{student.class_name}</Badge>
                  {student.position && <Badge variant="outline" className="text-white border-white">
                      {student.position}
                    </Badge>}
                  {student.is_boarding && <Badge variant="outline" className="text-white border-white">
                      住宿生
                    </Badge>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{student.current_score || 0}</div>
              <div className="text-sm text-orange-100">当前积分</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${scoreLevel.color} bg-opacity-80`}>
                {scoreLevel.label}
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <Tabs defaultValue="basic" className="p-6">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="contact">联系方式</TabsTrigger>
            <TabsTrigger value="family">家庭信息</TabsTrigger>
            <TabsTrigger value="education">教育背景</TabsTrigger>
            <TabsTrigger value="dorm">住宿信息</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center">
                  <User className="h-5 w-5 mr-2 text-orange-500" />
                  个人信息
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">性别:</span>
                    <span className="font-medium">{student.gender || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">民族:</span>
                    <span className="font-medium">{student.ethnicity || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">籍贯:</span>
                    <span className="font-medium">{student.native_place || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">政治面貌:</span>
                    <span className="font-medium">{student.political_status || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">出生日期:</span>
                    <span className="font-medium">{student.date_of_birth || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">健康状况:</span>
                    <span className="font-medium">{student.health_status || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">身高:</span>
                    <span className="font-medium">{student.height ? `${student.height}cm` : '-'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-orange-500" />
                  学籍信息
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">班级:</span>
                    <span className="font-medium">{student.class_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">班干部职务:</span>
                    <span className="font-medium">{student.position || '无'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">初始积分:</span>
                    <span className="font-medium">{student.initial_score || 100}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">当前积分:</span>
                    <span className={`font-medium font-bold ${scoreLevel.color.replace('bg-', 'text-')}`}>
                      {student.current_score || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">入学日期:</span>
                    <span className="font-medium">{student.enrollment_date || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">身份证号:</span>
                    <span className="font-medium font-mono text-xs">
                      {student.id_card_number || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-orange-500" />
              联系信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">个人手机号</div>
                <div className="font-medium font-mono">{student.phone_number || '-'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">家长手机号</div>
                <div className="font-medium font-mono">{student.parent_phone_number || '-'}</div>
              </div>
              <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">家庭住址</div>
                <div className="font-medium">{student.home_address || '-'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">邮政编码</div>
                <div className="font-medium font-mono">{student.postal_code || '-'}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="family" className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <Home className="h-5 w-5 mr-2 text-orange-500" />
              家庭主要成员
            </h3>
            {student.family_members && student.family_members.length > 0 ? <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">称谓</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">姓名</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">年龄</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">工作单位</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">职务</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">联系电话</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.family_members.map((member, index) => <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-sm">{member.relationship}</td>
                        <td className="py-2 px-3 text-sm font-medium">{member.name}</td>
                        <td className="py-2 px-3 text-sm">{member.age}</td>
                        <td className="py-2 px-3 text-sm">{member.work_unit}</td>
                        <td className="py-2 px-3 text-sm">{member.position}</td>
                        <td className="py-2 px-3 text-sm font-mono">{member.phone_number}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="text-center py-8 text-gray-400">暂无家庭信息</div>}
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">入学日期</div>
                <div className="font-medium">{student.enrollment_date || '-'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">毕业学校</div>
                <div className="font-medium">{student.graduated_from || '-'}</div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-700 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-orange-500" />
              个人简历
            </h3>
            {student.resume && student.resume.length > 0 ? <div className="space-y-3">
                {student.resume.map((item, index) => <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm">{item.period}</div>
                        <div className="text-sm text-gray-600 mt-1">{item.details}</div>
                        <div className="text-xs text-gray-400 mt-2">证明人: {item.reference}</div>
                      </div>
                    </div>
                  </div>)}
              </div> : <div className="text-center py-8 text-gray-400">暂无简历信息</div>}
          </TabsContent>

          <TabsContent value="dorm" className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-orange-500" />
              住宿信息
            </h3>
            {student.is_boarding ? <div className="space-y-4">
                {student.dorm_info && <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-sm text-orange-600 mb-1">楼栋</div>
                      <div className="font-bold text-lg">{student.dorm_info.building || '-'}</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-sm text-orange-600 mb-1">房间号</div>
                      <div className="font-bold text-lg">{student.dorm_info.room || '-'}</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-sm text-orange-600 mb-1">床位号</div>
                      <div className="font-bold text-lg">{student.dorm_info.bed || '-'}</div>
                    </div>
                  </div>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">住宿初始积分</div>
                    <div className="font-medium">{student.dorm_initial_score || 100}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">当前住宿积分</div>
                    <div className="font-medium">{student.dorm_score || 0}</div>
                  </div>
                </div>
              </div> : <div className="text-center py-8 text-gray-400">非住宿生</div>}
          </TabsContent>
        </Tabs>

        {/* 底部按钮 */}
        <div className="flex justify-between items-center p-6 bg-gray-50 border-t">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          <Button onClick={onEdit} className="bg-orange-500 hover:bg-orange-600">
            编辑信息
          </Button>
        </div>
      </div>
    </div>;
}