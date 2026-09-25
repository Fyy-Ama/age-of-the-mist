# 迷雾纪元 (Age of the Mist) — 产品需求文档 V1

> 本文档是后续开发的唯一依据。任何未写入本文档的需求均视为不在 V1 范围内。

---

## 1. 产品目标和使用场景

### 产品定位
西幻题材、纯前端单机开放世界探索游戏，面向碎片时间轻松游玩。无需登录，浏览器内自动存档，双击 HTML 即可运行。

### 使用场景
- 用户在碎片时间（午休、通勤间隙、睡前）打开浏览器轻松探索
- 单次游玩时长 5~30 分钟，随时可关闭，下次打开无缝继续
- 个人本地使用，无社交/联机需求

### 核心体验关键词
探索与发现、动态世界、涌现式玩法、轻松无压力、沉浸式氛围

---

## 2. 整体页面框架和导航结构

### 技术架构
- **单Canvas + DOM叠加层**：Canvas 渲染游戏世界，DOM 渲染所有 UI
- **零路由**：所有"页面"是同一 HTML 内的状态切换，非多页面应用
- **零构建工具**：纯 HTML/CSS/JS，`<script>` 按序加载

### 6个UI状态

| 状态 | 触发方式 | 说明 |
|------|----------|------|
| 启动页 | 首次打开 / 从暂停菜单返回 | 标题+开始/继续按钮 |
| 主游戏界面 | 开始/继续探索后 | Canvas世界 + HUD叠加 |
| ESC暂停菜单 | 游戏中按ESC | 暂停+功能入口列表 |
| 背包面板 | Tab / ESC菜单选择 | 物品网格+描述区 |
| 地图总览 | M键 / ESC菜单选择 | 区域轮廓+玩家位置+发现标记 |
| 设置面板 | ESC菜单选择 | FPS/提示开关/昼夜速度/重置 |

### 状态流转

```
[启动页] ──开始探索──→ [主游戏] ←──继续探索──┐
   ↑                    │↑↑↑↑               │
   │                 ESC││││Tab/M           │
   │                    ↓│││↓               │
   │              [ESC菜单]│││               │
   │               ↙ ↙ ↓ ↘ ↘              │
   │         背包 地图 设置 返回标题          │
   │          ↓    ↓    ↓     ↓             │
   │       [背包][地图][设置] [启动页]        │
   │          │    │    │                   │
   │          └────┴────┘                   │
   │            ESC/关闭                     │
   │         [ESC菜单] ──继续探索──→ [主游戏] │
   │                                        │
   └──────── 重置世界 ←──[设置]──────────────┘
```

### 全局操作映射

| 按键 | 功能 | 可用状态 |
|------|------|----------|
| WASD / 方向键 | 移动角色 | 主游戏 |
| E | 交互（拾取/激活/查看） | 主游戏 |
| 鼠标点击 | 同E键，点击世界中的可交互物 | 主游戏 |
| ESC | 打开/关闭暂停菜单 | 主游戏；关闭子面板 |
| Tab | 打开/关闭背包 | 主游戏 |
| M | 打开/关闭地图总览 | 主游戏 |
| Enter | 确认选中项 | 启动页、菜单、背包 |
| 上下键 | 切换焦点/选中项 | 启动页、菜单、背包 |

---

## 3. 游戏页面的内容结构

### 3.1 启动页

```
┌─────────────────────────────────────────────┐
│              ◆ 迷雾纪元 ◆                   │
│           Age of the Mist                   │
│          ┌───────────────────┐              │
│          │   ▶ 开始探索       │              │
│          └───────────────────┘              │
│          ┌───────────────────┐              │
│          │   ↻ 继续旅程       │ ← 仅存档存在时│
│          └───────────────────┘              │
│         WASD移动 · E交互 · ESC菜单           │
│            v0.1 · 纯前端单机                 │
└─────────────────────────────────────────────┘
```

- 全屏羊皮纸底色(#f4e8c1)，中世纪衬线字体
- 背景缓慢飘动半透明雾气粒子(Canvas绘制)
- "继续旅程"仅在检测到存档时显示
- 加载存档时按钮显示沙漏图标

### 3.2 主游戏界面(HUD)

```
┌─────────────────────────────────────────────┐
│ [区域名浮窗]                    [时间图标]    │
│                                             │
│              ← Canvas 游戏世界 →             │
│           （摄像机跟随玩家渲染）               │
│                                             │
│ [小地图120x120]                              │
│ [交互提示条: "[E] 拾取月瓣草"]               │
│ [快捷栏: 🎒12件 | 📍7处发现 | ⏱黄昏]       │
└─────────────────────────────────────────────┘
```

**HUD元素规格：**

| 元素 | 位置 | 行为 |
|------|------|------|
| 区域名浮窗 | 左上(16,16) | 进入新区域淡入3秒后淡出；常驻小字显示当前区域名 |
| 时间图标 | 右上(16,16) 32x32 | 随昼夜阶段切换图标(☀/☾/晨曦/暮色) |
| 小地图 | 左下，距底60px，距左16px，120x120 | 当前区域轮廓+玩家白点+已发现标记；半透明底 |
| 交互提示条 | 底部居中，距底100px | 进入交互范围淡入，离开淡出 |
| 快捷栏 | 底部通栏，高40px | 背包计数/发现数/当前时段；羊皮纸底+上边框 |

**Canvas渲染层叠顺序（从下到上）：**
1. 地面瓦片（按区域palette着色）
2. 地面装饰（草丛、路径纹理）
3. 物体阴影（椭圆半透明黑）
4. 世界实体/交互物（Y轴排序伪深度）
5. 玩家角色
6. 前景遮挡物（树冠等）
7. 粒子效果（萤火虫、雾气）
8. 昼夜颜色覆盖层（multiply混合）

### 3.3 ESC暂停菜单

```
          ╔═════════════════╗
          ║   ⏸ 旅途暂歇    ║
          ║  ▶ 继续探索     ║
          ║  🎒 打开行囊   ║
          ║  🗺️ 查看地图   ║
          ║  ⚙ 设置        ║
          ║  🚪 返回标题   ║
          ╚═════════════════╝
```

- 游戏画面暂停+暗色遮罩 rgba(0,0,0,0.5)
- 上下键/鼠标悬停切换选中项，Enter/点击执行
- ESC等同于"继续探索"

### 3.4 背包面板

```
   ╔═══════════════════════════════════╗
   ║          🎒 行囊                  ║
   ║  ┌────┐ ┌────┐ ┌────┐ ┌────┐    ║
   ║  │ 🌿 │ │ 🪙 │ │ ✉️ │ │ 🔮 │    ║
   ║  │月瓣│ │古币│ │残信│ │水晶│    ║
   ║  └────┘ └────┘ └────┘ └────┘    ║
   ║  ───────────────────────────────  ║
   ║  【月瓣草】                        ║
   ║  在月光下绽放的银色草药，           ║
   ║  据说能安抚不安的灵魂。             ║
   ║              [关闭]                ║
   ╚═══════════════════════════════════╝
```

- 居中弹窗，60%宽×70%高，羊皮纸底+双线手绘边框
- 4列网格，每格64x64，空格虚线框
- 选中物品金色边框，下方显示完整描述
- 背景 blur(3px)+暗遮罩
- 物品按收集时间排序，最新在前

### 3.5 地图总览

```
   ╔═══════════════════════════════════╗
   ║          🗺️ 已知世界              ║
   ║    ┌─────────┐  ┌──────────┐     ║
   ║    │迷雾森林  │  │废弃神殿   │     ║
   ║    │ ░░●░░░░ │  │ ▓▓▓▓▓▓▓ │     ║
   ║    └────┬────┘  └────┬─────┘     ║
   ║         │            │            ║
   ║    ┌────┴────────────┴─────┐     ║
   ║    │      旅人营地          │     ║
   ║    └──────────┬────────────┘     ║
   ║          ┌────┴────┐              ║
   ║          │ ?????? │ ← 未探索区域  ║
   ║          └─────────┘              ║
   ║  ● 当前位置   ★ 已发现   ? 未知    ║
   ╚═══════════════════════════════════╝
```

- 居中弹窗，70%宽×75%高，羊皮纸底+烧焦边缘效果
- 已探索区域显示轮廓+名称+地标；未到达显示虚线+"???"
- 玩家位置闪烁白点，已发现彩蛋用星号标记
- 悬停已探索区域高亮+tooltip；点击定位小地图到该区域
- 不缩放不拖拽

### 3.6 设置面板

```
   ╔═══════════════════════════════════╗
   ║          ⚙ 设置                   ║
   ║  显示FPS计数器    [✓]             ║
   ║  操作提示         [✓]             ║
   ║  昼夜循环速度     [━━━━●━━] 1x    ║
   ║  ───────────────────────────────  ║
   ║  [🔄 重置世界]                     ║
   ║   清除所有进度，重新开始            ║
   ║              [返回]                ║
   ╚═══════════════════════════════════╝
```

- 居中弹窗，40%宽
- 重置世界需二次确认："确定要遗忘一切吗？此操作不可撤销。"
- 昼夜速度三档：0.5x / 1x / 2x

### 3.7 事件通知(Toast)

```
     ┌─────────────────────────────────┐
     │ ✦ 你发现了一条隐秘的小径...      │
     │   浓雾散去，藤蔓后隐约可见通路    │
     └─────────────────────────────────┘
```

- 顶部居中横幅，距顶60px
- 半透明羊皮纸底+金色边框
- 从上方滑入，停留4秒后滑出淡出
- 点击可提前关闭；多个通知排队不重叠

---

## 4. 每个模块的用途

### 4.1 核心系统模块

| 模块 | 文件 | 用途 |
|------|------|------|
| Game | `js/game.js` | 主循环、系统初始化、状态机(loading/playing/paused/menu)、固定步长调度 |
| EventBus | `js/event-bus.js` | 发布-订阅事件总线，解耦模块间通信 |
| InputManager | `js/input-manager.js` | 统一采集键盘/鼠标输入，提供每帧输入快照 |
| SaveManager | `js/save-manager.js` | IndexedDB持久化读写、自动保存、schema迁移、localStorage降级 |
| Constants | `js/constants.js` | 全局常量：画布尺寸、瓦片大小、物理参数、颜色表 |
| Utils | `js/utils.js` | 工具函数：lerp, clamp, AABB检测, 随机数, 深拷贝 |

### 4.2 世界与地图模块

| 模块 | 文件 | 用途 |
|------|------|------|
| WorldMap | `js/world-map.js` | 持有完整瓦片数据、区域查询、障碍物索引、世界对象状态管理 |
| RegionManager | `js/region-manager.js` | 存储区域元数据、检测区域过渡、管理区域视觉主题/配色 |
| DayNightCycle | `js/day-night-cycle.js` | 游戏内时间推进、光照参数计算、昼夜阶段判定 |
| WorldEvents | `js/world-events.js` | 随机事件池管理、触发判定、去重、状态持久化 |
| Collision | `js/collision.js` | AABB碰撞检测与分轴滑动求解 |

### 4.3 玩家与实体模块

| 模块 | 文件 | 用途 |
|------|------|------|
| Player | `js/player.js` | 玩家移动、碰撞响应、交互判定、朝向、简单动画 |
| Entity | `js/entity.js` | Entity基类 + Interactable组件定义 |
| Inventory | `js/inventory.js` | 物品收集、存储、查询、导出/导入 |
| DiscoveryLog | `js/discovery-log.js` | 记录已发现地点、彩蛋、里程碑 |

### 4.4 渲染与UI模块

| 模块 | 文件 | 用途 |
|------|------|------|
| Camera | `js/camera.js` | 平滑跟随玩家、视口边界钳制、世界/屏幕坐标转换、视锥裁剪 |
| Renderer | `js/renderer.js` | Canvas分层渲染管线、昼夜叠加、性能优化 |
| UIManager | `js/ui-manager.js` | DOM-based HUD/菜单/弹窗/通知/背包/地图管理 |

### 4.5 入口与样式

| 文件 | 用途 |
|------|------|
| `index.html` | Canvas创建 + UI DOM结构 + 脚本按序加载 |
| `styles.css` | 中世纪UI边框、字体、羊皮纸配色、HUD布局、动画 |

---

## 5. 每个模块第一版最必要的数据和操作

### 5.1 SaveManager

**数据 — SaveData：**
```javascript
{
  version: 1,                          // schema版本号
  savedAt: number,                     // Unix时间戳(ms)
  player: { x, y, facingDirection, currentRegionId },
  collectedItems: string[],            // 已收集物品ID数组
  discoveredLocations: string[],       // 已发现地点ID数组
  discoveredEasterEggs: string[],      // 已发现彩蛋ID数组
  worldObjectStates: { [objId]: { activated, visible, cleared } },
  gameTime: number,                    // 归一化时间 0.0~1.0
  triggeredEvents: string[],           // 已触发事件ID数组
  settings: { showFPS, controlsHint, dayNightSpeed }
}
```

**操作：**
- `async init()` — 初始化IndexedDB
- `async save(data)` / `async load()` — 读写存档
- `markDirty()` — 标记需要保存
- `autoSaveCheck()` — 每帧调用，脏标记+5秒节流；纯位置变化30秒存一次
- 监听事件自动标脏：`item:collected`, `world:stateChanged`, `region:entered`, `daynight:phaseChanged`

### 5.2 WorldMap

**数据：**
- `tileMap[row][col]`: Uint8Array二维数组，值为TILE_ID数字
- 瓦片渲染查找表：`{ [tileId]: { color, walkable } }`
- 世界尺寸：200×200瓦片 = 6400×6400px，TILE_SIZE=32px

**操作：**
- `getTile(worldX, worldY)` — 查询瓦片
- `getRegionAt(worldX, worldY)` — 查询所在区域
- `getObstaclesInRect(rect)` — 合并瓦片级+对象级障碍物
- `getInteractablesInRect(rect)` — 空间查询可交互物
- `setObjectState(id, state)` / `getObjectState(id)` — 世界对象状态读写
- `exportStates()` / `importStates(states)` — 存档序列化

### 5.3 RegionManager

**数据 — RegionDef：**
```javascript
{
  id: string,              // "misty_forest"
  name: string,            // "迷雾森林"
  description: string,     // 风味文本
  bounds: { x, y, w, h }, // 瓦片坐标矩形
  palette: { ground, groundAlt, obstacle, accent, labelColor },
  terrainType: 'forest'|'ruins'|'camp'|'cave'|'coast',
  obstacles: Obstacle[],
  interactables: Interactable[],
  ambientFeatures: string[]
}
```

**操作：**
- `getRegion(id)` / `getAllRegions()`
- `detectTransition(oldPos, newPos)` — 返回新区域或null
- `getPalette(regionId)`

### 5.4 Player

**数据 — PlayerRuntime：**
```javascript
{
  x, y, width: 24, height: 24, speed: 180, // px/s
  facingDirection: 'up'|'down'|'left'|'right',
  currentRegionId: string,
  animFrame: number, animTimer: number, isMoving: boolean
}
```

**操作：**
- `update(dt, input, worldMap)` — 移动+碰撞+交互判定
- `getPosition()` / `getAABB()`
- `interact(target)` — 执行交互
- `setState(state)` / `getState()` — 存档恢复/导出

### 5.5 Camera

**数据：**
```javascript
{ x, y, width, height, lerpFactor: 0.08, worldBounds: {w, h} }
```

**操作：**
- `update(playerPos, dt)` — lerp跟随+边界钳制
- `worldToScreen(wx, wy)` / `screenToWorld(sx, sy)`
- `isVisible(aabb)` — 视锥裁剪判定
- `getViewport()` — 返回当前视口矩形

### 5.6 Renderer

**操作：**
- `init(canvas)` / `resize(w, h)`
- `render(frameData)` — 按8层顺序绘制
- frameData包含：camera, player, entities, interactables, particles, dayNight, regionLabel

### 5.7 Inventory

**数据 — ItemDef：**
```javascript
{
  id: string,           // "herb_moonpetal"
  name: string,         // "月瓣草"
  description: string,  // 西幻风味描述文本
  category: 'herb'|'coin'|'letter'|'easter_egg',
  iconShape: 'circle'|'diamond'|'rect'|'star',
  iconColor: string,
  isEasterEgg: boolean
}
```

**操作：**
- `addItem(itemId)` / `hasItem(itemId)` / `getItems()` / `getItemDef(itemId)` / `getCount()`
- emit `item:collected` 事件

### 5.8 DiscoveryLog

**操作：**
- `record(type, id, text)` — type: 'location'|'easter_egg'|'milestone'
- `hasRecorded(id)` / `getEntries()`
- 导出/导入用于存档

### 5.9 DayNightCycle

**数据：**
- `normalizedTime: number` (0.0~1.0)，0.0=午夜, 0.25=日出, 0.5=正午, 0.75=日落
- 一个完整周期 = 8分钟真实时间 (CYCLE_DURATION=480s)
- 阶段：NIGHT(0.0~0.2), DAWN(0.2~0.3), DAY(0.3~0.7), DUSK(0.7~0.8)

**操作：**
- `update(realDt)` — 推进时间
- `getTimeOfDay()` / `getPhase()` / `getOverlayColor()` / `getAmbientTint()`
- `setTime(normalized)` — 读档恢复
- 阶段变化时 emit `daynight:phaseChanged`

### 5.10 WorldEvents

**数据 — WorldEventDef：**
```javascript
{
  id, triggerRegion, triggerType: 'enter_region'|'time_of_day'|'object_state',
  condition: {}, eventType: 'path_discovery'|'merchant_marker'|'weather_change'|'guardian_spawn',
  description, markerBounds, weight, repeatable, cooldownMs
}
```

**操作：**
- `onRegionEnter(regionId)` — 筛选+过滤+加权随机选取≤1个事件
- `markTriggered(eventId)` — 写入已触发集合
- `getActiveMarkers()` — 地图上显示的临时标记
- 防重复：不可重复事件永久排除；可重复事件检查冷却；同次进入最多触发1个

### 5.11 Collision

**操作：**
- `testAABB(a, b)` — 碰撞检测
- `resolveMovement(entity, obstacles, dx, dy)` — 分轴滑动碰撞求解
- `pointInAABB(px, py, rect)` — 点矩形检测

### 5.12 InputManager

**操作：**
- `update()` — 每帧开头生成快照
- `isKeyDown(key)` / `isKeyPressed(key)` — 持续按住/本帧刚按下
- `getMouseWorldPos(camera)` / `isMouseClicked()`

### 5.13 UIManager

**操作：**
- `showRegionPopup(name)` / `updateHUD(count, phase, regionName)`
- `toggleInventory(items)` / `toggleMap(regions, playerPos)` / `toggleSettings()`
- `showInteractionPrompt(text)` / `showEventToast(title, desc)`
- `hideAll()`

### 5.14 EventBus

**关键事件列表：**
`player:moved`, `item:collected`, `region:entered`, `daynight:changed`, `daynight:phaseChanged`, `world:stateChanged`, `world:eventTriggered`, `save:completed`, `save:error`, `ui:openInventory`, `ui:closeMenu`

**操作：** `on(event, cb)` / `off(event, cb)` / `emit(event, data)`

---

## 6. 各模块之间的关系

### 依赖关系图

```
Game (中枢编排)
 ├── EventBus (所有模块通过事件通信，无直接依赖)
 ├── InputManager ← Player
 ├── Camera ← Renderer, UIManager
 ├── WorldMap ← Player, Renderer, RegionManager
 ├── RegionManager ← WorldMap, WorldEvents, UIManager
 ├── Player ← Renderer, SaveManager
 ├── Collision ← Player
 ├── Inventory ← Player, UIManager, SaveManager
 ├── DiscoveryLog ← Player, UIManager, SaveManager
 ├── DayNightCycle ← Renderer, WorldEvents, UIManager
 ├── WorldEvents ← RegionManager, UIManager
 ├── Renderer ← Camera, DayNightCycle
 ├── UIManager ← EventBus (纯事件驱动)
 └── SaveManager ← EventBus (监听状态变更事件)
```

### 通信原则
- **模块间不直接调用对方方法**（除Game初始化时的注入）
- 运行时状态变更全部通过 EventBus 广播
- SaveManager 被动监听事件标脏，不主动轮询业务模块
- UIManager 纯事件驱动，不持有游戏逻辑引用
- Renderer 只接收 FrameData 纯数据对象，不访问业务模块

### 数据流向

```
Input → Player.update() → EventBus.emit('player:moved')
                                ↓
                          Camera.update()
                          RegionManager.detectTransition() → emit('region:entered')
                                                                  ↓
                                                          WorldEvents.onRegionEnter()
                                                                  ↓
                                                          UIManager.showRegionPopup()
                                                          
Player.interact() → Inventory.addItem() → emit('item:collected')
                                              ↓
                                    UIManager.updateHUD()
                                    SaveManager.markDirty()
```

---

## 7. 第一版必须完成的功能

### 核心体验
1. WASD/方向键移动角色，摄像机平滑跟随
2. 至少5个命名区域的连续2D地图，可自由漫游无缝过渡
3. 区域进入时显示地名浮窗
4. 可收集物品散落在世界中，靠近按E或点击拾取
5. 背包面板展示已收集物品+西幻风味描述文本
6. 发现记录系统，菜单中可查看探索进度
7. 隐藏彩蛋点（石碑、日记等环境叙事物件）

### 动态世界
8. 昼夜循环（8分钟一周期），影响画面光照色调
9. 随机事件系统：进入区域概率触发小型事件（新路径、商人标记、天气变化）
10. 环境状态持久化：机关开关（灯塔、石门）改变世界可达性/可见性
11. 少量Guardian战斗作为探索障碍，击败后永久清除通路

### 存档与持久化
12. IndexedDB自动存档，脏标记+节流策略
13. localStorage降级方案
14. 关闭浏览器再打开，角色位置+收集进度+世界状态完整恢复
15. 菜单中提供"重置世界"选项（含二次确认）

### UI与视觉
16. 启动页（标题+开始/继续）
17. ESC暂停菜单（继续/背包/地图/设置/返回标题）
18. 地图总览面板（已探索区域轮廓+未探索???标记）
19. 设置面板（FPS开关/操作提示开关/昼夜速度/重置）
20. 事件通知Toast系统
21. 中世纪羊皮纸视觉主题贯穿所有UI
22. 纯代码绘制几何图形占位符作为美术资源

### 基础保障
23. 双击HTML即可运行，零配置零依赖
24. 稳定30fps+ on集成显卡
25. 全程无控制台报错

---

## 8. 第一版暂时不做的功能

| 类别 | 不做内容 | 备注 |
|------|----------|------|
| 账号系统 | 用户注册/登录 | 纯本地单机 |
| 联机 | 多人/联机/排行榜 | V1纯单机 |
| 数值成长 | 等级、经验值、属性点、装备强化 | 只做纯探索体验 |
| 移动端 | 触屏适配/响应式布局 | V1仅键鼠 |
| NPC系统 | NPC对话、对话树、好感度 | V1无NPC交互 |
| 任务系统 | 主线/支线任务、任务追踪 | V1纯自由探索 |
| 音频 | 音效、背景音乐、环境音 | V1纯视觉 |
| 美术资源 | 外部图片/精灵图加载 | V1纯代码绘制占位符 |
| 高级地图 | 缩放/拖拽/多层地图 | V1固定比例总览 |
| 战斗系统 | 连招、技能、掉落表、伤害数字 | Guardian仅为路障 |
| 建造/经营 | 房屋建造、资源生产 | 不在V1范围 |
| 成就系统 | 成就解锁、统计面板 | V1仅有发现记录 |
| 多存档槽 | 多角色/多存档切换 | V1单槽位 |
| 国际化 | 多语言支持 | V1仅中文 |
| 构建工具 | Webpack/Vite/打包 | V1纯script标签加载 |

---

## 9. 可以实际检查的验收标准

以下每条均可通过实际操作验证，不依赖主观判断：

### AC-1: 零配置启动
- [ ] 双击 `index.html` 在浏览器中打开，无需服务器/构建/安装
- [ ] 页面加载后显示启动页，无控制台报错
- [ ] 首次打开显示"开始探索"按钮，不显示"继续旅程"

### AC-2: 基础移动与摄像机
- [ ] WASD/方向键可移动角色，松开立即停止
- [ ] 摄像机平滑跟随玩家，lerp过渡无抖动
- [ ] 角色不会移出世界边界
- [ ] 帧率稳定 ≥30fps（开启FPS计数器验证）

### AC-3: 多区域自由漫游
- [ ] 地图上存在至少5个命名区域
- [ ] 区域之间无缝衔接，无加载/黑屏
- [ ] 进入新区域时左上角显示地名浮窗，3秒后淡出
- [ ] 每个区域有视觉上可区分的配色/地形特征

### AC-4: 碰撞系统
- [ ] 角色无法穿过墙壁/树木等障碍物
- [ ] 斜向撞墙时沿墙面滑动（不卡住）
- [ ] 世界边缘不可通行

### AC-5: 物品收集与背包
- [ ] 世界中存在可收集物品，靠近时显示交互提示
- [ ] 按E或点击可拾取物品，物品从世界消失
- [ ] 按Tab打开背包，显示已收集物品列表
- [ ] 点击/选中物品显示西幻风味描述文本
- [ ] 快捷栏实时更新物品计数

### AC-6: 存档持久化
- [ ] 收集物品后刷新页面，物品仍在背包中
- [ ] 移动到某位置后刷新页面，角色出现在该位置附近
- [ ] 激活机关（如推开石门）后刷新，机关保持激活状态
- [ ] 启动页出现"继续旅程"按钮
- [ ] 点击"继续旅程"完整恢复所有进度

### AC-7: 昼夜循环
- [ ] 画面光照随时间变化（白天明亮、夜晚暗沉、黄昏暖色）
- [ ] 右上角时间图标随阶段切换
- [ ] 一个完整昼夜周期约8分钟
- [ ] 昼夜状态被存档保存，读档后时间正确恢复

### AC-8: 世界状态与机关
- [ ] 存在至少1个可激活机关（如灯塔/石门）
- [ ] 激活后世界发生可见变化（新区域可达/远处可见）
- [ ] 机关状态被存档持久化

### AC-9: 随机事件
- [ ] 进入区域时有概率触发事件通知Toast
- [ ] Toast从顶部滑入，4秒后自动消失
- [ ] 不可重复事件不会在同一存档中再次触发
- [ ] 事件触发状态被存档保存

### AC-10: 地图总览
- [ ] 按M打开地图面板，显示已探索区域轮廓
- [ ] 未到达区域显示为"???"
- [ ] 玩家当前位置有标记
- [ ] 已发现彩蛋/地点有星号标记

### AC-11: 设置功能
- [ ] FPS计数器开关即时生效
- [ ] 操作提示开关控制交互提示条显示
- [ ] 昼夜速度可在0.5x/1x/2x间切换
- [ ] 重置世界弹出二次确认
- [ ] 确认后清除存档，返回启动页，"继续旅程"消失

### AC-12: ESC菜单完整性
- [ ] 游戏中按ESC暂停并显示菜单
- [ ] 5个选项均可正常跳转
- [ ] 再次ESC等同于"继续探索"
- [ ] 菜单中游戏画面暂停不动

### AC-13: 性能达标
- [ ] 在Intel UHD 620或同等集成显卡上 ≥30fps
- [ ] 内存占用 <100MB
- [ ] 无内存泄漏（持续游玩30分钟内存不持续增长）

### AC-14: 无错误运行
- [ ] 全流程操作无控制台error/warning
- [ ] 快速反复开关菜单/背包/地图不崩溃
- [ ] 存档损坏时优雅降级（提示重置，不白屏）

---

*文档版本: V1.0 | 最后更新: 2026-09-25*
