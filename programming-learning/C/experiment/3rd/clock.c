#include<stdio.h>
struct time {
    int hour;
    int minute;
    int second;
}a,b;

int main()
{
    int input=1;
    while (1) {
        printf("请输入时,分,秒:");
        scanf("%d,%d,%d",a.hour,a.minute,a.second);
        printf("\n");
        if (a.hour>=24||a.minute>=60||a.second>=60) {
            printf("输入时间不符合要求，请重新输入\n");
        }
        else break;
    }
    b=a;
    while (input!=0)
    {
    printf("请输入调整时间的秒数:");
        scanf("%d",&input);
        a.second+=input;
        if (input>0) {
            if (a.second>=60) {
            a.minute+=input/60;
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
                a.minute-=input/60;
                a.minute--;
                a.second%=60;
                a.second+=60;
            }
            if (a.minute<0) {
                a.hour-=a.minute/60;
                a.hour--;
                a.minute%=60;
                a.minute+=60;
            }
            if (a.hour<0) {
                a.hour%=24;
                a.hour+=24;
            }
        }
        printf("%d-%d-%d调整%d秒后为:%d-%d-%d",b.hour,b.minute,b.second,input,a.hour,a.minute,a.second);


    }
    return 0;
}