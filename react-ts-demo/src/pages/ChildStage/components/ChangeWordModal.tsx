/**
 * ChangeWordModal Component
 * 更换单词模态框 - 按首字母和长度分类显示单词
 */

import { useState, useEffect } from "react";
import type {
  ChangeWordModalProps,
  ChildWord,
} from "../../../types/vocabulary";
import {
  fetchChildWordsByLetter,
  filterWordsByLength,
} from "../../../services/childVocabularyService";
import "./ChangeWordModal.css";

const ChangeWordModal = ({
  isOpen,
  onClose,
  onSelectWord,
  grade = 0,
}: ChangeWordModalProps) => {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [selectedLength, setSelectedLength] = useState<
    "all" | "short" | "medium" | "long"
  >("all");
  const [words, setWords] = useState<ChildWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<ChildWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  useEffect(() => {
    if (isOpen && selectedLetter) {
      loadWords();
    }
  }, [isOpen, selectedLetter, grade]);

  useEffect(() => {
    filterWords();
  }, [words, selectedLength]);

  const loadWords = async () => {
    setIsLoading(true);
    try {
      const fetchedWords = await fetchChildWordsByLetter(
        selectedLetter,
        grade,
        100,
      );
      setWords(fetchedWords);
    } catch (error) {
      console.error("Error loading words:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterWords = () => {
    if (selectedLength === "all") {
      setFilteredWords(words);
    } else {
      setFilteredWords(filterWordsByLength(words, selectedLength));
    }
  };

  const handleSelectWord = (word: ChildWord) => {
    onSelectWord(word);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="child-change-word-modal-overlay" onClick={onClose}>
      <div
        className="child-change-word-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>选择单词</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-filters">
          <div className="filter-section">
            <h3>按首字母</h3>
            <div className="letter-tabs">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  className={`letter-tab ${selectedLetter === letter ? "active" : ""}`}
                  onClick={() => setSelectedLetter(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>按长度</h3>
            <div className="length-filters">
              <button
                className={`length-btn ${selectedLength === "all" ? "active" : ""}`}
                onClick={() => setSelectedLength("all")}
              >
                全部
              </button>
              <button
                className={`length-btn ${selectedLength === "short" ? "active" : ""}`}
                onClick={() => setSelectedLength("short")}
              >
                3-5字母
              </button>
              <button
                className={`length-btn ${selectedLength === "medium" ? "active" : ""}`}
                onClick={() => setSelectedLength("medium")}
              >
                6-8字母
              </button>
              <button
                className={`length-btn ${selectedLength === "long" ? "active" : ""}`}
                onClick={() => setSelectedLength("long")}
              >
                9+字母
              </button>
            </div>
          </div>
        </div>

        <div className="modal-content">
          {isLoading ? (
            <div className="loading-state">加载中...</div>
          ) : filteredWords.length > 0 ? (
            <div className="words-grid">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className="word-item"
                  onClick={() => handleSelectWord(word)}
                >
                  <div className="word-text">{word.word}</div>
                  <div className="word-translation">{word.translation}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">没有找到单词</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeWordModal;
