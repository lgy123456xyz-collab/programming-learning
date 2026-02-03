#include<stdio.h>
#include <string.h>

int main(){
    int n;
    scanf("%d",&n);
    char *arr[n];
    char word[n][5001];
    for(int i=0;i<n;i++) {
        scanf("%s",word[i]);
        arr[i]=word[i];
    }
    for (int i=0;i<n-1;i++) {
        for (int j=0;j<n-i-1;j++) {
            if (strcmp(arr[j],arr[j+1])<=0) {
                char *temp=arr[j];
                arr[j]=arr[j+1];
                arr[j+1]=temp;
            }
        }
    }
    for (int i=0;i<n;i++) {
        printf("%s\n",arr[i]);
    }
    return 0;
}
