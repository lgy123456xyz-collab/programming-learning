#include "LinkQueue.h"

template <typename T>
void InitQueue_L(LinkQueue<T> &Q){
    Q.front=Q.rear=new LNode<T>;
    Q.front->next=NULL;
}//初始化链队列

template <typename T>
void DestroyQueue_L(LinkQueue<T> &Q){
    while(Q.front){
        Q.rear=Q.front->next;
        delete Q.front;
        Q.front=Q.rear;
    }
}//销毁链队列

template <typename T>
void GetHead_L(LinkQueue<T> Q,T &e){
    if(Q.front==Q.rear){
        return false;
    }
    e=Q.front->next->data;
    return true;
}//取队头元素

template <typename T>
void EnQueue_L(LinkQueue<T> &Q,T e){
    LinkList<T> s=new LNode<T>;
    s->data=e;
    s->next=NULL;
    Q.rear->next=s;
    Q.rear=s;
}//入队

template <typename T>
void DeQueue_L(LinkQueue<T> &Q,T &e){
    if(Q.front==Q.rear){
        return false;
    }
    LNode<T> *p=Q.front->next;
    e=p->data;
    Q.front->next=p->next;
    if(Q.rear==p){
        Q.rear=Q.front;
    }
    delete p;
    return true;
}//出队

template <typename T>
bool QueueEmpty_L(LinkQueue<T> Q){
    return Q.front==Q.rear;
}//判断链队列是否为空

template <typename T>
int QueueLength_L(LinkQueue<T> Q){
    int length=0;
    LinkList<T> p=Q.front->next;
    while(p){
        length++;
        p=p->next;
    }
    return length;
}//求链队列长度

template <typename T>
void QueueTraverse_L(LinkQueue<T> Q){
    LinkList<T> p=Q.front->next;
    while(p){
        std::cout<<p->data<<" ";
        p=p->next;
    }
    std::cout<<std::endl;
}//遍历链队列

