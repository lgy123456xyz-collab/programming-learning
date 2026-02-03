#include<stdio.h>
#define PI 3.1415926
main ()
{
	double r,h;
	double cl,cs,cv;
	scanf("%lf%lf",&r,&h);
	cl=2*PI*r;
	cs=PI*r*r;
	cv=cs*h;
	printf("cl=%.4lf\ncs=%.4lf\ncv=%.4lf\n",cl,cs,cv);
	
}
