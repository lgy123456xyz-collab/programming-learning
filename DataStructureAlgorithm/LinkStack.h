#ifndef LINKSTACK_H
#define LINKSTACK_H
#include <stdio.h>
#include <string.h>
#include "SqStack.h"

typedef LinkList LinkStack;//链栈类型定义

void InitStack_L(LinkStack &S);
void DestroyStack_L(LinkStack &S);
bool GetTop_L(LinkStack S,int &e);
void Push_L(LinkStack &S,int e);
bool Pop_L(LinkStack &S,int &e);


#endif // LINKSTACK_H
