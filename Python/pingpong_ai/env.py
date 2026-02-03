import pygame
import numpy as np
import matplotlib.pyplot as plt
import os

# 游戏参数
WIDTH = 400
HEIGHT = 300
BALL_RADIUS = 5
PADDLE_WIDTH = 60
PADDLE_HEIGHT = 10
BALL_SPEED = 3
PADDLE_SPEED = 5

# 创建输出文件夹
if not os.path.exists("logs"):
    os.makedirs("logs")

reward_log = []  # 用于保存每局 reward

class PongEnv:
    def __init__(self):
        self.width = WIDTH
        self.height = HEIGHT
        self.paddle_width = PADDLE_WIDTH
        self.paddle_height = PADDLE_HEIGHT
        self.reset()

    def reset(self):
        self.ball_x = self.width // 2
        self.ball_y = self.height // 2
        self.ball_vx = BALL_SPEED * np.random.choice([-1, 1])
        self.ball_vy = BALL_SPEED * np.random.choice([-1, 1])
        self.p1_x = (self.width - self.paddle_width) // 2  # 底部 paddle
        self.p2_x = (self.width - self.paddle_width) // 2  # 顶部 paddle
        self.combo_hits = 0
        return self.get_state()

    def get_state(self):
        return np.array([
            self.p1_x / self.width,
            self.ball_x / self.width,
            self.ball_y / self.height,
            (self.ball_x - self.p1_x) / self.width,
            self.ball_vx / 5,
            self.ball_vy / 5,
            self.p2_x / self.width
        ], dtype=np.float32)

    def step(self, action1, action2):
        if action1 == 0:
            self.p1_x -= PADDLE_SPEED
        elif action1 == 2:
            self.p1_x += PADDLE_SPEED

        if action2 == 0:
            self.p2_x -= PADDLE_SPEED
        elif action2 == 2:
            self.p2_x += PADDLE_SPEED

        self.p1_x = np.clip(self.p1_x, 0, self.width - self.paddle_width)
        self.p2_x = np.clip(self.p2_x, 0, self.width - self.paddle_width)

        self.ball_x += self.ball_vx
        self.ball_y += self.ball_vy

        reward = 0.0
        done = False

        if self.ball_x <= 0 or self.ball_x >= self.width:
            self.ball_vx *= -1

        if self.ball_y <= self.paddle_height and self.p2_x <= self.ball_x <= self.p2_x + self.paddle_width:
            self.ball_vy *= -1

        elif self.ball_y >= self.height - self.paddle_height and self.p1_x <= self.ball_x <= self.p1_x + self.paddle_width:
            self.ball_vy *= -1
            self.combo_hits += 1
            reward += 0.1

            if self.combo_hits == 3:
                reward += 0.2
            elif self.combo_hits == 5:
                reward += 0.5
            elif self.combo_hits == 10:
                reward += 1.0

        elif self.ball_y > self.height:
            reward = -1.0
            done = True
            self.combo_hits = 0

        elif self.ball_y < 0:
            reward = 1.0
            done = True
            self.combo_hits = 0

        paddle_center = self.p1_x + self.paddle_width / 2
        dist = abs(self.ball_x - paddle_center) / (self.width / 2)
        proximity_reward = max(0.05 * (1 - dist), 0)
        reward += proximity_reward

        if done:
            reward_log.append(reward)

        return self.get_state(), reward, done, {}

    def render(self, screen):
        screen.fill((0, 0, 0))
        pygame.draw.rect(screen, (0, 255, 0), (self.p1_x, self.height - self.paddle_height, self.paddle_width, self.paddle_height))
        pygame.draw.rect(screen, (255, 0, 0), (self.p2_x, 0, self.paddle_width, self.paddle_height))
        pygame.draw.circle(screen, (255, 255, 255), (int(self.ball_x), int(self.ball_y)), BALL_RADIUS)
        pygame.display.flip()


def plot_rewards():
    if len(reward_log) >= 10:
        avg_rewards = [np.mean(reward_log[max(0, i-50):i+1]) for i in range(len(reward_log))]
        plt.figure(figsize=(10, 4))
        plt.plot(avg_rewards, label='Average Reward (window=50)')
        plt.xlabel('Episode')
        plt.ylabel('Reward')
        plt.title('Training Reward Curve')
        plt.legend()
        plt.grid(True)
        plt.tight_layout()
        plt.savefig("logs/reward_curve.png")
        plt.close()