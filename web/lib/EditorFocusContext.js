'use client';

import { createContext, useContext, useState } from 'react';

// روی موبایل وقتی ادیتور فوکوس دارد MobileToolbar کف صفحه ثابت می‌شود؛ اگر
// IslandNav هم همان‌جا شناور بماند، دو نوار روی هم تلنبار می‌شوند. این
// context فقط همین یک بیت («ادیتور الان فوکوس دارد؟») را بین Editor و
// IslandNav به اشتراک می‌گذارد تا IslandNav موقتاً کنار برود.
const EditorFocusContext = createContext({ focused: false, setFocused: () => {} });

export function EditorFocusProvider({ children }) {
  const [focused, setFocused] = useState(false);
  return <EditorFocusContext.Provider value={{ focused, setFocused }}>{children}</EditorFocusContext.Provider>;
}

export function useEditorFocus() {
  return useContext(EditorFocusContext);
}
