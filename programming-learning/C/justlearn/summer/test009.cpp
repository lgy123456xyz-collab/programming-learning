#include<stdio.h>
void move(char x,char y);
void hanoi(int n,char one,char two,char three);
int main(void)
{
	
	int m;
	printf("input the number of diskes:");
	scanf("%d",&m);
	printf("The step to moving %d diskes:\n",m);
	hanoi(m,'A','B','C');

} 
void hanoi(int n,char one,char two,char three)
{
	
	if(n==1)
		move(one,three);
	else 
		{
			hanoi(n-1,one,three,two);
			move(one,three);
			hanoi(n-1,two,one,three);
		}
}
void move(char x,char y)
	{
		printf("%c-->%c\n",x,y);
	}
