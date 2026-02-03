#include<stdio.h>
#include<stdlib.h>
int cmp(const void * e1,const void* e2){
    return *(int *)e1-*(int *)e2; //wrap if e1>e2
    //return *(int *)e2-*(int *)e1; //wrap if e2>e1
}

int main(){
    int arr[11]={2,3,10,9,1,7,5,6,8,4,12};;
    qsort(arr,sizeof(arr)/sizeof(arr[0]),sizeof(arr[0]),cmp);
    for(int i=0;i<11;i++){
        printf("%d ",arr[i]);
    }
    return 0;
}