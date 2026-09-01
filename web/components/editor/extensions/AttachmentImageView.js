'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { NodeViewWrapper } from '@tiptap/react';
import { useAttachmentUpload } from '@/lib/useAttachmentUpload';
import { useAttachmentUrl } from '@/lib/useAttachmentUrl';
import { RADIUS_SM } from '@/theme/theme';

// عرض/ارتفاع ذخیره‌شده در نود، اندازهٔ *فایلِ فشرده* است (تا ۱۶۰۰px — بند
// compressImage.js)، نه اندازهٔ مناسب نمایش. قبلاً همان عدد مستقیم عرض قاب
// می‌شد و عکس تمام پهنای ادیتور را می‌گرفت؛ یک عکس عمودی گوشی حتی یک صفحهٔ
// کامل ارتفاع می‌خورد. اینجا در یک قاب حداکثر ۴۲۰×۳۶۰ جا می‌شود — بدون
// بزرگ‌نمایی عکس‌های کوچک‌تر از آن.
const MAX_DISPLAY_WIDTH = 420;
const MAX_DISPLAY_HEIGHT = 360;

function displayWidth(width, height) {
  if (!width || !height) return MAX_DISPLAY_WIDTH;
  const scale = Math.min(1, MAX_DISPLAY_WIDTH / width, MAX_DISPLAY_HEIGHT / height);
  return Math.round(width * scale);
}

export default function AttachmentImageView({ node, updateAttributes }) {
  const { hash, width, height, status, alt } = node.attrs;
  useAttachmentUpload(hash, status, updateAttributes);
  const url = useAttachmentUrl(hash, status);

  return (
    <NodeViewWrapper data-attachment-image="" contentEditable={false}>
      <Box
        sx={{
          position: 'relative',
          maxWidth: '100%',
          width: displayWidth(width, height),
          aspectRatio: width && height ? `${width} / ${height}` : '4 / 3',
          bgcolor: 'action.hover',
          borderRadius: `${RADIUS_SM}px`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          my: 1,
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- بلاب محلی/دانلودشده، نه URL قابل بهینه‌سازی next/image
          <img src={url} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        ) : (
          <CircularProgress size={28} />
        )}
      </Box>
    </NodeViewWrapper>
  );
}
