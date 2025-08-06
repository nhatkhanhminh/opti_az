// hooks/helpers.ts
import { DrawerDirection } from "@/types/global";

export function isVertical(direction: DrawerDirection) {
  switch (direction) {
    case "top":
    case "bottom":
      return true;
    case "left":
    case "right":
      return false;
    default:
      return direction satisfies never;
  }
}

export function assignStyle(element: HTMLElement | null | undefined, style: Partial<CSSStyleDeclaration>) {
  if (!element) return () => {};
  const prevStyle = element.style.cssText;
  Object.assign(element.style, style);
  return () => {
    element.style.cssText = prevStyle;
  };
}

export function chain(...fns: Array<() => void>) {
  return () => {
    for (const fn of fns) {
      if (typeof fn === "function") fn();
    }
  };
}