/**
 * 故事阅读器页面
 * 支持分段阅读、单词点击翻译、语音朗读、问答测试
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { translateText } from "../../services/translationService";
import { playWordAudio } from "../../services/audioService";
import "../../styles/ChildStageCss/StoryReaderPage.css";

interface Section {
  number: number;
  text: string;
}

interface Question {
  id: string;
  type: string;
  section: string;
  category: string;
  question: string;
  answerType: string;
  answers: string[];
}

interface Story {
  id: string;
  slug: string;
  title: string;
  titleCn: string;
  collection: string;
  collectionName: string;
  difficulty: "easy" | "medium" | "hard";
  sections: Section[];
  questions: Question[];
  stats: {
    totalSections: number;
    totalSentences: number;
    totalQuestions: number;
    totalWords: number;
  };
}

const StoryReaderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const storyId = location.state?.storyId;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordTranslation, setWordTranslation] = useState<string>("");
  const [translationLoading, setTranslationLoading] = useState(false);
  const [sectionTranslation, setSectionTranslation] = useState<string>("");
  const [showSectionTranslation, setShowSectionTranslation] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // 加载故事数据
  useEffect(() => {
    if (!storyId) {
      navigate("/stories");
      return;
    }

    fetch("/stories-data/all-stories.json")
      .then((res) => res.json())
      .then((data: Story[]) => {
        const foundStory = data.find((s) => s.id === storyId);
        if (foundStory) {
          setStory(foundStory);
        } else {
          navigate("/stories");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("加载故事失败:", error);
        setLoading(false);
        navigate("/stories");
      });
  }, [storyId, navigate]);

  // 语音朗读功能 - 使用百度翻译API
  const handleReadAloud = async () => {
    if (!story || isReading) return;

    const text = story.sections[currentSection].text;
    setIsReading(true);

    try {
      // 生成音频URL
      const audioUrl = `http://localhost:3001/api/audio/speak?word=${encodeURIComponent(text)}&lang=en&speed=4`;

      // 创建音频对象
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      // 监听播放结束
      audio.onended = () => {
        setIsReading(false);
        setCurrentAudio(null);
      };

      // 监听错误
      audio.onerror = () => {
        console.error('音频播放失败');
        setIsReading(false);
        setCurrentAudio(null);
      };

      // 开始播放
      await audio.play();
    } catch (error) {
      console.error('朗读失败:', error);
      setIsReading(false);
      setCurrentAudio(null);
    }
  };

  // 停止朗读
  const handleStopReading = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsReading(false);
  };

  // 翻译当前段落 - 支持长文本分段翻译
  const handleTranslateSection = async () => {
    if (!story) return;

    if (showSectionTranslation) {
      setShowSectionTranslation(false);
      return;
    }

    const text = story.sections[currentSection].text;
    console.log('=== 开始翻译 ===');
    console.log('文本长度:', text.length);
    console.log('文本内容:', text.substring(0, 100) + '...');

    setTranslationLoading(true);

    try {
      // 百度翻译API限制为6000字符，我们设置更保守的限制
      const maxLength = 4500;

      if (text.length <= maxLength) {
        // 直接翻译
        console.log('文本长度未超过限制，直接翻译');
        const result = await translateText(text, 'en', 'zh');
        console.log('翻译结果:', result);
        if (result.trans_result && result.trans_result.length > 0) {
          // 合并所有翻译结果
          const allTranslations = result.trans_result.map(item => item.dst).join(' ');
          console.log('合并后的翻译:', allTranslations);
          setSectionTranslation(allTranslations);
          setShowSectionTranslation(true);
        }
      } else {
        // 分段翻译 - 改进的分割算法
        console.log('文本长度超过限制，需要分段翻译');

        // 更精确的句子分割：匹配句号、问号、感叹号后跟空格或引号
        const sentenceRegex = /[^.!?]+[.!?]+["']?\s*/g;
        const sentences = text.match(sentenceRegex) || [];

        console.log('分割出的句子数:', sentences.length);

        if (sentences.length === 0) {
          // 如果无法分割句子，按字符数强制分割
          console.log('无法按句子分割，强制按字符分割');
          const chunks: string[] = [];
          for (let i = 0; i < text.length; i += maxLength) {
            chunks.push(text.substring(i, i + maxLength));
          }

          console.log('强制分割成', chunks.length, '段');

          const translations: string[] = [];
          for (let i = 0; i < chunks.length; i++) {
            console.log(`翻译第 ${i + 1}/${chunks.length} 段，长度: ${chunks[i].length}`);
            const result = await translateText(chunks[i], 'en', 'zh');
            if (result.trans_result && result.trans_result.length > 0) {
              translations.push(result.trans_result[0].dst);
              console.log(`第 ${i + 1} 段翻译完成`);
            }
            // 添加延迟避免API限流
            if (i < chunks.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          }

          console.log('所有段落翻译完成，合并结果');
          setSectionTranslation(translations.join(''));
          setShowSectionTranslation(true);
        } else {
          // 按句子组合成块
          const chunks: string[] = [];
          let currentChunk = '';

          for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];

            // 如果当前块加上新句子会超过限制
            if ((currentChunk + sentence).length > maxLength) {
              if (currentChunk) {
                // 保存当前块
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
              } else {
                // 单个句子就超过限制，直接作为一个chunk
                chunks.push(sentence.trim());
                currentChunk = '';
              }
            } else {
              currentChunk += sentence;
            }
          }

          // 添加最后一个块
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }

          console.log('组合成', chunks.length, '个块');
          chunks.forEach((chunk, i) => {
            console.log(`块 ${i + 1} 长度: ${chunk.length}`);
          });

          // 翻译所有分段
          const translations: string[] = [];
          for (let i = 0; i < chunks.length; i++) {
            console.log(`翻译第 ${i + 1}/${chunks.length} 块`);
            const result = await translateText(chunks[i], 'en', 'zh');
            if (result.trans_result && result.trans_result.length > 0) {
              translations.push(result.trans_result[0].dst);
              console.log(`第 ${i + 1} 块翻译完成:`, result.trans_result[0].dst.substring(0, 50) + '...');
            }
            // 添加延迟避免API限流
            if (i < chunks.length - 1) {
              console.log('等待800ms后继续...');
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          }

          console.log('翻译完成，共', translations.length, '段');
          console.log('合并后的翻译长度:', translations.join(' ').length);

          // 合并翻译结果
          setSectionTranslation(translations.join(' '));
          setShowSectionTranslation(true);
        }
      }
    } catch (error) {
      console.error('翻译失败:', error);
      alert('翻译失败，请稍后重试');
    } finally {
      setTranslationLoading(false);
      console.log('=== 翻译流程结束 ===');
    }
  };

  // 单词点击处理 - 翻译单词
  const handleWordClick = async (word: string) => {
    // 清理标点符号
    const cleanWord = word.replace(/[.,!?;:"'()]/g, "").toLowerCase();
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setWordTranslation("");
    setTranslationLoading(true);

    try {
      const result = await translateText(cleanWord, 'en', 'zh');
      if (result.trans_result && result.trans_result.length > 0) {
        setWordTranslation(result.trans_result[0].dst);
      }
    } catch (error) {
      console.error('单词翻译失败:', error);
      setWordTranslation("翻译失败");
    } finally {
      setTranslationLoading(false);
    }
  };

  // 播放单词发音 - 使用百度翻译API
  const handlePlayWordAudio = async (word: string) => {
    try {
      await playWordAudio(word, { lang: 'en', speed: 5 });
    } catch (error) {
      console.error('发音失败:', error);
    }
  };

  // 渲染可点击的文本
  const renderClickableText = (text: string) => {
    const words = text.split(" ");
    return (
      <p className="story-text">
        {words.map((word, index) => (
          <span
            key={index}
            className="clickable-word"
            onClick={() => handleWordClick(word)}
          >
            {word}{" "}
          </span>
        ))}
      </p>
    );
  };

  // 获取当前段落相关的问题
  const getCurrentSectionQuestions = () => {
    if (!story) return [];
    return story.questions.filter((q) => {
      const sections = q.section.split(",").map((s) => parseInt(s.trim()));
      return sections.includes(currentSection + 1);
    });
  };

  // 上一段
  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setShowQuestions(false);
      setShowSectionTranslation(false);
      setSectionTranslation("");
    }
  };

  // 下一段
  const handleNextSection = () => {
    if (story && currentSection < story.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setShowQuestions(false);
      setShowSectionTranslation(false);
      setSectionTranslation("");
    }
  };

  if (loading) {
    return (
      <div className="story-reader-page">
        <div className="loading-container">
          <p>加载故事中...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  const currentSectionData = story.sections[currentSection];
  const sectionQuestions = getCurrentSectionQuestions();

  return (
    <div className="story-reader-page">
      {/* 顶部导航 */}
      <div className="reader-header">
        <button className="back-btn" onClick={() => navigate("/stories")}>
          ← 返回故事列表
        </button>
        <div className="story-info-header">
          <h1>{story.title}</h1>
          <p>{story.titleCn}</p>
        </div>
        <div className="header-spacer"></div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar">
        <div className="progress-info">
          <span>
            第 {currentSection + 1} / {story.sections.length} 段
          </span>
          <span>
            {Math.round(((currentSection + 1) / story.sections.length) * 100)}%
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${((currentSection + 1) / story.sections.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="reader-content">
        {/* 左侧：故事文本 */}
        <div className="story-section">
          <div className="section-header">
            <h2>段落 {currentSectionData.number}</h2>
            <div className="audio-controls">
              {!isReading ? (
                <button className="audio-btn" onClick={handleReadAloud}>
                  🔊 朗读
                </button>
              ) : (
                <button className="audio-btn stop" onClick={handleStopReading}>
                  ⏸️ 停止
                </button>
              )}
              <button
                className="translate-btn"
                onClick={handleTranslateSection}
                disabled={translationLoading}
              >
                {translationLoading ? "翻译中..." : showSectionTranslation ? "隐藏翻译" : "🌐 翻译"}
              </button>
            </div>
          </div>

          <div className="section-content">
            {renderClickableText(currentSectionData.text)}
          </div>

          {/* 段落翻译结果 */}
          {showSectionTranslation && sectionTranslation && (
            <div className="section-translation">
              <h4>📖 中文翻译</h4>
              <p>{sectionTranslation}</p>
            </div>
          )}

          {/* 导航按钮 */}
          <div className="section-navigation">
            <button
              className="nav-btn"
              onClick={handlePrevSection}
              disabled={currentSection === 0}
            >
              ← 上一段
            </button>

            {sectionQuestions.length > 0 && (
              <button
                className="quiz-btn"
                onClick={() => setShowQuestions(!showQuestions)}
              >
                {showQuestions ? "隐藏问题" : `📝 ${sectionQuestions.length} 道题`}
              </button>
            )}

            <button
              className="nav-btn"
              onClick={handleNextSection}
              disabled={currentSection === story.sections.length - 1}
            >
              下一段 →
            </button>
          </div>
        </div>

        {/* 右侧：单词翻译 */}
        {selectedWord && (
          <div className="word-panel">
            <div className="word-panel-header">
              <h3>单词详情</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setSelectedWord(null);
                  setWordTranslation("");
                }}
              >
                ✕
              </button>
            </div>
            <div className="word-content">
              <h2 className="word-title">{selectedWord}</h2>

              {translationLoading ? (
                <p className="word-loading">翻译中...</p>
              ) : wordTranslation ? (
                <div className="word-translation-result">
                  <h4>中文释义</h4>
                  <p className="translation-text">{wordTranslation}</p>
                </div>
              ) : (
                <p className="word-hint">💡 加载翻译中...</p>
              )}

              <button
                className="word-audio-btn"
                onClick={() => handlePlayWordAudio(selectedWord)}
              >
                🔊 发音
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 问题区域 */}
      {showQuestions && sectionQuestions.length > 0 && (
        <div className="questions-section">
          <h3>理解问题</h3>
          <div className="questions-list">
            {sectionQuestions.map((question, index) => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <span className="question-number">问题 {index + 1}</span>
                  <span className="question-category">{question.category}</span>
                </div>
                <p className="question-text">{question.question}</p>
                <div className="answers-list">
                  <p className="answers-label">参考答案：</p>
                  {question.answers.map((answer, idx) => (
                    <div key={idx} className="answer-item">
                      • {answer}
                    </div>
                  ))}
                </div>
                <span className="answer-type-badge">
                  {question.answerType === "explicit" ? "明确答案" : "推理答案"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryReaderPage;
