#pragma once
#include "LinkStack.h"

template <typename T>
using Queueptr = LinkList<T>;

template <typename T>
struct LinkQueue{
    Queueptr<T> front;
    Queueptr<T> rear;
};

template <typename T>
void InitQueue_L(LinkQueue<T> &Q);

template <typename T>
void DestroyQueue_L(LinkQueue<T> &Q);

template <typename T>
void GetHead_L(LinkQueue<T> Q,T &e);

template <typename T>
void EnQueue_L(LinkQueue<T> &Q,T e);

template <typename T>
void DeQueue_L(LinkQueue<T> &Q,T &e);

template <typename T>
bool QueueEmpty_L(LinkQueue<T> Q);

template <typename T>
int QueueLength_L(LinkQueue<T> Q);

template <typename T>
void QueueTraverse_L(LinkQueue<T> Q);

    

