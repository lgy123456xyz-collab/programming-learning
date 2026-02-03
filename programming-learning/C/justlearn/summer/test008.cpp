#include<stdio.h>
main()
{
	int a,i;
	scanf("%d",&a);
 	if((a%2)==0)
 	{
 	for(i=1;i<=(a/2-1);){ 	 
	 printf("%d ",(2*i-1));
	 i+=1;}
	 printf("%d",a-1); 
 	}else
	 {
 	
 	for(i=1;i<=(a+1)/2-1;)
 	{
 
 	printf("%d ",2*i-1);
 i+=1; 
 }printf("%d",a);}
 return 0;
} 

