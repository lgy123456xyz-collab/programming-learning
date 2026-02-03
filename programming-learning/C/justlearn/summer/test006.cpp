#include<stdio.h>
main()
{
	int a,b;
	int plus,minus,multiply,mod;
	int chu;
	scanf("%d%d",&a,&b);
	plus=a+b;
	minus=a-b;
	multiply=a*b;
	mod=a%b;
	chu=a/b;
	printf("%d + %d = %d\n%d - %d = %d\n%d * %d = %d\n%d / %d = %d\n%d %% %d = %d",a,b,plus,a,b,minus,a,b,multiply,a,b,chu,a,b,mod);
	
}
