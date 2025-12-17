"use client";
import { jsx } from "react/jsx-runtime";
import {
  ThemeProvider as NextThemesProvider
} from "next-themes";
function ThemeProvider({ children, ...props }) {
  return /* @__PURE__ */ jsx(NextThemesProvider, { ...props, children });
}
export {
  ThemeProvider
};
