cmake_minimum_required(VERSION 4.0)
project(12_2_2 C)

set(CMAKE_C_STANDARD 11)

add_executable(12_2_2 manydice.c
        diceroll.c
        diceroll.h)
