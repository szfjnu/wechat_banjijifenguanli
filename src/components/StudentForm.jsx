// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Plus, X } from 'lucide-react';

export function StudentForm({
  student,
  onSave,
  onCancel
}) {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    gender: '男',
    class_name: '',
    group_id: '',
    is_boarding: false,
    position: '',
    id_card_number: '',
    date_of_birth: '',
    phone_number: '',
    parent_phone_number: '',
    home_address: '',
    ethnicity: '汉族',
    native_place: '',
    political_status: '群众',
    postal_code: '',
    enrollment_date: '',
    graduated_from: '',
    health_status: '良好',
    height: '',
    dorm_info: {
      building: '',
      room: '',
      bed: ''
    }
  });
  const [familyMembers, setFamilyMembers] = useState([]);
  const [resume, setResume] = useState([]);
  const [newFamilyMember, setNewFamilyMember] = useState({
    relationship: '',
    name: '',
    age: '',
    work_unit: '',
    position: '',
    phone_number: ''
  });
  const [newResume, setNewResume] = useState({
    period: '',
    details: '',
    reference: ''
  });
  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id || '',
        name: student.name || '',
        gender: student.gender || '男',
        class_name: student.class_name || '',
        group_id: student.group_id || '',
        is_boarding: student.is_boarding || false,
        position: student.position || '',
        id_card_number: student.id_card_number || '',
        date_of_birth: student.date_of_birth || '',
        phone_number: student.phone_number || '',
        parent_phone_number: student.parent_phone_number || '',
        home_address: student.home_address || '',
        ethnicity: student.ethnicity || '汉族',
        native_place: student.native_place || '',
        political_status: student.political_status || '群众',
        postal_code: student.postal_code || '',
        enrollment_date: student.enrollment_date || '',
        graduated_from: student.graduated_from || '',
        health_status: student.health_status || '良好',
        height: student.height || '',
        dorm_info: student.dorm_info || {
          building: '',
          room: '',
          bed: ''
        }
      });
      setFamilyMembers(student.family_members || []);
      setResume(student.resume || []);
    }
  }, [student]);
  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      ...formData,
      family_members: familyMembers,
      resume: resume
    });
  };
  const addFamilyMember = () => {
    if (newFamilyMember.relationship && newFamilyMember.name) {
      setFamilyMembers([...familyMembers, newFamilyMember]);
      setNewFamilyMember({
        relationship: '',
        name: '',
        age: '',
        work_unit: '',
        position: '',
        phone_number: ''
      });
    } else {
      toast({
        title: '请填写完整信息',
        description: '家庭主要成员的称谓和姓名为必填项',
        variant: 'destructive'
      });
    }
  };
  const removeFamilyMember = index => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };
  const addResume = () => {
    if (newResume.period && newResume.details) {
      setResume([...resume, newResume]);
      setNewResume({
        period: '',
        details: '',
        reference: ''
      });
    } else {
      toast({
        title: '请填写完整信息',
        description: '个人简历的起止时间和详情为必填项',
        variant: 'destructive'
      });
    }
  };
  const removeResume = index => {
    setResume(resume.filter((_, i) => i !== index));
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          保存
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
          <TabsTrigger value="family">家庭信息</TabsTrigger>
          <TabsTrigger value="education">教育背景</TabsTrigger>
          <TabsTrigger value="dorm">住宿信息</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>学号 <span className="text-red-500">*</span></Label>
              <Input required value={formData.student_id} onChange={e => setFormData({
              ...formData,
              student_id: e.target.value
            })} placeholder="请输入学号" />
            </div>
            <div>
              <Label>姓名 <span className="text-red-500">*</span></Label>
              <Input required value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} placeholder="请输入姓名" />
            </div>
            <div>
              <Label>性别 <span className="text-red-500">*</span></Label>
              <Select value={formData.gender} onValueChange={value => setFormData({
              ...formData,
              gender: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="男">男</SelectItem>
                  <SelectItem value="女">女</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>班级 <span className="text-red-500">*</span></Label>
              <Input required value={formData.class_name} onChange={e => setFormData({
              ...formData,
              class_name: e.target.value
            })} placeholder="请输入班级" />
            </div>
            <div>
              <Label>身份证号</Label>
              <Input value={formData.id_card_number} onChange={e => setFormData({
              ...formData,
              id_card_number: e.target.value
            })} placeholder="请输入身份证号" />
            </div>
            <div>
              <Label>出生日期</Label>
              <Input type="date" value={formData.date_of_birth} onChange={e => setFormData({
              ...formData,
              date_of_birth: e.target.value
            })} />
            </div>
            <div>
              <Label>民族</Label>
              <Input value={formData.ethnicity} onChange={e => setFormData({
              ...formData,
              ethnicity: e.target.value
            })} placeholder="请输入民族" />
            </div>
            <div>
              <Label>籍贯</Label>
              <Input value={formData.native_place} onChange={e => setFormData({
              ...formData,
              native_place: e.target.value
            })} placeholder="请输入籍贯" />
            </div>
            <div>
              <Label>政治面貌</Label>
              <Select value={formData.political_status} onValueChange={value => setFormData({
              ...formData,
              political_status: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="群众">群众</SelectItem>
                  <SelectItem value="共青团员">共青团员</SelectItem>
                  <SelectItem value="中共党员">中共党员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>健康状况</Label>
              <Input value={formData.health_status} onChange={e => setFormData({
              ...formData,
              health_status: e.target.value
            })} placeholder="请输入健康状况" />
            </div>
            <div>
              <Label>身高 (cm)</Label>
              <Input type="number" value={formData.height} onChange={e => setFormData({
              ...formData,
              height: e.target.value
            })} placeholder="请输入身高" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>个人手机号</Label>
              <Input value={formData.phone_number} onChange={e => setFormData({
              ...formData,
              phone_number: e.target.value
            })} placeholder="请输入个人手机号" />
            </div>
            <div>
              <Label>家长手机号 <span className="text-red-500">*</span></Label>
              <Input required value={formData.parent_phone_number} onChange={e => setFormData({
              ...formData,
              parent_phone_number: e.target.value
            })} placeholder="请输入家长手机号" />
            </div>
            <div>
              <Label>家庭住址</Label>
              <Input value={formData.home_address} onChange={e => setFormData({
              ...formData,
              home_address: e.target.value
            })} placeholder="请输入家庭住址" />
            </div>
            <div>
              <Label>邮政编码</Label>
              <Input value={formData.postal_code} onChange={e => setFormData({
              ...formData,
              postal_code: e.target.value
            })} placeholder="请输入邮政编码" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">家庭主要成员</h3>
            <div className="grid grid-cols-6 gap-2">
              <Input placeholder="称谓" value={newFamilyMember.relationship} onChange={e => setNewFamilyMember({
              ...newFamilyMember,
              relationship: e.target.value
            })} />
              <Input placeholder="姓名" value={newFamilyMember.name} onChange={e => setNewFamilyMember({
              ...newFamilyMember,
              name: e.target.value
            })} />
              <Input type="number" placeholder="年龄" value={newFamilyMember.age} onChange={e => setNewFamilyMember({
              ...newFamilyMember,
              age: e.target.value
            })} />
              <Input placeholder="工作单位" value={newFamilyMember.work_unit} onChange={e => setNewFamilyMember({
              ...newFamilyMember,
              work_unit: e.target.value
            })} />
              <Input placeholder="职务" value={newFamilyMember.position} onChange={e => setNewFamilyMember({
              ...newFamilyMember,
              position: e.target.value
            })} />
              <Button type="button" onClick={addFamilyMember} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {familyMembers.length > 0 && <div className="space-y-2">
                {familyMembers.map((member, index) => <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="grid grid-cols-6 gap-2 text-sm">
                      <span>{member.relationship}</span>
                      <span>{member.name}</span>
                      <span>{member.age}岁</span>
                      <span>{member.work_unit}</span>
                      <span>{member.position}</span>
                      <span>{member.phone_number}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFamilyMember(index)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>)}
              </div>}
          </div>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>入学日期</Label>
              <Input type="date" value={formData.enrollment_date} onChange={e => setFormData({
              ...formData,
              enrollment_date: e.target.value
            })} />
            </div>
            <div>
              <Label>毕业学校</Label>
              <Input value={formData.graduated_from} onChange={e => setFormData({
              ...formData,
              graduated_from: e.target.value
            })} placeholder="请输入毕业学校" />
            </div>
          </div>
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">个人简历</h3>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="起止年月" value={newResume.period} onChange={e => setNewResume({
              ...newResume,
              period: e.target.value
            })} />
              <Input placeholder="在何地、何校、任何职" value={newResume.details} onChange={e => setNewResume({
              ...newResume,
              details: e.target.value
            })} />
              <div className="flex gap-2">
                <Input placeholder="证明人" value={newResume.reference} onChange={e => setNewResume({
                ...newResume,
                reference: e.target.value
              })} />
                <Button type="button" onClick={addResume} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {resume.length > 0 && <div className="space-y-2">
                {resume.map((item, index) => <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="grid grid-cols-3 gap-2 text-sm flex-1">
                      <span>{item.period}</span>
                      <span>{item.details}</span>
                      <span>证明人: {item.reference}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeResume(index)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>)}
              </div>}
          </div>
        </TabsContent>

        <TabsContent value="dorm" className="space-y-4">
          <div>
            <Label>是否住宿</Label>
            <Select value={formData.is_boarding ? 'true' : 'false'} onValueChange={value => setFormData({
            ...formData,
            is_boarding: value === 'true'
          })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">是</SelectItem>
                <SelectItem value="false">否</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.is_boarding && <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
              <div>
                <Label>楼栋</Label>
                <Input value={formData.dorm_info.building} onChange={e => setFormData({
              ...formData,
              dorm_info: {
                ...formData.dorm_info,
                building: e.target.value
              }
            })} placeholder="请输入楼栋" />
              </div>
              <div>
                <Label>房间号</Label>
                <Input value={formData.dorm_info.room} onChange={e => setFormData({
              ...formData,
              dorm_info: {
                ...formData.dorm_info,
                room: e.target.value
              }
            })} placeholder="请输入房间号" />
              </div>
              <div>
                <Label>床位号</Label>
                <Input type="number" value={formData.dorm_info.bed} onChange={e => setFormData({
              ...formData,
              dorm_info: {
                ...formData.dorm_info,
                bed: e.target.value
              }
            })} placeholder="请输入床位号" />
              </div>
            </div>}
        </TabsContent>
      </Tabs>
    </form>;
}