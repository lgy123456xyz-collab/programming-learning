#include<stdio.h>
#include<string.h>
#include<ctype.h>

#define MolarC 12.01
#define MolarH 1.008
#define MolarO 16.00
#define MolarN 14.01

float Turn(char c){
    if(c=='C')  return MolarC;
    if(c=='H')  return MolarH;
    if(c=='O')  return MolarO;
    if(c=='N')  return MolarN;
    return 0;

}

int main(){
    char s[200];
    int T;
    scanf("%d",&T);
    while(T--){
        scanf("%s",s);
        int i=0;
        float temp;
        float all=0;
        while(s[i]){
            if(isalpha(s[i])){
                temp=Turn(s[i]);
                i++;
                int num=0;
                while(s[i]&&isdigit(s[i])){
                    num=num*10+(s[i]-'0');
                    i++;
                }
                if(num==0)  num=1;
                all=all+(temp*num);
            }
            else{
                i++;
            }
        }
        printf("%.3f\n",all);
    }
    return 0;
}