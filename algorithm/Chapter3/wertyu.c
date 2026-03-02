// #include<stdio.h>
// char s[]="`1234567890-=QWERTYUIOP[]\\ASDFGHJKL;'ZXCVBNM,./";
// int main(){
//     int i,c;
//     while((c=getchar())!=EOF){
//         // for(i=1;s[i]&&s[i]!=c;i++);
//         int i=1;
//         while(s[i]!='\0'&&s[i]!=c){
//             i++;
//         }
//         if(s[i]){
//             putchar(s[i-1]);
//         }
//         else{
//             putchar(c); //防止' '被输出成'/'
//         }
//     }
//     return 0;
// }
#include<stdio.h>
char s[]="`1234567890-=QWERTYUIOP[]\\ASDFGHJKL;'ZXCVBNM,./";
int main(){
    int c;
    int i;
    while((c=getchar())!=EOF){
        for(i=1;s[i]!='\0'&&s[i]!=c;i++);
        if(s[i]=='\0'){
            printf("%c",c);
        }
        else{
            printf("%c",s[i-1]);
        }
     
    }
    return 0;
}