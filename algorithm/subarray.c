#include<stdio.h>
int main(){
    int n,m;
    scanf("%d %d",&n,&m);
    float sum=0;
    for(int i=0;i<m-n+1;i++){
        sum+=1.0/(n+i)/(n+i);
    }
    printf("%.5f\n",sum);
    return 0;
}