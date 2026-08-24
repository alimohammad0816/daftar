import { compressImage } from './compressImage';
import { stageBlob } from './attachments';

// بند ۱۲.۶: سقف اندازهٔ فایل — همان عددی که سرور هم اجرا می‌کند (api/app/config.py).
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function insertFileIntoEditor(editor, file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('حجم فایل از ۲۵ مگابایت بیشتر است');
  }

  const attachmentId = crypto.randomUUID();
  const isImage = file.type.startsWith('image/');

  // بعد از insertContent یک نود atom، انتخاب روی خودِ همان نود می‌ماند
  // (NodeSelection) نه بعد از آن — بدون یک پاراگراف خالی دنبالش، درجِ بعدی
  // (یا حتی تایپ خود کاربر) همین نود را جایگزین می‌کند نه اینکه بعدش بیاید.
  // این هم دقیقاً همان جای‌گذاری‌ای است که بند ۱۳.۴ می‌خواهد: «کاربر همان‌جا
  // شروع به نوشتن توضیح می‌کند».
  if (isImage) {
    const { blob, width, height } = await compressImage(file);
    const hash = await stageBlob(blob, 'image/webp');
    editor
      .chain()
      .focus()
      .insertContent([
        { type: 'attachmentImage', attrs: { attachmentId, hash, width, height, status: 'uploading' } },
        { type: 'paragraph' },
      ])
      .run();
    return;
  }

  const hash = await stageBlob(file, file.type || 'application/octet-stream');
  editor
    .chain()
    .focus()
    .insertContent([
      { type: 'fileAttachment', attrs: { attachmentId, hash, name: file.name, size: file.size, status: 'uploading' } },
      { type: 'paragraph' },
    ])
    .run();
}
