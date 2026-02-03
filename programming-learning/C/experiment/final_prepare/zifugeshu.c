// //
// // Created by Lenovo on 2025/10/27.
// //
// #include<stdio.h>
// int main() {
//     char cur='0';
//     int cnt[6]={0};
//     while (cur!=EOF) {
//         cur=getchar();
//         if (cur>='0' && cur<='9') {
//             cnt[2]++;
//         }else if (cur>='A' && cur<='Z') {
//             cnt[0]++;
//         }
//         else if (cur>='a' && cur<='z') {
//             cnt[1]++;
//         }
//         else if (cur==' ')
//             cnt[3]++;
//         else if (cur>=1&&cur<=32) {
//             cnt[4]++;
//         }
//         else cnt[5]++;
//     }
//     cnt[5]--;
//     printf("%d个大写字母,%d个小写字母,%d个数字,%d个空格,%d个制表符,%d个其它字符",cnt[0],cnt[1],cnt[2],cnt[3],cnt[4],cnt[5]);
// }
#include<stdio.h>
int main(){
    char input[1000];
    input[0]=getchar();
    int i=1;
    while((input[i]=getchar())!=EOF){
        i++;
    }
    int a[6]={0};
    for(int j=0;j<i;j++){
        if(input[j]>=97&&input[j]<=97+25){
            a[1]++;
        }
        else if(input[j]>=65&&input[j]<=65+25){
            a[0]++;
        }
        else if(input[j]>=48&&input[j]<=48+9){
            a[2]++;
        }
        else if(input[j]==' '){
            a[3]++;
        } 
        else if(input[j]<32){
            a[4]++;
        }
        else{
            a[5]++;
        }
    }
    printf("%d个大写字母,%d个小写字母,%d个数字,%d个空格,%d个制表符,%d个其它字符",a[0],a[1],a[2],a[3],a[4],a[5]);
}