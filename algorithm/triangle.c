#include<stdio.h>
#include<time.h>
int main(){
    int n;
    scanf("%d",&n);
    for(int i=0;i<n;i++){
        for(int j=0;j<i;j++){
            printf(" ");
        }
        for(int k=0;k<2*(n-i)-1;k++){
            printf("*");
        }
        printf("\n");
    }
    printf("%.5f",(double)clock()/CLOCKS_PER_SEC);
    return 0;
}