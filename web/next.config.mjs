/** @type {import('next').NextConfig} */
const nextConfig = {
  // ایمیج Docker تولید را کوچک نگه می‌دارد — فقط server.js + node_modules
  // هرس‌شده به‌جای کل پروژه (بند ۱۶، فاز Docker).
  output: 'standalone',
};

export default nextConfig;
