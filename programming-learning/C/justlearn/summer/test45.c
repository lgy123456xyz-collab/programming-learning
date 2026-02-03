#include<stdio.h>

int SavePrime(int n,int k);
int isPrime(int m);
int main()
{
    int n,k,cnt,sum;
    scanf("%d%d",&n,&k);
    cnt=0;
    sum=0;
    int p;
    int j;
    for(j=n;cnt<k-1&&j>2;j--)
        {
            if(isPrime(j)==1)
            {
                printf("%d+",j);
                cnt++;
                sum+=j;
            }
            
        }
    p=j;
    if(p==2)
    {
        printf("%d=%d",p,sum+2);
        return 0;
    }
    else
    {
        for(int g=p-1;cnt<k;g--)
        {
            if(isPrime(g)==1)
            {
                
                printf("%d=%d",g,sum+g);
                cnt++;
                return 0;
            }
            
        }
    }
}

    
    


int isPrime(int m)
{
    if(m==1)
    {
        return 0;
    }
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
