//
// Created by Lenovo on 2025/10/23.
//

#include<stdio.h>
#include<stdint.h>
#define BASE 1000000000U
#define MAXD 300
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
void bigint_print(const struct BigInt *a) { //输出大数字
    printf("%u",a->d[a->len-1]);
    int i;
    for(i=a->len-2;i>=0;i--) {
        printf("%09u",a->d[i]);
    }
    printf("\n");
}
void bigint_mul_small(struct BigInt *a,uint32_t m) {
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
                printf("%lu ",i);
                m=m/i;
            }
            if (i*i>m) {
                printf("%lu ",m);
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
                    printf("%lu ",i);
                    m=m/i;
                    j=i;

                }

            }
            if (i*i>m) {
                printf("%lu ",m);
                m=1;

            }
        }
    }
}
uint64_t bigint_mod_small(struct BigInt *a, uint64_t m) {
    uint64_t rem = 0;
    for (int i = a->len - 1; i >= 0; --i) {
        rem = (rem * BASE + a->d[i]) % m;
    }
    return rem;
}
uint64_t bigint_div_u64_simple(struct BigInt *q, const struct BigInt *a, uint64_t m) {
    uint64_t rem = 0;
    for (int i = a->len - 1; i >= 0; --i) {
        uint64_t cur = rem * BASE + a->d[i];
        q->d[i] = cur / m;
        rem = cur % m;
    }
    q->len = a->len;
    bigint_normalize(q);
    return rem;
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
void tackle_big_n(int n) {
    struct BigInt a;
    bigint_set_zero(&a);
    bigint_pow2_minus1(&a,n);

    uint64_t step = isSmallPrime(n) ? 2*n : 2;
    uint64_t i = isSmallPrime(n) ? 1+2*n : 3;

    while (!(a.len==1 && a.d[0]==1)) {
        if (bigint_mod_small(&a,i)==0) {
            printf("%lu ", i);
            bigint_div_u64_simple(&a, &a, i);  // 直接用 a 做商
        } else {
            i += step;
        }
    }
}
int main(void){
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