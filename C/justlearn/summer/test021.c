#include <stdio.h>
#include <stdlib.h>

int main()
{
    int n;
    printf("n=");
   
 scanf("%d",&n);
    int i;
    long double An=1.0;
    long double term=1.0;
    long double Sn=0.0;
    for(i=1;i<=n;i++){
        Sn=Sn+An;
        term=term*i;
        An=1.0/term;
    }
    printf("e=%.15Lf",Sn);
    return 0;
}
