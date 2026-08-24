'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { NodeViewWrapper } from '@tiptap/react';
import { useAttachmentUpload } from '@/lib/useAttachmentUpload';
import { useAttachmentUrl } from '@/lib/useAttachmentUrl';

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
          width: width || 320,
          aspectRatio: width && height ? `${width} / ${height}` : '4 / 3',
          bgcolor: 'action.hover',
          borderRadius: 2,
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
