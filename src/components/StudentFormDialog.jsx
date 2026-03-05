// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Plus, Trash2 } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

export function StudentFormDialog({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  isAdd
}) {
  const addFamilyMember = () => {
    setFormData({
      ...formData,
      family_members: [...(formData.family_members || []), {
        title: '',
        name: '',
        age: '',
        work_unit: '',
        position: '',
        phone: ''
      }]
    });
  };
  const removeFamilyMember = index => {
    const newMembers = [...(formData.family_members || [])];
    newMembers.splice(index, 1);
    setFormData({
      ...formData,
      family_members: newMembers
    });
  };
  const addResumeItem = () => {
    setFormData({
      ...formData,
      resume: [...(formData.resume || []), {
        start_end_date: '',
        description: '',
        witness: ''
      }]
    });
  };
  const removeResumeItem = index => {
    const newResume = [...(formData.resume || [])];
    newResume.splice(index, 1);
    setFormData({
      ...formData,
      resume: newResume
    });
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isAdd ? '新增学生' : '编辑学生信息'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="contact">联系方式</TabsTrigger>
            <TabsTrigger value="family">家庭信息</TabsTrigger>
            <TabsTrigger value="school">学籍信息</TabsTrigger>
            <TabsTrigger value="dorm">住宿信息</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>学号 *</Label>
                <Input value={formData.student_id || ''} onChange={e => setFormData({
                ...formData,
                student_id: e.target.value
              })} placeholder="请输入学号" disabled={!isAdd} />
              </div>
              <div>
                <Label>姓名 *</Label>
                <Input value={formData.name || ''} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} placeholder="请输入姓名" />
              </div>
              <div>
                <Label>性别 *</Label>
                <Select value={formData.gender || '男'} onValueChange={value => setFormData({
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>班级名称 *</Label>
                <Input value={formData.class_name || ''} onChange={e => setFormData({
                ...formData,
                class_name: e.target.value
              })} placeholder="请输入班级名称" />
              </div>
              <div>
                <Label>所属小组ID</Label>
                <Input value={formData.group_id || ''} onChange={e => setFormData({
                ...formData,
                group_id: e.target.value
              })} placeholder="请输入小组ID" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>出生日期</Label>
                <Input type="date" value={formData.date_of_birth || ''} onChange={e => setFormData({
                ...formData,
                date_of_birth: e.target.value
              })} />
              </div>
              <div>
                <Label>民族</Label>
                <Input value={formData.ethnicity || '汉族'} onChange={e => setFormData({
                ...formData,
                ethnicity: e.target.value
              })} placeholder="请输入民族" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>籍贯</Label>
                <Input value={formData.native_place || ''} onChange={e => setFormData({
                ...formData,
                native_place: e.target.value
              })} placeholder="请输入籍贯" />
              </div>
              <div>
                <Label>政治面貌</Label>
                <Select value={formData.political_status || '群众'} onValueChange={value => setFormData({
                ...formData,
                political_status: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="群众">群众</SelectItem>
                    <SelectItem value="共青团员">共青团员</SelectItem>
                    <SelectItem value="党员">党员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>班干部职务</Label>
                <Input value={formData.position || ''} onChange={e => setFormData({
                ...formData,
                position: e.target.value
              })} placeholder="如：班长、学习委员等" />
              </div>
              <div>
                <Label>身高(cm)</Label>
                <Input type="number" value={formData.height || ''} onChange={e => setFormData({
                ...formData,
                height: e.target.value
              })} placeholder="请输入身高" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div>
              <Label>个人手机号 *</Label>
              <Input value={formData.phone_number || ''} onChange={e => setFormData({
              ...formData,
              phone_number: e.target.value
            })} placeholder="请输入个人手机号" />
            </div>

            <div>
              <Label>家长手机号 *</Label>
              <Input value={formData.parent_phone_number || ''} onChange={e => setFormData({
              ...formData,
              parent_phone_number: e.target.value
            })} placeholder="请输入家长手机号" />
            </div>

            <div>
              <Label>身份证号（加密存储）</Label>
              <Input value={formData.id_card_number || ''} onChange={e => setFormData({
              ...formData,
              id_card_number: e.target.value
            })} placeholder="请输入身份证号" />
            </div>

            <div>
              <Label>家庭住址</Label>
              <Input value={formData.home_address || ''} onChange={e => setFormData({
              ...formData,
              home_address: e.target.value
            })} placeholder="请输入家庭住址" />
            </div>

            <div>
              <Label>邮政编码</Label>
              <Input value={formData.postal_code || ''} onChange={e => setFormData({
              ...formData,
              postal_code: e.target.value
            })} placeholder="请输入邮政编码" />
            </div>
          </TabsContent>

          <TabsContent value="family" className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label>家庭主要成员</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              </div>

              <div className="space-y-4">
                {(formData.family_members || []).map((member, index) => <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFamilyMember(index)} className="absolute top-2 right-2 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>称谓</Label>
                        <Input value={member.title || ''} onChange={e => {
                      const newMembers = [...formData.family_members];
                      newMembers[index].title = e.target.value;
                      setFormData({
                        ...formData,
                        family_members: newMembers
                      });
                    }} placeholder="如：父亲、母亲" />
                      </div>
                      <div>
                        <Label>姓名</Label>
                        <Input value={member.name || ''} onChange={e => {
                      const newMembers = [...formData.family_members];
                      newMembers[index].name = e.target.value;
                      setFormData({
                        ...formData,
                        family_members: newMembers
                      });
                    }} placeholder="请输入姓名" />
                      </div>
                      <div>
                        <Label>年龄</Label>
                        <Input type="number" value={member.age || ''} onChange={e => {
                      const newMembers = [...formData.family_members];
                      newMembers[index].age = e.target.value;
                      setFormData({
                        ...formData,
                        family_members: newMembers
                      });
                    }} placeholder="请输入年龄" />
                      </div>
                      <div>
                        <Label>联系电话</Label>
                        <Input value={member.phone || ''} onChange={e => {
                      const newMembers = [...formData.family_members];
                      newMembers[index].phone = e.target.value;
                      setFormData({
                        ...formData,
                        family_members: newMembers
                      });
                    }} placeholder="请输入联系电话" />
                      </div>
                      <div>
                        <Label>工作单位</Label>
                        <Input value={member.work_unit || ''} onChange={e => {
                      const newMembers = [...formData.family_members];
                      newMembers[index].work_unit = e.target.value;
                      setFormData({
                        ...formData,
                        family_members: newMembers
                      });
                    }} placeholder="请输入工作单位" />
                      </div>
                      <div>
                        <Label>职务</Label>
                        <Input value={member.position || ''} onChange={e => {
                      const newMembers = [...formData.family_members];
                      newMembers[index].position = e.target.value;
                      setFormData({
                        ...formData,
                        family_members: newMembers
                      });
                    }} placeholder="请输入职务" />
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="school" className="space-y-4">
            <div>
              <Label>学籍信息ID</Label>
              <Input value={formData.student_record_id || ''} onChange={e => setFormData({
              ...formData,
              student_record_id: e.target.value
            })} placeholder="请输入学籍信息ID" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>入学日期</Label>
                <Input type="date" value={formData.enrollment_date || ''} onChange={e => setFormData({
                ...formData,
                enrollment_date: e.target.value
              })} />
              </div>
              <div>
                <Label>毕业学校</Label>
                <Input value={formData.graduated_from || ''} onChange={e => setFormData({
                ...formData,
                graduated_from: e.target.value
              })} placeholder="请输入毕业学校" />
              </div>
            </div>

            <div>
              <Label>健康状况</Label>
              <Select value={formData.health_status || '良好'} onValueChange={value => setFormData({
              ...formData,
              health_status: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="良好">良好</SelectItem>
                  <SelectItem value="一般">一般</SelectItem>
                  <SelectItem value="较差">较差</SelectItem>
                  <SelectItem value="有特殊病史">有特殊病史</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>当前总积分</Label>
                <Input type="number" value={formData.current_score || 100} onChange={e => setFormData({
                ...formData,
                current_score: Number(e.target.value)
              })} placeholder="请输入当前总积分" />
              </div>
              <div>
                <Label>学期初始分</Label>
                <Input type="number" value={formData.initial_score || 100} onChange={e => setFormData({
                ...formData,
                initial_score: Number(e.target.value)
              })} placeholder="请输入学期初始分" />
              </div>
            </div>

            <div>
              <Label>积分等级</Label>
              <Select value={formData.score_level || 'A'} onValueChange={value => setFormData({
              ...formData,
              score_level: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A（优秀）</SelectItem>
                  <SelectItem value="B">B（良好）</SelectItem>
                  <SelectItem value="C">C（中等）</SelectItem>
                  <SelectItem value="D">D（较差）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>奖惩情况</Label>
              <textarea className="w-full p-3 border border-gray-200 rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-orange-500" value={formData.awards_and_punishments || ''} onChange={e => setFormData({
              ...formData,
              awards_and_punishments: e.target.value
            })} placeholder="请输入奖惩情况" />
            </div>

            <div>
              <Label>班主任意见</Label>
              <textarea className="w-full p-3 border border-gray-200 rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-orange-500" value={formData.head_teacher_opinion || ''} onChange={e => setFormData({
              ...formData,
              head_teacher_opinion: e.target.value
            })} placeholder="请输入班主任意见" />
            </div>

            <div>
              <Label>学校意见</Label>
              <textarea className="w-full p-3 border border-gray-200 rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-orange-500" value={formData.school_opinion || ''} onChange={e => setFormData({
              ...formData,
              school_opinion: e.target.value
            })} placeholder="请输入学校意见" />
            </div>
          </TabsContent>

          <TabsContent value="dorm" className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_boarding" checked={formData.is_boarding || false} onChange={e => setFormData({
              ...formData,
              is_boarding: e.target.checked
            })} className="w-4 h-4" />
              <Label htmlFor="is_boarding">是否住宿生</Label>
            </div>

            {formData.is_boarding && <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>楼栋</Label>
                    <Input value={formData.dorm_info?.building || ''} onChange={e => setFormData({
                  ...formData,
                  dorm_info: {
                    ...(formData.dorm_info || {}),
                    building: e.target.value
                  }
                })} placeholder="如：1栋" />
                  </div>
                  <div>
                    <Label>房间号</Label>
                    <Input value={formData.dorm_info?.room || ''} onChange={e => setFormData({
                  ...formData,
                  dorm_info: {
                    ...(formData.dorm_info || {}),
                    room: e.target.value
                  }
                })} placeholder="如：101" />
                  </div>
                  <div>
                    <Label>床位号</Label>
                    <Input value={formData.dorm_info?.bed || ''} onChange={e => setFormData({
                  ...formData,
                  dorm_info: {
                    ...(formData.dorm_info || {}),
                    bed: e.target.value
                  }
                })} placeholder="如：1号" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>住宿积分</Label>
                    <Input type="number" value={formData.dorm_score || 100} onChange={e => setFormData({
                  ...formData,
                  dorm_score: Number(e.target.value)
                })} placeholder="请输入住宿积分" />
                  </div>
                  <div>
                    <Label>住宿初始分</Label>
                    <Input type="number" value={formData.dorm_initial_score || 100} onChange={e => setFormData({
                  ...formData,
                  dorm_initial_score: Number(e.target.value)
                })} placeholder="请输入住宿初始分" />
                  </div>
                </div>

                <div>
                  <Label>已折算到总积分的宿舍积分</Label>
                  <Input type="number" value={formData.dorm_converted_score || 0} onChange={e => setFormData({
                ...formData,
                dorm_converted_score: Number(e.target.value)
              })} placeholder="请输入已折算分数" />
                </div>
              </div>}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onSave} className="bg-orange-600 hover:bg-orange-700">
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}