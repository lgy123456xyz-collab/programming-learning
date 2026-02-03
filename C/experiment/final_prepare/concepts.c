#include<stdio.h>
int main(){
    char s[5],c;
    for(int i=0;i<5&&(c=getchar())!='\n';++i){
        s[i]=c;
    }
    for(int i=0;i<5;i++){
        printf("%c",s[i]);
    }
    return 0;
}