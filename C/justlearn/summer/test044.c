#include <stdio.h>




int isPrime(int m);
int main()
{
    int i;
    int m;
    scanf("%d",&m);
    for(i=2;2*i<=m;i++)
    {
        if(isPrime(i)+isPrime(m-i)==2)
        {
            printf("%d = %d + %d",m,i,m-i);
            return 0;
        }
    }



}


int isPrime(int m)
{
    if(m==2)
    {
        return 1;
    }
    for(int i=2;i*i<=m;i++)
    {
        if(m%i==0)
        {
            return 0;
        }
    }
    return 1;
}