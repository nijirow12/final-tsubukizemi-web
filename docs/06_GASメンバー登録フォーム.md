# Google フォーム + GAS によるメンバー登録自動化

**最終更新:** 2026-04-22
**ドキュメントの位置づけ:** ゼミメンバーを microCMS に登録するための Google フォームと、回答を自動で microCMS へ送信する Google Apps Script（GAS）の設計・実装ガイド。

---

## 1. 概要

メンバー情報の登録を microCMS の管理画面から直接行うのではなく、Google フォームを窓口にする運用。

**狙い:**
- ゼミ生本人が自分で自己紹介やプロジェクト情報を入力できる（microCMS のアカウントを配布しなくて良い）
- 日本語 / 英語をフォームで併記入力させて二言語コンテンツを担保
- 写真は Google Drive に自動保存され、管理者が後から microCMS に紐付ける
- フォーム送信 → GAS → microCMS の Content API に POST、という一方向フロー

**データの流れ:**

```
[ゼミ生] ── 回答送信 ──▶ [Google フォーム]
                              │
                              ├──▶ [Google Drive] (写真のみ自動保存)
                              │
                              ▼
                       [GAS: onFormSubmit]
                              │
                              └──▶ POST https://{domain}.microcms.io/api/v1/tsubukizemi
                                         │
                                         ▼
                                   [microCMS コンテンツ作成]
                                         │
                                         ▼
                                   [サイトに反映] (ISR 5分)
```

---

## 2. フォーム設計

### 2.1 フォーム名

> **津吹ゼミ メンバー登録フォーム**

### 2.2 フォーム説明（フォーム冒頭の説明文）

> 津吹ゼミ公式サイトに掲載するメンバー情報を登録するフォームです。日本語と英語の両方を入力してください（英語が難しい場合は簡単な翻訳でも構いません）。送信いただいた内容は、公式サイトのメンバーページに掲載されます。
>
> **所要時間の目安:** 約 10 分
> **写真:** 正方形に近いサイズ（1:1 推奨）、1MB 以下を推奨
> **SNS:** Instagram / LinkedIn / X など任意の1つをリンクできます
>
> 修正が必要な場合はサイト管理者（津吹先生 / サイト担当）までご連絡ください。

### 2.3 質問項目一覧

| #   | 質問                          | 回答形式            | 必須  | microCMS フィールド    |
| --- | --------------------------- | --------------- | --- | ----------------- |
| 1   | 名前（日本語）                     | 記述式（短文）         | ✅   | `nameJP`          |
| 2   | Name (English)              | 記述式（短文）         | ✅   | `nameEN`          |
| 3   | 自己紹介（日本語）                   | 記述式（長文）         | ✅   | `introductionJP`  |
| 4   | Self-introduction (English) | 記述式（長文）         | ✅   | `introductionEN`  |
| 5   | 携わったプロジェクト（日本語）             | 記述式（長文）         | ✅   | `projectsJP`      |
| 6   | Projects (English)          | 記述式（長文）         | ✅   | `projectsEN`      |
| 7   | 活動国                         | 記述式（短文 / 自由記述）  | ✅   | `countries`       |
| 8   | 学年                          | ラジオボタン（単一選択）    | ✅   | `grade`           |
| 9   | SNS URL                     | 記述式（短文）         | ✅   | `socialurl`       |
| 10  | プロフィール写真                    | ファイルのアップロード（1枚） |     | `photo`（後から手動紐付け） |

### 2.4 選択肢 / 入力フォーマットの定義

**活動国（Q7 / 自由記述）:**
- カンマ（`,`）、読点（`、`）、スラッシュ（`/`）、改行のいずれかで複数国を区切って入力可
- 日本語 / 英語どちらでも可。例: `カンボジア, ベトナム` / `Cambodia / Vietnam` / `タイ、Thailand`
- サイトに掲載されている国フォルダ（地球儀上のピンに対応）に揃えることを推奨
- 未登録の国を書いた場合: GAS 側で単純スラッグ化して microCMS に送る（例: `グアテマラ` → `グアテマラ`のまま）。ピン表示には [src/data/pin-coordinates.ts](../src/data/pin-coordinates.ts) への座標追加も必要（§7 参照）

**質問の説明文 推奨:**
> 今までに訪れた / 関わった国を日本語または英語で入力してください。複数ある場合はカンマ区切りで（例: カンボジア, ベトナム, Thailand）。

**学年（Q8）:**
```
1年 / 2年 / 3年 / 4年 / 5年 / 6年 / 7年 / alumni（OB・OG）
```

> **補足:** `alumni` を選んだ場合、サイト側で自動的に OB/OG 扱い（`isOB=true`）になり、学年は非表示になる（[src/lib/microcms.ts](../src/lib/microcms.ts) で判定）。

---

## 3. microCMS スキーマ対応

GAS は受信した回答を、[src/lib/microcms.ts](../src/lib/microcms.ts) の `RawMember` 型に沿った JSON に変換して POST する。

```
POST https://{MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/tsubukizemi
Headers:
  X-MICROCMS-API-KEY: {MICROCMS_API_KEY}
  Content-Type: application/json

Body:
{
  "nameJP": "山田 太郎",
  "nameEN": "Taro Yamada",
  "introductionJP": "...",
  "introductionEN": "...",
  "projectsJP": "...",
  "projectsEN": "...",
  "countries": ["cambodia", "vietnam"],
  "grade": ["3年"],
  "socialurl": "https://instagram.com/..."
}
```

**国名の変換:** フォームでは日本語（`カンボジア`）で選ばせ、GAS 側で英語スラッグ（`cambodia`）に変換してから送る。これはサイトの `PIN_COORDINATES` キーと一致させるため（[src/data/pin-coordinates.ts](../src/data/pin-coordinates.ts)）。

**写真について:** 写真は microCMS の `image` 型フィールドのため、管理画面でのアップロードが最も確実。フォーム送信時は Drive にファイルが保存され、GAS が管理者に通知メールを送る → 管理者が microCMS の管理画面で該当メンバーに紐付ける、という運用。

---

## 4. GAS コード

**➡ 本物のソース: [docs/gas/member-form.gs](./gas/member-form.gs)**

貼り付け手順:

1. フォーム編集画面 → 右上「⋮」→ スクリプトエディタを開く
2. [docs/gas/member-form.gs](./gas/member-form.gs) を開き、中身を全選択 → コピー
3. GAS 側の `Code.gs` に貼り付け → 保存

> **なぜ別ファイル？** markdown のコードフェンス ` ```javascript ` / ` ``` ` を一緒にコピーしてしまうと、GAS がそれをテンプレートリテラルとして解釈し `SyntaxError: Unexpected end of input` になる事故を防ぐため、生の `.gs` 単体ファイルを唯一のソースとしている。

**このスクリプトの主要な挙動（概要）:**

- `onFormSubmit` トリガーでフォーム回答 → microCMS に POST
- `COUNTRY_MAP`: 日本語国名 → [src/data/pin-coordinates.ts](../src/data/pin-coordinates.ts) の英語スラッグに変換（カバレッジは同ファイルに合わせて 60 ヶ国超）
- `toCountrySlugs()`: カンマ / 読点 / スラッシュ / 改行で区切られた自由記述を配列化、未知の国名は単純スラッグ化して保持
- 写真添付ありの場合: 管理者に Drive リンク付きメールを送信（microCMS 側で手動アップロード運用）
- 送信失敗（HTTP 400+）時: 管理者にエラー詳細メール
- `testMicroCMSConnection()`: セットアップ時の接続確認用

---

## 5. セットアップ手順

### 5.1 Google フォームを作る

1. https://forms.google.com/ で新規フォーム作成
2. フォーム名・説明・質問を §2 の仕様通りに作成
3. Q10「プロフィール写真」は「ファイルのアップロード」タイプ（Google ログイン必須 / 1ファイル制限）
4. 回答先スプレッドシートを作成（任意・バックアップ用）

### 5.2 microCMS の API キーを準備

1. microCMS ダッシュボード → サービス → API → `tsubukizemi` → 「API キー管理」
2. 既存のキーに **Write 権限（POST）** を付与するか、書き込み用の別キーを新規発行
3. キーをコピー（GAS に登録する）

> **注意:** サイトの読み取りで使っている `MICROCMS_API_KEY`（Vercel の env に登録されているもの）は、デフォルトでは Read 権限のみ。GAS 用には **Write 権限を含む別キーを推奨** する。サイト側キーと分離しておくと、GAS だけ無効化する等の運用が容易。

### 5.3 GAS を設定

1. フォーム編集画面の右上「⋮」→「スクリプトエディタ」
2. `Code.gs` に §4 のコードを貼り付け
3. **プロジェクトの設定（歯車アイコン）** → 「スクリプトプロパティ」に以下を登録:

| キー | 値（例） |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | `tsubukin` |
| `MICROCMS_API_KEY` | 5.2 で取得した Write 権限キー |
| `MICROCMS_ENDPOINT` | `tsubukizemi` |
| `NOTIFY_EMAIL` | 管理者のメールアドレス（エラー通知 / 写真通知先） |

4. 初回実行（`testMicroCMSConnection` を手動実行）で権限承認ダイアログが出る → 承認
5. ログで `[200]` が返れば接続 OK

### 5.4 トリガーを登録

1. スクリプトエディタ左メニュー「トリガー」→「＋ トリガーを追加」
2. 以下で設定:
   - 実行する関数: `onFormSubmit`
   - イベントのソース: **フォームから**
   - イベントの種類: **フォーム送信時**
3. 保存 → 権限承認

### 5.5 動作確認

1. フォームをプレビューで送信
2. スクリプトエディタ → 「実行数」で `onFormSubmit` が成功していることを確認
3. microCMS の管理画面で該当 API に新しいコンテンツが追加されていることを確認
4. 写真がある場合は、5.3 で設定した `NOTIFY_EMAIL` 宛に Drive リンク付きのメールが届く
5. 管理者が microCMS 管理画面で該当メンバーを開き、`photo` フィールドに Drive の画像をアップロード
6. microCMS で **公開** に切替 → 5分以内にサイトに反映（ISR: revalidate=300）

---

## 6. よくあるトラブル

| 症状 | 原因と対処 |
|---|---|
| `onFormSubmit` でエラー `Cannot read property 'response'` | トリガーが「スプレッドシートから」になっている可能性。**フォームから** に設定し直す。 |
| microCMS 返答 `403 X-MICROCMS-API-KEY required` | API キーが未設定、または Write 権限がない。§5.2 を再確認。 |
| microCMS 返答 `400 validation error` | フィールド名が `microcms.ts` の `RawMember` と一致していない可能性。特に `nameJP` / `nameEN` のケース、`grade` が配列か等を確認。 |
| 写真通知メールが届かない | `NOTIFY_EMAIL` が未設定 / スパム判定 / MailApp のクオータ（無料 Google アカウントは 100通/日）を確認。 |
| `alumni` 選択時にサイトで学年が残る | サイト側で `gradeArr.includes('alumni')` を判定しており、配列に `'alumni'` が入っていれば OB 扱いになる（[src/lib/microcms.ts](../src/lib/microcms.ts:67)）。GAS で送る `grade` が `["alumni"]` になっているか確認。 |
| 同じ人が複数回送信して重複登録される | microCMS 側で手動削除 / GAS で `nameJP` の既存チェックを追加。現状は都度作成のみ。 |

---

## 7. 地球儀ピンと Drive フォルダの関係

サイトの地球儀に表示されるピンは、**Drive に国フォルダが存在する国だけ** が自動的に表示される仕組みになっている。

**データの流れ:**

```
[Drive] ルート → 地域フォルダ → 国フォルダ(例: 🇰🇭カンボジア)
  │
  ▼
[/api/drive/folders] 第2階層までフラット化して返す
  │
  ▼
[matchFolderToCountry] フォルダ名から pin-coordinates.ts の id を推定
  │
  ▼
[driveImages state] { cambodia: [...images...], vietnam: [...] }
  │
  ▼
[GlobeScene / GlobeSceneHome] driveImages のキーに含まれる国だけピンを表示
```

**新しい国のピンを追加したい場合:**

1. Drive のルート → 任意の地域フォルダ配下に「🇽🇽国名」フォルダを作成（フォルダ名に日本語または英語の国名を含める）
2. もしその国が [src/data/pin-coordinates.ts](../src/data/pin-coordinates.ts) に登録済みなら → サイトは自動でピンを表示（※Drive API キャッシュが 1 時間のため反映までラグあり）
3. 登録が無い国の場合 → `pin-coordinates.ts` に座標を追記。あわせて [docs/gas/member-form.gs](./gas/member-form.gs) の `COUNTRY_MAP` にも日本語⇔英語スラッグのエントリを追加しておくと、フォーム側でも整合が取れる

**注意点:**
- フォルダ名マッチングは「フォルダ名に `coord.labelJa` または `coord.label`（小文字）が含まれるか」で判定（[src/lib/google-drive.ts](../src/lib/google-drive.ts) の `matchFolderToCountry`）。複数国の名前を含むフォルダ名（例: `インド・ネパール合同`）は先勝ちになる
- Drive フォルダが空（画像 0 枚）でもピンは出る（ピン表示は "フォルダが存在するか" で判定、画像件数は問わない）
- 国名が複数の単語で構成される国（例: `Hong Kong`、`South Africa`）はフォルダ名にスペースを含めて作成する必要がある（`HongKong` だとマッチしない）

---

## 8. 関連ファイル

- [src/lib/microcms.ts](../src/lib/microcms.ts) — `RawMember` 型の定義（GAS が送る JSON のスキーマ）
- [src/app/api/members/route.ts](../src/app/api/members/route.ts) — サイト側の取得経路
- [src/data/pin-coordinates.ts](../src/data/pin-coordinates.ts) — 国スラッグと座標の一覧（GAS の `COUNTRY_MAP` と対応）
- [src/lib/google-drive.ts](../src/lib/google-drive.ts) — Drive フォルダ名から国 ID へのマッチング
- [src/components/three/GlobeSceneHome.tsx](../src/components/three/GlobeSceneHome.tsx) — ピン表示の可視性制御
- [docs/05_開発要件定義.md](./05_開発要件定義.md) §3 — microCMS スキーマ設計の背景
