#include<math.h>
#include<stdio.h>
int main(void)
{
    double m,n;
    scanf("%lf %lf",&m,&n);
    int c;
    c=tgamma(n+1)/tgamma(m+1)/tgamma(n-m+1);
    printf("result = %d",c);
}
