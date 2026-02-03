#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#define TSIZE 45
struct film {
    char title[TSIZE];
    int rating;
    struct film *next;
};
char * s_gets(char * st, int n);

int main(){
    struct film *head = NULL;
    struct film * prev,*current;
    char input [TSIZE];


    puts("Enter first movie title:");
    while(s_gets(input,TSIZE)!=NULL&&input[0]!='\0') {
        current = (struct film *)malloc(sizeof(struct film));
        if(head==NULL) {
            head = current;
        }
        else {
            prev->next = current;
        }
        current->next = NULL;
        strcpy(current->title,input);
        puts("Enter new rating:");
        scanf("%d",&current->rating);
        while (getchar()!='\n') {
            continue;
        }
        puts("Enter new name:empty to stop");
        prev = current;
    }
    if(head==NULL) {
        puts("No data entered");
    }
    else {
        printf("Here is the movie list:\n");
    }
    current = head;
    while(current!=NULL) {
        printf("%s %d\n",current->title,current->rating);
        current = current->next;
    }
    current = head;
    while(current!=NULL) {
        free(current);
        head=current->next;
    }
    printf("Bye\n");
    return 0;
}
char *s_gets(char * st, int n) {
    char *ret_val;
    char *find;
    ret_val = fgets(st,n,stdin);
    if(ret_val) {
        find=strchr(st,'\n');
        if (find) *find='\0';
    }
    return ret_val;
}