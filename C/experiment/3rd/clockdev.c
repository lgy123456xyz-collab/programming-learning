#include<stdio.h>
#include<stdint.h>
struct time {
    int64_t hour;
    int64_t minute;
    int64_t second;
}a,b;

int main()
{
    int64_t input=1;
    while (1) {
        printf("请输入时,分,秒:");
        scanf("%lld,%lld,%lld",&a.hour,&a.minute,&a.second);
        if (a.hour>=24||a.minute>=60||a.second>=60||a.hour<0||a.minute<0||a.second<0) {
            printf("输入时间不符合要求，请重新输入\n");
        }
        else break;
    }
    b=a;
    while (input!=0)
    {
    printf("请输入调整时间的秒数:");

        scanf("%lld",&input);
        if(input==0)
        break;
        a.second+=input;
        if (input>0) {
            if (a.second>=60) {
            a.minute+=a.second/60;
            a.second%=60;
        }
            if (a.minute>=60) {
            a.hour+=a.minute/60;
            a.minute%=60;
        }
            if (a.hour>=24) {
                a.hour%=24;
            }
        }
        if (input<0) {
            if (a.second<0) {
                a.minute+=a.second/60;
                a.minute-=1;
                a.second%=60;
                a.second+=60;
            }
            if (a.minute<0) {
                a.hour+=a.minute/60;
                a.hour-=1;
                a.minute%=60;
                a.minute+=60;
            }
            if (a.hour<0) {
                a.hour%=24;
                a.hour+=24;
            }
        }
        printf("%02lld-%02lld-%02lld调整%lld秒后为:%02lld-%02lld-%02lld",b.hour,b.minute,b.second,input,a.hour,a.minute,a.second);
		printf("\n");
        a=b;
    }
    return 0;
}
