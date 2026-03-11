#ifndef SQLIST_H
#define SQLIST_H

#include <stdio.h>
#include <string.h>

#define LIST_INIT_SIZE 100
#define LIST_INC_SIZE 20

typedef struct{
    int *elem;
    int listsize;
    int length;
    int incrementsize;
}SqList;//顺序表

void InitList_Sq(SqList &L,int msize=LIST_INIT_SIZE);   //初始化顺序表
void DestroyList_Sq(SqList &L);                         //销毁顺序表
bool ListEmpty_Sq(SqList L);                            //判断顺序表是否为空
bool ListFull_Sq(SqList L);                             //判断顺序表是否已满
int ListLength_Sq(SqList L);                            //求顺序表长度
int LocateItem_Sq(SqList L,int e);                      //按值查找
int GetItem_Sq(SqList L,int i,int &e);                  //按位查找
void ErrorMsg(const char *msg);                         //错误信息提示
void ListInsert_Sq(SqList &L,int i,int e);              //插入元素
void ListDelete_Sq(SqList &L,int i,int &e);             //删除元素


#endif // SQLIST_H

