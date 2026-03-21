#include "Homework.h"

//2.3
void Insertx(SqList<int> &L, int x){
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

void Reverse(SqList<int> &L){
    if(L.length<=1) return;
    for(int i=0;i<L.length/2;i++){
        int temp=L.elem[i];
        L.elem[i]=L.elem[ListLength_Sq(L)-1-i];
        L.elem[ListLength_Sq(L)-1-i]=temp;
    }
}

//2.6
void ReverseLinkList(LinkList<int> &L){
    
    LinkList<int> p=L->next;
    if(p->next==NULL) return;
    LinkList<int> q=L->next->next;
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
void Union2_L(LinkList<int> &La,LinkList<int> &Lb,LinkList<int> &Lc){
    LinkList<int> pa=La;
    LinkList<int> pb=Lb;
    LinkList<int> pc=NULL;
    while(pa&&pb){
        if(pa->data<pb->data){
            if(!pc){ pc=pa;
                Lc=pc;
            }
            else{pc->next=pa;
                pc=pc->next;
            }
            pa=pa->next;
        } else if(pa->data>pb->data){
            if(!pc){pc=pb;
                Lc=pc;
            }
            else{pc->next=pb;
                pc=pc->next;
            }
            pb=pb->next;
    }    
        
        else{
            if(!pc){ pc=pa;
                Lc=pc;
            }
            else{ pc->next=pa;
                pc=pc->next;
            }
            pa=pa->next;
            LinkList<int> q=pb;
            pb=pb->next;
         
      delete q;
        }
    }
    if(pa){
        if(!pc){ pc=pa;
            Lc=pc;
        }
        else{ pc->next=pa;
        }
    }
    if(pb){
        if(!pc){ pc=pb;
            Lc=pc;
        }
        else{ pc->next=pb;
        }
    }

}

//2.10
void DeleteHead_L(LNode<int> *s){
    LinkList<int> p=s;
    LinkList<int> pre=NULL;
    while(p->next!=s){
        pre=p;
        p=p->next;
    }
    pre->next=s;
    delete p;
    return;
    
}

//2.12
void Exchange_Sq(SqList<int> &L){
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


//3.7
bool matchToString(char str[]){
    SqStack<char> S;    //为了让char不报错,这里用了一下cpp模板
    InitStack_Sq(S);
    int flag=1;
    char *p=str;
    char e;
    while(*p&&flag){
        switch(*p){
            case '(':
            case '[':
            case '{':
                Push_Sq(S,*p);
                break;
            case ')':
                if(Pop_Sq(S,e)||e!='('){
                    flag=0;
                }
                break;
            case ']':
                if(Pop_Sq(S,e)||e!='['){
                    flag=0;
                }
                break;
            case '}':
                if(Pop_Sq(S,e)||e!='{'){
                    flag=0;
                }
                break;  
            default:
                break;
        }
        p++;
        if(flag==1&&StackEmpty_Sq(S)){
            return 1;
        }
        else 
            return 0;
    }
    
}

//设表达式由单字母变量、双目运算符和圆括号组成（如:“(a*(b+c)-d)/e）”。
//试写一个算法，将一个书写正确的表达式转换为逆波兰式。