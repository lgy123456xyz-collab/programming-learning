#include <stdio.h>
void bubblesort(int num, int a[]) {
    int temp;
    for (int i=0;i<num-1;i++) {
        int flag=0;
        for (int j=0;j<num-1-i;j++) {
            if (a[j]>a[j+1]) {
                temp=a[j];
                a[j]=a[j+1];
                a[j+1]=temp;
                flag++;
            }
        }
        if (flag==0) {
            return;
        }
    }
}
int main() {
    FILE *file=fopen("data.txt","r");
    if(file==NULL) {
        printf("File not found\n");
        return 0;
    }
    int num;
    int count=0;
    int arr[5000];
    while(fscanf(file,"%d",&num)!=EOF) {
        arr[count++]=num;
    }
    bubblesort(count,arr);
    for(int i=0;i<count;i++) {
        printf("%d\n",arr[i]);
    }
    return 0;

}