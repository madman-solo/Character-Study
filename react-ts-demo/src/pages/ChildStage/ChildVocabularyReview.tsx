/**
 * ChildVocabularyReview Page
 * 少儿单词复习页 - 基于艾宾浩斯遗忘曲线的间隔重复复习
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useChildRewards, POINT_RULES } from "../../hooks/useChildRewards";
import useSpacedRepetition from "../../hooks/useSpacedRepetition";
import { getAllLearnedChildWords } from "../../services/spacedRepetitionService";
import ReviewCard from "./components/ReviewCard";
import SpacedRepetitionProgress from "./components/SpacedRepetitionProgress";
import type { ChildWord } from "../../types/vocabulary";
import "../../styles/ChildStageCss/ChildVocabularyReview.css";

const ChildVocabularyReview = () => {
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
    isChild: true,
    // 不限制等级，所有等级的单词都可以复习
    limit: 10,
  });

  const { addPoints } = useChildRewards(userId);
  const [showCompletion, setShowCompletion] = useState(false);

  // 所有已学单词（包括不需要复习的）
  const [allLearnedWords, setAllLearnedWords] = useState<any[]>([]);
  const [isLoadingAllWords, setIsLoadingAllWords] = useState(false);

  useEffect(() => {
    // Start session when component mounts
    if (!session && words.length > 0) {
      startSession();
    }
  }, [words, session, startSession]);

  useEffect(() => {
    // Check if review is complete
    // 只有当索引超出数组范围时（所有单词都已答题），才触发完成
    if (
      session &&
      currentWordIndex >= words.length &&
      session.wordsReviewed > 0
    ) {
      handleReviewComplete();
    }
  }, [currentWordIndex, words.length, session]);

  // 获取所有已学单词
  useEffect(() => {
    const fetchAllLearnedWords = async () => {
      setIsLoadingAllWords(true);
      try {
        // 不传grade参数，获取所有等级的已学单词
        const response = await getAllLearnedChildWords(userId);
        setAllLearnedWords(response.words || []);
      } catch (error) {
        console.error('Error fetching all learned words:', error);
      } finally {
        setIsLoadingAllWords(false);
      }
    };

    fetchAllLearnedWords();
  }, [userId]);

  const handleCorrect = async () => {
    await submitAnswer(true);

    // Award points for correct answer
    addPoints(POINT_RULES.CORRECT_ANSWER, "答对单词");
  };

  const handleWrong = async () => {
    await submitAnswer(false);
  };

  const handleReviewComplete = () => {
    const completedSession = endSession();

    if (completedSession) {
      // Award bonus points for completing review session
      addPoints(POINT_RULES.STUDY_10MIN, "完成复习");
      setShowCompletion(true);
    }
  };

  const handleBackToBook = () => {
    navigate("/child-vocabulary-book");
  };

  const handleRestart = () => {
    resetSession();
    setShowCompletion(false);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="child-vocab-review-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载复习单词中...</p>
        </div>
      </div>
    );
  }

  if (error || words.length === 0) {
    return (
      <div className="child-vocab-review-page">
        {/* Navigation Bar */}
        <div className="review-navbar">
          <button className="nav-back-btn" onClick={handleBackToBook}>
            ← 返回单词本
          </button>
          <h1 className="nav-title">单词复习</h1>
        </div>

        {/* Empty State Message */}
        <div className="empty-message">
          <div className="empty-icon">📚</div>
          <h2>暂无需要复习的单词</h2>
          <p>{error || "你已经完成了所有单词的复习！"}</p>
        </div>

        {/* All Learned Words Section */}
        {allLearnedWords.length > 0 && (
          <div className="all-words-section">
            <h3 className="section-title">📖 所有已学单词 ({allLearnedWords.length})</h3>
            <div className="words-grid">
              {allLearnedWords.map((item: any) => (
                <div key={item.word.id} className="word-card">
                  <div className="word-header">
                    <span className="word-text">{item.word.word}</span>
                    <span className="word-phonetic">{item.word.phonetic}</span>
                  </div>
                  <div className="word-translation">{item.word.translation}</div>
                  <div className="word-progress">
                    <div className="progress-stats">
                      <span className="stat correct">✓ {item.progress.correctCount}</span>
                      <span className="stat wrong">✗ {item.progress.wrongCount}</span>
                    </div>
                    <div className="next-review">
                      {item.progress.mastered ? (
                        <span className="mastered-badge">✨ 已掌握</span>
                      ) : item.progress.isDue ? (
                        <span className="due-badge">🔔 需要复习</span>
                      ) : (
                        <span className="next-review-time">
                          下次复习: {new Date(item.progress.nextReview).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State for All Words */}
        {isLoadingAllWords && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载已学单词中...</p>
          </div>
        )}

        {/* No Words Learned Yet */}
        {!isLoadingAllWords && allLearnedWords.length === 0 && (
          <div className="no-words-message">
            <p>你还没有学习过任何单词，快去单词本开始学习吧！</p>
            <button className="start-learning-btn" onClick={handleBackToBook}>
              开始学习
            </button>
          </div>
        )}
      </div>
    );
  }

  if (showCompletion && session) {
    return (
      <div className="child-vocab-review-page">
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
            <button className="action-btn" onClick={handleBackToBook}>
              返回单词本
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="child-vocab-review-page">
      {/* Navigation Bar */}
      <div className="child-vocab-review-navbar">
        <button className="nav-back-btn" onClick={handleBackToBook}>
          ← 返回
        </button>
        <h1 className="nav-title">单词复习</h1>
        <div className="nav-info">
          第 {currentWordIndex + 1} / {words.length} 个
        </div>
      </div>

      {/* Progress Section */}
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

      {/* Review Card Section */}
      <div className="review-section">
        {currentWord && (
          <ReviewCard
            word={currentWord as ChildWord}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            showImage={true}
            animationsEnabled={true}
          />
        )}
      </div>

      {/* Statistics Info */}
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

export default ChildVocabularyReview;
