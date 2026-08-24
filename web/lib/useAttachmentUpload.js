'use client';

import { useEffect } from 'react';
import { uploadPendingBlob } from './attachments';

// همان افکت هم آپلود اولیه را انجام می‌دهد هم رزومهٔ بعد از قطعی را — چون هر دو
// یعنی «این نود با status=uploading مانت شد، ببین بایت‌ها محلی هستند یا نه».
export function useAttachmentUpload(hash, status, updateAttributes) {
  useEffect(() => {
    if (status !== 'uploading' || !hash) return undefined;
    let cancelled = false;

    uploadPendingBlob(hash)
      .then((uploaded) => {
        if (uploaded && !cancelled) updateAttributes({ status: 'ready' });
      })
      .catch(() => {
        // بی‌اهمیت — دفعهٔ بعد که این یادداشت باز شود دوباره امتحان می‌شود
      });

    return () => {
      cancelled = true;
    };
  }, [hash, status, updateAttributes]);
}
