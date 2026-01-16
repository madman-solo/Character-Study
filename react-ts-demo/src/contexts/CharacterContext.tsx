import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { Character } from "../types";
import { useAuth } from "./AuthContext";
import {
  getUserCharacters,
  getUserFavorites,
  addUserCharacter,
  removeUserCharacter,
  addUserFavorite,
  removeUserFavorite,
  setDefaultCharacter,
} from "../api";

interface CharacterContextType {
  myCharacters: Character[];
  myFavorites: Character[];
  currentCharacter: Character | null;
  isCharacterAdded: (characterId: string) => boolean;
  isCharacterFavorited: (characterId: string) => boolean;
  addCharacter: (character: Character, setAsDefault?: boolean) => Promise<void>;
  removeCharacter: (characterId: string) => Promise<void>;
  favoriteCharacter: (character: Character) => Promise<void>;
  unfavoriteCharacter: (characterId: string) => Promise<void>;
  setAsCurrentCharacter: (character: Character) => Promise<void>;
  refreshData: () => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
);

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
};

interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider = ({ children }: CharacterProviderProps) => {
  const { user } = useAuth();
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [myFavorites, setMyFavorites] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
    null
  );

  // 加载用户的角色和收藏
  const loadUserData = async () => {
    if (!user) {
      // 用户未登录时清空数据
      setMyCharacters([]);
      setMyFavorites([]);
      setCurrentCharacter(null);
      return;
    }

    try {
      const [characters, favorites] = await Promise.all([
        getUserCharacters(user.id),
        getUserFavorites(user.id),
      ]);

      setMyCharacters(characters);
      setMyFavorites(favorites);

      // 设置当前角色为默认角色
      const defaultChar = characters.find((char: any) => char.isDefault);
      if (defaultChar) {
        setCurrentCharacter(defaultChar);
      } else if (characters.length > 0) {
        setCurrentCharacter(characters[0]);
      } else {
        setCurrentCharacter(null);
      }
    } catch (error) {
      console.error("加载用户数据失败:", error);
      // 发生错误时也清空数据
      setMyCharacters([]);
      setMyFavorites([]);
      setCurrentCharacter(null);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const refreshData = async () => {
    await loadUserData();
  };

  const isCharacterAdded = (characterId: string) => {
    return myCharacters.some((char) => char.id === characterId);
  };

  const isCharacterFavorited = (characterId: string) => {
    return myFavorites.some((char) => char.id === characterId);
  };

  const addCharacter = async (
    character: Character,
    setAsDefault: boolean = false
  ) => {
    if (!user) {
      alert("请先登录");
      return;
    }

    try {
      await addUserCharacter(user.id, character.id, setAsDefault);
      await refreshData();
    } catch (error) {
      console.error("添加角色失败:", error);
      throw error;
    }
  };

  const removeCharacter = async (characterId: string) => {
    if (!user) return;

    try {
      await removeUserCharacter(user.id, characterId);
      await refreshData();
    } catch (error) {
      console.error("移除角色失败:", error);
      throw error;
    }
  };

  const favoriteCharacter = async (character: Character) => {
    if (!user) {
      alert("请先登录");
      return;
    }

    try {
      await addUserFavorite(user.id, character.id);
      await refreshData();
    } catch (error) {
      console.error("收藏角色失败:", error);
      throw error;
    }
  };

  const unfavoriteCharacter = async (characterId: string) => {
    if (!user) return;

    try {
      await removeUserFavorite(user.id, characterId);
      await refreshData();
    } catch (error) {
      console.error("取消收藏失败:", error);
      throw error;
    }
  };

  const setAsCurrentCharacter = async (character: Character) => {
    if (!user) return;

    try {
      await setDefaultCharacter(user.id, character.id);
      setCurrentCharacter(character);
      await refreshData();
    } catch (error) {
      console.error("设置默认角色失败:", error);
      throw error;
    }
  };

  return (
    <CharacterContext.Provider
      value={{
        myCharacters,
        myFavorites,
        currentCharacter,
        isCharacterAdded,
        isCharacterFavorited,
        addCharacter,
        removeCharacter,
        favoriteCharacter,
        unfavoriteCharacter,
        setAsCurrentCharacter,
        refreshData,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};
