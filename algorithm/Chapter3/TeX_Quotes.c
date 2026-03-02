// #include<stdio.h>
// int main(){
//     int c,q=1;
//     while((c=getchar())!=EOF){
//         if(c=='"'){
//             printf("%s",q?"``":"''");
//             q=!q;
//         }
//         else{
//             putchar(c);
//         }
//     }
//     return 0;
// }
#include<stdio.h>
int main(){
    int flag=1;
    char c;
    while((c=getchar())!=EOF){
        if(c=='"'&&flag){
            flag--;
            printf("``");
        }
        else if(c=='"'){
            flag++;
            printf("''");
            
        }
        else
            printf("%c",c);
    }
    return 0;
}