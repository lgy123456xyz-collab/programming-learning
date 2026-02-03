#include<stdio.h>
int delete_odd(int m);
int main()
{
	int input;
	scanf("%d",&input);
	delete_odd(input);
	return 0;
}
int delete_odd(int m)
{
	int b,c;
	int flag=0;
	b=m;
	while(b>0)
	{
		c=b%10;
		b=b/10;
		if(c%2==0&&c!=0)
		{
			printf("%d",c);
			flag++;
		}
	}
	if(flag==0)
	{
		printf("0");
	}
	return 0;
}