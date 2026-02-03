#include<stdio.h>

#include<stdint.h>


#define BASE 1000000000U
#define MAXD 3
#define BASE_DIGS 9

struct BigInt {
    int len;    //length
    uint32_t d[MAXD];
};

void bigint_set_zero(struct BigInt *a) {    //初始化BigInt
    a->len=1;
    a->d[0]=0;
}
void bigint_normalize(struct BigInt *a) {   //重整化length
    while(((a->len)>1)&&(a->d[(a->len)-1])==0) {
        (a->len)--;
    }
}
// void bigint_from_uint_64(struct BigInt *a,uint64_t x) { //导入进数组
//     bigint_set_zero(a);
//     a->len=x;
//     while (x){
//         a->d[(a->len)++]=(uint32_t)(x%BASE);
//         x/=BASE;
//     }
//     if ((a->len)==0) {
//         a->len=1;
//         a->d[0]=0;
//     }
// }
// void bigint_copy(struct BigInt *dst,const struct BigInt *src) { //复制大数字
//     dst->len=src->len;
//     memcpy(dst->d,src->d,src->len*sizeof(uint32_t));
// }
void bigint_print(const struct BigInt *a) { //输出大数字
    printf("%u",a->d[a->len-1]);
    int i;
    for(i=a->len-2;i>=0;i--) {
        printf("%09u",a->d[i]);
    }
    printf("\n");
}
//每坨uint32_t存9位数字
//计算加法
// void bigint_add(struct BigInt *c,const struct BigInt *a,const struct BigInt *b) {
//     uint64_t carry=0;
//     int n=((a->len)>(b->len)?(a->len):(b->len));
//     int i;
//     for (i=0;i<n;i++) {
//         uint64_t av=(i<(a->len)?a->d[i]:0);
//         uint64_t bv=(i<(b->len)?b->d[i]:0);
//         uint64_t cur=av+bv+carry;
//         if (i>=(c->len)) {
//             (c->d[i]=(uint32_t)(cur%BASE));
//             }
//         carry=cur/BASE;
//         if (i+1>(c->len)) {
//             c->len=i+1;
//         }
//         bigint_normalize(c);
//     }
// }

//计算加法(a>b)
// void bigint_sub(struct BigInt *c,const struct BigInt *a,const struct BigInt *b) {
//     uint64_t carry=0;
//     c->len=a->len;
//     int i;
//     for (i=0;i<a->len;++i) {
//         int64_t av=a->d[i];
//         int64_t bv=(i<b->len?b->d[i]:0);
//         int64_t cur=av-bv-carry;
//         if (cur<0) {
//             cur+=BASE;
//             carry=1;
//         }
//         else
//             carry=0;
//         c->d[i]=(uint32_t)cur;
//     }
//     bigint_normalize(c);
// }
//计算乘法(多精度乘以多精度)
// void bigint_mul(struct BigInt *c,const struct BigInt *a,const struct BigInt *b) {
//     memset(c->d,0,sizeof(uint32_t)*c->len);
//     int i;
//     for (i=0;i<(a->len)+(b->len);++i) {
//         c->d[i]=0;
//     }
//     c->len=a->len+b->len;
//     int j;
//     for (j=0;j<a->len;++j) {
//         uint64_t carry=0;
//         int k;
//         for (k=0;k<b->len||k;++k) {
//             uint64_t bv=(k<b->len?b->d[k]:0);
//             uint64_t cur=c->d[j+k]+(uint64_t)a->d[j]*bv+carry;
//             c->d[j+k]=(uint32_t)(cur%BASE);
//             carry=cur/BASE;
//         }
//     }
//     bigint_normalize(c);
// }

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
//多精度加单精度(32位)
// void bigint_add_small(struct BigInt *a,uint32_t m) {
//     uint64_t carry=m;
//     int i;
//     for (i=0;i<a->len&&carry;++i) {
//         uint64_t cur=(uint64_t)a->d[i]+carry;
//         a->d[i]=(uint32_t)(cur%BASE);
//         carry=cur/BASE;
//     }
//     if (carry) {
//         a->d[a->len++]=(uint32_t)carry;
//     }
//     bigint_normalize(a);
// }
//比较两个大数字
// int bigint_cmp(const struct BigInt *a,const struct BigInt *b) {
//     if (a->len!=b->len) {
//         return(a->len<b->len?-1:1);
//     }
//     int i;
//     for (i=a->len-1;i>=0;--i) {
//         if (a->d[i]!=b->d[i]) {
//             return(a->d[i]<b->d[i]?-1:1);
//         }
//     }
//     return 0;
// }
//对单精度(64位)数取模
//快速取模 利用位运算 绕死我了 (逐位取模)https://www.cnblogs.com/thrillerz/p/4530108.html
uint64_t bigint_mod_small(struct BigInt *a,uint64_t m) {
//     uint64_t rem64=0;
//     int i;
//     for (i=a->len-1;i>=0;--i) {
//         uint64_t x=rem64;
//         uint64_t y=BASE;
//         uint64_t mod=(uint64_t)m;
//         uint64_t product_mod=0;
//         while (y) {
//             if (y&1){
//                 uint64_t tmp=product_mod+x;
//                 if (tmp>=mod){
//                     tmp-=mod*(tmp/mod);
//                 }
//                 product_mod=tmp%mod;
//             }
//             uint64_t xx=x+x;
//             if (xx>=mod) {
//                 xx-=mod*(xx/mod);
//             }
//             x=xx%mod;
//             y>>=1;
//         }
//         uint64_t t=product_mod;
//         uint64_t s=t+a->d[i];
//         rem64=s%mod;
//     }
//     return rem64;
    uint64_t rem=0;
    for (int i=a->len-1;i>=0;i--) {
        rem=(rem*BASE+a->d[i])%m;
    }
    return rem;
}
//高精度除以低精度
uint64_t bigint_div_u64_simple(struct BigInt *q,const struct BigInt *a,uint64_t m) {
    uint64_t rem=0;
    struct BigInt tmp =*a;
    for (int i=tmp.len-1;i>=0;--i) {
        // uint64_t cur_high=rem/(m/BASE+1);
        // uint64_t cur_low=rem%(m/BASE+1);
        // uint64_t cur=cur_high*(m/BASE+1)*BASE+cur_low*BASE+tmp.d[i];
        // q->d[i]=(uint32_t)(cur/m);
        // rem=cur%m;
        uint64_t cur=rem*BASE+tmp.d[i];
        q->d[i]=(uint32_t)(cur/m);
        rem=cur%m;
    }
    q->len=tmp.len;
    bigint_normalize(q);
    return rem;
}

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
    uint64_t i=1+2*n;
    uint64_t m=cal2nminus1(n);

    if (isSmallPrime(n)) {
        while (m!=1) {
            if (m%i==0) {
                printf("%llu ",i);
                m=m/i;
            }
            if (i*i>m) {
                printf("%llu ",m);
                m=1;
            }
            i+=2*n;
        }

    }
    else {
        uint64_t j=3;
        while (m!=1) {
        for (i=j;i*i<=m;i+=2) {
            if (m%i==0) {
                printf("%llu ",i);
                m=m/i;
                j=i;

            }

        }
        if (i*i>m) {
            printf("%llu ",m);
            m=1;

        }
    }
    }
}
void bigint_pow2_minus1(struct BigInt *a,int n) {
    bigint_set_zero(a);

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

void tackle_big_n(int n)
{
    struct BigInt a;
    struct BigInt b;
    bigint_set_zero(&a);
    bigint_set_zero(&b);
    bigint_pow2_minus1(&a,n);


    if (isSmallPrime(n)==1) {
        uint64_t i=1+2*n;
        while (!(a.len==1&&a.d[0]==1)) {
            if (bigint_mod_small(&a,i)==0) {
                printf("%llu ",i);
                bigint_div_u64_simple(&b,&a,i);
            }
            struct BigInt tmp;
            uint64_t m;
            m=bigint_div_u64_simple(&tmp,&a,i);
            if (m<i) {
                bigint_print(&a);
            }
            i+=2*n;
            int k;
            for (k=0;k<b.len;++k) {
                a.d[k]=b.d[k];
            }
            a.len=k;
            bigint_normalize(&a);
            bigint_normalize(&b);
        }

    }
    else {
        uint64_t j=3;
        while (!(a.len==1&&a.d[0]==1)) {
            if (bigint_mod_small(&a,j)==0) {
                printf("%llu ",j);
                bigint_div_u64_simple(&b,&a,j);
            }
            struct BigInt tmp;
            uint64_t m;
            m=bigint_div_u64_simple(&tmp,&a,j);
            if (m<j) {
                bigint_print(&a);
            }
            j+=2;
            int k;
            for (k=0;k<b.len;++k) {
                a.d[k]=b.d[k];
            }
            a.len=k;
            bigint_normalize(&a);
            bigint_normalize(&b);
        }

    }

}
int main(void) {
    int t;
    scanf("%d",&t);
    while (t--) {
        int n;
        scanf("%d",&n);
        if (n<=64) {
            tackle_small_n(n);
        }
        else
            tackle_big_n(n);
        printf("\n");
    }
}