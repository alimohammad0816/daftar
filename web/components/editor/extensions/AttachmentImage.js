import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import AttachmentImageView from './AttachmentImageView';

// بند ۴ و ۱۳.۴: در سند فقط attachmentId/hash/width/height/status ذخیره
// می‌شود، هیچ‌وقت خودِ فایل — NodeView با URL.createObjectURL نمایشش می‌دهد.
export const AttachmentImage = Node.create({
  name: 'attachmentImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      attachmentId: { default: null },
      hash: { default: null },
      width: { default: null },
      height: { default: null },
      status: { default: 'ready' },
      alt: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-attachment-image]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-attachment-image': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AttachmentImageView);
  },
});
