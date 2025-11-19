#include<stdio.h>
main()
{
 float a,b,sum,m;
 int c;
 a=1;
 b=2;
 sum=0;
 m=2;
 
 for(c=1;c<=10;c++) 
 {sum=sum+(b/a);
 b=m+a;
 a=m;
 m=b;
}
printf("%f",sum);
}
