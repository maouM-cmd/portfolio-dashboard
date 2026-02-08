# 📊 ポートフォリオ分析ダッシュボード

リアルタイム株価データを表示する、モダンなポートフォリオ管理アプリケーションです。

## 🌐 デモサイト

**[https://maoum-cmd.github.io/portfolio-dashboard/](https://maoum-cmd.github.io/portfolio-dashboard/)**

## ✨ 機能

| 機能 | 説明 |
|------|------|
| 📈 **リアルタイム株価** | Yahoo Finance APIで最新の株価を取得 |
| 💼 **保有銘柄管理** | 銘柄の追加・編集・削除（ブラウザに自動保存） |
| 📊 **損益計算** | 取得価格と現在価格から損益を自動計算 |
| 📁 **Excelエクスポート** | ポートフォリオデータをExcelファイルで出力 |
| 📄 **PDFレポート** | 投資レポートをPDFで出力 |
| 📉 **比較分析** | S&P500、VT、日経225とのパフォーマンス比較 |
| 🌙 **ダークモード** | 目に優しいダークモード対応 |

## 🛠️ 技術スタック

- **フロントエンド**: React 19 + Vite
- **スタイリング**: Tailwind CSS 4 + Shadcn UI
- **チャート**: Recharts
- **データ取得**: Yahoo Finance API
- **デプロイ**: GitHub Pages

## 📦 デフォルト登録銘柄

- 金（ゴールド）`GC=F`
- eMAXIS Slim S&P500 `^GSPC`
- ヒューマナ `HUM`
- ヒューリック `3003.T`
- 大阪瓦斯 `9532.T`

## 🚀 ローカルで実行

```bash
# クローン
git clone https://github.com/maouM-cmd/portfolio-dashboard.git
cd portfolio-dashboard

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## 📝 ライセンス

MIT License
