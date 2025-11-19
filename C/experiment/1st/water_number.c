#include<stdio.h>
int main()
{
	int i;
	for(i=100;i<1000;i++)
	{
		int b,c,d;
		d=i%10;
		c=(i/10)%10;
		b=i/100;
		if((b*b*b+c*c*c+d*d*d)==i)
		{
			printf("%d\n",i);
		}
	}
}

