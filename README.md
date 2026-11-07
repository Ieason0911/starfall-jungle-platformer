# 星落遺跡：叢林篇

一款以 Phaser 4 製作的橫向平台跳躍遊戲。深入叢林遺跡，找回八枚星之碎片、避開尖刺，並抵達神殿出口。

## 開始遊玩

```bash
npm install
npm run dev
```

在瀏覽器開啟 Vite 顯示的本機網址即可遊玩。方向鍵或 A、D 移動；Space、↑ 或 W 跳躍。支援觸控螢幕上的方向與跳躍按鈕。

## 建置與預覽

```bash
npm run build
npm run preview
```

建置產物會放在 `dist/`。GitHub Actions 會在推送到 `main` 時建置並部署至 GitHub Pages。

## GitHub Pages Repo 名稱建議

Repo 名稱為 **`starfall-jungle-platformer`**。遊戲網址是 [https://ieason0911.github.io/starfall-jungle-platformer/](https://ieason0911.github.io/starfall-jungle-platformer/)。Vite 使用相對資產路徑，因此 repo 名稱不需要寫死在遊戲設定中。

## 素材

遊戲使用 Kenney 的 New Platformer Pack、Foliage Pack 與 Particle Pack。素材採 CC0 1.0 授權；來源與授權摘要見 [`public/assets/ASSET-LICENSES.txt`](public/assets/ASSET-LICENSES.txt)。原始素材包保存在 `assets/packs/kenney/`。
