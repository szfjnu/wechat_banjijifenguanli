// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Cake, User } from 'lucide-react';
// @ts-ignore;
import { Card } from '@/components/ui';
// @ts-ignore;
import { getBeijingDateString, getBeijingTime } from '@/lib/utils';

export function BirthdayReminder(props) {
  const {
    $w
  } = props;
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadBirthdays();
  }, []);
  const loadBirthdays = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取今天的日期（北京时区）
      const today = getBeijingDateString();
      const beijingTime = getBeijingTime();
      const currentMonth = String(beijingTime.getMonth() + 1).padStart(2, '0');
      const currentDay = String(beijingTime.getDate()).padStart(2, '0');
      const todayMD = `${currentMonth}-${currentDay}`; // 格式: "03-17"

      // 查询今天生日的学生
      const result = await db.collection('students').get();
      if (result && result.data) {
        const todayBirthdays = result.data.filter(student => {
          if (!student.birthday) return false;
          try {
            const birthdayDate = new Date(student.birthday);
            const birthdayMonth = String(birthdayDate.getMonth() + 1).padStart(2, '0');
            const birthdayDay = String(birthdayDate.getDate()).padStart(2, '0');
            return `${birthdayMonth}-${birthdayDay}` === todayMD;
          } catch (e) {
            return false;
          }
        }).map(student => ({
          student_id: student.student_id,
          name: student.name,
          birthday: student.birthday,
          age: calculateAge(student.birthday),
          class_name: student.class_name
        }));
        setBirthdays(todayBirthdays);
      }
    } catch (error) {
      console.error('加载生日信息失败:', error);
    } finally {
      setLoading(false);
    }
  };
  const calculateAge = birthday => {
    const today = getBeijingTime();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birthDate.getDate()) {
      age--;
    }
    return age;
  };
  if (loading) {
    return <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Card>;
  }
  if (birthdays.length === 0) {
    return null; // 没有生日时不显示
  }
  return <Card className="mb-6 border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-bold text-pink-700">
              今日生日提醒 {birthdays.length > 0 && `(${birthdays.length}人)`}
            </h3>
          </div>
          <span className="text-sm text-pink-600 font-medium">
            {getBeijingDateString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {birthdays.map((student, index) => <div key={student.student_id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-pink-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{student.name}</div>
                <div className="text-sm text-gray-500">
                  {student.class_name} · {student.age}岁
                </div>
              </div>
              <div className="text-2xl">🎂</div>
            </div>)}
        </div>
      </div>
    </Card>;
}