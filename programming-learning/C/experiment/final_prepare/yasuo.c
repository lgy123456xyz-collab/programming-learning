// #include<string.h>
// #include <stdio.h>
// struct Statistic{
//     char name;
//     int number;
// };
// int Length(struct Statistic *a) {
//     int tmp=0;
//     for (int i=0;i<1010;i++) {
//         if (a[i].number!=0) {
//             tmp++;
//         }
//         else {
//             break;
//         }
//     }
//     return tmp;
// }
// int main() {
//     char str[1010];
//     scanf("%s", str);
//     int len = strlen(str);
//     int i=0;
//     int tmp=1;
//     int flag=0;
//     struct Statistic ustc[1010];
//     for (int i=0;i<1010;i++){
//         ustc[i].number=0;
//     }
//     ustc[0].name=str[0];
//     while(i<len) {

//         if (str[i]==str[i+1]) {
//             tmp++;
//             i++;
//             continue;
//         }
//         ustc[flag].number=tmp;
//         i++;
//         flag++;
//         ustc[flag].name=str[i];
//         tmp=1;
//     }
//     int len_new=Length(&ustc);
//     if (len>=2*len_new) {
//         for (int j=0;j<len_new;j++) {
//             printf("%c",ustc[j].name);
//             printf("%d",ustc[j].number);
//         }
//     }
//     else {
//         printf("%s",str);
//     }

// }
#include<stdio.h>
#include<string.h>
int main(){
    char a[1002]={0};
    char output[1002]={0};
    scanf("%s",a);
    int flag=0;
    int len=strlen(a);
    int outflag=0;
    while(flag<len){
        if(a[flag]==a[flag+1]){
            int cnt=1;
            while(a[flag+cnt]==a[flag]){
                cnt++;
            }
            int temp=cnt;
            int rem=0;
            while(cnt!=0){
                rem=rem*10+cnt%10;
                cnt/=10;
            }
            output[outflag]=a[flag];
            outflag++;
            while(rem!=0){
                output[outflag]=rem%10+48;
                rem/=10;
                outflag++;
            }
            flag=flag+temp;
        }
        else{
            output[outflag]=a[flag];
            outflag++;
            output[outflag]='1';
            outflag++;
            flag++;
        }        

    }

    if(strlen(output)<strlen(a)){
        printf("%s",output);
    }
    else{
        printf("%s",a);
    } 

}