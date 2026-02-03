//
// Created by Lenovo on 2025/10/22.
//
#include<stdio.h>
void alter(int *p,int *q){
int temp1;
int temp2;
temp1=*p+*q;
temp2=*p-*q;
*p=temp1;
*q=temp2;
}



int main()
{int x,y;
printf("Enter the first number:");
scanf("%d",&x);
printf("Enter the second number:");
scanf("%d",&y);
printf("The sum of the two numbers is %d\n",x+y);
printf("The minus of the two numbers is %d\n",x-y);
alter(&x,&y);
printf("The value of x is %d\n",x);
printf("The value of y is %d",y);
}
