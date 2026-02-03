#include<stdio.h>
#include<math.h>
int prime(m);
int main(void)
{
    int j=100,m,cnt=0;

    for(m=1;m<=j;m++)
    {
    if(prime(m)==1)
    {
        cnt+=printf("%6d",m);
        if(cnt%60==0)
        {
            printf("\n");
        }
    }
    }
}   

int prime(int m)
{
    int k,i;
    k=sqrt(m);
    if(m==1)
    {
        return 0;
    }
    for(i=2;i<=k;i++)
    {
        if(m%i==0)
        {
            return 0;
        }
        
    }
    return 1;
}
