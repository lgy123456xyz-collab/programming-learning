// #include<stdio.h>
// int main(){
//     int n;
//     int k;
//     scanf("%d",&n);
//     scanf("%d",&k);

//     int live[n];
//     for(int i=0;i<n;i++) {
//         live[i]=1;
//     }
//     int flag=0;
//     int num=0;
//     int sum=0;
//     if (n==1) {
//         printf("1");
//         return 0;
//     }
//     while (1) {
//         if (live[num]==1) {
//             flag++;
//             if (flag%k==0) {
//                 live[num]=0;
//                 sum++;
//                 if (sum==n-1) {
//                 break;
//                 }
//             }
//         }
//         num++;
//         if (num==n) {
//             num=0;

//         }
//     }
//     for(int i=0;i<n;i++) {
//         if (live[i]==1) {
//             printf("%d\n",i+1);
//         }
//     }

// }

#include<stdio.h>
int save(int n,int k){
    int a[n];
    for(int i=0;i<n;i++){
        a[i]=1;
    }
    int flag=1;
    int cnt=0;
    int position=0;
    while(flag!=n){
        flag=0;
        for(int i=0;i<n;i++){
            if(a[i]==0){
                flag++;
            }
            if(a[i]==1){
                cnt++;
                if(cnt==k){
                    a[i]=0;
                    cnt=0;
                    position=i;
                }
            }

        }
    }
    return position;

}
int main(){
    int m,n;
    scanf("%d %d",&m,&n);
    int a=save(m,n);
    printf("%d",a+1);
}
