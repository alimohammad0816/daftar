'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { NodeViewWrapper } from '@tiptap/react';
import { useAttachmentUpload } from '@/lib/useAttachmentUpload';
import { useAttachmentUrl } from '@/lib/useAttachmentUrl';
import { toFa } from '@/lib/toFa';
import { RADIUS_SM } from '@/theme/theme';

function formatSize(bytes) {
  if (bytes < 1024) return `${toFa(bytes)} بایت`;
  if (bytes < 1024 * 1024) return `${toFa(Math.round(bytes / 1024))} کیلوبایت`;
  return `${toFa((bytes / (1024 * 1024)).toFixed(1))} مگابایت`;
}

export default function FileAttachmentView({ node, updateAttributes }) {
  const { hash, name, size, status } = node.attrs;
  useAttachmentUpload(hash, status, updateAttributes);
  const url = useAttachmentUrl(hash, status);
  const downloadReady = status === 'ready' && url;

  return (
    <NodeViewWrapper data-file-attachment="" contentEditable={false}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          my: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: `${RADIUS_SM}px`,
          maxWidth: 360,
        }}
      >
        <InsertDriveFileRoundedIcon color="action" />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography noWrap sx={{ fontWeight: 600, unicodeBidi: 'isolate' }}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatSize(size)}
          </Typography>
        </Box>
        {downloadReady ? (
          <IconButton component="a" href={url} download={name} aria-label="دانلود" sx={{ width: 44, height: 44 }}>
            <DownloadRoundedIcon />
          </IconButton>
        ) : (
          <CircularProgress size={20} sx={{ mx: 1.5 }} />
        )}
      </Box>
    </NodeViewWrapper>
  );
}
