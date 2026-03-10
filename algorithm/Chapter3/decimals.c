#include<stdio.h>
#include<string.h>
int a[3005],b[3005];
void printd(int son,int mother,int begin,int end){
    int length=end-begin+1;
    printf("%d/%d = ",son,mother);
    int i=0;
    printf("%d.",b[i]);
    i++;
    while(i<=begin+49&&i<=end){
        if(i==begin){
            printf("(");
        }
        printf("%d",b[i]);
        if(i==end){
            printf(")\n");
        }else if(i==begin+49){
        printf("...)\n");
    }
        i++;
    }

    printf("   %d = number of digits in repeating cycle\n",length);
    return;
}



int main(){
   int son,mother;
   while(scanf("%d%d",&son,&mother)==2){
    memset(a,-1,sizeof(a));
    memset(b,0,sizeof(b));
    int begin,end;
    int rem,shang,time=0;
    shang=son/mother;
    b[time]=shang;
    rem=son-shang*mother;
    a[rem]=time;

    time++;
    while(rem!=0){
        shang=10*rem/mother;
        b[time]=shang;
        rem=10*rem-shang*mother;
        if(a[rem]!=-1){
            begin=a[rem]+1;
            end=time;
            printd(son,mother,begin,end);
            break;
        }
        else{
            a[rem]=time;
        }
        time++;
    }
    if(rem==0)
    printd(son,mother,time,time);
    printf("\n");

   }
   return 0;
}
//经历了千辛万苦,终于写出来了--2026 3 10 14 59
//怎么说呢,这个题就不太会,上周二写完了上一道题,这个题搁置了一个星期,然后床上想到的解法,看余数,然后今天物理课上写的手稿版本,中午打字,但是问题很大,尝试用vim,光抄代码用了半个小时,然后核心bug是a应该初始化为-1,同时第一次余数就该存进a,就这个最后才想到
//还有就是换行,50位时候的边界条件,以及退出循环忘了写,真不知道我代码能力这么查到底能不能学计算机,妈了个逼的,我真是太废物了,不说别的了,去取车了.