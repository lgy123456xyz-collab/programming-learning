// #include<stdio.h>
// int main()
// {
// 	int m;
// 	scanf("%d",&m);
// 	int money[3]={0,0,0};
// 	int i;
// 	int cnt=0;
// 	for(i=1;i<=m;i++)
// 	{
// 		int input;
// 		scanf("%d",&input);
// 		if(input==20) 
// 		{
// 			money[2]++;
// 			if(money[1]>=1&&money[0]>=1)
// 			{
// 				money[0]--;
// 				money[1]--;
// 			}
// 			else if(money[0]>=3)
// 			{
// 				money[0]-=3;
// 			}
// 			else 
// 				cnt++;
			
// 		}
// 		if(input==10) 
// 		{
// 			money[1]++;
// 			if(money[0]>=1)
// 			{
// 				money[0]--;
// 			}
// 			else cnt++;
			
// 		}
// 		if(input==5) 
// 		{
// 			money[0]++;
// 		}
// 	}
// 	if(cnt!=0)
// 	printf("0");
// 	else printf("1");
// }


#include<stdio.h>
int main(){
    int m;
    scanf("%d",&m);
    if(m==0){
        printf("1");
        return 0;
    }
    int a[3]={0};
    int input[m];
    for(int i=0;i<m;i++){
        scanf("%d",&input[i]);
    }
    for(int i=0;i<m;i++){
        int flag=0;
        if(input[i]==5){
            a[2]++;
            flag=1;
        }
        else if(input[i]==10){
            a[1]++;
            if(a[2]>=1){
                a[2]--;
                flag=1;
            }
            else{
                flag=0;
            }
        }
        else if(input[i]==20){
            a[0]++;
            if(a[1]>=1&&a[2]>=1){
                a[2]--;
                a[1]--;
                flag=1;
            }else if(a[2]>=3){
                flag=1;
                a[2]-=3;
            }
            else{
                flag=0;
            }
        }
        if(flag==0){
            printf("0");
            return 0;
        }
    }
    printf("1");
    return 0;
}

// #include<stdio.h>
// int main(){
//     int m;
//     scanf("%d",&m);
//     if(m==0){
//         printf("1");
//         return 0;
//     }
//     int a[3]={0};
//     int input[m];
//     for(int i=0;i<m;i++){
//         scanf("%d",&input[i]);
//     }
//     for(int i=0;i<m;i++){
//         printf("%d",input[i]);
//     }
// }