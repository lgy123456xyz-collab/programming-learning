#include<stdio.h>
#include<stdlib.h>
#include<string.h>
int cmp(const void * e1,const void* e2){
    if((*(float*)e1-*(float*)e2)>0){
        return 1;
    }
    // else if((*(float*)e2-*(float*)e1)>0){
    //     return -1;
    // } 
    return 0;
}    

int main(){
    float arr[11]={2,3,10,9,1,7,5,6,8,8,12};
    qsort(arr,sizeof(arr)/sizeof(arr[0]),sizeof(arr[0]),cmp);
    for(int i=0;i<11;i++){
        printf("%f ",arr[i]);
    }
    return 0;
}





