#include<stdio.h>
#include<math.h>
int main(void)
{
    double cylinder( double r, double h);
    double a,b;
    scanf("%lf %lf",&a,&b);
    printf("Volume = %.3lf",cylinder(a,b));
}

double cylinder(double r, double h)
{
    double v;
    v=M_PI*r*r*h;
    return v;
}