#ifndef STACK_H
#define STACK_H

#include <stdio.h>
#include <string.h>
#include "LinkList.h"

#define STACK_INIT_SIZE 100
typedef struct{
    int *elem;
    int top;
    int stacksize;
}SqStack;//顺序栈

void InitStack_Sq(SqStack &S,int msize=STACK_INIT_SIZE);   //初始化顺序栈
void DestroyStack_Sq(SqStack &S);                         //销毁顺序栈
void ClearStack_Sq(SqStack &S);                           //清空顺序栈
int StackLength_Sq(SqStack S);                            //求顺序栈长度
bool StackEmpty_Sq(SqStack S);                            //判断顺序栈是否为空  
bool GetTop_Sq(SqStack S,int &e);                      //取栈顶元素
void Push_Sq(SqStack &S,int e);              //入栈
bool Pop_Sq(SqStack &S,int &e);             //出栈
void StackTraverse_Sq(SqStack S);          //遍历顺序栈

#endif // STACK_H

