# Vercelへのデプロイ手順

このアプリをVercelにデプロイする手順です。

## 前提条件

- Vercelアカウント（[vercel.com](https://vercel.com)で作成）
- GitHubリポジトリにコードがプッシュされていること

## デプロイ手順

### 方法1: Vercel CLIを使用

1. Vercel CLIをインストール（まだの場合）
```bash
npm i -g vercel
```

2. プロジェクトディレクトリでログイン
```bash
cd example-dimo-auth
vercel login
```

3. デプロイ
```bash
vercel
```

初回は対話形式で設定を聞かれます：
- Set up and deploy? → **Y**
- Which scope? → あなたのアカウントを選択
- Link to existing project? → **N**（新規プロジェクトの場合）
- Project name? → プロジェクト名を入力
- Directory? → **./** または **example-dimo-auth**
- Override settings? → **N**

4. 本番環境にデプロイ
```bash
vercel --prod
```

### 方法2: Vercelダッシュボードを使用

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. "Add New..." → "Project"をクリック
3. GitHubリポジトリをインポート
4. プロジェクト設定：
   - **Framework Preset**: Create React App
   - **Root Directory**: `login-with-dimo/example-dimo-auth`（リポジトリのルートから見たパス）
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. 環境変数を設定（重要！）
   - Settings → Environment Variables に以下を追加：
     - `REACT_APP_DIMO_CLIENT_ID`
     - `REACT_APP_DIMO_REDIRECT_URI`（VercelのデプロイURLに合わせて変更）
     - `REACT_APP_DIMO_ENV`（`development` または `production`）
     - `REACT_APP_DIMO_API_KEY`

6. "Deploy"をクリック

## 重要な注意事項

### リダイレクトURIの設定

Vercelにデプロイした場合、リダイレクトURIは以下のようになります：
- `https://your-project-name.vercel.app`
- またはカスタムドメインを使用している場合：`https://your-domain.com`

**重要**: DIMOプラットフォームで、このリダイレクトURIをクライアントIDに登録する必要があります。

### 環境変数の設定

Vercelダッシュボードで環境変数を設定する際：
1. Settings → Environment Variables
2. 各環境変数を追加：
   - **Name**: `REACT_APP_DIMO_CLIENT_ID`
   - **Value**: あなたのクライアントID
   - **Environment**: Production, Preview, Development（必要に応じて）

同様に他の環境変数も設定します。

### .tgzファイルについて

`dimo-network-login-with-dimo-0.0.27.tgz`ファイルはリポジトリに含める必要があります。
Vercelのビルド時にこのファイルが利用可能であることを確認してください。

## トラブルシューティング

### ビルドエラー

- `.tgz`ファイルがリポジトリに含まれているか確認
- `package.json`の依存関係が正しいか確認

### 環境変数が読み込まれない

- 環境変数名が`REACT_APP_`で始まっているか確認
- Vercelダッシュボードで正しい環境（Production/Preview/Development）に設定されているか確認
- デプロイ後に再ビルドが必要な場合があります

### リダイレクトURIエラー

- DIMOプラットフォームで、VercelのURLが正しく登録されているか確認
- リダイレクトURIは完全一致する必要があります（末尾のスラッシュも含む）


