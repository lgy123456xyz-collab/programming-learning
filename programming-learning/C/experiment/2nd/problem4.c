#include<stdio.h>
int isPrime(int m)
{
	if(m==1) return 0;
	if(m==2) return 1;
	int i;
	for(i=2;i*i<=m;i++)
	{
		if(m%i==0) return 0; 
	}
	return 1;
}
int main()
{
	int m;
	scanf("%d",&m);
	if(m%2!=0) return 0;
	int i;
	for(i=4;i<=m;i+=2)
	{
		int j;
		for(j=2;j<=i/2;j++)
		{
			if(isPrime(j)&&isPrime(i-j))
			printf("%d=%d+%d\n",i,j,i-j);
		}
	}
}
