#include<stdio.h>
int isleapyear(int m)
{
	if(m%4==0&&(m%100!=0))
	return 1;
	return 0;
}
void printweek(void)
{
	printf("Mon Tur Wed Thu Fri Sat Sun\n"); 
}

int main()
{
	int a,b;
	scanf("%d %d",&a,&b);
	int dmp[12]={31,28,31,30,31,30,31,31,30,31,30,31};
	if(isleapyear(a)==1)
	dmp[1]=29;
	int i,cnt=b-1;
	for(i=1;i<=12;i++)
	{
		printf("%dÄê%dÔÂ\n",a,i);
		printweek();
		int j,k;
		
		for(k=1;k<=4*cnt;k++)
		{
			printf(" ");
		}
		for(j=1;j<=dmp[i-1];j++)
		{
			cnt++;
			printf("%4d",j);
			if(cnt%7==0&&dmp[i-1]!=j)
			{
				printf("\n");	
			}
			if(cnt%7==0)
			{
				cnt=0;
			}
			
		}
		printf("\n\n");

	}
}
