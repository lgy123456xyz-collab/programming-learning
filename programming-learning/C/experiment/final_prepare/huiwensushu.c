// #include<stdio.h>
// int isPrime(int m);
// int isReturn(int m);
// int main()
// {
//     int i;
//     for(i=1;i<=10000;i++)
//     {
//         if(isPrime(i)&&isReturn(i)==1)
//         {
//             if(i==2)
//             {
//                 printf("%d",i);
//             }
//             else
//             {
//                 printf(" %d",i);
//             }
//         }
//     }
// }
// int isPrime(int m)
// {
//     if(m==1)
//     return 0;
//     if(m==2)
//     return 1;
//     int i;
//     for(i=2;i*i<=m;i++)
//     {
//         if(m%i==0)
//         {
//             return 0;
//         }
//     }
//     return 1;
// }

// int isReturn(int m)
// {
//     int a,b,c;
//     a=0;
//     b=m;
    
//     while(b>0)
//     {
//         c=b%10;
//         a=10*a+c;
//         b=b/10;
//     }
//     if(a==m)
//     return 1;
//     return 0;
// }
#include<stdio.h>
int isPrime(int a){
    if(a==1)
    return 0;
    if(a==2)
    return 1;
    for(int i=2;i*i<=a;i++){
        if(a%i==0){
            return 0;
        }
    }
    return 1;
}
int turn(int a){
    int rem=0;
    while(a!=0){
        rem=10*rem+a%10;
        a/=10;
    }
    return rem;
}
int main(){
    for(int i=1;i<=10000;i++){
        if(isPrime(i)&&(turn(i)==i)){
            printf("%d ",i);
        }
    }
    return 0;
}