/**
 * ChildVocabularyBook Page
 * 少儿单词本主页 - 26个字母动画 + 特色单词展示
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useChildLearning } from "../../hooks/useChildLearning";
import { useActivityTracker } from "../../hooks/useActivityTracker";
import { useChildSound } from "../../hooks/useChildSound";
import AlphabetAnimation from "./components/AlphabetAnimation";
import VocabularyWordCard from "./components/VocabularyWordCard";
import ChangeWordModal from "./components/ChangeWordModal";
import WordLearningModal from "./components/WordLearningModal";
import type { ChildWord } from "../../types/vocabulary";
import { fetchRandomChildWord } from "../../services/childVocabularyService";
import { trackChildWordProgress } from "../../services/spacedRepetitionService";
import "../../styles/ChildStageCss/ChildVocabularyBook.css";

const ChildVocabularyBook = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  // 使用学习时长统计hook
  const { learningData, startLearningSession, endLearningSession } = useChildLearning(userId);

  // 使用音效hook
  const { speakWord } = useChildSound();

  // 学习会话ID（从后端API获取）
  const [sessionId, setSessionId] = useState<string | null>(null);

  // 跟踪是否已经开始学习会话
  const hasStartedSession = useRef(false);

  // 保存最新的endLearningSession引用，避免闭包问题
  const endLearningSessionRef = useRef(endLearningSession);

  const [featuredWord, setFeaturedWord] = useState<ChildWord | null>(null);
  const [isChangeWordModalOpen, setIsChangeWordModalOpen] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [loadingBarComplete, setLoadingBarComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 活跃度追踪 - 监听用户活动和页面可见性
  const activityState = useActivityTracker({
    inactivityTimeout: 3 * 60 * 1000, // 3分钟无活动自动暂停
    heartbeatInterval: 30 * 1000, // 30秒心跳间隔
    onPause: () => {
      console.log('⏸️ 用户暂停学习（页面失焦或无活动）');
    },
    onResume: () => {
      console.log('▶️ 用户恢复学习');
    },
    onHeartbeat: async (state) => {
      // 发送心跳到服务器，保持会话活跃
      if (sessionId) {
        try {
          await fetch('http://localhost:3001/api/learning-session/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              timestamp: Date.now()
            })
          });
          console.log('💓 心跳已发送，活跃时长:', Math.floor(state.activeDuration / 1000 / 60), '分钟');
        } catch (error) {
          console.error('心跳发送失败:', error);
        }
      }
    }
  });

  useEffect(() => {
    loadFeaturedWord();
  }, []);

  // 更新endLearningSession的ref引用
  useEffect(() => {
    endLearningSessionRef.current = endLearningSession;
  }, [endLearningSession]);

  // 字母动画完成后，启动加载条
  useEffect(() => {
    if (animationComplete && !loadingBarComplete) {
      const timer = setTimeout(() => {
        setLoadingBarComplete(true);
      }, 2000); // 加载条持续2秒
      return () => clearTimeout(timer);
    }
  }, [animationComplete, loadingBarComplete]);

  // 学习时长统计：等待learningData加载完成后开始学习会话
  useEffect(() => {
    if (learningData && !hasStartedSession.current) {
      // 启动前端学习会话
      startLearningSession();
      hasStartedSession.current = true;

      // 调用后端API启动学习会话
      const startBackendSession = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/learning-session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              sessionType: 'vocabulary-book'
            })
          });

          const data = await response.json();
          if (data.success) {
            setSessionId(data.sessionId);
            console.log('✅ 学习会话已开始，会话ID:', data.sessionId);
          }
        } catch (error) {
          console.error('启动学习会话失败:', error);
        }
      };

      startBackendSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningData]); // 当learningData加载完成时触发

  // 组件卸载时结束学习会话
  useEffect(() => {
    return () => {
      if (hasStartedSession.current) {
        // 结束前端学习会话
        endLearningSessionRef.current();

        // 调用后端API结束学习会话，传递活跃度追踪数据
        const endBackendSession = async () => {
          if (sessionId) {
            try {
              const response = await fetch('http://localhost:3001/api/learning-session/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId,
                  activeTime: activityState.activeDuration,
                  pausedTime: activityState.pausedDuration
                })
              });

              const data = await response.json();
              if (data.success) {
                console.log('✅ 学习会话已结束');
                console.log('📊 总时长:', data.totalTime, '分钟');
                console.log('✅ 有效时长:', data.validTime, '分钟');
                console.log('⏸️ 暂停时长:', data.pausedTime, '分钟');
              }
            } catch (error) {
              console.error('结束学习会话失败:', error);
            }
          }
        };

        endBackendSession();
        hasStartedSession.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件卸载时执行

  const loadFeaturedWord = async () => {
    setIsLoading(true);
    try {
      const word = await fetchRandomChildWord();
      setFeaturedWord(word);
    } catch (error) {
      console.error("Error loading featured word:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLetterClick = (letter: string) => {
    // Could filter words by letter in the future
    console.log("Letter clicked:", letter);
  };

  // 使用useCallback包装动画完成回调，避免引用变化导致timer重置
  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  const [isLearningModalOpen, setIsLearningModalOpen] = useState(false);

  const handleWordClick = () => {
    if (featuredWord) {
      // 直接打开学习模态框，不跳转到详情页
      setIsLearningModalOpen(true);
      // 注意：单词发音由WordLearningModal组件自动播放，这里不需要重复调用
    }
  };

  const handleChangeWord = (word: ChildWord) => {
    setFeaturedWord(word);
  };

  const handleReviewClick = () => {
    navigate("/child-vocabulary-review");
  };

  const handleCorrect = async (word: ChildWord) => {
    console.log("🔍 handleCorrect 被调用");
    console.log("🔍 user:", user);
    console.log("🔍 word:", word);
    console.log("🔍 word.id:", word?.id);

    if (!user) {
      console.warn("⚠️ 用户未登录，无法记录单词进度");
      return;
    }

    try {
      console.log("📡 开始调用API保存进度...");
      console.log("📡 参数: userId=", user.id, "wordId=", word.id, "correct=true");

      // 调用后端API保存进度（这样单词会进入艾宾浩斯复习系统）
      await trackChildWordProgress(user.id, word.id, true);

      console.log("✅ 单词答对了，已加入复习系统:", word.word);
      console.log("✅ API调用成功");
    } catch (error) {
      console.error("❌ 保存单词进度失败:", error);
      console.error("❌ 错误详情:", error instanceof Error ? error.message : String(error));

      // API调用失败时，仍然保存到localStorage作为备份
      const storageKey = `child_word_progress_${user.id}`;
      const savedData = localStorage.getItem(storageKey);
      const progressData = savedData ? JSON.parse(savedData) : {};

      if (!progressData[word.word]) {
        progressData[word.word] = {
          wordId: word.id,
          correctCount: 0,
          wrongCount: 0,
          mastered: false,
          lastStudied: new Date().toISOString(),
        };
      }

      progressData[word.word].correctCount += 1;
      progressData[word.word].lastStudied = new Date().toISOString();

      if (progressData[word.word].correctCount >= 3) {
        progressData[word.word].mastered = true;
      }

      localStorage.setItem(storageKey, JSON.stringify(progressData));
      console.log("💾 已保存到localStorage作为备份");
    }
  };

  const handleWrong = async (word: ChildWord) => {
    if (!user) return;

    try {
      // 调用后端API保存进度（这样单词会进入艾宾浩斯复习系统）
      await trackChildWordProgress(user.id, word.id, false);
      console.log("❌ 单词答错了，已加入复习系统:", word.word);
    } catch (error) {
      console.error("保存单词进度失败:", error);
      // API调用失败时，仍然保存到localStorage作为备份
      const storageKey = `child_word_progress_${user.id}`;
      const savedData = localStorage.getItem(storageKey);
      const progressData = savedData ? JSON.parse(savedData) : {};

      if (!progressData[word.word]) {
        progressData[word.word] = {
          wordId: word.id,
          correctCount: 0,
          wrongCount: 0,
          mastered: false,
          lastStudied: new Date().toISOString(),
        };
      }

      progressData[word.word].wrongCount += 1;
      progressData[word.word].lastStudied = new Date().toISOString();
      progressData[word.word].mastered = false;

      localStorage.setItem(storageKey, JSON.stringify(progressData));
    }
  };

  return (
    <div className="child-vocab-book-page">
      {/* Navigation Bar */}
      <div className="child-vocab-navbar">
        <button className="nav-back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 className="nav-title">我的单词本</h1>
        <div className="nav-actions">
          <button
            className="nav-btn"
            onClick={() => setIsChangeWordModalOpen(true)}
          >
            🔄 更换单词
          </button>
          <button className="nav-btn primary" onClick={handleReviewClick}>
            📝 复习单词
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="child-vocab-book-content">
        {/* Featured Word Section - 只在加载条完成后显示 */}
        {loadingBarComplete && (
          <div className="featured-word-section">
            <h2 className="section-title">今日单词</h2>
            {isLoading ? (
              <div className="loading-state">加载中...</div>
            ) : featuredWord ? (
              <>
                <VocabularyWordCard
                  word={featuredWord}
                  onWordClick={handleWordClick}
                  showBlurredBackground={true}
                  animationsEnabled={animationComplete}
                />
                <div className="word-hint">
                  <p>👆 点击单词开始学习</p>
                </div>
              </>
            ) : (
              <div className="empty-state">暂无单词</div>
            )}
          </div>
        )}

        {/* Alphabet Animation Section - Bottom */}
        <div className="alphabet-section-bottom">
          <AlphabetAnimation
            onLetterClick={handleLetterClick}
            animationsEnabled={true}
            onAnimationComplete={handleAnimationComplete}
          />

          {/* Loading Bar - 字母动画完成后显示 */}
          {animationComplete && !loadingBarComplete && (
            <div className="loading-bar-container">
              <div className="loading-bar">
                <div className="loading-bar-fill"></div>
              </div>
              <p className="loading-text">🎈 正在准备单词本...</p>
            </div>
          )}
        </div>
      </div>

      {/* Change Word Modal */}
      <ChangeWordModal
        isOpen={isChangeWordModalOpen}
        onClose={() => setIsChangeWordModalOpen(false)}
        onSelectWord={handleChangeWord}
        grade={0}
      />

      {/* Word Learning Modal */}
      <WordLearningModal
        isOpen={isLearningModalOpen}
        word={featuredWord}
        onClose={() => setIsLearningModalOpen(false)}
        onCorrect={handleCorrect}
        onWrong={handleWrong}
        animationsEnabled={animationComplete}
      />
    </div>
  );
};

export default ChildVocabularyBook;
