/**
 * VocabularyReview Page (Adult)
 * 成人单词复习页 - 基于艾宾浩斯遗忘曲线的间隔重复复习
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useSpacedRepetition from "../hooks/useSpacedRepetition";
import DictationInput from "./ChildStage/components/DictationInput";
import SpacedRepetitionProgress from "./ChildStage/components/SpacedRepetitionProgress";
import type { Word } from "../types/vocabulary";
import "../styles/VocabularyReview.css";

const VocabularyReview = () => {
  const { bookType } = useParams<{ bookType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const {
    words,
    currentWord,
    currentWordIndex,
    isLoading,
    error,
    session,
    statistics,
    submitAnswer,
    startSession,
    endSession,
    resetSession,
  } = useSpacedRepetition({
    userId,
    isChild: false,
    bookType: bookType || "初一",
    limit: 20,
  });

  const [showTranslation, setShowTranslation] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (!session && words.length > 0) {
      startSession();
    }
  }, [words, session, startSession]);

  useEffect(() => {
    if (
      session &&
      currentWordIndex >= words.length - 1 &&
      session.wordsReviewed > 0
    ) {
      handleReviewComplete();
    }
  }, [currentWordIndex, words.length, session]);

  const handlePlayAudio = () => {
    if (!currentWord) return;
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        (currentWord as Word).word,
      );
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (input: string) => {
    if (!currentWord) return;
    const isCorrect =
      input.toLowerCase() === (currentWord as Word).word.toLowerCase();
    await submitAnswer(isCorrect);
  };

  const handleReviewComplete = () => {
    endSession();
    setShowCompletion(true);
  };

  const handleBackToVocabulary = () => {
    navigate(`/vocabulary/${bookType}`);
  };

  const handleRestart = () => {
    resetSession();
    setShowCompletion(false);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="vocabulary-review-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载复习单词中...</p>
        </div>
      </div>
    );
  }

  if (error || words.length === 0) {
    return (
      <div className="vocabulary-review-page">
        <div className="empty-container">
          <div className="empty-icon">📚</div>
          <h2>暂无需要复习的单词</h2>
          <p>{error || "你已经完成了所有单词的复习！"}</p>
          <button className="back-btn" onClick={handleBackToVocabulary}>
            返回单词本
          </button>
        </div>
      </div>
    );
  }

  if (showCompletion && session) {
    return (
      <div className="vocabulary-review-page">
        <div className="completion-container">
          <div className="completion-icon">🎉</div>
          <h2>复习完成！</h2>
          <div className="completion-stats">
            <div className="stat-item">
              <span className="stat-label">复习单词：</span>
              <span className="stat-value">{session.wordsReviewed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">正确：</span>
              <span className="stat-value correct">
                {session.correctAnswers}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">错误：</span>
              <span className="stat-value wrong">{session.wrongAnswers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">准确率：</span>
              <span className="stat-value">{session.accuracy}%</span>
            </div>
          </div>
          <div className="completion-actions">
            <button className="action-btn primary" onClick={handleRestart}>
              再复习一次
            </button>
            <button className="action-btn" onClick={handleBackToVocabulary}>
              返回单词本
            </button>
          </div>
        </div>
      </div>
    );
  }

  const word = currentWord as Word;

  return (
    <div className="vocabulary-review-page">
      <div className="vocabulary-review-navbar">
        <button className="nav-back-btn" onClick={handleBackToVocabulary}>
          ← 返回
        </button>
        <h1 className="nav-title">单词复习 - {bookType}</h1>
        <div className="nav-info">
          第 {currentWordIndex + 1} / {words.length} 个
        </div>
      </div>

      {session && (
        <div className="progress-section">
          <SpacedRepetitionProgress
            totalWords={words.length}
            reviewedWords={session.wordsReviewed}
            correctCount={session.correctAnswers}
            wrongCount={session.wrongAnswers}
            accuracy={session.accuracy}
          />
        </div>
      )}

      <div className="review-section">
        {word && (
          <div className="review-card">
            <div className="word-display">
              <button className="audio-btn" onClick={handlePlayAudio}>
                🔊 听发音
              </button>
              <button
                className="translation-btn"
                onClick={() => setShowTranslation(!showTranslation)}
              >
                {showTranslation ? "隐藏翻译" : "显示翻译"}
              </button>
              {showTranslation && (
                <div className="translation-display">
                  <p className="translation-text">{word.translation}</p>
                  {word.definition && (
                    <p className="definition-text">{word.definition}</p>
                  )}
                </div>
              )}
            </div>

            <div className="dictation-section">
              <h3>请拼写这个单词</h3>
              <p className="hint">💡 提示：单词有 {word.word.length} 个字母</p>
              {word.phonetic && (
                <p className="phonetic-hint">音标：{word.phonetic}</p>
              )}
              <DictationInput
                onSubmit={handleSubmit}
                placeholder="输入单词..."
                correctAnswer={word.word}
                showFeedback={true}
              />
            </div>
          </div>
        )}
      </div>

      {statistics && (
        <div className="statistics-info">
          <p>📊 总计 {statistics.total} 个单词</p>
          <p>✓ 已掌握 {statistics.mastered} 个</p>
          <p>📝 学习中 {statistics.learning} 个</p>
        </div>
      )}
    </div>
  );
};

export default VocabularyReview;
