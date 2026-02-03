# 最小 CMake 版本要求
cmake_minimum_required(VERSION 3.10)

# 项目名称
project(DiceRolling C)

# 设置 C 语言标准 (例如 C99)
set(CMAKE_C_STANDARD 99)

# 添加可执行文件：
# 目标名称是 DiceRolling
# 源文件是 main.c 和 diceroll.c
add_executable(DiceRolling manydice.c diceroll.c diceroll.h)