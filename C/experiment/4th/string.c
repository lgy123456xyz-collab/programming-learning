#include<stdio.h>
#include <string.h>

int main(){
    int num=3;
    int len;
    while (num--) {
        char ch[100];
        printf("输入一个字符串:");
        scanf("%s",ch);
        len=strlen(ch);
        printf("正序:");
        for (int i=0;i<len;i++) {
            if (ch[i]<='9'&&ch[i]>='0') {
                printf("*");
            }
            else {
                printf("%c",ch[i]);
            }
        }
        printf("\n");
        printf("逆序:");
        for (int i=len-1;i>=0;i--) {
            if (ch[i]<='9'&&ch[i]>='0') {
                printf("*");
            }
            else {
                printf("%c",ch[i]);
            }
        }
        printf("\n");
    }
}
