#include<stdio.h>
main()
{
	int a,b,c,d=1,e;
	scanf("%d",&a);
	b=(a+1)*a/2;
	for(c=1;c<=b;c++)
	{
	printf("%4d",c);
	if(((2*a+1-d)*d/2)==c)
	{
		printf("\n");
		d+=1;
	} 
	}
}
