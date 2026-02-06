import type { VocabularyBookType } from "../types";
import "../styles/VocabularyModal.css";

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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content vocabulary-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>选择单词本</h2>
          <button className="close-button" onClick={onClose}>
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
                    onClick={() => {
                      onSelectBook(book);
                    }}
                  >
                    <div className="book-icon">📖</div>
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
