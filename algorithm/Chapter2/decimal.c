#include<stdio.h>
int main(){
    int a,b,c;
    scanf("%d%d%d",&a,&b,&c);
    while(a!=0||b!=0||c!=0){
        printf("%.*f\n",c,(float)a/b);
        scanf("%d%d%d",&a,&b,&c);
    }
    return 0;
}