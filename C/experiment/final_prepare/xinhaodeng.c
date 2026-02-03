// #include<stdio.h>
// int main(void)
// {
//  char m,n;
//  scanf("%c %c",&m,&n);
//  char s[2];
//  s[0]=m;
//  s[1]=n;
//  if(s[0]=='G')
//  {
//  	printf("通行"); 
//  }
//  else if(s[0]=='R')
//  {
// 	if(s[1]=='M')
// 	{
// 		printf("违规");
// 	}
// 	else printf("停车");
//  }
//  else if(s[1]=='M')
//  {
//  	printf("减速通过");
//  }
//  else printf("等待");
// }


#include<stdio.h>
int main(){
    char light,action;
    light=getchar();
    getchar();
    action=getchar();
    if(light=='G'){
        printf("通行");
    }
    else if(light=='Y'){
        if(action=='M'){
            printf("减速通过");
        }
        else{
            printf("等待");
        }
    }
    else{
        if(action=='M'){
            printf("违规");
        }
        else{
            printf("停车");
        }
    }
}