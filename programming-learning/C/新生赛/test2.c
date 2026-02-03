#include<stdio.h>
int main()
{
    int num;
    scanf("%d",&num);
    for(int i=1;i<=num;i++)
    {
        printf("%d\n",i);
        fflush(stdout);
        int m;
        scanf("%d",&m);
        if (m==0)
        {
            printf("!\n");
            fflush(stdout);
            break;
        }

    }
    return 0;
}