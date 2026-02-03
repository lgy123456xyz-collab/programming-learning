#include<stdio.h>

int main() {
    char a[20]={0};
    int flag=0;
    int count=0;
    int temp=0;
    while (scanf("%c",&a[flag])) {
        if (a[flag]=='.') {
            if (temp==0&&count!=0) {
                printf("%d",count);
                temp=1;
            }
            else if (count!=0)
                printf(" %d",count);
            break;
        }
        else if (a[flag]==' ') {
            if (temp==0&&count!=0) {
                printf("%d",count);
                temp=1;
            }
            else if (count!=0)
                printf(" %d",count);
            count=0;
            continue;
        }
        else if (a[flag]=='\n') {
            count=0;
            break;
        }
        count++;


    }
return 0;

}