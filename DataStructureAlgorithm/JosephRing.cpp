#include<iostream>
struct LNode{
   int position;
   int password;
   LNode* next;
};
using CyList=LNode*;
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

int main(){
    CyList Joseph=new LNode;
    InitCyList(Joseph);    
    LNode* Now=Joseph;

    int n;
    std::cin>>n;
    for(int i=0;i<n;i++){
        int password;
        std::cin>>password;
        InsertCyList(Joseph,Now,i+1,password);
    }//先检查到这里7.50
    // Now=Now->next;
    Now=Joseph;
    int m;
    std::cin>>m;
    int order=0;
    while(!isCyListEmpty(Joseph)){
        for (int i = 0; i < m - 1; ) {
            Now = Now->next;
            if (Now != Joseph) i++; 
        }
        m=DeleteCyList(Joseph,Now,order);
        std::cout<<order<<" ";
    }
    return 0;
}
