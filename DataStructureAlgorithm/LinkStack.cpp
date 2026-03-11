#include "LinkStack.h"

void InitStack_L(LinkStack &S){
    S=NULL;
}//初始化链栈

void DestroyStack_L(LinkStack &S){
    while(S){
        LinkList p=S;
        S=S->next;
        delete p;
    }
}//销毁链栈

bool GetTop_L(LinkStack S,int &e){
    if(S==NULL) return 0;
    e=S->data;
    return 1;
}//取栈顶元素

void Push_L(LinkStack &S,int e){
    LinkList p=new LNode;
    p->data=e;
    p->next=S;
    S=p;
}//入栈

bool Pop_L(LinkStack &S,int &e){
    if(S==NULL) return 0;
    LinkList p=S;
    e=p->data;
    S=S->next;
    delete p;
    return 1;
}//出栈

