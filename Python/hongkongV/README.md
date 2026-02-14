**项目**
- **名称**: 港式五张（PyQt6 版）
- **说明**: 原 Tkinter 界面已移植为 PyQt6；修正了下注与筹码流向（含 ante、每轮投注记录、跟注/加注/弃牌逻辑），并微调了配色与交互。

**Requirements**
- Python 3.8+
- PyQt6

**安装**
- 建议在虚拟环境中安装：

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -U pip
pip install PyQt6
```

**运行**
- 在项目根目录下运行：

```bash
python main.py
```

**主要文件**
- `main.py`: PyQt6 主程序窗口与游戏流程（界面、下注流程、AI 调用）。
- `gui_components.py`: PyQt6 的 `BetSlider` 组件（滑动加注）。
- `engine.py`: 牌型评估与发牌逻辑。
- `player.py`: 玩家状态与钱包。
- `ai_logic.py`: AI 决策逻辑（可调 aggression / bluff_frequency）。
- `train.py`: 简易自对弈演化脚本（非必须运行）。

**玩法与金钱逻辑要点（实现细节）**
- 每局开始时所有玩家支付 ante（当前实现为每人 $50），该金额直接计入底池并设置为该玩家本轮已投注（`current_bet=50`）。
- `current_max_bet` 表示本轮的最高已投金额，玩家在后续选择中需补齐 `current_max_bet - player.current_bet` 才视为跟注。
- 跟注（Call）：只支付补齐差额；若余额不足则以全部余额跟入（all-in）。
- 加注（Raise）：滑条表示“在当前最高注基础上增加 X 元”，玩家只需支付差额（`desired - player.current_bet`），并在支付后若其 `current_bet` 超过 `current_max_bet` 则更新为新的 `current_max_bet`。
- 弃牌（Fold）：玩家退出本局，不再参与后续发牌与摊牌。
- 每当本轮投注结束并进入下一轮发牌时：所有玩家的 `current_bet` 被清零，`current_max_bet` 被重置为 0（下一轮重新开始投注）。
- 若某一时刻只剩一名玩家未弃牌，则该玩家直接获得底池。

**AI 行为说明**
- AI 根据 `engine.evaluate_hand()` 返回的牌力（等级）与若干启发规则决定 `fold/call/raise`。
- AI 的 `raise` 返回值被解释为希望在当前最高注上额外增加的金额（与玩家滑条语义一致）。

**界面操作**
- 主菜单选择玩家人数后进入对局。
- 底部滑动条为加注量（表示在当前最高注上增加的金额）。
- 按钮：`跟注/过牌`、`确认加注`、`放弃 (Fold)`。

**调试与注意事项**
- 如果程序因缺少 PyQt6 报错，请先按上方安装步骤安装。
- 若想调整起始 ante、初始钱包或 AI 参数，请修改 `main.py` 中的对应数值或 `ai_logic.py` 中 AI 参数。
- 目前实现为本地单机多人（玩家+若干 AI），网络对战未实现。

---
如需，我可以：
- 把 `requirements.txt` 生成到项目中。
- 本地运行一次并把运行日志/截图贴回供你确认。