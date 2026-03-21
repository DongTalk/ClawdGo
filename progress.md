Original prompt: 请读取、理解并执行以下任务文档：/Users/ronnie/local_file/dev/pipeline/clawdgo/cc/Codex开发任务-世界可视化v3-RPG完整世界.md

- 参考对标补充：用户提供 https://github.com/ringhyacinth/Star-Office-UI
- 当前目标：在 feature/world-demo-v3 完成 world-demo v3 重建（含素材、双场景、UI、状态同步）
- 约束：不修改 watch-soul.py / skills/ / arena-server/ / src/

## TODO
- [ ] 准备 Kenney 素材到 world-demo/assets/kenney/... 目录
- [ ] 重建 index.html：Boot/Overworld/Indoor/UI 结构
- [ ] 接入 world-state 轮询 + Demo 脚本 + 场景切换 fade
- [ ] 自测：node --check + 本地服务启动验证
- [ ] 提交到 feature/world-demo-v3（不 push）

## 2026-03-21 执行记录（v3）
- [x] 新建分支 `feature/world-demo-v3`
- [x] 下载并落地 Kenney 素材到 `world-demo/assets/kenney/`
- [x] 重建 `world-demo/index.html` 为 Boot/Overworld/Indoor/UIScene 架构
- [x] 加入 DEMO + LIVE 状态同步、场景切换（300ms fade）、右侧 UI 持续显示
- [x] `node --check` 通过
- [ ] 浏览器自动化回归（待执行）
- [x] 处理 Safari 白屏风险：将 Phaser 从 CDN 改为本地 `world-demo/vendor/phaser.min.js`
- [x] 本地 HTTP 服务可访问验证：`curl -I http://127.0.0.1:8080` 返回 200

## 对标补充（Star-Office-UI）
- [x] 拉取并对标 `ringhyacinth/Star-Office-UI`
- [x] 采用其关键稳定策略：`vendor/phaser-3.80.1.min.js` 本地化加载，避免网络/CDN导致空白
- [x] 对标 Star-Office-UI 完成第一轮视觉重构：
  - [x] Overworld 重建为高密度图层（地形噪声 + 建筑预制 + 围栏 + 阴影 + 树木边界）
  - [x] 室内场景加入 Kenney sample 背景叠加和房间氛围色
  - [x] 小白角色帧切换到 tiny-dungeon 可用角色帧，避免错误贴图
- [x] 修复室内大面积黑屏/露底 bug：
  - [x] Indoor 相机改为按窗口 cover 缩放（resize 自动重算）
  - [x] 进入室内时隐藏 Overworld，退出时恢复可见，避免场景底层泄露
- [x] 修复室内错误贴图（角色头部误作家具）：替换为有效家具/设备 tile 索引
- [x] 去除 sample 底图底部水印区：新增 `sample_clean.png`
