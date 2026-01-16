//todo: 0~12岁 英文学习扩充页面
import React from "react";
import { useNavigate } from "react-router-dom";
const ChildEnglish: React.FC = () => {
  return (
    <div className="placeholder-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← 返回
      </button>
      <div className="placeholder-content">
        <h2>0~12岁 英文学习扩充页面</h2>
        <p>
          这里是0~12岁儿童的英文学习扩充页面。您可以在这个页面上学习更多的英文单词、短语和句子。
        </p>
      </div>
    </div>
  );
};
export default ChildEnglish;
