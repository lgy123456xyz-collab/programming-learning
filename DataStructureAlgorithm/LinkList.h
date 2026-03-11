#ifndef LINKLIST_H
#define LINKLIST_H

#include <stdio.h>
#include <string.h>
#include "sqList.h"


typedef struct LNode{
    int data;
    struct LNode *next;
}LNode,*LinkList;//链表结点和链表类型定义
//写LNode *p;等价于LNode *p;
//写LinkList p;等价于LNode *p;

void InitList_HL(LinkList &L);
void InitList_L(LinkList &L);
int ListLength_L(LinkList L);
LNode * LocateItem_L(LinkList L,int e);
void ListInsertHead_L(LinkList &L,LNode *p,LNode *s);
void ListInsertTail_L(LinkList &L,LNode *p,LNode *s);
void ListDelete_L(LinkList &L,LNode *p,int &e);
void Union_L(LinkList &La,LinkList Lb);
void Union1_L(LinkList &La,LinkList Lb);




#endif // LINKLIST_H

