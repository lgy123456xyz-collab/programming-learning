//
// Created by Lenovo on 2025/10/24.
//
#include<stdio.h>
#include<stdint.h>

void tackle_small_n(int n) {
    uint64_t i=1+2*n;
    uint64_t m=cal2nminus1(n);
    uint64_t tmp=m;
    if (isSmallPrime(n)) {
        while (m!=1) {
            if (m%i==0) {
                printf("%llu ",i);
                m=m/i;
            }
            if (i*i>tmp&&m!=1) {
                printf("%llu ",m);
                m=1;
            }
            i+=2*n;
        }
    }
    else {
        uint64_t j=3;
        while (m!=1) {
            for (i=j;i*i<=tmp;i+=2) {
                if (m%i==0) {
                    printf("%llu ",i);
                    m=m/i;
                    j=i;

                }
            }
            if (i*i>n&&m!=1) {
                printf("%llu ",m);
                m=1;

            }
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