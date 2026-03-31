#include<stdio.h>
#include<string.h>


int upper[105];
int lower[105];

int check(int s1[],int s2[]){
    int len1=strlen(s1);
    int len2=strlen(s2);
    int p1=0;
    int p2=0;
    while(p1<len1&&p2<len2&&){
        if(s1[p1]+s2[p2]<=3){
            p2++;
        }
    }
}

int main(){
    while(scanf("%s",upper)==1){
        scanf("%s",lower);
        int len1=check(upper,lower);
        int len2=check(lower,upper);
        printf("%d",len1<=len2?len1:len2);
    }
    return 0;
}

// 2. 别忘了“两个方向”
// 这是很多同学（包括厉害的同学）最容易漏掉的点：

// 情况 A：s1 在左，s2 往右滑。

// 情况 B：s2 在左，s1 往右滑。

// 优雅的处理技巧：
// 你不需要写两套复杂的逻辑。写一个函数 int get_length(char* a, char* b)，计算“a 固定，b 尝试往右靠”的最短长度。然后在 main 函数里：

// C
// int len1 = get_length(s1, s2);
// int len2 = get_length(s2, s1);
// printf("%d\n", len1 < len2 ? len1 : len2);
//ai太牛逼了!!!