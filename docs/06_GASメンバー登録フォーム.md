# Google フォーム + GAS によるメンバー登録自動化

**最終更新:** 2026-04-22
　**位置づけ:** ゼミメンバーを microCMS に登録するための Google フォームと、回答を microCMS へ自動送信する Google Apps Script（GAS）の設計・実装・運用ガイド。

## 目次

1. [概要](#1-概要)
2. [フォーム設計](#2-フォーム設計)
3. [microCMS スキーマとの対応](#3-microcms-スキーマとの対応)
4. [GAS コード](#4-gas-コード)
5. [セットアップ手順](#5-セットアップ手順)
6. [運用](#6-運用)
7. [地球儀ピンと Drive フォルダの関係](#7-地球儀ピンと-drive-フォルダの関係)
8. [トラブルシューティング](#8-トラブルシューティング)
9. [関連ファイル](#9-関連ファイル)

---

## 1. 概要

メンバー登録を microCMS 管理画面から直接行うのではなく、Google フォームを窓口にする運用。

**狙い:**

- ゼミ生本人が自己紹介やプロジェクト情報を入力できる（microCMS アカウントを配布しなくて良い）
- 日本語 / 英語の両方を併記入力させて二言語コンテンツを担保
- 写真は Google Drive に保存 → GAS が管理者に通知 → 管理者が microCMS 側で紐付け
- フォーム送信 → GAS → microCMS Content API に POST の一方向フロー

**データフロー:**

```
[ゼミ生]
   │ 回答送信
   ▼
[Google フォーム] ──（写真は Drive に自動保存）──▶ [Google Drive]
   │                                                    │
   │ onFormSubmit トリガー                               │ リンク
   ▼                                                    ▼
[GAS: member-form.gs]  ──────────────────────▶ [管理者メール通知]
   │                              （写真ありの場合: 手動紐付け依頼）
   │ POST /api/v1/tsubukizemi
   ▼
[microCMS]
   │ (管理者が "公開" に切替)
   ▼
[サイト /members]   ※ISR revalidate=300 → 5分以内に反映
```

---

## 2. フォーム設計

### 2.1 フォーム名

> **津吹ゼミ メンバー登録フォーム**

### 2.2 フォーム説明（冒頭に表示する文）

> 津吹ゼミ公式サイトに掲載するメンバー情報を登録するフォームです。日本語と英語の両方を入力してください（英語は簡単な翻訳でも構いません）。送信内容は公式サイトのメンバーページに掲載されます。
>
> - **所要時間の目安:** 約 10 分
> - **写真:** 正方形に近いサイズ（1:1 推奨）、1MB 以下推奨
> - **SNS:** Instagram / LinkedIn / X など任意の 1 つをリンク可（省略可）
>
> 修正が必要な場合はサイト管理者までご連絡ください。

### 2.3 質問項目

| # | 質問 | 回答形式 | 必須 | microCMS フィールド |
|---|---|---|:---:|---|
| 1 | 名前（日本語） | 記述式（短文） | ✅ | `nameJP` |
| 2 | Name (English) | 記述式（短文） | ✅ | `nameEN` |
| 3 | 自己紹介（日本語） | 記述式（長文） | ✅ | `introductionJP` |
| 4 | Self-introduction (English) | 記述式（長文） | ✅ | `introductionEN` |
| 5 | 携わったプロジェクト（日本語） | 記述式（長文） |  | `projectsJP` |
| 6 | Projects (English) | 記述式（長文） |  | `projectsEN` |
| 7 | 活動国 | 記述式（短文 / 自由記述） | ✅ | `countries` |
| 8 | 学年 | ラジオボタン（単一選択） | ✅ | `grade` |
| 9 | SNS URL | 記述式（短文） |  | `socialurl` |
| 10 | プロフィール写真 | ファイルのアップロード（1 枚） |  | `photo`（手動紐付け） |

> 必須（✅）の判断基準: サイト表示で不可欠なもの（名前・自己紹介・活動国・学年）は必須、補助情報（プロジェクト・SNS・写真）は任意。

### 2.4 入力フォーマットの補足

**活動国（Q7 / 自由記述）:**

- 区切り文字はカンマ `,` / 読点 `、` / スラッシュ `/` / 改行のいずれか
- 日本語 / 英語どちらも可
- 記入例: `カンボジア, ベトナム` / `Cambodia / Vietnam` / `タイ、Thailand`
- **推奨:** サイトの地球儀ピンと揃えるため、[src/data/pin-coordinates.ts](../src/data/pin-coordinates.ts) に定義済みの国名を使う
- 未登録国を書いた場合: GAS が単純スラッグ化して microCMS に送る。ピン表示が必要なら `pin-coordinates.ts` への追記が別途必要（§7 参照）

**質問の説明文 推奨:**

> 今まで訪れた / 関わった国を日本語または英語で入力してください。複数ある場合はカンマ区切りで（例: カンボジア, ベトナム, Thailand）。

**学年（Q8）:** `1年` / `2年` / `3年` / `4年` / `5年` / `6年` / `7年` / `alumni（OB・OG）`

> `alumni` を選択すると、サイト側で自動的に OB/OG 扱いになり、学年表示は消える（[src/lib/microcms.ts:67](../src/lib/microcms.ts#L67) で判定）。

---

## 3. microCMS スキーマとの対応

### 3.1 送信スキーマ

GAS は受信した回答を、[src/lib/microcms.ts](../src/lib/microcms.ts) の `RawMember` 型に沿った JSON に変換して POST する。

```
POST https://{MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/{MICROCMS_ENDPOINT}
Headers:
  X-MICROCMS-API-KEY: {MICROCMS_API_KEY}
  Content-Type: application/json

Body:
{
  "nameJP":          "山田 太郎",
  "nameEN":          "Taro Yamada",
  "introductionJP": "...",
  "introductionEN": "...",
  "projectsJP":     "...",
  "projectsEN":     "...",
  "countries":      ["cambodia", "vietnam"],
  "grade":          ["3年"],
  "socialurl":      "https://instagram.com/..."
}
```

### 3.2 国名の扱い

フォームでは日本語 / 英語どちらも自由記述。GAS 側で `COUNTRY_MAP`（60+ ヶ国）を引き、サイト内の英語スラッグ（`cambodia`、`south-africa` 等）に正規化してから送る。マップに無い国はスペース→ハイフン化した小文字スラッグで送る。

### 3.3 写真の扱い

microCMS の `image` 型フィールドは API 経由で直接書き込めないため、以下の半自動フローを採る:

1. フォーム送信 → 写真は Google Drive に自動保存される（Google フォームのファイルアップロード機能の標準動作）
2. GAS が `NOTIFY_EMAIL` 宛に Drive リンクと microCMS コンテンツ ID を記載したメールを送信
3. 管理者がメールのリンクから写真を確認し、microCMS 管理画面で該当メンバーの `photo` フィールドにアップロード

---

## 4. GAS コード

**➡ 本体ソース: [docs/gas/member-form.gs](./gas/member-form.gs)**

**貼り付け手順:**

1. フォーム編集画面 → 右上「⋮」→ スクリプトエディタ
2. [docs/gas/member-form.gs](./gas/member-form.gs) を開いて全選択 → コピー
3. GAS 側の `Code.gs` に貼り付け → 保存

> **なぜ別ファイル？** markdown のコードフェンス ` ```javascript ` / ` ``` ` を一緒にコピーすると、GAS がそれをテンプレートリテラルとして解釈し `SyntaxError: Unexpected end of input` になる事故があるため、生の `.gs` 単体ファイルを唯一のソースとしている。

**スクリプトの挙動サマリ:**

- `onFormSubmit(e)` — フォーム送信をトリガに、回答を microCMS へ POST
- `COUNTRY_MAP` — 日本語国名 → [src/data/pin-coordinates.ts](../src/data/pin-coordinates.ts) の英語スラッグ変換表（同ファイルと同期しておく）
- `toCountrySlugs(value)` — 自由記述を区切り文字で分割・正規化・重複排除
- `toDriveLinks(ids)` — 写真ファイル ID から Drive URL を組み立て
- `testMicroCMSConnection()` — 初期セットアップ時の接続確認（手動実行）
- エラー時は `NOTIFY_EMAIL` にレスポンス本文・送信データを添付してメール送信

---

## 5. セットアップ手順

### 5.1 前提

- **Google アカウント** — フォーム作成権限あり（ゼミ共用アカウント推奨）
- **microCMS アカウント** — サービス `tsubukizemi` に対する Write 権限
- **通知先メール** — エラー / 写真通知を受ける管理者のメールアドレス

### 5.2 Google フォームを作る

1. https://forms.google.com/ で新規フォーム作成
2. §2 の仕様どおりにフォーム名・説明・質問を作成
3. Q10 は「ファイルのアップロード」タイプ（Google ログイン必須 / 1 ファイル上限 / 画像のみ）
4. 任意: 「回答」タブでスプレッドシートをリンク（回答のバックアップとして有効）

### 5.3 microCMS の Write API キーを発行

1. microCMS ダッシュボード → `tsubukizemi` サービス → API `tsubukizemi` → **API キー管理**
2. **Write 権限（POST）を持つ新規キーを発行**（既存の Read キーに Write を付けるのではなく、**書き込み専用の別キーを作る**）
3. キーをコピー（次節 §5.4 で使う）

> **重要:** サイトが env `MICROCMS_API_KEY` で使っている Read キーと、GAS で使う Write キーは分離すること。両者を混同すると、漏洩時の影響範囲が拡がる / 個別無効化できない。

### 5.4 GAS を設定

1. フォーム編集画面 → 右上「⋮」→「スクリプトエディタ」
2. §4 の手順で `Code.gs` に [docs/gas/member-form.gs](./gas/member-form.gs) の内容を貼り付け → 保存
3. 左メニュー **歯車（プロジェクトの設定）** → **スクリプト プロパティ** に以下を登録:

| キー | 値 |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | 例: `tsubukin`（microCMS ダッシュボードの URL の `https://___.microcms.io` 部分） |
| `MICROCMS_API_KEY` | §5.3 で発行した **Write 権限キー** |
| `MICROCMS_ENDPOINT` | `tsubukizemi`（リスト API のエンドポイント ID） |
| `NOTIFY_EMAIL` | 管理者のメールアドレス（エラー / 写真通知の宛先） |

4. 関数選択プルダウンで `testMicroCMSConnection` を選び **実行** → 初回は権限承認ダイアログが出るので承認
5. 実行ログに `[200] { "contents": [...] }` 相当が出れば接続 OK

### 5.5 トリガーを登録

1. スクリプトエディタ左メニュー **⏰ トリガー** → **＋ トリガーを追加**
2. 設定:
   - 実行する関数: `onFormSubmit`
   - イベントのソース: **フォームから**
   - イベントの種類: **フォーム送信時**
3. 保存 → 権限承認

### 5.6 動作確認

1. フォームをプレビューから 1 件テスト送信（実在のゼミ生データは使わない）
2. スクリプトエディタ → **実行数**（履歴）で `onFormSubmit` が成功していることを確認
3. microCMS 管理画面で該当 API に新しいコンテンツ（下書き状態）が追加されていることを確認
4. 写真を添付した場合は `NOTIFY_EMAIL` 宛に Drive リンク付きメールが届くことを確認
5. microCMS 管理画面で該当メンバーを開き、`photo` フィールドに画像をアップロード → **公開** に切替
6. 5 分以内にサイト（本番）の `/members` で反映を確認（ISR `revalidate=300`）
7. テストデータは microCMS 側で削除

---

## 6. 運用

### 6.1 日常運用（新メンバー登録を受ける）

1. フォーム URL をゼミ生に配布（フォーム編集画面 → 右上「送信」→ リンクタブ）
2. 送信されると GAS が自動で microCMS に **下書き** として登録する
3. 管理者はメール通知を受け、microCMS 管理画面で:
   - 写真添付があれば `photo` フィールドに設定
   - 内容を確認して問題なければ **公開** に切替
4. 5 分以内にサイトに反映される

### 6.2 国・ピンを追加する

§7 参照。フォルダ作成 → 必要なら `pin-coordinates.ts` と `COUNTRY_MAP` に追記。

### 6.3 フォーム項目を変える

フォームの質問タイトルを変更した場合は、[docs/gas/member-form.gs](./gas/member-form.gs) の `FIELD_MAP` を同じタイトルに合わせて修正する。タイトルがズレると GAS は黙ってその項目を無視する（エラーにはならない）ので注意。

### 6.4 重複送信の扱い

現状の GAS は毎回 **新規作成** する（`nameJP` の既存チェック等はしていない）。同じ人が複数回送った場合は、microCMS 管理画面で古いほうを削除する運用。重複検出を自動化したい場合は `onFormSubmit` 内で `GET /api/v1/{endpoint}?filters=nameJP[equals]...` を先に叩く拡張を検討。

---

## 7. 地球儀ピンと Drive フォルダの関係

サイトの地球儀に表示されるピンは、**Drive に国フォルダが存在する国だけ** が自動的に表示される仕組み。

```
[Drive] ルート → 地域フォルダ → 国フォルダ（例: 🇰🇭カンボジア）
   │
   ▼
[/api/drive/folders] 第 2 階層までフラット化して返す
   │
   ▼
[matchFolderToCountry] フォルダ名から pin-coordinates.ts の id を推定
   │
   ▼
[driveImages state] { cambodia: [...], vietnam: [...] }
   │
   ▼
[GlobeSceneHome / GlobeScene] driveImages のキーに含まれる国だけピン表示
```

**新しい国のピンを追加する手順:**

1. Drive の任意の地域フォルダ配下に「🇽🇽国名」フォルダを作成（フォルダ名に日本語または英語の国名を含める）
2. その国が [src/data/pin-coordinates.ts](../src/data/pin-coordinates.ts) に登録済みなら → 自動でピン表示される（Drive API キャッシュが 1 時間のためラグあり）
3. 未登録の国の場合 → `pin-coordinates.ts` に座標（lat / lng）を追記。併せて [docs/gas/member-form.gs](./gas/member-form.gs) の `COUNTRY_MAP` にも日本語⇔英語スラッグを追加し、フォーム側と整合を取る

**注意点:**

- フォルダ名マッチングは「フォルダ名に `coord.labelJa` または `coord.label.toLowerCase()` が含まれるか」で判定（[src/lib/google-drive.ts](../src/lib/google-drive.ts) の `matchFolderToCountry`）
- 複数の国名を含むフォルダ名（例: `インド・ネパール合同`）は **先勝ち**（長いキーワード優先でソート済み）
- 空フォルダ（画像 0 枚）でもピンは出る（判定は "フォルダの存在" で行うため）
- 複数単語の国名（`Hong Kong`、`South Africa` 等）はフォルダ名にスペースを含めて作る必要がある（`HongKong` だとマッチしない）

---

## 8. トラブルシューティング

| 症状 | 原因と対処 |
|---|---|
| `onFormSubmit` 実行時に `Cannot read property 'response' of undefined` | トリガーが「スプレッドシートから」になっている可能性。**フォームから / フォーム送信時** に設定し直す（§5.5）。 |
| microCMS が `403 X-MICROCMS-API-KEY required` | API キーが未設定、または Write 権限がない。§5.3 を再確認。 |
| microCMS が `400 validation error` | フィールド名が `RawMember` と一致していない可能性。特に `nameJP` の大文字小文字、`grade` が配列か（文字列ではなく `["3年"]` か）を確認。 |
| フォームの質問を 1 つ変えたら、その項目だけ反映されなくなった | GAS の `FIELD_MAP` にある旧タイトルと一致しなくなった。`FIELD_MAP` のキーをフォームの新タイトルに合わせる（§6.3）。 |
| 写真通知メールが届かない | `NOTIFY_EMAIL` 未設定 / 迷惑メールに振り分け / `MailApp` 1 日クオータ（無料 Google アカウントは 100 通/日）を確認。 |
| `alumni` を選んだのにサイトで学年が残る | サイト側は `grade` 配列に `'alumni'` が含まれるかで判定している（[src/lib/microcms.ts:67](../src/lib/microcms.ts#L67)）。GAS が `grade: ["alumni"]` で送れているかログ確認。 |
| 同じ人が複数回送信して重複登録された | 現状は都度新規作成（§6.4）。microCMS 管理画面で古いほうを手動削除する運用。 |
| Drive にフォルダを追加したのにピンが出ない | `/api/drive/folders` のキャッシュ（1 時間）の影響。または `pin-coordinates.ts` に座標未登録（§7）。 |

---

## 9. 関連ファイル

- [docs/gas/member-form.gs](./gas/member-form.gs) — **GAS 本体**（貼り付け用の唯一のソース）
- [src/lib/microcms.ts](../src/lib/microcms.ts) — `RawMember` 型（GAS が送る JSON のスキーマ）
- [src/app/api/members/route.ts](../src/app/api/members/route.ts) — サイト側の取得経路（ISR 5 分）
- [src/data/pin-coordinates.ts](../src/data/pin-coordinates.ts) — 国スラッグと座標（GAS の `COUNTRY_MAP` と対応）
- [src/lib/google-drive.ts](../src/lib/google-drive.ts) — Drive フォルダ名 → 国 ID マッチング
- [src/components/three/GlobeSceneHome.tsx](../src/components/three/GlobeSceneHome.tsx) — ピン可視性制御
- [docs/05_開発要件定義.md](./05_開発要件定義.md) §3 — microCMS スキーマ設計の背景
