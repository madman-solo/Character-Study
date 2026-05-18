// ESC 关闭 + 焦点陷阱
import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export function useFocusReturn() {
  const triggerRef = useRef<HTMLElement | null>(null);
  const save = () => { triggerRef.current = document.activeElement as HTMLElement; };
  const restore = () => { triggerRef.current?.focus(); };
  return { save, restore };
}
export function useFocusTrap(ref: RefObject<HTMLElement>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return; //弹幕关闭时不执行
    const el = ref.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
    ); //获取所有可聚焦元素
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus(); //默认聚焦第一个元素

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      // 重新查询，支持动态内容（如子视图切换）
      const focusableNow = el.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      const firstNow = focusableNow[0];
      const lastNow = focusableNow[focusableNow.length - 1];
      // 焦点不在模态框内时，强制拉回
      if (!el.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? lastNow : firstNow)?.focus();
        return;
      }
      if (e.shiftKey ? document.activeElement === firstNow : document.activeElement === lastNow) {
        e.preventDefault();
        (e.shiftKey ? lastNow : firstNow)?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);
}

export function useEscClose(onClose: () => void, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return; //弹幕关闭时不执行
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(); //监听 ESC 键，关闭弹幕
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
}
