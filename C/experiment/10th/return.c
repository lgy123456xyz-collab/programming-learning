#include<stdio.h>
#include <stdlib.h>

struct list {
    int data;
    struct list *next;
};
void Reverse(struct list *head,int start, int stop) {
    struct list *a,*b,*c,*d;
    a=head;
    for (int i=1;i<start;i++) {
        a=a->next;
    }
    b=a->next;
    c=b->next;

    for (int i=0;i<stop-start;i++) {
        d=c->next;
        c->next=a->next;
        a->next=c;
        b->next=d;
        c=d;
    }
    struct list * current=head->next;
    while (current!=NULL) {
        printf("%d ",current->data);
        current=current->next;
    }
    // current=head;
    // while (current!=NULL) {
    //     head=current->next;
    //     free(current);
    //
    // }

}
int main() {
    int n;
    scanf("%d",&n);

    struct list* head=NULL;
    struct list* dummy=(struct list*)malloc (sizeof(struct list));
    dummy->data=0;
    dummy->next=NULL;
    struct list *prev=dummy,*current;
    for(int i=0;i<n;i++) {
        current=(struct list*)malloc(sizeof(struct list));

        scanf("%d",&current->data);
        current->next=NULL;
        prev->next=current;

        prev=current;
    }
    int start,stop;
    scanf("%d%d",&start,&stop);
    if (start<1||start>n||stop<1||stop>n) {
        current=dummy->next;
        while (current!=NULL) {
            printf("%d ",current->data);
            current=current->next;
        }
        current=head;
        while (current!=NULL) {
            free(current);
            head=current->next;
        }
    }
    else {
        Reverse(dummy,start,stop);
    }
    return 0;

}