#include<stdio.h>
#include<string.h>
#include<stdlib.h>


int main(){
    int T;
    scanf("%d",&T);
    while(T--){
        int a[10]={0};
        int in;
        scanf("%d",&in);
        
        for(int i=1;i<=in;i++){
            int k=i;
            while(k>0){
                a[k%10]++;
                k/=10;
            }
        }
        
        for(int j=0;j<10;j++){
            printf("%d",a[j]);
            if(j==9){
                printf("\n");
            }else{
                printf(" ");
            }
        }


    }
}