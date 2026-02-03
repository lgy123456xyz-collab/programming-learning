#include<stdio.h>
#include <stdlib.h>
#include <time.h>
void max_min(int arr[100], int *max,int *min) {
    *max=arr[0];
    *min=arr[0];
    for (int i=0;i<100;i++) {
        if (arr[i]>*max) {
            *max=arr[i];
        }
        if (arr[i]<*min) {
            *min=arr[i];
        }
    }
}
int main() {
    srand(time(0));
    int a[100];
    for(int i=0;i<100;i++) {
        a[i]=rand()%100;
    }
    int max,min;
    max_min(a,&max,&min);
    printf("max=%d\n",max);
    printf("min=%d\n",min);
    return 0;

}
