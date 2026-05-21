/**
 * 单词学习模态框组件
 * 实现读出+默写的学习流程
 */

import { useState, useEffect, useRef } from "react";
import { useChildSound } from "../../../hooks/useChildSound";
import DictationInput from "./DictationInput";
import type { WordLearningModalProps } from "../../../types/vocabulary";
import "./WordLearningModal.css";
import { useFocusTrap, useEscClose, useFocusReturn } from "../../../hooks/useAccessibility";

const WordLearningModal = ({
  isOpen,
  word,
  onClose,
  onCorrect,
  onWrong,
  animationsEnabled = true,
}: WordLearningModalProps) => {
  const [step, setStep] = useState<"listening" | "dictation" | "result">(
    "listening",
  );
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  // 使用音效hook
  const { speakWord } = useChildSound();

  // 当模态框打开时，重置状态并播放发音
  useEffect(() => {
    if (isOpen && word) {
      setStep("listening");
      setUserInput("");
      setIsCorrect(false);

      // 延迟一下再播放，让模态框动画完成
      setTimeout(() => {
        speakWord(word.word);
        // 播放完后进入默写阶段
        setTimeout(() => {
          setStep("dictation");
        }, 1500);
      }, 300);
    }
  }, [isOpen, word, speakWord]);
  //无障碍功能 - 键盘焦点管理和ESC键关闭
  const modalRef = useRef<HTMLDivElement>(null);
  const { save, restore } = useFocusReturn();
  useEffect(() => { if (isOpen) save(); else restore(); }, [isOpen]);
  useFocusTrap(modalRef, isOpen);
  useEscClose(onClose, isOpen);

  const handleDictationSubmit = (input: string) => {
    if (!word) return;

    const correct = input.toLowerCase() === word.word.toLowerCase();
    setIsCorrect(correct);
    setUserInput(input);
    setStep("result");

    // 2秒后关闭模态框并触发回调
    setTimeout(() => {
      if (correct) {
        onCorrect(word);
      } else {
        onWrong(word);
      }
      onClose();
    }, 2000);
  };

  const handleReplay = () => {
    if (word) {
      speakWord(word.word);
    }
  };

  if (!isOpen || !word) return null;

  return (
    <div
      className="word-learning-modal-overlay"
      onClick={onClose}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className={`word-learning-modal ${animationsEnabled ? "child-animate-scale-in" : ""}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* 关闭按钮 */}
        <button className="modal-close-btn" onClick={onClose} aria-label="关闭">
          ✕
        </button>

        {/* 听音阶段 */}
        {step === "listening" && (
          <div className="learning-step listening-step">
            <div className="step-icon child-animate-pulse"></div>
            <h2 className="step-title">请仔细听...</h2>
            <div className="sound-wave child-animate-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* 默写阶段 */}
        {step === "dictation" && (
          <div className="learning-step dictation-step">
            <div className="step-icon">
              <img
                alt="书写"
                src="/src/assets/iconfont/书写.svg"
                width={56}
                height={56}
              ></img>
            </div>
            <h2 className="step-title">请写出你听到的单词</h2>
            <p className="step-hint">
              <img
                alt="灯泡"
                src="/src/assets/iconfont/child/灯泡.svg"
                width={66}
                height={66}
              ></img>
              提示: {word.translation}
            </p>

            <button className="replay-btn" onClick={handleReplay}>
              <img
                alt="扬声器"
                src="/src/assets/iconfont/child/扬声器.svg"
                width={34}
                height={34}
              ></img>
              再听一次
            </button>

            <DictationInput
              onSubmit={handleDictationSubmit}
              placeholder="输入单词..."
              correctAnswer={word.word}
              showFeedback={false}
            />
          </div>
        )}

        {/* 结果阶段 */}
        {step === "result" && (
          <div className="learning-step result-step">
            {isCorrect ? (
              <>
                <div className="result-icon correct child-animate-bounce-in">
                  ✓
                </div>
                <h2 className="result-title correct">太棒了！</h2>
                <p className="result-message">你答对了！</p>
              </>
            ) : (
              <>
                <div className="result-icon wrong child-animate-shake">✗</div>
                <h2 className="result-title wrong">再试试吧</h2>
                <p className="result-message">
                  正确答案是: <strong>{word.word}</strong>
                </p>
                <p className="result-hint">你的答案: {userInput}</p>
              </>
            )}

            <div className="word-info">
              <p className="word-phonetic">{word.phonetic}</p>
              <p className="word-translation">{word.translation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordLearningModal;
