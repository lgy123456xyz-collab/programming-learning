#include <stdio.h>
#include <stdlib.h>
#include <unistd.h> // For getopt
#include <ctype.h>  // For toupper, tolower
#include <string.h> // For memory allocation functions

// 定义默认缓冲区大小
#define INITIAL_CAPACITY 1024

// --- 函数声明 ---
void process_and_print(char *input_string, char mode);

// --- 主函数 ---
int main(int argc, char *argv[]) {
    // 1. 命令行参数解析
    int opt;
    // 默认模式为 'p' (原样打印)
    char mode = 'p'; 
    
    // 使用 getopt 来解析 -p, -u, -l 参数。
    // 注意：在实际应用中，通常只检查 -u 和 -l，如果都没出现，则默认为 -p。
    // 但是为了满足题目要求，我们解析所有参数。
    while ((opt = getopt(argc, argv, "pul")) != -1) {
        switch (opt) {
            case 'p':
                mode = 'p'; // 原样打印 (Pass-through)
                break;
            case 'u':
                mode = 'u'; // 转换成大写 (Uppercase)
                break;
            case 'l':
                mode = 'l'; // 转换成小写 (Lowercase)
                break;
            case '?':
                // 处理未知选项
                fprintf(stderr, "Usage: %s [-p | -u | -l]\n", argv[0]);
                return 1;
        }
    }
    
    // 2. 读取标准输入直到文件结束 (EOF)
    char *input_buffer = NULL;
    size_t capacity = 0;
    size_t length = 0;
    int c;

    // 初始分配内存
    capacity = INITIAL_CAPACITY;
    input_buffer = (char *)malloc(capacity);
    if (input_buffer == NULL) {
        perror("Failed to allocate initial memory");
        return 1;
    }

    // 逐字符读取标准输入
    while ((c = fgetc(stdin)) != EOF) {
        // 如果缓冲区满了，就重新分配更大的内存 (动态增长)
        if (length + 1 >= capacity) {
            capacity *= 2;
            char *temp = (char *)realloc(input_buffer, capacity);
            if (temp == NULL) {
                perror("Failed to reallocate memory");
                free(input_buffer);
                return 1;
            }
            input_buffer = temp;
        }
        
        // 将字符存入缓冲区
        input_buffer[length] = (char)c;
        length++;
    }

    // 确保字符串以空字符结束
    if (input_buffer != NULL) {
        // 如果缓冲区为空，可能导致段错误，但由于我们至少分配了初始容量，这里是安全的
        if (length < capacity) {
            input_buffer[length] = '\0';
        } else {
             // 还需要额外的空间来存储空字符
            char *temp = (char *)realloc(input_buffer, length + 1);
            if (temp == NULL) {
                perror("Failed to reallocate memory for null terminator");
                free(input_buffer);
                return 1;
            }
            input_buffer = temp;
            input_buffer[length] = '\0';
        }
    } else {
        // 理论上不会发生，除非初始分配失败
        return 0;
    }

    // 3. 处理并打印结果
    process_and_print(input_buffer, mode);
    
    // 4. 释放内存
    free(input_buffer);
    
    return 0;
}

// --- 辅助处理函数 ---
void process_and_print(char *input_string, char mode) {
    if (input_string == NULL) return;

    // 遍历字符串并根据模式进行处理
    for (size_t i = 0; input_string[i] != '\0'; i++) {
        char current_char = input_string[i];
        char output_char;

        switch (mode) {
            case 'u':
                // 转换成大写
                output_char = toupper(current_char);
                break;
            case 'l':
                // 转换成小写
                output_char = tolower(current_char);
                break;
            case 'p':
            default:
                // 原样打印 (Pass-through)
                output_char = current_char;
                break;
        }
        
        // 打印处理后的字符
        putchar(output_char);
    }
}

// ----------------------