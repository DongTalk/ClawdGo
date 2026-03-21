# World Demo v3（RPG 完整世界）

本版本使用本地 PNG 素材（Kenney），不能直接双击 `index.html` 打开。

## 启动方式

```bash
cd world-demo
python3 -m http.server 8080
```

浏览器访问：

- [http://localhost:8080](http://localhost:8080)

## 说明

- 页面会每 2 秒轮询 `world-state.json`。
- 有 `world-state.json` 时进入 LIVE 模式。
- 无文件或读取失败时自动回到 DEMO 模式并循环演示。

## 资源说明

- 地图素材：Kenney Tiny Town / Tiny Dungeon（CC0）。
- UI 字体：Ark Pixel 中文版（OFL，见 `assets/fonts/OFL.txt`）。
- 为避免底图底部水印影响观感，运行时使用 `sample_clean.png`（裁切版）。
