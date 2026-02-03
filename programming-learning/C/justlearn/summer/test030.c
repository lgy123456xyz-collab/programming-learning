#include <stdio.h>
#include <stdlib.h>

int main()
{
    int n;
    printf("n="); 
    fflush(stdout);   // 保证立刻输出提示符

    scanf("%d",&n);

    int i;
    double An=1.0;
    double term=1.0;
    double Sn=0.0;

    for(i=1;i<=n;i++){
        Sn=Sn+An;
        term=term*i;
        An=1.0/term;
    }

    printf("e=%.15f\n",Sn);
    return 0;
}
