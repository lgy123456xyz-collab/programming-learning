#include<stdio.h>
int main(void)
{
	long fac(long);
	long i,n;
	scanf("%ld",&n);
	for(i=1;i<=n;i++)
	printf("%ld!=%ld\n",i,fac(i));
	
	
	
}
long fac(long n)
{
	
 long i,f=1;
	for(i=1;i<=n;i++)
	f*=i;
	return(f);
}
