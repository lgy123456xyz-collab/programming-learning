#include<stdio.h>
void swap(char *str1,char *str2,int width){
    char tmp=0;
    for(int i=0;i<width;i++){
        tmp=*(str1+i);
        *(str1+i)=*(str2+i);
        *(str2+i)=tmp;
    }
}
void my_qsort(void *arr,int num,int width,int(*cmp)(const void *,const void*)){
    for(int i=0;i<num-1;i++){
        for(int j=0;j<num-i-1;j++){
            if(cmp((char*)arr+j*width,(char*)arr+(j+1)*width)>0){
                swap((char*)arr+j*width,(char*)arr+(j+1)*width,width);
            }
        }
    }
}
int int_cmp(const void*e1,const void *e2)
{
    return *(int *)e1-*(int *)e2;
}
int char_cmp(const void *e1,const void *e2){
    return *(char *)e1-*(char *)e2;
}
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
    // int darr[10] = { 1,2,4,6,9,10,3,8,8,-1 };
    // char carr[10+1] = "ahkgdefzpx";

    // my_qsort(darr, 10, sizeof(int), int_cmp);
    // my_qsort(carr, 10, sizeof(char), char_cmp);

    // for (int i = 0; i < 10; i++){
    //     printf("%d ",darr[i]);
    // }
    // printf("\n");

    // printf("%s", carr);

    // return 0;
    float arr[11]={2,3,10,9,1,7,5,6,8,8,12};
    my_qsort(arr,sizeof(arr)/sizeof(arr[0]),sizeof(arr[0]),cmp);
    for(int i=0;i<11;i++){
        printf("%f ",arr[i]);
    }
    return 0;    
}