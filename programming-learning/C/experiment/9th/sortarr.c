#include<stdio.h>
#include<stdint.h>
int main() {
    uint64_t m,n;
    scanf("%lu%lu",&m,&n);
    uint64_t arr[m];
    uint64_t brr[n];
    for (uint64_t i=0;i<m;i++) {
        scanf("%lu",&arr[i]);
    }
    for (uint64_t i=0;i<n;i++) {
        scanf("%lu",&brr[i]);
    }

    uint64_t flagB=0;
    for (uint64_t i=0;i<m;i++) {
        while ((brr[flagB]<arr[i])&&flagB<n) {

            printf("%llu ",brr[flagB]);
            flagB++;
        }
        printf("%llu ",arr[i]);
    }


}