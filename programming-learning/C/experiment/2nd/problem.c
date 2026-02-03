#include<stdio.h>
int main()
{
	int m;
	scanf("%d",&m);
	int money[3]={0,0,0};
	int i;
	int cnt=0;
	for(i=1;i<=m;i++)
	{
		int input;
		scanf("%d",&input);
		if(input==20) 
		{
			money[2]++;
			if(money[1]>=1&&money[0]>=1)
			{
				money[0]--;
				money[1]--;
			}
			else if(money[0]>=3)
			{
				money[0]-=3;
			}
			else 
				cnt++;
			
		}
		if(input==10) 
		{
			money[1]++;
			if(money[0]>=1)
			{
				money[0]--;
			}
			else cnt++;
			
		}
		if(input==5) 
		{
			money[0]++;
		}
	}
	if(cnt!=0)
	printf("0");
	else printf("1");
}
