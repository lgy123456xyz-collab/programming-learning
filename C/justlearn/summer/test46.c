#include <stdio.h>
int isPrime(int m);
int main()
{
    int n,k,i,cnt,sum,cntTotal;
    cnt=0;
    sum=0;
    cntTotal=0;
    scanf("%d%d",&n,&k);
    for(i=1;i<=n;i++)
    {
        if(isPrime(i))
            cntTotal++;
    }

    for(i=n;i>=1;i--)
    {        
        if(isPrime(i))
        {
            cnt++;
            if(k<=cntTotal)
            {
                if(cnt==k)
                    printf("%d=",i);
                else
                    printf("%d+",i);                
            }
            else{
                 if(cnt==cntTotal)
                    printf("%d=",i);
                else
                    printf("%d+",i);               
            }
            sum=sum+i;  
            if(cnt==k)
                break;         
        }

    }
    printf("%d",sum);
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