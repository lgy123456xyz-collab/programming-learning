#include<stdio.h>
int isPrime(int n) {
    if(n==1)
        return 0;
    if(n==2)
        return 1;
    if(n%2==0)
        return 0;
    for (int i=3;i*i<=n;i++) {
        if(n%i==0)
            return 0;
    }
    return 1;
}
int f(int n) {
    if (n%2==1)
        return 3*n+1;
    if(n%2==0)
        return n/2;

}
int main() {
    int m,n,p;
    scanf("%d",&m);
    while (1) {
        m++;
        n=m;
        p=f(n);
        int count=1;
        while (p!=1) {
            p=f(p);
            count++;
        }
        if (isPrime(count)&&isPrime(n)) {
            printf("%d %d",n,count);
            return 0;
        }

    }

}