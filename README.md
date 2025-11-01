# 辞書シフト置換 PWA v1.1.3-pwa2

- 既存の v1.1.3 に **manifest / service worker** を追加して PWA 化しました。
- GitHub Pages（HTTPS）に置けば、オフライン動作＆「ホーム画面に追加」が可能です。

### 使い方
1. このフォルダを公開（`index.html` をルートに）。
2. 初回ロード後、SW がキャッシュを作成します。以降はオフラインでも動作。
3. 反映が鈍いときは、`service-worker.js?ver=` の番号を上げてください。
