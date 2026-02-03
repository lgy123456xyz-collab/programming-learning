
#include<stdio.h>
int isPrime(int num) {
   if (num==1) return 0;
   if (num==2) return 1;
   if (num%2==0) return 0;
   for (int i=3; i*i<+num; i+=2) {
      if (num%i==0) return 0;

   }
   return 1;
}
int isReturn(int num) {
    int temp=num;
    int rem;
    int new=0;
    while (temp!=0) {
        rem=temp%10;
        temp=temp/10;
        new=new*10+rem;
    }
    if (isPrime(new)) return 1;
    else return 0;
}

int main(){
    for (int i=100;i<=1000;i++)
        if (isReturn(i)&&isPrime(i)) {
            printf("%d\n",i);
        }

}