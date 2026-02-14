#include<stdio.h>

int main() {
    for(int i=123;i<=987;i++){
        int a=i;
        int b=2*i;
        int c=3*i;
        int digits[10]={0};
        int a1=i/100;
        int a2=(i/10)%10;
        int a3=i%10;
        int b1=b/100;
        int b2=(b/10)%10;
        int b3=b%10;
        int c1=c/100;
        int c2=(c/10)%10;
        int c3=c%10;
        digits[a1]++;
        digits[a2]++;
        digits[a3]++;
        digits[b1]++;
        digits[b2]++;
        digits[b3]++;
        digits[c1]++;
        digits[c2]++;
        digits[c3]++;
        int flag=0;
        for(int j=1;j<10;j++){
            if(digits[j]>=1){
                flag++;
            }
        }
        if(flag==9){
            printf("%d %d %d\n",i,2*i,3*i);
        }
    }
}