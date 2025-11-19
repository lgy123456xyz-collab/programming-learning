#include<stdio.h>
#include<math.h>
main()
{
	float x,y;
	scanf("%f%f",&x,&y);
	if (-5<=x&&x<=5&&-2.5<=y&&y<=2.5)
	printf("In the rectangle");
	else printf("Not in the rectangle");
}
