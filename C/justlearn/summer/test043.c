#include <stdio.h>

int isPrime(int m);



int main()
{
    int m;
    scanf("%d",&m);
    int s;
    s=m;
    int j;
    int k=0;
    while(m>0)
    {
        j=m%10;
        m/=10;
        k+=j;
    }

    if(isPrime(s)==1 && isPrime(k)==1)
        printf("yes");
    else
        printf("no");   
}

int isPrime(int m)
{
    int i;
    for(i=2;i*i<=m;i++)
    {
        if (m%i==0)
        return 0;
    }
    return 1;
}




