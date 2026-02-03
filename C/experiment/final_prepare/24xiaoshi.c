// #include<stdio.h>
// #include<stdint.h>
// struct time {
//     int64_t hour;
//     int64_t minute;
//     int64_t second;
// }a,b;

// int main()
// {
//     int64_t input=1;
//     while (1) {
//         printf("请输入时,分,秒:");
//         scanf("%lld,%lld,%lld",&a.hour,&a.minute,&a.second);
//         if (a.hour>=24||a.minute>=60||a.second>=60||a.hour<0||a.minute<0||a.second<0) {
//             printf("输入时间不符合要求，请重新输入\n");
//         }
//         else break;
//     }
//     b=a;
//     while (input!=0)
//     {
//     printf("请输入调整时间的秒数:");

//         scanf("%lld",&input);
//         if(input==0)
//         break;
//         a.second+=input;
//         if (input>0) {
//             if (a.second>=60) {
//             a.minute+=a.second/60;
//             a.second%=60;
//         }
//             if (a.minute>=60) {
//             a.hour+=a.minute/60;
//             a.minute%=60;
//         }
//             if (a.hour>=24) {
//                 a.hour%=24;
//             }
//         }
//         if (input<0) {
//             if (a.second<0) {
//                 a.minute+=a.second/60;
//                 a.minute-=1;
//                 a.second%=60;
//                 a.second+=60;
//             }
//             if (a.minute<0) {
//                 a.hour+=a.minute/60;
//                 a.hour-=1;
//                 a.minute%=60;
//                 a.minute+=60;
//             }
//             if (a.hour<0) {
//                 a.hour%=24;
//                 a.hour+=24;
//             }
//         }
//         printf("%02lld-%02lld-%02lld调整%lld秒后为:%02lld-%02lld-%02lld",b.hour,b.minute,b.second,input,a.hour,a.minute,a.second);
// 		printf("\n");
//         a=b;
//     }
//     return 0;
// }
#include<stdio.h>
struct Time{
    int hour;
    int minute;
    int second;
};
int main(){
    struct Time shijian;
    // printf("%d",-90000%64800); 
    printf("请输入时,分,秒:");
    scanf("%d,%d,%d",&shijian.hour,&shijian.minute,&shijian.second);
    while(shijian.hour<0||shijian.hour>=24||shijian.minute<0||shijian.minute>=60||shijian.second<0||shijian.second>=60){//错误1,不知道24小时是啥
        printf("输入时间不符合要求，请重新输入\n请输入时,分,秒:");
           scanf("%d,%d,%d",&shijian.hour,&shijian.minute,&shijian.second);
           
    }
    int input=1;
    printf("请输入调整时间的秒数:");
    scanf("%d",&input); 
    while(input!=0){
        int temp=input;
        input%=86400;
        if(input<0){
            input+=86400;
        }
        int var_hour=input/3600;
        int var_minute=(input%3600)/60;
        int var_second=(input)%60;
        int temp_hour=shijian.hour; 
        int temp_minute=shijian.minute;
        int temp_second=shijian.second;
        temp_second+=var_second;
        temp_minute+=var_minute;
        temp_hour+=var_hour;
        if(temp_second>=60){ 
            temp_second-=60;
            temp_minute++;
        }
        if(temp_minute>=60){
            temp_minute-=60;
            temp_hour++;
        }
        if(temp_hour>=24){
            temp_hour%=24;
        }
        printf("%02d-%02d-%02d调整%d秒后为:%02d-%02d-%02d\n",shijian.hour,shijian.minute,shijian.second,temp,temp_hour,temp_minute,temp_second);
    printf("请输入调整时间的秒数:");
    scanf("%d",&input); 
    } //错误2,接收放在最后


} 


// #include<stdio.h>
// struct Time{
//     int hour;
//     int minute;
//     int second;
// };
// int main(){
//         struct Time shijian;
//     // printf("%d",-90000%64800); 
//     printf("请输入时,分,秒:");
//     scanf("%d,%d,%d",&shijian.hour,&shijian.minute,&shijian.second);
//                printf("%d %d %d",shijian.hour,shijian.minute,shijian.second);
//     while(shijian.hour<0||shijian.hour>24||shijian.minute<0||shijian.minute>=60||shijian.second<0||shijian.second>=60){
//         printf("输入时间不符合要求，请重新输入\n请输入时,分,秒:");
//            scanf("%d,%d,%d",&shijian.hour,&shijian.minute,&shijian.second);
//            printf("%d %d %d",shijian.hour,shijian.minute,shijian.second);
//     }
// }