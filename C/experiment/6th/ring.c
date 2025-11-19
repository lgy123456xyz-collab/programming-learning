#include<stdio.h>
int main(){
    int n;
    int k;
    scanf("%d",&n);
    scanf("%d",&k);

    int live[n];
    for(int i=0;i<n;i++) {
        live[i]=1;
    }
    int flag=0;
    int num=0;
    int sum=0;
    if (n==1) {
        printf("1");
        return 0;
    }
    while (1) {
        if (live[num]==1) {
            flag++;
            if (flag%k==0) {
                live[num]=0;
                sum++;
                if (sum==n-1) {
                break;
                }
            }
        }
        num++;
        if (num==n) {
            num=0;

        }
    }
    for(int i=0;i<n;i++) {
        if (live[i]==1) {
            printf("%d\n",i+1);
        }
    }

}