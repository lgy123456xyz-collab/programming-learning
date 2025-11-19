#include <stdio.h>
#include <stdlib.h>

#define NUM 20 
int main()
{
   	int i, n;
  	int time;
	scanf("%d",&time);
	n = NUM;
	int a[NUM];
	// srand(time);
	for(i=0;i<n;i++)
   	{
		int s;
		s=(rand()%101);
    	a[i]=s;
		// printf("%d ",a[i]);
		
		int j;
		for(j=0;j<i;j++)
		{
			if(a[j]>a[i])
			{
				int t;
				t=a[i];
				int k;
				for(k=i-1;k>=j;k--)
				{
					a[k+1]=a[k];
				}
				a[j]=t;
			break;	
			}
		
		}
	}
	// printf("\n");
	int ii;
	int jj=0;
	for(ii=0;ii<NUM;ii++)
	{
		printf("%4d ",a[ii]);
		if((++jj)%5==0)
		{
			printf("\n");
		}
	}
	int cnt=1;
	while (cnt<=3)
	{
		int input;
		scanf("%d",&input);
		int delta=NUM/2;
		int x=NUM/2;
		while(delta!=0)
		{
			if(input=a[NUM-1])
			{
				printf("%d",NUM-1);
				break;
			}
			if(delta!=1&&delta%2!=0) delta=delta/2+1;
			else delta=delta/2;
			if(a[x]<input) x=x+delta;
			if(a[x]>input) x=x-delta;
			if(a[x]==input) 
			{
				printf("%d\n",x);
				break;
			}
		}
		if(delta==0)
		{
			printf("Not found\n");
		}
		cnt++;
	}
  	return(0);
}