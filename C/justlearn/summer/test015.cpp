#include<math.h>
#include<stdio.h>
int main(void)
{
	int i,b,c,d,e,m,a;

	scanf("%d",&m);
	int f[m];
for(i=0;i<m;i++)
{
	scanf("%d",&c); 
	f[i]=c;
}
for(i=0;i<m;i++)
{
	d=0;
	e=f[i];
	a=sqrt(e);
if(e==1)
{
	d=1;
}
else {
	for(b=2;b<=a;b++)
	{
	if(e%b==0)
	{
	d=1;break;}
	}
}

	if(d==0)
	printf("Yes\n");
	else 
	printf("No\n");
}
	
return 0;
} 
