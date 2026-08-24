import * as Y from 'yjs';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

// وقتی لاگ به این اندازه رسید، سرور را وادار به فشرده‌سازی می‌کنیم — بند ۱۳.۲.
const SNAPSHOT_THRESHOLD = 500;
const RETRY_DELAY_MS = 4000;

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// بند ۱۳.۲/۱۶.۵: سرور رلهٔ کور است — پروتکل استاندارد y-websocket اینجا کار
// نمی‌کند چون به خواندن state vector روی سرور نیاز دارد. این پرووایدر خودش،
// در هر اتصال، snapshot+لاگ سرور را می‌گیرد، دیفِ محلیِ نادیده را حساب و
// می‌فرستد، و از آن به بعد فقط بستهٔ خام Yjs رد و بدل می‌کند (بند ۱۳.۵ مورد ۳:
// اتصال فقط وقتی صفحه دیده می‌شود؛ pause/connect را useLiveSync صدا می‌زند).
export class SyncProvider {
  constructor(docId, ydoc) {
    this.docId = docId;
    this.ydoc = ydoc;
    this.ws = null;
    this.lastSeq = 0;
    this.status = 'paused';
    this._listeners = new Set();
    this._destroyed = false;
    this._paused = true;
    this._connecting = false;
    this._compacting = false;
    this._retryTimer = null;

    this._onLocalUpdate = (update, origin) => {
      if (origin === this) return;
      this._send(update);
    };
    this.ydoc.on('update', this._onLocalUpdate);
  }

  onStatus(fn) {
    this._listeners.add(fn);
    fn(this.status);
    return () => this._listeners.delete(fn);
  }

  _setStatus(status) {
    this.status = status;
    for (const fn of this._listeners) fn(status);
  }

  _send(bytes) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(bytes);
  }

  connect() {
    if (this._destroyed) return;
    this._paused = false;
    clearTimeout(this._retryTimer);
    this._retryTimer = null;
    if (this.ws || this._connecting) return;

    this._connecting = true;
    this._setStatus('connecting');
    this._syncThenOpen().finally(() => {
      this._connecting = false;
    });
  }

  async _syncThenOpen() {
    try {
      const res = await fetch(`${API_BASE}/sync/${this.docId}/since?seq=0`, { credentials: 'include' });
      if (!res.ok) throw new Error('sync-since-failed');
      const { seq, updates } = await res.json();
      if (this._destroyed || this._paused) return;

      const remoteDoc = new Y.Doc();
      for (const b64 of updates) Y.applyUpdate(remoteDoc, base64ToBytes(b64));
      const remoteState = Y.encodeStateVector(remoteDoc);
      const localDiff = Y.encodeStateAsUpdate(this.ydoc, remoteState);
      Y.applyUpdate(this.ydoc, Y.encodeStateAsUpdate(remoteDoc), this);
      this.lastSeq = seq;

      this._openSocket(localDiff);
      if (updates.length > SNAPSHOT_THRESHOLD) this._compact();
    } catch {
      if (this._destroyed || this._paused) return;
      this._setStatus('error');
      this._scheduleRetry();
    }
  }

  _openSocket(localDiff) {
    const ws = new WebSocket(`${WS_BASE}/sync/${this.docId}`);
    ws.binaryType = 'arraybuffer';
    this.ws = ws;

    ws.onopen = () => {
      this._setStatus('connected');
      if (localDiff && localDiff.byteLength > 2) ws.send(localDiff);
    };
    ws.onmessage = (event) => {
      const buf = new Uint8Array(event.data);
      const seq = new DataView(buf.buffer, buf.byteOffset, 4).getUint32(0, false);
      Y.applyUpdate(this.ydoc, buf.subarray(4), this);
      this.lastSeq = Math.max(this.lastSeq, seq);
    };
    ws.onclose = () => {
      if (this.ws !== ws) return; // بستهٔ خودمان (pause/destroy) — قبلاً مدیریت شده
      this.ws = null;
      this._setStatus(this._destroyed || this._paused ? 'paused' : 'disconnected');
      if (!this._destroyed && !this._paused) this._scheduleRetry();
    };
  }

  _scheduleRetry() {
    if (this._destroyed || this._paused || this._retryTimer) return;
    this._retryTimer = setTimeout(() => {
      this._retryTimer = null;
      this.connect();
    }, RETRY_DELAY_MS);
  }

  async _compact() {
    if (this._compacting) return;
    this._compacting = true;
    try {
      const payload = Y.encodeStateAsUpdate(this.ydoc);
      await fetch(`${API_BASE}/sync/${this.docId}/snapshot?seq=${this.lastSeq}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: payload,
      });
    } catch {
      // بی‌اهمیت — دفعهٔ بعد که لاگ باز هم بزرگ بود دوباره امتحان می‌شود
    } finally {
      this._compacting = false;
    }
  }

  // بند ۱۳.۵ مورد ۳: اتصال فقط در پیش‌زمینه — اینجا فقط WS بسته می‌شود، پرووایدر
  // زنده می‌ماند تا connect() بعدی بدون ساخت نمونهٔ تازه کار کند.
  pause() {
    this._paused = true;
    clearTimeout(this._retryTimer);
    this._retryTimer = null;
    if (this.ws) {
      const ws = this.ws;
      this.ws = null;
      ws.onclose = null;
      ws.close();
    }
    this._setStatus('paused');
  }

  destroy() {
    this._destroyed = true;
    this.pause();
    this.ydoc.off('update', this._onLocalUpdate);
  }
}
