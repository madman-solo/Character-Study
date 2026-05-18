import { useState, lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { useStudyTimer } from "./hooks/useStudyTimer";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import PageLoader from "./components/PageLoader";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CharacterProvider } from "./contexts/CharacterContext";
import { EyeCareProvider } from "./contexts/EyeCareContext";
import Navbar from "./components/Navbar";
import ProfileSidebar from "./components/ProfileSidebar";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
const HelpPage = lazy(() => import("./pages/HelpPage"));
const SharePage = lazy(() => import("./pages/SharePage"));
const StudyTimePage = lazy(() => import("./pages/StudyTimePage"));
const ScenarioModal = lazy(() => import("./components/ScenarioModal"));
const EnglishLearningModeModal = lazy(
  () => import("./components/EnglishLearningModeModal"),
);
const VocabularyModal = lazy(() => import("./components/VocabularyModal"));
const LearningModeModal = lazy(() => import("./components/LearningModeModal"));

const Characters = lazy(() => import("./pages/Characters"));
const CharacterDetail = lazy(() => import("./pages/CharacterDetail"));
const VocabularyPage = lazy(() => import("./pages/VocabularyPage"));
const ListeningPage = lazy(() => import("./pages/ListeningPage"));
const IntensiveDetailPage = lazy(() => import("./pages/IntensiveDetailPage"));
const SpeakingPage = lazy(() => import("./pages/SpeakingPage"));
const TreeHolePage = lazy(() => import("./pages/TreeHolePage"));
const CharacterSelectionPage = lazy(
  () => import("./pages/CharacterSelectionPage"),
);
const CharacterCreationPage = lazy(
  () => import("./pages/CharacterCreationPage"),
);
const CustomCompanionSetupPage = lazy(
  () => import("./pages/CustomCompanionSetupPage"),
);
const CustomCompanionChatPage = lazy(
  () => import("./pages/CustomCompanionChatPage"),
);
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const MyCharactersPage = lazy(() => import("./pages/MyCharactersPage"));
const MyFavoritesPage = lazy(() => import("./pages/MyFavoritesPage"));
const RealTimeTranslationPage = lazy(
  () => import("./pages/RealTimeTranslationPage"),
);
const WritingPage = lazy(() => import("./pages/WritingPage"));
const VocabularyReview = lazy(() => import("./pages/VocabularyReview"));
// 儿童模块
const ChildEnglishHome = lazy(
  () => import("./pages/ChildStage/ChildEnglishHome"),
);
const ChildAnimationDetail = lazy(
  () => import("./pages/ChildStage/ChildAnimationDetail"),
);
const ChildQuizGame = lazy(() => import("./pages/ChildStage/ChildQuizGame"));
const ChildVocabularyHub = lazy(
  () => import("./pages/ChildStage/ChildVocabularyHub"),
);
const ChildVocabularyBook = lazy(
  () => import("./pages/ChildStage/ChildVocabularyBook"),
);
const ChildWordDetail = lazy(
  () => import("./pages/ChildStage/ChildWordDetail"),
);
const ChildVocabularyReview = lazy(
  () => import("./pages/ChildStage/ChildVocabularyReview"),
);
const StoryReaderPage = lazy(
  () => import("./pages/ChildStage/StoryReaderPage"),
);
const DailyWordPage = lazy(
  () => import("./pages/ChildStage/InterChild/DailyWordPage"),
);
const ColoringPage = lazy(
  () => import("./pages/ChildStage/InterChild/ColoringPage"),
);
const SongsPage = lazy(() => import("./pages/ChildStage/InterChild/SongsPage"));
const StoriesPage = lazy(
  () => import("./pages/ChildStage/InterChild/StoriesPage"),
);
const AdvancedTrainingPage = lazy(
  () => import("./pages/ChildStage/InterChild/AdvancedTrainingPage"),
);

import type {
  ScenarioMode,
  EnglishLevel,
  VocabularyBookType,
  LearningMode,
} from "./types";
import type { EnglishLearningModeType } from "./components/EnglishLearningModeModal";
import { useFocusReturn } from "./hooks/useAccessibility";
import "./App.css";
import "./styles/EyeCareMode.css";

function AppContent() {
  const { user, token } = useAuth();
  useStudyTimer(user?.id, token);
  const navigate = useNavigate();
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isEnglishModeModalOpen, setIsEnglishModeModalOpen] = useState(false);
  const [isVocabularyModalOpen, setIsVocabularyModalOpen] = useState(false);
  const [isLearningModeModalOpen, setIsLearningModeModalOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  const scenarioFocus = useFocusReturn();
  const englishModeFocus = useFocusReturn();
  const vocabularyFocus = useFocusReturn();
  const learningModeFocus = useFocusReturn();

  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel | null>(null);
  const [selectedVocabulary, setSelectedVocabulary] =
    useState<VocabularyBookType | null>(null);
  const [englishMode, setEnglishMode] = useState<string>("");

  const handleScenarioSelect = (
    scenario: ScenarioMode,
    level?: EnglishLevel,
  ) => {
    console.log("Selected scenario:", scenario, "Level:", level);
    setSelectedScenario(scenario.name);

    if (level) {
      setSelectedLevel(level);
    }
  };

  const handleShowEnglishModeSelection = (level: EnglishLevel) => {
    setSelectedLevel(level);
    englishModeFocus.save();
    setIsEnglishModeModalOpen(true);
  };

  const handleEnglishModeSelect = (mode: EnglishLearningModeType) => {
    console.log("Selected English learning mode:", mode);

    if (mode === "daily-conversation") {
      setEnglishMode("日常对话（英语模式）");
      navigate("/");
    } else if (mode === "listening-speaking") {
      navigate("/listening");
    } else if (mode === "vocabulary") {
      setIsVocabularyModalOpen(true);
    } else if (mode === "real-time-translation") {
      navigate("/translation");
    } else if (mode === "writing") {
      navigate("/writing");
    }
  };

  const handleVocabularySelect = (book: VocabularyBookType) => {
    console.log("Selected vocabulary book:", book);
    setSelectedVocabulary(book);
    setIsVocabularyModalOpen(false);
    setIsLearningModeModalOpen(true);
  };

  const handleLearningModeSelect = (mode: LearningMode) => {
    console.log("Selected learning mode:", mode);
    console.log("Current selectedVocabulary:", selectedVocabulary);

    if (mode === "interactive-memory") {
      navigate("/");
    } else if (mode === "vocabulary-book") {
      // 将选中的单词本类型作为 URL 参数传递
      if (selectedVocabulary) {
        const path = `/vocabulary/${encodeURIComponent(selectedVocabulary)}`;
        console.log("Navigating to:", path);
        navigate(path);
      } else {
        console.error("selectedVocabulary is null!");
      }
    }
  };

  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      setIsProfileSidebarOpen(true);
    }
  };

  const handleNavigateHome = () => {
    setEnglishMode(""); // 清空英语模式，确保日常对话模式下不显示英语模式指示器
    navigate("/");
  };

  return (
    <div className="app">
      <Navbar
        onScenarioClick={() => { scenarioFocus.save(); setIsScenarioModalOpen(true); }}
        onProfileClick={handleProfileClick}
        selectedScenario={selectedScenario}
      />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home englishMode={englishMode} />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/character/:id" element={<CharacterDetail />} />
            <Route path="/vocabulary/:bookType" element={<VocabularyPage />} />
            <Route path="/listening" element={<ListeningPage />} />
            <Route
              path="/listening/intensive/:id"
              element={<IntensiveDetailPage />}
            />
            <Route path="/speaking" element={<SpeakingPage />} />
            <Route path="/translation" element={<RealTimeTranslationPage />} />
            <Route path="/writing" element={<WritingPage />} />
            <Route path="/tree-hole" element={<TreeHolePage />} />
            <Route path="/child-english-home" element={<ChildEnglishHome />} />
            <Route
              path="/child-animation-detail/:id"
              element={<ChildAnimationDetail />}
            />
            <Route path="/child-quiz-game" element={<ChildQuizGame />} />
            <Route path="/child-daily-word" element={<DailyWordPage />} />
            <Route path="/child-coloring" element={<ColoringPage />} />
            <Route path="/child-songs" element={<SongsPage />} />
            <Route path="/child-stories" element={<StoriesPage />} />
            <Route path="/story-reader/:slug" element={<StoryReaderPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route
              path="/child-advanced-training"
              element={<AdvancedTrainingPage />}
            />
            <Route
              path="/child-vocabulary-hub"
              element={<ChildVocabularyHub />}
            />
            <Route
              path="/child-vocabulary-book"
              element={<ChildVocabularyBook />}
            />
            <Route
              path="/child-word-detail/:word"
              element={<ChildWordDetail />}
            />
            <Route
              path="/child-vocabulary-review"
              element={<ChildVocabularyReview />}
            />
            <Route
              path="/vocabulary-review/:bookType"
              element={<VocabularyReview />}
            />
            <Route
              path="/character-selection"
              element={<CharacterSelectionPage />}
            />
            <Route
              path="/character-creation"
              element={<CharacterCreationPage />}
            />
            <Route
              path="/custom-companion-setup"
              element={<CustomCompanionSetupPage />}
            />
            <Route
              path="/custom-companion-chat"
              element={<CustomCompanionChatPage />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/study-time" element={<StudyTimePage />} />

            <Route path="/my-characters" element={<MyCharactersPage />} />
            <Route path="/favorites" element={<MyFavoritesPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/share" element={<SharePage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Suspense fallback={null}>
        <ScenarioModal
          isOpen={isScenarioModalOpen}
          onClose={() => { setIsScenarioModalOpen(false); scenarioFocus.restore(); }}
          onSelectScenario={handleScenarioSelect}
          onShowEnglishModeSelection={handleShowEnglishModeSelection}
          onNavigateHome={handleNavigateHome}
        />

        <EnglishLearningModeModal
          isOpen={isEnglishModeModalOpen}
          onClose={() => { setIsEnglishModeModalOpen(false); englishModeFocus.restore(); }}
          level={selectedLevel}
          onSelectMode={handleEnglishModeSelect}
        />

        <VocabularyModal
          isOpen={isVocabularyModalOpen}
          onClose={() => { setIsVocabularyModalOpen(false); vocabularyFocus.restore(); }}
          onSelectBook={handleVocabularySelect}
        />

        <LearningModeModal
          isOpen={isLearningModeModalOpen}
          onClose={() => { setIsLearningModeModalOpen(false); learningModeFocus.restore(); }}
          onSelectMode={handleLearningModeSelect}
        />
      </Suspense>
      <ProfileSidebar
        isOpen={isProfileSidebarOpen}
        onClose={() => setIsProfileSidebarOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CharacterProvider>
        <EyeCareProvider>
          <Router>
            <AppContent />
          </Router>
        </EyeCareProvider>
      </CharacterProvider>
    </AuthProvider>
  );
}

export default App;
