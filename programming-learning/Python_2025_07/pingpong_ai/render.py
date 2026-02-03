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
    pygame.draw.rect(screen, BLACK, (env.p1_x, HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT))
    pygame.draw.rect(screen, BLACK, (env.p2_x, 0, PADDLE_WIDTH, PADDLE_HEIGHT))
    pygame.draw.rect(screen, BLACK, (env.ball_x, env.ball_y, BALL_SIZE, BALL_SIZE))
    pygame.display.flip()

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("DQN Ping Pong")

    env = PongEnv()
    model = DQN()
    model.load_state_dict(torch.load("dqn_pong_model.pth"))
    model.eval()

    clock = pygame.time.Clock()
    state = env.reset()
    done = False

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                return

        # AI 控制底部挡板
        with torch.no_grad():
            state_t = torch.tensor(state).unsqueeze(0)
            q_values = model(state_t)
            action = q_values.argmax().item()

        # 简单 AI 顶部挡板
        if state[0] < state[5]:
            action2 = 0
        elif state[0] > state[5] + (60/400):
            action2 = 2
        else:
            action2 = 1

        state, _, _, done = env.step(action, action2)
        draw(env, screen)

        if done:
            pygame.time.wait(1000)
            state = env.reset()

        clock.tick(60)

if __name__ == "__main__":
    main()
