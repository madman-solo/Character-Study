/**
 * ChildWordDetail Page
 * 单词详情页 - 显示单词的详细信息和互动学习
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ChildWord } from "../../types/vocabulary";
import {
  fetchChildWord,
  getWordImageUrl,
} from "../../services/childVocabularyService";
import "../../styles/ChildStageCss/ChildWordDetail.css";

const ChildWordDetail = () => {
  const { word: wordParam } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const [word, setWord] = useState<ChildWord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wordParam) {
      loadWord(wordParam);
    }
  }, [wordParam]);

  const loadWord = async (wordText: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedWord = await fetchChildWord(wordText);
      setWord(fetchedWord);
    } catch (err) {
      console.error("Error loading word:", err);
      setError("加载单词失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (!word) return;
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="child-word-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="child-word-detail-page">
        <div className="error-container">
          <div className="error-icon">😢</div>
          <h2>{error || "未找到单词"}</h2>
          <button className="back-btn" onClick={() => navigate(-1)}>
            返回
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getWordImageUrl(word);

  return (
    <div className="child-word-detail-page">
      {/* Navigation Bar */}
      <div className="child-word-detail-navbar">
        <button className="nav-back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 className="nav-title">单词详情</h1>
        <div className="nav-spacer"></div>
      </div>

      {/* Main Content */}
      <div className="child-word-detail-content">
        {/* Word Display Section */}
        <div className="word-display-section">
          <div className="word-image-container">
            <div
              className="word-image"
              style={{ backgroundImage: `url(${imageUrl})` }}
            >
              <div className="word-image-overlay">
                <div className="word-emoji">
                  {imageUrl.includes("data:image/svg") &&
                    imageUrl.match(/>(.*?)<\/text>/)?.[1]}
                </div>
              </div>
            </div>
          </div>

          <div className="word-info-container">
            <h2 className="word-text">{word.word}</h2>
            <p className="word-phonetic">{word.phonetic}</p>
            <p className="word-translation">{word.translation}</p>
            {word.pos && <p className="word-pos">词性: {word.pos}</p>}

            <button className="audio-btn" onClick={handlePlayAudio}>
              <span className="audio-icon">🔊</span>
              <span className="audio-text">听发音</span>
            </button>
          </div>
        </div>

        {/* Interactive Section */}
        <div className="interactive-section">
          <h3 className="section-title">互动学习</h3>
          <div className="interactive-cards">
            <div className="interactive-card">
              <div className="card-icon">✍️</div>
              <h4>练习拼写</h4>
              <p>多次书写加深记忆</p>
            </div>
            <div className="interactive-card">
              <div className="card-icon">🎤</div>
              <h4>跟读练习</h4>
              <p>模仿标准发音</p>
            </div>
            <div className="interactive-card">
              <div className="card-icon">🎮</div>
              <h4>单词游戏</h4>
              <p>趣味学习单词</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildWordDetail;
