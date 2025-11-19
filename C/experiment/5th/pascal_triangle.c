#include<stdio.h>
//
// Created by Lenovo on 2025/11/10.
//
int pascal (int m,int n);
int power(int m);
int main(){
int m,n;
scanf("%d%d",&m,&n);
printf("%d",pascal(m-1,n));
return 0;
}
int power(int m) {
    int base=1;
    for(int i=1;i<=m;i++){
        base *= i;
    }
    return base;
}
int pascal(int m,int n)
{
return(power(m)/power(m-n+1)/power(n-1));
}
