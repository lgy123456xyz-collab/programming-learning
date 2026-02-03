import pygame
import torch
import numpy as np
from env import PongEnv
from dqn_agent import DQN

WIDTH, HEIGHT = 400, 300
PADDLE_WIDTH, PADDLE_HEIGHT = 60, 10
BALL_SIZE = 10
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

def draw(env, screen):
    screen.fill(WHITE)
    pygame.draw.rect(screen, BLACK, (env.p1_x, HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT))  # 人类挡板底部
    pygame.draw.rect(screen, BLACK, (env.p2_x, 0, PADDLE_WIDTH, PADDLE_HEIGHT))  # AI挡板顶部
    pygame.draw.rect(screen, BLACK, (env.ball_x, env.ball_y, BALL_SIZE, BALL_SIZE))
    pygame.display.flip()

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Human vs DQN AI Ping Pong")

    env = PongEnv()
    model = DQN()
    model.load_state_dict(torch.load("dqn_pong_model.pth"))
    model.eval()

    clock = pygame.time.Clock()
    state = env.reset()
    done = False
    human_action = 1  # 初始不动

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                return
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    human_action = 0
                elif event.key == pygame.K_RIGHT:
                    human_action = 2
            elif event.type == pygame.KEYUP:
                if event.key in (pygame.K_LEFT, pygame.K_RIGHT):
                    human_action = 1

        # AI 控制顶部挡板
        with torch.no_grad():
            state_t = torch.tensor(state).unsqueeze(0)
            q_values = model(state_t)
            ai_action = q_values.argmax().item()

        # 环境步进（底部人类挡板动作，顶部AI动作）
        state, _, _, done = env.step(human_action, ai_action)

        draw(env, screen)

        if done:
            pygame.time.wait(1000)
            state = env.reset()

        clock.tick(60)

if __name__ == "__main__":
    main()
