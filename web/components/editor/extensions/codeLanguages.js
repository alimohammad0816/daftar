import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';

// بند ۴: «زبان‌های محدود (js, ts, python, bash, sql, json)».
export const lowlight = createLowlight();
lowlight.register({ javascript, typescript, python, bash, sql, json });
