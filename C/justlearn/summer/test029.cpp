#include<stdio.h>
#include<math.h>
main()
{
	int i,j=1,a,b,sum=0;
	scanf("%d%d",&a,&b);
	for(i=a;i<=b;i++)
	{
	printf("%5d",i);
	sum+=i;
	
	if(j%5==0)printf("\n");
	j++;
}
if ((j-1)%5!=0)
printf("\n");
printf("Sum = %d",sum);
}

