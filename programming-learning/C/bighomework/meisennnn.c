#include<stdio.h>
#include<stdint.h>

#define BASE 1000000000U
#define MAXD 3

struct BigInt {
    int len;    //length
    uint32_t d[MAXD];
};

void bigint_set_zero(struct BigInt *a) {    //初始化BigInt
    a->len=1;
    a->d[0]=0;
}

void bigint_normalize(struct BigInt *a) {   //重整化BigInt
    while(((a->len)>1)&&(a->d[(a->len)-1])==0) {
        (a->len)--;
    }
}

void bigint_print(const struct BigInt *a) { //输出大数字
    printf("%u",a->d[a->len-1]);
    int i;
    for(i=a->len-2;i>=0;i--) {
        printf("%09u",a->d[i]);
    }
    printf(" ");

}

void bigint_mul_small(struct BigInt *a,uint32_t m) {//多精度乘以单精度(32位)
    uint64_t carry=0;
    int i;
    for (i=0;i<a->len||carry;++i) {
        if (i==a->len) {
            a->d[a->len++]=0;
        }
        uint64_t cur=carry+(uint64_t)a->d[i]*m;
        a->d[i]=(uint32_t)(cur%BASE);
        carry=cur/BASE;
    }
    bigint_normalize(a);
}

void bigint_pow2_minus1(struct BigInt *a,int n) {//计算大n的2^n-1
    bigint_set_zero(a);
    a->d[0]=1;
    int i;
    for (i=1;i<=n;++i) {
        bigint_mul_small(a,2);
    }
    int j=0;
    while (j<a->len) {
        if (a->d[j]>0) {
            a->d[j]--;
            break;
        }
        else {
            a->d[j]=BASE-1;
            j++;
        }
    }
    bigint_normalize(a);
}
uint64_t bigint_div_small(struct BigInt *b, const struct BigInt *a, uint64_t m) {
    uint64_t rem=0;
    b->len=a->len;
    int i;
    for (i=a->len-1;i>=0;--i) {
        uint64_t cur=rem*BASE+a->d[i];
        uint64_t q=(uint64_t)cur/m;
        rem=cur%m;
        b->d[i]=(uint32_t)q;
    }
    while(b->len>1&&b->d[b->len-1]==0) {
        b->len--;
    }
    return rem;
}


// uint64_t bigint_div_small(struct BigInt *b, const struct BigInt *a, uint64_t m) {
//     __uint128_t rem=0;
//     b->len=a->len;
//     for (int i=a->len-1;i>=0;--i) {
//         __uint128_t cur=rem*BASE+a->d[i];
//         __uint128_t q=(uint64_t)cur/m;
//         rem=cur%m;
//         b->d[i]=(uint32_t)q;
//     }
//     while(b->len>1&&b->d[b->len-1]==0) {
//         b->len--;
//     }
//     return rem;
// }
// 比较两个大数字



uint64_t cal2nminus1(int n)
{
    int i;
    uint64_t prod=1;
    int two=2;
    for (i=1;i<=n;++i) {
        prod*=two;
    }
    prod-=1;
    return prod;
}

int isSmallPrime(uint64_t m) {
    if (m==1) return 0;
    if (m==2) return 1;
    uint64_t i=0;
    for (i=2;i*i<=m;++i) {
        if (m%i==0) {
            return 0;
        }
    }
    return 1;

}
void tackle_small_n(int n) {
    uint64_t step;
    uint64_t begin;
    uint64_t m=cal2nminus1(n);
    uint64_t tmp=m;
    if (isSmallPrime(m)) {
        begin=2*n+1;
        step=2*n;
    } else {
        begin=3;
        step=2;
    }
    uint64_t i;
    for ( i=begin;i*i<=tmp;i+=step) {
        if (m%i==0) {
            printf("%llu ",i);
            m/=i;
            i-=step;
        }
        if (m==1)
            break;
    }
    if (m!=1) {
        printf("%llu ",m);
    }
}

//处理大n
void tackle_big_n(int n) {
    struct BigInt a;
    struct BigInt b;
    bigint_set_zero(&b);
    bigint_pow2_minus1(&a,n);
    uint64_t step;
    uint64_t begin;
    if (isSmallPrime(n)) {
        begin=2*n+1;
        step=2*n;
    } else {
        begin=3;
        step=2;
    }
    uint64_t i;
    for ( i=begin;;i+=step) {
        if (bigint_div_small(&b,&a,i)==0) {
            printf("%llu ",i);
            a=b;
            bigint_set_zero(&b);
            i-=step;
        }
        if (a.len==1&&a.d[0]==1)
            break;
        if (i>=cal2nminus1(30))
            break;
    }
    if (!(a.len==1&&a.d[0]==1)){
        bigint_print(&a);
    }

}
int main(void) {
    int t;
    scanf("%d",&t);
// #define t 3
//     int a[t]={61,62,67};
    int a[t];
    for(int i=0;i<t;i++) {
        scanf("%d",&a[i]);
    }
	int i;
    for(i=0;i<t;i++) {
        int n=a[i];

        if (n<=64) {
            tackle_small_n(n);
        }
        else
            tackle_big_n(n);
        printf("\n");
    }
}
