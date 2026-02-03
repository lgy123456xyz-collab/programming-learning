
// #include<stdio.h>
// struct Problem {
//     char name[50];
//     int time;
//     int hard;
//     int mark;
// };
// void SortByTime(struct Problem arr[],int brr[],int n){
//     int tmp=0;
//     for (int i=0;i<n;i++) {
//         arr[i].mark=arr[i].time;
//     }
//     for (int i=0;i<n;i++) {
//         for (int j=0;j<n-i;j++) {
//             if (arr[j].mark>arr[j+1].mark) {
//                 tmp=arr[j+1].mark;
//                 arr[j+1].mark=arr[j].mark;
//                 arr[j].mark=tmp;
//                 tmp=brr[j+1];
//                 brr[j+1]=brr[j];
//                 brr[j]=tmp;
//             }
//         }
//     }
// }
// void SortByHard(struct Problem arr[],int brr[],int n) {
//     int tmp=0;
//     for (int i=0;i<n;i++) {
//         arr[i].mark=arr[i].hard;
//     }
//     for (int i=0;i<n;i++) {
//         for (int j=0;j<n-i;j++) {
//             if (arr[j].mark>arr[j+1].mark) {
//                 tmp=arr[j+1].mark;
//                 arr[j+1].mark=arr[j].mark;
//                 arr[j].mark=tmp;
//                 tmp=brr[j+1];
//                 brr[j+1]=brr[j];
//                 brr[j]=tmp;
//             }
//         }
//     }
// }

// int main() {
//     int n;
//     int m;
//     int mode;
//     scanf("%d%d%d",&n,&m,&mode);
//     struct Problem pm[n];
//     int tag[n];
//     for (int i=0;i<n;i++) {
//         tag[i]=i;
//     }
//     for (int i=0;i<n;i++) {
//         scanf("%s",pm[i].name);
//         scanf("%d",&pm[i].time);
//         scanf("%d",&pm[i].hard);
//     }
//     if (mode==1) {
//         SortByTime(pm,tag,n);
//         for (int i=0;i<m;i++) {
//             printf("%s %d\n",pm[tag[i]].name,pm[tag[i]].time);
//         }
//     }
//     else if (mode==2) {
//         SortByHard(pm,tag,n);
//         for (int i=0;i<m;i++) {
//             printf("%s %d\n",pm[tag[i]].name,pm[tag[i]].hard);
//         }
//     }

// }
#include<stdio.h>
#include<stdlib.h>
struct Problem {
    char name[50];
    int time;
    int hard;
};
int cmpByTime(const void *e1,const void*e2){
    return(((struct Problem*)e1)->time-((struct Problem*)e2)->time);
}
int cmpByHard(const void *e1,const void*e2){//注意一定要在这里写const
    return(((struct Problem*)e1)->hard-((struct Problem*)e2)->hard);
}
int main() {
    int n;
    int m;
    int mode;
    scanf("%d%d%d",&n,&m,&mode);
    struct Problem pm[n];

    for (int i=0;i<n;i++) {
        scanf("%s",pm[i].name);
        scanf("%d",&pm[i].time);
        scanf("%d",&pm[i].hard);
    }
    if (mode==1) {
        qsort(pm,sizeof(pm)/sizeof(pm[0]),sizeof(pm[0]),cmpByTime);
        for (int i=0;i<m;i++) {
            printf("%s %d\n",pm[i].name,pm[i].time);
        }
    }
    else if (mode==2) {
        qsort(pm,sizeof(pm)/sizeof(pm[0]),sizeof(pm[0]),cmpByHard);
        for (int i=0;i<m;i++) {
            printf("%s %d\n",pm[i].name,pm[i].hard);
        }
    }

}
