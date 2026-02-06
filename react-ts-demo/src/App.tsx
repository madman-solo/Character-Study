import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CharacterProvider } from "./contexts/CharacterContext";
import { EyeCareProvider } from "./contexts/EyeCareContext";
import Navbar from "./components/Navbar";
import ScenarioModal from "./components/ScenarioModal";
import EnglishLearningModeModal from "./components/EnglishLearningModeModal";
import VocabularyModal from "./components/VocabularyModal";
import LearningModeModal from "./components/LearningModeModal";
import ProfileSidebar from "./components/ProfileSidebar";
import Home from "./pages/Home";
import Characters from "./pages/Characters";
import CharacterDetail from "./pages/CharacterDetail";
import VocabularyPage from "./pages/VocabularyPage";
import ListeningPage from "./pages/ListeningPage";
import SpeakingPage from "./pages/SpeakingPage";
import TreeHolePage from "./pages/TreeHolePage";
import CustomCompanionSetupPage from "./pages/CustomCompanionSetupPage";
import CustomCompanionChatPage from "./pages/CustomCompanionChatPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import MyCharactersPage from "./pages/MyCharactersPage";
import MyFavoritesPage from "./pages/MyFavoritesPage";
import RealTimeTranslationPage from "./pages/RealTimeTranslationPage";
import WritingPage from "./pages/WritingPage";
import ChildEnglishHome from "./pages/ChildStage/ChildEnglishHome";
import ChildAnimationDetail from "./pages/ChildStage/ChildAnimationDetail";
import ChildQuizGame from "./pages/ChildStage/ChildQuizGame";
import DailyWordPage from "./pages/ChildStage/InterChild/DailyWordPage";
import ColoringPage from "./pages/ChildStage/InterChild/ColoringPage";
import SongsPage from "./pages/ChildStage/InterChild/SongsPage";
import StoriesPage from "./pages/ChildStage/InterChild/StoriesPage";
import GamesPage from "./pages/ChildStage/InterChild/GamesPage";
import VIPPage from "./pages/ChildStage/InterChild/VIPPage";
import PremiumCoursesPage from "./pages/ChildStage/InterChild/PremiumCoursesPage";
import AdvancedTrainingPage from "./pages/ChildStage/InterChild/AdvancedTrainingPage";
import SpecialMaterialsPage from "./pages/ChildStage/InterChild/SpecialMaterialsPage";
import DailyLifePage from "./pages/ChildStage/InterChild/DailyLifePage";
import SchoolStoriesPage from "./pages/ChildStage/InterChild/SchoolStoriesPage";
import FamilyTimePage from "./pages/ChildStage/InterChild/FamilyTimePage";
import NaturePage from "./pages/ChildStage/InterChild/NaturePage";
import DailyPhrasesPage from "./pages/ChildStage/InterChild/DailyPhrasesPage";
import FoodEnglishPage from "./pages/ChildStage/InterChild/FoodEnglishPage";
import TransportationPage from "./pages/ChildStage/InterChild/TransportationPage";
import HealthMedicalPage from "./pages/ChildStage/InterChild/HealthMedicalPage";
import ChildVocabularyHub from "./pages/ChildStage/ChildVocabularyHub";
import ChildVocabularyBook from "./pages/ChildStage/ChildVocabularyBook";
import ChildWordDetail from "./pages/ChildStage/ChildWordDetail";
import ChildVocabularyReview from "./pages/ChildStage/ChildVocabularyReview";
import VocabularyReview from "./pages/VocabularyReview";
import StoryReaderPage from "./pages/ChildStage/StoryReaderPage";
import type {
  ScenarioMode,
  EnglishLevel,
  VocabularyBookType,
  LearningMode,
} from "./types";
import type { EnglishLearningModeType } from "./components/EnglishLearningModeModal";
import "./App.css";
import "./styles/EyeCareMode.css";

function AppContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isEnglishModeModalOpen, setIsEnglishModeModalOpen] = useState(false);
  const [isVocabularyModalOpen, setIsVocabularyModalOpen] = useState(false);
  const [isLearningModeModalOpen, setIsLearningModeModalOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

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
        onScenarioClick={() => setIsScenarioModalOpen(true)}
        onProfileClick={handleProfileClick}
        selectedScenario={selectedScenario}
      />

      <Routes>
        <Route path="/" element={<Home englishMode={englishMode} />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/character/:id" element={<CharacterDetail />} />
        <Route path="/vocabulary/:bookType" element={<VocabularyPage />} />
        <Route path="/listening" element={<ListeningPage />} />
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
        <Route path="/child-games" element={<GamesPage />} />
        <Route path="/child-vip" element={<VIPPage />} />
        <Route path="/child-premium-courses" element={<PremiumCoursesPage />} />
        <Route path="/child-advanced-training" element={<AdvancedTrainingPage />} />
        <Route path="/child-special-materials" element={<SpecialMaterialsPage />} />
        <Route path="/child-daily-life" element={<DailyLifePage />} />
        <Route path="/child-school-stories" element={<SchoolStoriesPage />} />
        <Route path="/child-family-time" element={<FamilyTimePage />} />
        <Route path="/child-nature" element={<NaturePage />} />
        <Route path="/child-daily-phrases" element={<DailyPhrasesPage />} />
        <Route path="/child-food-english" element={<FoodEnglishPage />} />
        <Route path="/child-transportation" element={<TransportationPage />} />
        <Route path="/child-health-medical" element={<HealthMedicalPage />} />
        <Route path="/child-vocabulary-hub" element={<ChildVocabularyHub />} />
        <Route path="/child-vocabulary-book" element={<ChildVocabularyBook />} />
        <Route path="/child-word-detail/:word" element={<ChildWordDetail />} />
        <Route path="/child-vocabulary-review" element={<ChildVocabularyReview />} />
        <Route path="/vocabulary-review/:bookType" element={<VocabularyReview />} />
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
        <Route
          path="/friends"
          element={<PlaceholderPage title="我的好友" icon="👥" />}
        />
        <Route
          path="/study-time"
          element={<PlaceholderPage title="学习时长" icon="⏱️" />}
        />
        <Route path="/my-characters" element={<MyCharactersPage />} />
        <Route
          path="/games"
          element={<PlaceholderPage title="益智小游戏" icon="🎮" />}
        />
        <Route
          path="/notes"
          element={<PlaceholderPage title="我的笔记" icon="📝" />}
        />
        <Route path="/favorites" element={<MyFavoritesPage />} />
        <Route
          path="/eye-care"
          element={<PlaceholderPage title="护眼模式" icon="👁️" />}
        />
        <Route
          path="/help"
          element={<PlaceholderPage title="帮助与反馈" icon="❓" />}
        />
        <Route
          path="/share"
          element={<PlaceholderPage title="分享好友" icon="📤" />}
        />
      </Routes>

      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        onSelectScenario={handleScenarioSelect}
        onShowEnglishModeSelection={handleShowEnglishModeSelection}
        onNavigateHome={handleNavigateHome}
      />

      <EnglishLearningModeModal
        isOpen={isEnglishModeModalOpen}
        onClose={() => setIsEnglishModeModalOpen(false)}
        level={selectedLevel}
        onSelectMode={handleEnglishModeSelect}
      />

      <VocabularyModal
        isOpen={isVocabularyModalOpen}
        onClose={() => setIsVocabularyModalOpen(false)}
        onSelectBook={handleVocabularySelect}
      />

      <LearningModeModal
        isOpen={isLearningModeModalOpen}
        onClose={() => setIsLearningModeModalOpen(false)}
        onSelectMode={handleLearningModeSelect}
      />

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
