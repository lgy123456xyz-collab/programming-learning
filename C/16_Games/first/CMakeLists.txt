cmake_minimum_required(VERSION 3.20)
set(CMAKE_POLICY_VERSION_MINIMUM 3.5)

project(sfml_auto_start)

set(CMAKE_CXX_STANDARD 20)

# 禁止 SFML 编译示例和文档，加快速度并减少出错
set(SFML_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(SFML_BUILD_DOC OFF CACHE BOOL "" FORCE)
set(SFML_BUILD_TESTS OFF CACHE BOOL "" FORCE)

include(FetchContent)
FetchContent_Declare(
    SFML
    GIT_REPOSITORY https://github.com/SFML/SFML.git
    GIT_TAG 3.0.0
)

# 确保 SFML 已经准备好
FetchContent_GetProperties(SFML)
if(NOT sfml_POPULATED)
    message(STATUS "正在下载 SFML 源码...")
    FetchContent_Populate(SFML)
    # 这一步非常关键：手动添加子目录，这样 SFML::graphics 才会生效
    add_subdirectory(${sfml_SOURCE_DIR} ${sfml_BINARY_DIR})
endif()

add_executable(sfml_auto_start main.cpp)

# 链接
target_link_libraries(sfml_auto_start SFML::graphics SFML::window SFML::system)