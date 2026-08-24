'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, logout as apiLogout, me, verifyRecovery as apiVerifyRecovery, verifyTotp as apiVerifyTotp } from './api';

// بند ۱۴.۱ (بازنگری فاز ۵): ورود دروازهٔ کل اپ است. این کانتکست تنها منبع
// وضعیت نشست است — هم AuthGate برای قفل کل اپ از آن می‌خواند، هم پنل تنظیمات
// برای نمایش «وارد شده به‌عنوان» و خروج.
export const STAGE = { LOADING: 'loading', LOGGED_OUT: 'logged-out', NEED_CODE: 'need-code', LOGGED_IN: 'logged-in' };

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [stage, setStage] = useState(STAGE.LOADING);
  const [session, setSession] = useState(null);

  useEffect(() => {
    me()
      .then((data) => {
        setSession(data);
        setStage(STAGE.LOGGED_IN);
      })
      .catch(() => setStage(STAGE.LOGGED_OUT));
  }, []);

  const login = async (username, password) => {
    await apiLogin(username, password);
    setStage(STAGE.NEED_CODE);
  };

  const finishLogin = async () => {
    const data = await me();
    setSession(data);
    setStage(STAGE.LOGGED_IN);
  };

  const verifyTotp = async (code) => {
    await apiVerifyTotp(code);
    await finishLogin();
  };

  const verifyRecovery = async (code) => {
    await apiVerifyRecovery(code);
    await finishLogin();
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setSession(null);
      setStage(STAGE.LOGGED_OUT);
    }
  };

  return (
    <SessionContext.Provider value={{ stage, session, login, verifyTotp, verifyRecovery, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession باید داخل SessionProvider استفاده شود');
  return ctx;
}
