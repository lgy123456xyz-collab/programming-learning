// #include<stdio.h>
// int isleapyear(int m)
// {
// 	if(m%4==0&&(m%100!=0))
// 	return 1;
// 	return 0;
// }
// void printweek(void)
// {
// 	printf("Mon Tur Wed Thu Fri Sat Sun\n"); 
// }

// int main()
// {
// 	int a,b;
// 	scanf("%d %d",&a,&b);
// 	int dmp[12]={31,28,31,30,31,30,31,31,30,31,30,31};
// 	if(isleapyear(a)==1)
// 	dmp[1]=29;
// 	int i,cnt=b-1;
// 	for(i=1;i<=12;i++)
// 	{
// 		printf("%d年%d月\n",a,i);
// 		printweek();
// 		int j,k;
		
// 		for(k=1;k<=4*cnt;k++)
// 		{
// 			printf(" ");
// 		}
// 		for(j=1;j<=dmp[i-1];j++)
// 		{
// 			cnt++;
// 			printf("%4d",j);
// 			if(cnt%7==0&&dmp[i-1]!=j)
// 			{
// 				printf("\n");	
// 			}
// 			if(cnt%7==0)
// 			{
// 				cnt=0;
// 			}
			
// 		}
// 		printf("\n\n");

// 	}
// }
#include<stdio.h>
int isLeapYear(int year){
    if((year%4==0&&year%100!=0)||year%400==0){
        return 1;
    }
    else{
        return 0;
    }
}
int printWeek(void){
    printf("Mon Tur Wed Thu Fri Sat Sun\n");
}
int main(){
    int year,day;
    scanf("%d %d",&year,&day);
    int month[12]={31,28,31,30,31,30,31,31,30,31,30,31};
    if(isLeapYear(year)==1){
        month[1]=29;
    }
    int flag=(day-1); 
    for(int i=0;i<12;i++){
        printf("%d年%d月\n",year,i+1);
        printWeek();
        for(int k=0;k<4*(flag);k++){
            printf(" ");
        }
       
        for(int j=0;j<month[i];j++){
            flag++;
            printf("%4d",j+1);
            if(flag%7==0){
                printf("\n");
            }
            
        }
        printf("\n");
        if(flag%7!=0){
            printf("\n");
        }
        flag%=7;

        
    }
}