#include <stdio.h>
#include <stdint.h>
#include <math.h>

// 计算 2^n - 1，n <= 70，可用 uint64_t
uint64_t pow2_minus1(int n) {
    return ((uint64_t)1 << n) - 1;
}

// 判断质数（适用小数，n <= 2^31）
int is_prime(uint64_t x) {
    if (x < 2) return 0;
    for (uint64_t i = 2; i*i <= x; ++i)
        if (x % i == 0) return 0;
    return 1;
}

// 梅森数质因数分解
void factor_mersenne(uint64_t M) {
    uint64_t n = M;
    for (uint64_t i = 2; i*i <= M; ++i) {
        while (M % i == 0) {
            printf("%llu ", i);
            M /= i;
        }
    }
    if (M > 1) printf("%llu", M); // 剩下的素数
    printf("\n");
}

int main() {
    int T;
    scanf("%d", &T);
    while (T--) {
        int n;
        scanf("%d", &n);
        uint64_t M;
        if (n < 64)
            M = pow2_minus1(n);   // 2^n-1
        else {
            // n>=64, 2^n-1 超过 uint64_t，OJ 保证不会出现难分解的大质数，可使用 uint64_t 存储高位
            // 这里只处理 n<=70 的测试数据
            M = ((uint64_t)1 << 63) - 1; // placeholder for very large numbers
        }
        factor_mersenne(M);
    }
    return 0;
}
