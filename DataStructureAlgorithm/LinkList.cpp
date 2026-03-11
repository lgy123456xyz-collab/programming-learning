#include "LinkList.h"

void InitList_HL(LinkList &L){
    L=new LNode;
    L->next=NULL;
}//初始化带头结点的链表

void InitList_L(LinkList &L){
    L=NULL;
}//初始化不带头结点的链表

int ListLength_L(LinkList L){
    int count=0;
    LinkList p=L;
    while(p){
        count++;
        p=p->next;
    }
    return count;
}//求链表长度

LNode * LocateItem_L(LinkList L,int e){
    LinkList p=L;
    while(p&&p->data!=e){
        p=p->next;
    }
    return p;
}//按值查找

void ListInsertHead_L(LinkList &L,LNode *p,LNode *s){
    if(p==NULL){
        s->next=L;
        L=s;
    }
    else {
        LinkList q=L;
        while(q&&q->next!=p){
            q=q->next;
        }
        if(q){
            q->next=s;
            s->next=p;
        }
        else{
            ErrorMsg("p不是链表中的结点\n");
        }
    }
}//在p结点之前插入s结点


void ListInsertTail_L(LinkList &L,LNode *p,LNode *s){
    s->next=p->next;
    p->next=s;
}//在p结点之后插入s结点

void ListDelete_L(LinkList &L,LNode *p,int &e){
    if(p==L){
        L=p->next;
    }
    else {
        LinkList q=L;
        while(q&&q->next!=p){
            q=q->next;
        }
        if(q){
            q->next=p->next;
        }
        else{
            ErrorMsg("p不是链表中的结点\n");
        }
        e=p->data;
        delete p;
    }
}//删除p结点

void Union_L(LinkList &La,LinkList Lb){
    if(La==NULL){
        La=Lb;
        return;
    }
    while(Lb){
        LinkList s=Lb;
        Lb=Lb->next;
        LinkList p=La;
        LinkList pre=NULL;
        while(p&&p->data!=s->data){
            pre=p;
            p=p->next;
        }
        if(p){
            delete s;
        }
        else{
            pre->next=s;
            s->next=NULL;
        }
    }
}//求La和Lb的并集，结果存储在La中，Lb不变

void Union1_L(LinkList &La,LinkList Lb){
    LinkList pa=La;
    while(Lb){
        LinkList s=Lb;
        Lb=Lb->next;
        LinkList p=pa;
        while(p&&p->data!=s->data){
            p=p->next;
        }
        if(p){
            delete s;
        }
        else{
            s->next=La;
            La=s;
        }
    }
}//求La和Lb的并集，结果存储在La中，Lb不变，算法2

//2.3
void Insertx(SqList &L, int x){
    int len=ListLength_Sq(L);
    for(int i=0;i<=len;i++){
        if(x<L.elem[i]){
            ListInsert_Sq(L,i,x);
            break;
        }else if(L.elem[i]=='\0'){
            ListInsert_Sq(L,i+1,x);
        } 
    }
}

//2.5

void Reverse(SqList &L){
    if(L.length<=1) return;
    for(int i=0;i<L.length/2;i++){
        int temp=L.elem[i];
        L.elem[i]=L.elem[ListLength_Sq(L)-1-i];
        L.elem[ListLength_Sq(L)-1-i]=temp;
    }
}

//2.6
void ReverseLinkList(LinkList &L){
    
    LinkList p=L->next;
    if(p->next==NULL) return;
    LinkList q=L->next->next;
    p->next=NULL;
    while(q->next!=NULL){
        L->next=q;
        q=q->next;
        L->next->next=p;
        p=L->next;

    }
    L->next=q;
    q->next=p;
    

}

//2.9
void Union2_L(LinkList &La,LinkList &Lb,LinkList &Lc){
    LinkList pa=La;
    LinkList pb=Lb;
    LinkList pc=NULL;
    while(pa&&pb){
        if(pa->data<pb->data){
            if(!pc){
                pc=pa;
                Lc=pc;
            }
            else{
                pc->next=pa;
                pc=pc->next;
            }
            pa=pa->next;

        }
        else if(pa->data>pb->data){
            if(!pc){
                pc=pb;
                Lc=pc;
            }
            else{
                pc->next=pb;
                pc=pc->next;
            }
            pb=pb->next;
    }    
        else{
            if(!pc){
                pc=pa;
                Lc=pc;
            }
            else{
                pc->next=pa;
                pc=pc->next;
            }
            pa=pa->next;
            LinkList q=pb;
            pb=pb->next;
            delete q;
        }
    }
    if(pa){
        if(!pc){
            pc=pa;
            Lc=pc;
        }
        else{
            pc->next=pa;
        }
    }
    if(pb){
        if(!pc){
            pc=pb;
            Lc=pc;
        }
        else{
            pc->next=pb;
        }
    }

}

//2.10
void DeleteHead_L(LNode *s){
    LinkList p=s;
    LinkList pre=NULL;
    while(p->next!=s){
        pre=p;
        p=p->next;
    }
    pre->next=s;
    delete p;
    return;
    
}

//2.12
void Exchange_Sq(SqList &L){
    int i=0,j=L.length-1;
    while(i<j){
        while(i<j&&L.elem[i]%2==1)
            i++;
        while(i<j&&L.elem[j]%2==0)
            j--;
        if(i<j){
            int temp=L.elem[i];
            L.elem[i]=L.elem[j];
            L.elem[j]=temp;
        }
    }
}