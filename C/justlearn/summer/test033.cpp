#include <stdio.h>
int main()
{
	printf("Please input a capital letter:\n");
	char c1,c2;
	c1=getchar();
	if(c1<65||c1>122||(90<c1&&c1<97)){
		printf("You haven't input a letter!\n");
		return 1;
	}
	if(96<c1&&c1<123){
		printf("You haven't input a capital letter!\n");
		return 1;
	}
	c2=c1+32;
	putchar(c2);
	printf("\n");
	return 0;
}
