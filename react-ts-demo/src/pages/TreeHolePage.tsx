import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TreeHolePage.css';

interface DialogueMessage {
  id: string;
  speaker: 'user' | 'tree-hole';
  text: string;
  emotion?: 'happy' | 'sad' | 'neutral' | 'excited';
}

// 模拟对话流程
const dialogueFlow = [
  { speaker: 'user' as const, text: '你好啊，我来找你聊天啦。' },
  { speaker: 'tree-hole' as const, text: '你好呀！很高兴见到你，有什么想和我分享的吗？', emotion: 'happy' as const },
  { speaker: 'user' as const, text: '最近有点累，想找个人说说话。' },
  { speaker: 'tree-hole' as const, text: '我一直都在这里，你可以放心地和我说任何事情。', emotion: 'neutral' as const },
  { speaker: 'user' as const, text: '谢谢你愿意倾听。' },
  { speaker: 'tree-hole' as const, text: '不用客气！能陪伴你是我的荣幸。', emotion: 'excited' as const },
];

// 背景图片根据情绪变化
const backgrounds = {
  happy: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  sad: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
  neutral: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  excited: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
};

const TreeHolePage = () => {
  const navigate = useNavigate();
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<'happy' | 'sad' | 'neutral' | 'excited'>('neutral');
  const [showClickHint, setShowClickHint] = useState(true);

  const currentDialogue = dialogueFlow[currentDialogueIndex];

  // 打字机效果
  useEffect(() => {
    if (currentDialogue) {
      setIsTyping(true);
      setDisplayedText('');
      let index = 0;
      const text = currentDialogue.text;

      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 50);

      // 更新情绪和背景
      if (currentDialogue.emotion) {
        setCurrentEmotion(currentDialogue.emotion);
      }

      return () => clearInterval(timer);
    }
  }, [currentDialogueIndex]);

  const handleDialogueClick = () => {
    if (isTyping) {
      // 如果正在打字，立即显示完整文本
      setDisplayedText(currentDialogue.text);
      setIsTyping(false);
    } else if (currentDialogueIndex < dialogueFlow.length - 1) {
      // 进入下一句对话
      setCurrentDialogueIndex(currentDialogueIndex + 1);
      setShowClickHint(false);
    }
  };

  return (
    <div
      className="tree-hole-page"
      style={{ background: backgrounds[currentEmotion] }}
    >
      {/* 背景装饰 */}
      <div className="background-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>

      {/* 返回按钮 */}
      <button className="tree-hole-back-button" onClick={() => navigate('/')}>
        ← 返回
      </button>

      {/* 角色显示区 */}
      <div className="characters-container">
        {/* 用户角色（右下角） */}
        {currentDialogue.speaker === 'user' && (
          <div className="character-avatar user-avatar">
            <div className="avatar-placeholder">👤</div>
            <div className="character-label">我</div>
          </div>
        )}

        {/* 树洞角色（左下角） */}
        {currentDialogue.speaker === 'tree-hole' && (
          <div className="character-avatar tree-hole-avatar">
            <div className="avatar-placeholder">👩</div>
            <div className="character-label">树洞</div>
          </div>
        )}
      </div>

      {/* 对话框 */}
      <div
        className={`dialogue-box ${currentDialogue.speaker === 'user' ? 'user-dialogue' : 'tree-hole-dialogue'}`}
        onClick={handleDialogueClick}
      >
        <div className="dialogue-speaker">
          {currentDialogue.speaker === 'user' ? '我' : '树洞'}
        </div>
        <div className="dialogue-text">
          {displayedText}
          {isTyping && <span className="typing-cursor">▌</span>}
        </div>
        {showClickHint && !isTyping && (
          <div className="click-hint">点击继续 ▼</div>
        )}
      </div>

      {/* 进度指示器 */}
      <div className="dialogue-progress">
        {currentDialogueIndex + 1} / {dialogueFlow.length}
      </div>
    </div>
  );
};

export default TreeHolePage;
