'use client';

import { useEffect, useState } from 'react';
import { getLocalBlobUrl, getRemoteBlobUrl } from './attachments';

// بند ۴: «در useEffect حتماً revokeObjectURL صدا بزن وگرنه حافظه نشت می‌کند» —
// فقط URLهای محلی (ساخته‌شدهٔ همین هوک) revoke می‌شوند، نه کش دوردستِ مشترک.
export function useAttachmentUrl(hash, status) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!hash) return undefined;
    let cancelled = false;
    let localUrl = null;

    (async () => {
      const local = await getLocalBlobUrl(hash);
      if (local) {
        localUrl = local;
        if (!cancelled) setUrl(local);
        return;
      }
      if (status === 'ready') {
        try {
          const remote = await getRemoteBlobUrl(hash);
          if (!cancelled) setUrl(remote);
        } catch {
          // فایل فعلاً در دسترس نیست
        }
      }
    })();

    return () => {
      cancelled = true;
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [hash, status]);

  return url;
}
