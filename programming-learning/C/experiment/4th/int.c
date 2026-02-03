#include<stdio.h>
int main() {
    int len;
    int min=1;

    int cnt=0;
    scanf("%d",&len);
    int arr[len];
    for(int i=0;i<len;i++)
        scanf("%d",&arr[i]);
    while (cnt<len) {
        for(int i=0;i<len;i++) {
            if(arr[i]==min) {
                min++;
                break;
            }

        }
    cnt++;
    }

    printf("%d",min);
    return 0;
}