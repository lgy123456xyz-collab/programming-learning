#include "SqStack.h"

void InitStack_Sq(SqStack &S,int msize=STACK_INIT_SIZE){
    S.elem=new int[msize];
    S.top=-1;
    S.stacksize=msize;
}//初始化顺序栈

void DestroyStack_Sq(SqStack &S){
    delete []S.elem;
    S.top=-1;
    S.stacksize=0;
}//销毁顺序栈

bool GetTop_Sq(SqStack S,int &e){
    if(S.top==-1) return 0;
    e=S.elem[S.top];
    return 1;
}//取栈顶元素

void Increment(SqStack &S){
    int *newbase=new int[S.stacksize+STACK_INIT_SIZE];
    if(!newbase){
        ErrorMsg("内存分配失败\n");
        return;
    }
    memcpy(newbase,S.elem,S.stacksize*sizeof(int));
    delete []S.elem;
    S.elem=newbase;
    S.stacksize+=STACK_INIT_SIZE;
}//增加顺序栈的存储空间

void Push_Sq(SqStack &S,int e){
    if(S.top==S.stacksize-1){
        Increment(S);
    }
    S.top++;
    S.elem[S.top]=e;
}//入栈

bool Pop_Sq(SqStack &S,int &e){
    if(S.top==-1){
        return 0;
    }
    e=S.elem[S.top];
    S.top--;
    return 1;
}//出栈


