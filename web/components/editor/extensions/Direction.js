import { Extension } from '@tiptap/core';

// بند ۴ در PLAN.md: بدون این، پاراگرافی که با کلمهٔ انگلیسی شروع شود چپ‌چین
// می‌پرد. attribute `dir` را روی هر بلوک نگه می‌دارد؛ دکمهٔ تولبار همین را
// با setTextDirection عوض می‌کند.
export const Direction = Extension.create({
  name: 'direction',

  addOptions() {
    return {
      types: ['heading', 'paragraph', 'blockquote'],
      defaultDirection: null,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          dir: {
            default: this.options.defaultDirection,
            parseHTML: (element) => element.getAttribute('dir') || this.options.defaultDirection,
            renderHTML: (attributes) => (attributes.dir ? { dir: attributes.dir } : {}),
          },
        },
      },
    ];
  },

  addCommands() {
    // .map+.some نه .every: هر لحظه فقط یکی از انواع (مثلاً paragraph) در
    // انتخاب فعلی حضور دارد؛ .every روی اولین نوعِ نبود (مثلاً heading)
    // کوتاه‌مدار می‌شود و هیچ‌وقت به paragraph نمی‌رسد — دقیقاً همان الگویی
    // که خودِ TextAlign رسمی TipTap برای این مسئله استفاده می‌کند.
    return {
      setTextDirection:
        (direction) =>
        ({ commands }) =>
          this.options.types.map((type) => commands.updateAttributes(type, { dir: direction })).some(Boolean),
      unsetTextDirection:
        () =>
        ({ commands }) =>
          this.options.types.map((type) => commands.resetAttributes(type, 'dir')).some(Boolean),
    };
  },
});
