/**
 * 音效控制组件
 * 提供音效开关和音量调节功能
 */

import React from "react";
import type { SoundConfig } from "../../../hooks/useChildSound";
import "./SoundControl.css";

interface SoundControlProps {
  config: SoundConfig;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}

const SoundControl: React.FC<SoundControlProps> = ({
  config,
  onToggle,
  onVolumeChange,
}) => {
  return (
    <div className="child-sound-control">
      <button
        className={`child-sound-toggle ${config.enabled ? "active" : ""}`}
        onClick={onToggle}
        aria-label={config.enabled ? "关闭音效" : "开启音效"}
        title={config.enabled ? "关闭音效" : "开启音效"}
      >
        {config.enabled ? "🔊" : "🔇"}
      </button>

      {config.enabled && (
        <div className="child-sound-volume child-animate-slide-right">
          <input
            type="range"
            min="0"
            max="100"
            value={config.volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="child-volume-slider"
            aria-label="音量"
          />
          <span className="child-volume-value">{config.volume}%</span>
        </div>
      )}
    </div>
  );
};

export default SoundControl;
