#include "sqList.h"

static void Increment(SqList &L){
    int *newbase=new int[L.listsize+LIST_INC_SIZE];
    if(!newbase){
        ErrorMsg("内存分配失败\n");
        return;
    }
    memcpy(newbase,L.elem,L.listsize*sizeof(int));
    delete []L.elem;
    L.elem=newbase;
    L.listsize+=LIST_INC_SIZE;
}//增加顺序表的存储空间

void InitList_Sq(SqList &L,int msize=LIST_INIT_SIZE){
    L.elem=new int[msize];
    L.listsize=msize;
    L.length=0;
}//初始化顺序表
void DestroyList_Sq(SqList &L){
    delete []L.elem;
    L.length=0;
    L.listsize=0;
}//销毁顺序表
bool ListEmpty_Sq(SqList L){
    return L.length==0;
}//判断顺序表是否为空
bool ListFull_Sq(SqList L){
    return L.length==L.listsize;
}//判断顺序表是否已满
int ListLength_Sq(SqList L){
    return L.length;
}//求顺序表长度
int LocateItem_Sq(SqList L,int e){
    for(int i=0;i<L.length;i++){
        if(L.elem[i]==e) return i+1;
    }
    return 0;
}//按值查找
int GetItem_Sq(SqList L,int i,int &e){
    if(i<1||i>L.length) return 0;
    e=L.elem[i-1];
    return 1;
}//按位查找

void ErrorMsg(const char *msg){
    printf("%s",msg);
}//错误提示
void ListInsert_Sq(SqList &L,int i,int e){
    if(i<1||i>L.length+1){
        ErrorMsg("插入位置不合法\n");
        return;
    }
    if(L.length==L.listsize){
        Increment(L);
    }
    for(int j=L.length-1;j>=i-1;j--){
        L.elem[j+1]=L.elem[j];
    }
    L.elem[i-1]=e;
    L.length++;
}//插入元素
void ListDelete_Sq(SqList &L,int i,int &e){
    if(i<1||i>L.length){
        ErrorMsg("删除位置不合法\n");
        return;
    }
    e=L.elem[i-1];
    for(int j=i;j<L.length;j++){
        L.elem[j-1]=L.elem[j];
    }
    L.length--;
}//删除元素 
