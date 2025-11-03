# 🌀 Oulipo〈S+7〉

<p align="center">
  <img src="https://raw.githubusercontent.com/Masato-Nasu/Oulipo-S-7-/main/icon-512.png" width="160" alt="Oulipo S+7 icon" />
</p>

**Oulipo〈S+7〉** は、フランスの文学実験グループ Oulipo（ウリポ）の手法「S+7」をもとに、  
日本語の文を “語彙的に平行移動” させる装置です。辞書の中で単語を一定数ずらして置き換えることで、  
「意味が少しずれた、けれど文として読める」テキストを生成します。

---

## 🔗 実行ページ
👉 https://masato-nasu.github.io/Oulipo-S-7-/

> ブラウザ（Chrome / Safari / Edge 推奨）で開くと、オフラインでも動作する **PWA 版 Oulipo〈S+7〉** が起動します。  
> スマートフォンでは「ホーム画面に追加」でインストール可能です。

---

## 📸 スクリーンショット
<p align="center">
  <img src="https://raw.githubusercontent.com/Masato-Nasu/Oulipo-S-7-/main/screenshot.png" width="480" alt="Oulipo S+7 Screenshot" />
</p>

---

## ✨ 概要

### 📖 〈S+7〉とは
辞書で単語を引き、その **7 項目後（S+7）** にある単語で置き換えるという文芸的手法。  
本アプリでは **任意のずらし量（S+K）** を指定して、意味を保ちながら文体だけを滑らかに変質させることができます。

### 🧠 助詞を保持して、語彙だけをずらす
「読めるけれど意味は変わる」——詩と論理の境界で生まれる新しい日本語の地層を観測します。

### ⚙️ 内蔵辞書を組み込み済み（オフライン変換対応）
辞書を PWA 内に埋め込み、通信なしで高速に変換。PC・スマートフォン両対応。

---

## 🕹️ 操作方法

| ボタン / 項目 | 説明 |
|---|---|
| 入力欄 | 日本語の文章を入力します。 |
| ずらし量（S+K） | 辞書で何語先にずらすか指定します。 |
| 変換（Transform） | Oulipo ルールで変換を実行します。 |
| 復号（Revert） | 同じキー（ずらし値）で元に戻します。 |
| 保存（Save） | 結果をテキストとして保存します。 |

---

## 📱 PWA インストール方法

1. Chrome / Safari / Edge で上記 URL を開く  
2. 画面下部または右上メニューから **「ホーム画面に追加」／「インストール」** を選択  
3. ホームにアイコンが追加され、以後はアプリのようにフルスクリーンで利用できます  
4. オフライン時も辞書がキャッシュされ、動作します

---

## 🧩 技術仕様

- **PWA 対応**（オフラインキャッシュ可）  
- **Service Worker** による強制更新制御  
- **内蔵辞書（dict.txt）** による即時変換  
- **localStorage** により設定を保持  
- **完全クライアントサイド構成**（外部通信なし）

---

## 💬 コンセプトノート

「Oulipo〈S+7〉」は、言葉を少しだけずらし、思考の風景を観測するための小さな文芸装置です。  
意味の解体と再構成のあいだで、言葉そのものの「運動」を体験します。

---

## 📁 構成

index.html メインUI
script.js S+7変換ロジック
dict.txt 組み込み辞書
manifest.json PWA設定
serviceWorker.js キャッシュ制御・更新
icon-192.png PWAアイコン（小）
icon-512.png PWAアイコン（大）
screenshot.png 実行画面サンプル

---

## 🧾 ライセンス

MIT License  
© 2025 Masato Nasu
