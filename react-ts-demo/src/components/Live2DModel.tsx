import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).PIXI = PIXI;
PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL_LEGACY;

interface Live2DModelProps {
  modelPath: string | string[];
  width?: number;
  height?: number;
  paddingBottom?: number;
  paddingRight?: number;
  right?: number;
  onModelLoaded?: () => void;
}

const Live2DModelComponent = ({
  modelPath,
  width = 800,
  height = 600,
  paddingBottom = 50,
  paddingRight = 150,
  right = 100,
  onModelLoaded,
}: Live2DModelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || initializedRef.current) return;
    initializedRef.current = true;

    let destroyed = false;
    let pixiApp: PIXI.Application | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const models: any[] = [];

    const init = async () => {
      pixiApp = new PIXI.Application({
        view: canvas,
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      if (destroyed) {
        pixiApp.destroy(true);
        return;
      }

      const paths = Array.isArray(modelPath) ? modelPath : [modelPath];

      try {
        const loaded = await Promise.all(paths.map((p) => Live2DModel.from(p)));

        if (destroyed) {
          loaded.forEach((m) => {
            try {
              m.destroy();
            } catch {
              /* ignore */
            }
          });
          pixiApp.destroy(true);
          return;
        }

        loaded.forEach((model, i) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pixiApp!.stage.addChild(model as any);
          models.push(model);

          const scaleX = width / paths.length / model.width;
          const scaleY = height / model.height;
          const scale = Math.min(scaleX, scaleY) * 0.85;
          model.scale.set(scale);

          const slotWidth = width / paths.length;
          model.x = slotWidth * i + (slotWidth - model.width * scale) / 2;
          model.y = (height - model.height * scale) / 2;

          model.interactive = true;
          model.buttonMode = true;
          model.on("pointerdown", () => model.motion("Tap"));
          model.motion("Idle");
        });

        canvas.addEventListener("mousemove", (e) => {
          const rect = canvas.getBoundingClientRect();
          models.forEach((m) =>
            m.focus(e.clientX - rect.left, e.clientY - rect.top),
          );
        });

        onModelLoaded?.();
      } catch (err) {
        console.error("Live2D 模型加载失败:", err);
      }
    };

    init();

    return () => {
      destroyed = true;
      initializedRef.current = false;
      models.forEach((m) => {
        try {
          m.destroy();
        } catch {
          /* ignore */
        }
      });
      if (pixiApp) {
        try {
          pixiApp.destroy(true);
        } catch {
          /* ignore */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width * 1.5}
      height={height * 1.5}
      style={{
        display: "block",
        // width: width,
        // height: height,
        paddingRight: paddingRight,
        paddingBottom: paddingBottom,
        position: "absolute",
        right: `${right}px`,
      }}
    />
  );
};

export default Live2DModelComponent;
