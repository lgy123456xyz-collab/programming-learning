#include<stdio.h>
char password[100005];
char message[100005];

int main(){
    while(scanf("%s%s",password,message)==2&&password[0]!=EOF){
        int flag=1;
        char *ptr=message;
        for(int i=0;password[i]!='\0';i++){
            while((*ptr!=password[i])&&*(ptr)!='\0')ptr++;
            if(*ptr!=password[i]){
                flag=0;
                break;
            }
            if(*(ptr)!='\0')ptr++;
        }
        if(flag==0){
            printf("No\n");
        }
        else{
            printf("Yes\n");
        }
    }
}