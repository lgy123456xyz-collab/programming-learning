#ifndef IOSINCLUDE

#include<iostream>
#endif


#include"CyList.h"

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
