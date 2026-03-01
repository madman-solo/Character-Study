import React, { useState, useEffect } from "react";
import { createCharacter, updateCharacter } from "../services/characterService";
import type { CustomCharacter } from "../services/characterService";
import "../styles/CharacterForm.css";

interface CharacterFormProps {
  userId: string;
  character?: CustomCharacter; // 如果提供，则为编辑模式
  onSuccess: () => void;
  onCancel: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  userId,
  character,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    gender: "female" as "male" | "female" | "other",
    age: "",
    personality: "",
    background: "",
    speakingStyle: "",
    hobbies: [] as string[],
    traits: [] as string[],
  });

  const [hobbyInput, setHobbyInput] = useState("");
  const [traitInput, setTraitInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        avatar: character.avatar || "",
        gender: character.gender,
        age: character.age || "",
        personality: character.personality,
        background: character.background || "",
        speakingStyle: character.speakingStyle || "",
        hobbies: character.hobbies,
        traits: character.traits,
      });
    }
  }, [character]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("请输入角色名称");
      return;
    }

    if (!formData.personality.trim()) {
      alert("请输入性格特征");
      return;
    }

    try {
      setLoading(true);
      if (character) {
        // 编辑模式
        await updateCharacter(character.id, formData);
      } else {
        // 创建模式
        await createCharacter({ ...formData, userId });
      }
      onSuccess();
    } catch (error) {
      console.error("保存角色失败:", error);
      alert("保存角色失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const addHobby = () => {
    if (hobbyInput.trim() && !formData.hobbies.includes(hobbyInput.trim())) {
      setFormData({
        ...formData,
        hobbies: [...formData.hobbies, hobbyInput.trim()],
      });
      setHobbyInput("");
    }
  };

  const removeHobby = (hobby: string) => {
    setFormData({
      ...formData,
      hobbies: formData.hobbies.filter((h) => h !== hobby),
    });
  };

  const addTrait = () => {
    if (traitInput.trim() && !formData.traits.includes(traitInput.trim())) {
      setFormData({
        ...formData,
        traits: [...formData.traits, traitInput.trim()],
      });
      setTraitInput("");
    }
  };

  const removeTrait = (trait: string) => {
    setFormData({
      ...formData,
      traits: formData.traits.filter((t) => t !== trait),
    });
  };

  // 预设性格标签
  const presetTraits = [
    "温柔",
    "活泼",
    "冷静",
    "傲娇",
    "开朗",
    "内向",
    "幽默",
    "认真",
    "天然呆",
    "成熟",
    "可爱",
    "高冷",
  ];

  return (
    <div className="character-form-overlay">
      <div className="character-form-container">
        <div className="form-header">
          <h2>{character ? "编辑角色" : "创建新角色"}</h2>
          <button className="close-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="character-form">
          {/* 基本信息 */}
          <div className="form-section">
            <h3>基本信息</h3>

            <div className="form-group">
              <label>
                角色名称 <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例如：小雪、艾莉丝"
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label>头像URL</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData({ ...formData, avatar: e.target.value })
                }
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>性别</label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as "male" | "female" | "other",
                    })
                  }
                >
                  <option value="female">女性</option>
                  <option value="male">男性</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div className="form-group">
                <label>年龄</label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="例如：18岁、20多岁"
                />
              </div>
            </div>
          </div>

          {/* 性格设定 */}
          <div className="form-section">
            <h3>性格设定</h3>

            <div className="form-group">
              <label>
                性格特征 <span className="required">*</span>
              </label>
              <textarea
                value={formData.personality}
                onChange={(e) =>
                  setFormData({ ...formData, personality: e.target.value })
                }
                placeholder="描述角色的性格特点，例如：温柔体贴、善解人意、喜欢照顾别人"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>性格标签</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={traitInput}
                  onChange={(e) => setTraitInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTrait())
                  }
                  placeholder="输入标签后按回车"
                />
                <button type="button" onClick={addTrait} className="add-btn">
                  添加
                </button>
              </div>
              <div className="preset-tags">
                {presetTraits.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    className={`preset-tag ${formData.traits.includes(trait) ? "active" : ""}`}
                    onClick={() => {
                      if (formData.traits.includes(trait)) {
                        removeTrait(trait);
                      } else {
                        setFormData({
                          ...formData,
                          traits: [...formData.traits, trait],
                        });
                      }
                    }}
                  >
                    {trait}
                  </button>
                ))}
              </div>
              <div className="tags-list">
                {formData.traits.map((trait) => (
                  <span key={trait} className="tag">
                    {trait}
                    <button
                      type="button"
                      onClick={() => removeTrait(trait)}
                      className="tag-remove"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 详细设定 */}
          <div className="form-section">
            <h3>详细设定</h3>

            <div className="form-group">
              <label>背景故事</label>
              <textarea
                value={formData.background}
                onChange={(e) =>
                  setFormData({ ...formData, background: e.target.value })
                }
                placeholder="角色的背景故事、经历等"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>说话风格</label>
              <textarea
                value={formData.speakingStyle}
                onChange={(e) =>
                  setFormData({ ...formData, speakingStyle: e.target.value })
                }
                placeholder="描述角色的说话方式，例如：语气温柔、喜欢用叠词、经常使用敬语"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>兴趣爱好</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={hobbyInput}
                  onChange={(e) => setHobbyInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addHobby())
                  }
                  placeholder="输入爱好后按回车"
                />
                <button type="button" onClick={addHobby} className="add-btn">
                  添加
                </button>
              </div>
              <div className="tags-list">
                {formData.hobbies.map((hobby) => (
                  <span key={hobby} className="tag">
                    {hobby}
                    <button
                      type="button"
                      onClick={() => removeHobby(hobby)}
                      className="tag-remove"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={loading}
            >
              取消
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "保存中..." : character ? "保存修改" : "创建角色"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterForm;
