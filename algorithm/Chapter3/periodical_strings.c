#include<stdio.h>
#include<string.h>
int main(){
    int T;
    scanf("%d",&T);
    while(T--){
        char s[100];
        scanf("%s",s);
        int len=strlen(s);
        int flag=1;
        int i;
        for(i=1;i<len;i++){
            if(len%i!=0){
                continue;
            }
            int times=len/i;
            int plusflag=0;
            for(int j=1;j<times;j++){
                if(strncmp(s+j*i,s,i)==0){
                    plusflag++;
                }
            }
            if(plusflag==times-1){
                flag=0;
                break;
            }
        }
        printf("%d",i);
        if(T!=0){
            printf("\n\n");
        }
        else{
            printf("\n");
        }
    }
}