// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { User, Phone, MapPin, Calendar, BookOpen, Award, Home, GraduationCap } from 'lucide-react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

function InfoItem({
  label,
  value,
  icon: Icon
}) {
  return <div className="flex items-start gap-2">
      {Icon && <Icon className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />}
      <div className="flex-1">
        <span className="text-sm text-gray-600 block mb-1">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value || '-'}</span>
      </div>
    </div>;
}
export function StudentViewDialog({
  isOpen,
  onClose,
  student
}) {
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>学生详细信息</DialogTitle>
        </DialogHeader>

        {student && <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="contact">联系方式</TabsTrigger>
              <TabsTrigger value="school">学籍信息</TabsTrigger>
              <TabsTrigger value="dorm">住宿信息</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="学号" value={student.student_id} icon={User} />
                <InfoItem label="姓名" value={student.name} icon={User} />
                <InfoItem label="性别" value={student.gender} />
                <InfoItem label="班级" value={student.class_name} />
                <InfoItem label="所属小组ID" value={student.group_id || '-'} />
                <InfoItem label="班干部职务" value={student.position || '-'} />
                <InfoItem label="出生日期" value={student.date_of_birth || '-'} icon={Calendar} />
                <InfoItem label="民族" value={student.ethnicity || '-'} />
                <InfoItem label="籍贯" value={student.native_place || '-'} icon={MapPin} />
                <InfoItem label="政治面貌" value={student.political_status || '-'} />
                <InfoItem label="身高" value={student.height ? `${student.height}cm` : '-'} />
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">家庭主要成员</h4>
                {student.family_members && student.family_members.length > 0 ? <div className="space-y-3">
                    {student.family_members.map((member, index) => <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">称谓：</span>
                            <span className="font-medium">{member.title || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">姓名：</span>
                            <span className="font-medium">{member.name || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">年龄：</span>
                            <span className="font-medium">{member.age || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">联系电话：</span>
                            <span className="font-medium">{member.phone || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">工作单位：</span>
                            <span className="font-medium">{member.work_unit || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">职务：</span>
                            <span className="font-medium">{member.position || '-'}</span>
                          </div>
                        </div>
                      </div>)}
                  </div> : <p className="text-sm text-gray-500">暂无家庭信息</p>}
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-3">
              <InfoItem label="个人手机号" value={student.phone_number || '-'} icon={Phone} />
              <InfoItem label="家长手机号" value={student.parent_phone_number || '-'} icon={Phone} />
              <InfoItem label="身份证号" value={student.id_card || '-'} />
              <InfoItem label="家庭住址" value={student.family_address || '-'} icon={MapPin} />
              <InfoItem label="邮政编码" value={student.postal_code || '-'} />
            </TabsContent>

            <TabsContent value="school" className="space-y-3">
              <InfoItem label="学籍信息ID" value={student.student_record_id || '-'} icon={BookOpen} />
              <InfoItem label="入学日期" value={student.enrollment_date || '-'} icon={Calendar} />
              <InfoItem label="毕业学校" value={student.graduated_from || '-'} icon={GraduationCap} />
              <InfoItem label="健康状况" value={student.health_status || '-'} />
              <InfoItem label="当前总积分" value={student.current_score || '-'} icon={Award} />
              <InfoItem label="学期初始分" value={student.initial_score || '-'} />
              <InfoItem label="积分等级" value={student.score_level || '-'} />

              {student.awards_and_punishments && <div className="border-t border-gray-200 pt-3 mt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">奖惩情况</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{student.awards_and_punishments}</p>
                </div>}

              {student.head_teacher_opinion && <div className="border-t border-gray-200 pt-3 mt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">班主任意见</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{student.head_teacher_opinion}</p>
                </div>}

              {student.school_opinion && <div className="border-t border-gray-200 pt-3 mt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">学校意见</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{student.school_opinion}</p>
                </div>}
            </TabsContent>

            <TabsContent value="dorm" className="space-y-3">
              <InfoItem label="是否住宿生" value={student.is_boarding ? '是' : '否'} />
              {student.is_boarding && student.dorm_info && <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">住宿信息</h4>
                    <div className="bg-orange-50 p-4 rounded-lg space-y-2">
                      <InfoItem label="楼栋" value={student.dorm_info.building || '-'} icon={Home} />
                      <InfoItem label="房间号" value={student.dorm_info.room || '-'} icon={Home} />
                      <InfoItem label="床位号" value={student.dorm_info.bed || '-'} icon={Home} />
                    </div>
                  </div>
                  <InfoItem label="住宿积分" value={student.dorm_score || '-'} />
                  <InfoItem label="住宿初始分" value={student.dorm_initial_score || '-'} />
                  <InfoItem label="已折算到总积分的宿舍积分" value={student.converted_dorm_score || '0'} />
                </>}
            </TabsContent>
          </Tabs>}
      </DialogContent>
    </Dialog>;
}