cmake_minimum_required(VERSION 4.0)
project(C)

set(CMAKE_C_STANDARD 11)

add_executable(main.c)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/output/bin")
