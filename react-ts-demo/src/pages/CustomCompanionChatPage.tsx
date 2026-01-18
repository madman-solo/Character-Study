import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/CustomCompanionChatPage.css';

interface Message {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  timestamp: Date;
}

interface CustomSetup {
  userIdentity: string;
  companionIdentity: string;
  background: string;
}

const CustomCompanionChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setup = location.state as CustomSetup;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'companion',
      text: `你好！我是你的${setup?.companionIdentity || '朋友'}，很高兴认识你！`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 背景选项
  const backgroundOptions: { [key: string]: string } = {
    default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    forest: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    night: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
    cherry: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  };

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 如果没有设置信息，返回设置页面
  useEffect(() => {
    if (!setup || !setup.userIdentity || !setup.companionIdentity) {
      navigate('/custom-companion-setup');
    }
  }, [setup, navigate]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);

    // 模拟对方回复
    setTimeout(() => {
      const companionMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'companion',
        text: generateResponse(inputText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, companionMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // 简单的回复生成逻辑
  const generateResponse = (userInput: string): string => {
    const responses = [
      '我明白你的感受，继续说吧。',
      '这听起来很有趣！能详细说说吗？',
      '我一直在听，你可以放心地和我分享。',
      '谢谢你愿意和我分享这些。',
      '我很高兴能陪伴你。',
      '你说得对，我也这么认为。',
    ];

    if (userInput.includes('谢谢') || userInput.includes('感谢')) {
      return '不用客气，我很乐意帮助你！';
    } else if (userInput.includes('再见') || userInput.includes('拜拜')) {
      return '再见！期待下次和你聊天！';
    } else if (userInput.includes('?') || userInput.includes('？')) {
      return '这是个好问题，让我想想...我觉得这取决于你的想法。';
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!setup) return null;

  return (
    <div
      className="custom-chat-page"
      style={{ background: backgroundOptions[setup.background] || backgroundOptions.default }}
    >
      {/* 聊天容器 */}
      <div className="chat-container">
        {/* 头部 */}
        <div className="chat-header">
          <button className="chat-back-button" onClick={() => navigate('/')}>
            ← 返回
          </button>
          <div className="chat-header-info">
            <div className="chat-title">{setup.companionIdentity}</div>
            <div className="chat-subtitle">在线</div>
          </div>
          <div className="chat-header-spacer"></div>
        </div>

        {/* 消息列表 */}
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.sender === 'user' ? 'user-message-wrapper' : 'companion-message-wrapper'}`}
            >
              <div className="message-avatar">
                {message.sender === 'user' ? '👤' : '💫'}
              </div>
              <div className="message-content">
                <div className="message-sender">
                  {message.sender === 'user' ? setup.userIdentity : setup.companionIdentity}
                </div>
                <div
                  className={`message-bubble ${message.sender === 'user' ? 'user-bubble' : 'companion-bubble'}`}
                >
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-wrapper companion-message-wrapper">
              <div className="message-avatar">💫</div>
              <div className="message-content">
                <div className="message-sender">{setup.companionIdentity}</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            placeholder="输入消息..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomCompanionChatPage;
