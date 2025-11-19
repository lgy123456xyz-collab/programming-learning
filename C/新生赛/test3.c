#include<stdio.h>
#include<stdlib.h>


int cmp(const void *a, const void *b)
{
    return *(int *)b-*(int *)a;
}
int main()
{
    int t;
    scanf("%d",&t);
    for (int i = 1; i <= t; i++)
    {
        int n,m;
        scanf("%d %d",&n,&m);
        int num[n+1][m+1];
        int output [n+1][m+1];
        for(int tt=0;tt<=n+1;tt++)
            for(int j=0;j<=m+1;j++)
            output[tt][j]=0;
        for(int tt=0;tt<=n+1;tt++)
            for(int j=0;j<=m+1;j++)
            num[tt][j]=0;
        for(int j=1;j<=m;j++)
        {
            int u,v;
            scanf("%d %d",&u,&v);
            num[u][j]= -1;
            output[v][j]= +1;
        }
        for(int k=1;k<=n;k++)
        {
            for(int j=1;j<=m;j++)
            {
                if (num[k][j]==-1)
                {
                    int count[n+1];
                    for(int cc=0;cc<=n;cc++)
                    {
                        count[cc]=0;
                    }
                    for(int aa=1;aa<=n;aa++)
                    {
                        if(output[aa][j]==1)
                        {
                            count[aa]=aa;
                            qsort(count,n+1,sizeof(int),cmp);
                            for(int bb=n;bb>=1;bb--)
                            {
                                if(count[bb]!=0)
                                printf("%d ",count[bb]);
                                fflush(stdout);
                            }
                        }
                    }
                }
                
                
            }
            
            printf("\n");
            fflush(stdout);

        }
        printf("\n");
        fflush(stdout);

    }
    
    return 0;
}