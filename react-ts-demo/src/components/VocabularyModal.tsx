import type { VocabularyBookType } from "../types";
import "../styles/VocabularyModal.css";
import { useFocusTrap, useEscClose } from "../hooks/useAccessibility";
import { useRef } from "react";
interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: VocabularyBookType) => void;
}

const VocabularyModal = ({
  isOpen,
  onClose,
  onSelectBook,
}: VocabularyModalProps) => {
  const books: { value: VocabularyBookType; category: string }[] = [
    { value: "初一", category: "初中" },
    { value: "初二", category: "初中" },
    { value: "初三", category: "初中" },
    { value: "高一", category: "高中" },
    { value: "高二", category: "高中" },
    { value: "高三", category: "高中" },
    { value: "四级", category: "大学" },
    { value: "六级", category: "大学" },
    { value: "雅思", category: "出国" },
    { value: "托福", category: "出国" },
  ];

  const groupedBooks = books.reduce(
    (acc, book) => {
      if (!acc[book.category]) {
        acc[book.category] = [];
      }
      acc[book.category].push(book.value);
      return acc;
    },
    {} as Record<string, VocabularyBookType[]>,
  );

  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);
  useEscClose(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="modal-content vocabulary-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title"> 选择单词本</h2>
          <button className="close-button" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <div className="vocabulary-books">
          {Object.entries(groupedBooks).map(([category, bookList]) => (
            <div key={category} className="book-category">
              <h3 className="category-title">{category}</h3>
              <div className="books-grid">
                {bookList.map((book) => (
                  <div
                    key={book}
                    className="book-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => { onSelectBook(book); }}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelectBook(book))}
                  >
                    <div className="book-icon">
                      <img
                        src="/src/assets/iconfont/单词本.svg"
                        alt={book}
                        width={38}
                        height={38}
                      />
                    </div>
                    <span className="book-name">{book}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VocabularyModal;
