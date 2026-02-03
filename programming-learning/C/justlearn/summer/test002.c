# include <stdio.h>
#include <math.h> 
int main()
{
 double   a,b,c,s,area;
 printf("Please input the length of the three sides of the triangle:\n");
 scanf("%lf%lf%lf",&a,&b,&c);
 if (a+b<=c||a+c<=b||b+c<=a){
 	printf("The entered sides can't form a triangle!");
 	return 1;
 }
 s=0.5*(a+b+c);
 area=sqrt(s*(s-a)*(s-b)*(s-c));
 printf("The area of the triangle is :%f\n",area);
 
	return 0;
}
