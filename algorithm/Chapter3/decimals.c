// #include<stdio.h>
// #include<string.h>
// int a[3005],b[3005];
// void printd(int son,int mother,int begin,int end){
//     int length=end-begin+1;
//     printf("%d/%d = ",son,mother);
//     int i=0;
//     printf("%d.",b[i]);
//     i++;
//     while(i<=begin+49&&i<=end){
//         if(i==begin){
//             printf("(");
//         }
//         printf("%d",b[i]);
//         if(i==end){
//             printf(")\n");
//         }else if(i==begin+49){
//         printf("...)\n");
//     }
//         i++;
//     }

//     printf("   %d = number of digits in repeating cycle\n",length);
//     return;
// }



// int main(){
//    int son,mother;
//    while(scanf("%d%d",&son,&mother)==2){
//     memset(a,-1,sizeof(a));
//     memset(b,0,sizeof(b));
//     int begin,end;
//     int rem,shang,time=0;
//     shang=son/mother;
//     b[time]=shang;
//     rem=son-shang*mother;
//     a[rem]=time;

//     time++;
//     while(rem!=0){
//         shang=10*rem/mother;
//         b[time]=shang;
//         rem=10*rem-shang*mother;
//         if(a[rem]!=-1){
//             begin=a[rem]+1;
//             end=time;
//             printd(son,mother,begin,end);
//             break;
//         }
//         else{
//             a[rem]=time;
//         }
//         time++;
//     }
//     if(rem==0)
//     printd(son,mother,time,time);
//     printf("\n");

//    }
//    return 0;
// }
// //经历了千辛万苦,终于写出来了--2026 3 10 14 59
// //怎么说呢,这个题就不太会,上周二写完了上一道题,这个题搁置了一个星期,然后床上想到的解法,看余数,然后今天物理课上写的手稿版本,中午打字,但是问题很大,尝试用vim,光抄代码用了半个小时,然后核心bug是a应该初始化为-1,同时第一次余数就该存进a,就这个最后才想到
// //还有就是换行,50位时候的边界条件,以及退出循环忘了写,真不知道我代码能力这么查到底能不能学计算机,妈了个逼的,我真是太废物了,不说别的了,去取车了.

//2026/03/31看看ai的优雅写法,写不过ai真的啊
#include <stdio.h>
#include <string.h>

// 数组大小建议开到 3000 以上，因为余数范围由分母决定
int pos[3005];   // 记录余数第一次出现的位置
int digits[3005]; // 记录每一位商

void solve(int a, int b) {
    memset(pos, -1, sizeof(pos));
    
    int s = a, m = b;
    int integer_part = s / m;
    int rem = s % m;
    int count = 0;

    // 1. 模拟除法：直到余数为0或出现重复余数
    while (rem != 0 && pos[rem] == -1) {
        pos[rem] = count;         // 记录当前余数对应的商的索引
        digits[count++] = (rem * 10) / m;
        rem = (rem * 10) % m;
    }

    // 2. 确定循环节范围
    int cycle_start = (rem == 0) ? count : pos[rem];
    int cycle_len = (rem == 0) ? 1 : (count - pos[rem]);

    // 3. 优雅地输出
    printf("%d/%d = %d.", a, b, integer_part);

    // 输出非循环部分
    for (int i = 0; i < cycle_start; i++) {
        printf("%d", digits[i]);
    }

    // 输出循环部分
    printf("(");
    for (int i = cycle_start; i < count; i++) {
        if (i - cycle_start >= 50) { // 超过50位
            printf("...");
            break;
        }
        printf("%d", digits[i]);
    }
    if (rem == 0) printf("0"); // 如果是有限小数，循环节就是 (0)
    printf(")\n");

    printf("   %d = number of digits in repeating cycle\n\n", cycle_len);
}

int main() {
    int a, b;
    while (scanf("%d %d", &a, &b) == 2) {
        solve(a, b);
    }
    return 0;
}
//ai太吊了,我现在既比不过同学,更比不过ai,还要学习有什么用!!!