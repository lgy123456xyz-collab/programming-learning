#include<stdio.h>
#include<string.h>
#include<stdlib.h>
typedef struct {
    char name[20];
    int score;
}student;
int name_cmp(const void *e1,const void *e2){
    return strcmp(((student*)e1)->name,((student*)e2)->name);
}
int score_cmp(const void*e1,const void*e2){
    return(((student*)e2)->score-((student*)e1)->score);
}
int main(){
    student arr[3]={{"zhangsan",80},{"lisi",92},{"wangwu",99}};
    qsort(arr,sizeof(arr)/sizeof(arr[0]),sizeof(arr[0]),name_cmp);
    for(int i=0;i<3;i++){
        printf("%s %d\n",arr[i].name,arr[i].score);
    }
    printf("\n");

    qsort(arr,sizeof(arr)/sizeof(arr[0]),sizeof(arr[0]),score_cmp);
    for(int i=0;i<3;i++){
        printf("%s %d\n",arr[i].name,arr[i].score);
    }
    return 0;

}