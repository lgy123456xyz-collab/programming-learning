
#include"CyList.h"
#include<iostream>

void InitCyList(CyList &L){
    L->next=L;
    L->position=0;
    L->password=0;

}
void InsertCyList(CyList &L,LNode*&Now,int position,int password){
    Now->next=new LNode;
    Now=Now->next;
    Now->position=position;
    Now->password=password;
    Now->next=L;
}
bool isCyListEmpty(CyList L){
    if(L->next==L)return 1;
    else return 0;
}
int DeleteCyList(CyList &L,LNode* &Now,int &position){
    LNode*p=Now->next;
    if(p==L){
        p=p->next;
        Now=L;
    }
    position=Now->next->position;
    Now->next=Now->next->next;
    int e= p->password;
    delete p;
    return e;
}