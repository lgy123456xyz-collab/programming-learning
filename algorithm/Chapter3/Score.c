
#include<string.h>
#include<stdio.h>
int main(){
    char s[85];
    int T;
    scanf("%d",&T);
    while(T--){
        scanf("%s",s);
        int l=strlen(s);
        int flag=0;
        int score=0;
        for(int i=0;i<l;i++){
            if(s[i]=='O'){
                flag++;
                score+=flag;
            }
            else{
                flag=0;
            }
        }
        printf("%d\n",score);
    }
}
