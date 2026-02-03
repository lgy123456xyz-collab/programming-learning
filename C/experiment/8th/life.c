#include<stdio.h>
int main (){
    int map[1004][42][42]={0};
    for(int i=1;i<=40;i++)
    {
        for(int j=1;j<=40;j++)
        {
            char c;

            scanf("%c",&c);
            if(c=='*')
            map[0][i][j]=1;

        }
        getchar();


    }
    int num;
    scanf("%d",&num);
    // printf("%d",num);
    int flag=0;
    for(int k=0;k<num&&k<1000;k++)
    {
        for(int i=1;i<=40;i++)
        {
            for(int j=1;j<=40;j++){
                int sum=map[k][i-1][j-1]+map[k][i-1][j]+map[k][i-1][j+1]+map[k][i][j-1]+map[k][i][j+1]+map[k][i+1][j-1]+map[k][i+1][j]+map[k][i+1][j+1];
                if (sum==3&&map[k][i][j]==0)
                {
                    map[k+1][i][j]=1;
                }
                else if((sum==2||sum==3)&&map[k][i][j]==1)
                {
                    map[k+1][i][j]=1;
                }
                else if((sum<2)&&map[k][i][j]==1)
                {
                    map[k+1][i][j]=0;
                }
                else if((sum>3)&&map[k][i][j]==1)
                {
                    map[k+1][i][j]=0;
                }
            }
        }
        flag++;
    }
    for(int i=1;i<=40;i++)
    {
        for(int j=1;j<=40;j++)
        {


            if(map[flag][i][j]==1)
            {
                printf("*");
            }
            else printf("-");
        }
        printf("\n");
    }
}



