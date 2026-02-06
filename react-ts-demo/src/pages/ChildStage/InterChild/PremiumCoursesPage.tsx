/**
 * 精品课程页面
 * 系统化英语课程
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/PremiumCoursesPage.css";

interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: number;
  level: string;
}

const PremiumCoursesPage = () => {
  const navigate = useNavigate();

  const courses: Course[] = [
    {
      id: "1",
      title: "自然拼读课",
      description: "掌握字母发音规律，见词能读",
      icon: "🔤",
      lessons: 30,
      level: "入门",
    },
    {
      id: "2",
      title: "情景对话课",
      description: "日常生活场景英语对话练习",
      icon: "💬",
      lessons: 40,
      level: "初级",
    },
    {
      id: "3",
      title: "语法启蒙课",
      description: "轻松有趣的英语语法入门",
      icon: "📖",
      lessons: 35,
      level: "初级",
    },
    {
      id: "4",
      title: "阅读理解课",
      description: "提升英语阅读能力和理解力",
      icon: "📚",
      lessons: 45,
      level: "中级",
    },
    {
      id: "5",
      title: "写作训练课",
      description: "从单词到句子，再到短文写作",
      icon: "✍️",
      lessons: 38,
      level: "中级",
    },
    {
      id: "6",
      title: "听力强化课",
      description: "提高英语听力理解能力",
      icon: "👂",
      lessons: 42,
      level: "中级",
    },
    {
      id: "7",
      title: "口语表达课",
      description: "流利自信地用英语表达",
      icon: "🗣️",
      lessons: 50,
      level: "高级",
    },
    {
      id: "8",
      title: "综合提升课",
      description: "听说读写全面提升",
      icon: "🎯",
      lessons: 60,
      level: "高级",
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleCourseClick = (course: Course) => {
    alert(`课程: ${course.title}\n${course.description}\n功能开发中...`);
  };

  return (
    <div className="premium-courses-page">
      {/* 顶部导航 */}
      <div className="premium-courses-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">🎓 精品课程</h1>
        <div className="header-spacer"></div>
      </div>

      {/* 说明 */}
      <div className="premium-courses-intro">
        <p>系统化课程体系，循序渐进提升英语能力！</p>
      </div>

      {/* 课程网格 */}
      <div className="premium-courses-grid">
        {courses.map((course) => (
          <div
            key={course.id}
            className="course-card"
            onClick={() => handleCourseClick(course)}
          >
            <div className="course-icon">{course.icon}</div>
            <div className="course-info">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span>📝 {course.lessons} 课时</span>
                <span className="course-level">{course.level}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumCoursesPage;
