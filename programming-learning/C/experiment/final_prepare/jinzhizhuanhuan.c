// #include<stdio.h>
// void dec2sn(int decimal, int systemNumber);
// void output(int m);
// int power(int m,int n);

// int main()
// {
// 	int m,n;
// 	scanf("%d %d",&m,&n);
// 	dec2sn(m,n);
// 	return 0;
// }

// void dec2sn(int decimal,int sysytemNumber)
// {
// 	int a=decimal;
// 	int b;
// 	while(a>0)
// 	{
// 		int cnt=0;
// 		b=a;
// 		while(b>=sysytemNumber)
// 		{
// 			b=b/sysytemNumber;
// 			cnt++;
// 		}
// 		output(b);
// 		a=a-b*power(sysytemNumber,cnt);
// 		if(a==0)
// 		{
// 			int j;
// 			for(j=1;j<=cnt;j++)
// 			{
// 				printf("0");
// 			}
// 		}
// 	}

// }

// void output(int m)
// {
// 	switch (m)
// 	{
// 	case 0:
// 	case 1:
// 	case 2:
// 	case 3:
// 	case 4:
// 	case 5:
// 	case 6:
// 	case 7:
// 	case 8:
// 	case 9:printf("%d",m);break;
// 	case 10:printf("A");break;
// 	case 11:printf("B");break;
// 	case 12:printf("C");break;
// 	case 13:printf("D");break;
// 	case 14:printf("E");break;
// 	case 15:printf("F");break;					
// 	}
// }

// int power(int m,int n)
// {
// 	int i;
// 	int pow=1;
// 	for(i=1;i<=n;i++)
// 	{
// 		pow*=m;
// 	}
// 	return pow;
// }
#include<stdio.h>
void dec2sn(int decimal, int systemNumber){
    if(decimal!=0){
        dec2sn(decimal/systemNumber,systemNumber);
        int rem=decimal%systemNumber;
        if(rem>=0&&rem<=9){
            printf("%d",rem);
        }
        else{
            switch(rem){
                case 10:
                printf("A");
                break;
                case 11:
                printf("B");
                break;
                case 12:
                printf("C");
                break;
                case 13:
                printf("D");
                break;
                case 14:
                printf("E");
                break;
                case 15:
                printf("F");
                break;
            }
        }
    }
}
int main(){
    int m,n;
    scanf("%d %d",&m,&n);
    dec2sn(m,n);
    return 0;
}