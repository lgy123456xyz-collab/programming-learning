// #include<stdio.h>
// #include <string.h>

// int main(){
//     int n;
//     scanf("%d",&n);
//     char *arr[n];
//     char word[n][5001];
//     for(int i=0;i<n;i++) {
//         scanf("%s",word[i]);
//         arr[i]=word[i];
//     }
//     for (int i=0;i<n-1;i++) {
//         for (int j=0;j<n-i-1;j++) {
//             if (strcmp(arr[j],arr[j+1])<=0) {
//                 char *temp=arr[j];
//                 arr[j]=arr[j+1];
//                 arr[j+1]=temp;
//             }
//         }
//     }
//     for (int i=0;i<n;i++) {
//         printf("%s\n",arr[i]);
//     }
//     return 0;
// }

#include<stdio.h>
#include <stdlib.h>
#include<string.h>
int main(){
    int n;
    scanf("%d",&n);
    char*a[n];
    for(int i=0;i<n;i++){
        a[i]=(char*)malloc(5001*sizeof(char));
        scanf("%s",a[i]);
    }
    for(int i=0;i<n-1;i++){
        for(int j=0;j<n-1-i;j++){
            if(strcmp(a[j],a[j+1])<0){
                char *temp;
                temp=a[j];
                a[j]=a[j+1];
                a[j+1]=temp; 
            }
        }
    }
    for(int i=0;i<n;i++){
        printf("%s\n",a[i]);
    }
}