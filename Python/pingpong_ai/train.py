import torch
import torch.nn as nn
import torch.optim as optim
import random
import numpy as np
from collections import deque
from env import PongEnv, plot_rewards  # 确保 env.py 中有 plot_rewards 和 PongEnv
from torch.utils.tensorboard import SummaryWriter

# DQN 网络定义，假设输入7维状态，输出3个动作（左，不动，右）
class DQN(nn.Module):
    def __init__(self):
        super(DQN, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(7, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 3)
        )

    def forward(self, x):
        return self.net(x)

# 训练参数
BATCH_SIZE = 64
GAMMA = 0.99
EPS_START = 1.0
EPS_END = 0.05
EPS_DECAY = 5000
TARGET_UPDATE = 10
MEMORY_SIZE = 100
LR = 1e-3
NUM_EPISODES = 1000

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

class ReplayMemory:
    def __init__(self, capacity):
        self.memory = deque(maxlen=capacity)

    def push(self, *args):
        self.memory.append(tuple(args))

    def sample(self, batch_size):
        return random.sample(self.memory, batch_size)

    def __len__(self):
        return len(self.memory)

def select_action(policy_net, state, steps_done):
    eps_threshold = EPS_END + (EPS_START - EPS_END) * np.exp(-1. * steps_done / EPS_DECAY)
    if random.random() > eps_threshold:
        with torch.no_grad():
            state = torch.tensor(state, dtype=torch.float32).unsqueeze(0).to(device)
            return policy_net(state).argmax(dim=1).item()
    else:
        return random.choice([0, 1, 2])  # 左，不动，右

def optimize_model(policy_net, target_net, memory, optimizer):
    if len(memory) < BATCH_SIZE:
        return
    transitions = memory.sample(BATCH_SIZE)
    batch = list(zip(*transitions))
    states = torch.tensor(np.array(batch[0]), dtype=torch.float32).to(device)
    actions = torch.tensor(batch[1], dtype=torch.int64).unsqueeze(1).to(device)
    rewards = torch.tensor(batch[2], dtype=torch.float32).unsqueeze(1).to(device)
    next_states = torch.tensor(np.array(batch[3]), dtype=torch.float32).to(device)
    dones = torch.tensor(batch[4], dtype=torch.float32).unsqueeze(1).to(device)

    q_values = policy_net(states).gather(1, actions)
    with torch.no_grad():
        next_q_values = target_net(next_states).max(1)[0].unsqueeze(1)
    expected_q_values = rewards + (GAMMA * next_q_values * (1 - dones))

    loss = nn.MSELoss()(q_values, expected_q_values)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

def main():
    env = PongEnv()
    policy_net = DQN().to(device)
    target_net = DQN().to(device)
    target_net.load_state_dict(policy_net.state_dict())
    target_net.eval()

    optimizer = optim.Adam(policy_net.parameters(), lr=LR)
    memory = ReplayMemory(MEMORY_SIZE)

    steps_done = 0
    episode_durations = []
    writer = SummaryWriter("logs/tensorboard_train")

    for episode in range(NUM_EPISODES):
        state = env.reset()
        done = False
        total_reward = 0
        while not done:
            action1 = select_action(policy_net, state, steps_done)
            # 简单对手策略：跟踪球的位置
            action2 = 0 if env.ball_x < env.p2_x + env.paddle_width / 2 else 2

            next_state, reward, done, _ = env.step(action1, action2)
            total_reward += reward

            memory.push(state, action1, reward, next_state, done)

            state = next_state
            optimize_model(policy_net, target_net, memory, optimizer)

            steps_done += 1

        episode_durations.append(total_reward)
        writer.add_scalar('Reward/Episode', total_reward, episode)
        print(f"Episode {episode+1}/{NUM_EPISODES}, Reward: {total_reward:.2f}, Epsilon: {EPS_END + (EPS_START - EPS_END) * np.exp(-1. * steps_done / EPS_DECAY):.3f}")

        if episode % TARGET_UPDATE == 0:
            target_net.load_state_dict(policy_net.state_dict())

    # 保存模型
    torch.save(policy_net.state_dict(), "dqn_pong_model.pth")

    # 关闭TensorBoard写入
    writer.close()

    # 画训练奖励曲线
    plot_rewards()

if __name__ == "__main__":
    main()
