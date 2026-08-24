import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FileAttachmentView from './FileAttachmentView';

// بند ۴: «فقط نمایش کارت فایل و دانلود — پیش‌نمایش PDF داخل اپ را فعلاً نساز».
export const FileAttachment = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      attachmentId: { default: null },
      hash: { default: null },
      name: { default: 'فایل' },
      size: { default: 0 },
      status: { default: 'ready' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-file-attachment]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-file-attachment': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView);
  },
});
