#include<string.h>
#include<stdio.h>
int main(){
    int cnt=0;

    while(cnt<3){   
        printf("输入一个字符串:");
        char a[10000]={0};
        scanf("%s",a);
        int len=strlen(a);
        for(int i=0;i<len;i++){
            if((a[i]>=48&&a[i]<=(48+9))){
                a[i]='*';
            }
        }  
        printf("正序:%s\n",a);
        printf("逆序:");
        for(int i=len-1;i>=0;i--){
            printf("%c",a[i]);
        }
        printf("\n");
        cnt++;
    }
}