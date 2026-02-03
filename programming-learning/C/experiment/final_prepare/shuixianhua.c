// #include<stdio.h>
// int main()
// {
// 	int i;
// 	for(i=100;i<1000;i++)
// 	{
// 		int b,c,d;
// 		d=i%10;
// 		c=(i/10)%10;
// 		b=i/100;
// 		if((b*b*b+c*c*c+d*d*d)==i)
// 		{
// 			printf("%d\n",i);
// 		}
// 	}
// }

#include<stdio.h>
int main(){
    for(int i=100;i<1000;i++){
        int bai=i/100;
        int shi=(i%100)/10;
        int ge=i%10;
        if(bai*bai*bai+shi*shi*shi+ge*ge*ge==i){
            printf("%d ",i);
        }
    }
    return 0;
}