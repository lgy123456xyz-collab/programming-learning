#include <stdio.h>

void max_and_change(double *a,double *b,double *c)
{
    double temp;
    if(*a>*b)
    {
        temp=*a;
        *a=*b;
        *b=temp;
    }
    if(*b>*c)
    {
        temp=*b;
        *b=*c;
        *c=temp;
    }
    if(*a>*c)
    {
        temp=*a;
        *a=*c;
        *c=temp;
    }
}
int main(void)
{
    double x=0, y=0, z=0;
    scanf("%lf %lf %lf",&x,&y,&z);
    printf("The value of x is %lf\n",x);
    printf("The value of y is %lf\n",y);
    printf("The value of z is %lf\n",z);
    max_and_change(&x,&y,&z);
    printf("The value of x is %lf\n",x);
    printf("The value of y is %lf\n",y);
    printf("The value of z is %lf\n",z);
    return 0;


}