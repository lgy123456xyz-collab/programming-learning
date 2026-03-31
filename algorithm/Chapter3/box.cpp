// #include<stdio.h>
// #include<string.h>
// int deletep(int(*p)[2]){
//     int flag[6];
//     int a[3];
//     memset(flag,-1,sizeof(flag));
//     // memset(a,-1,sizeof(a));
//     int k=0;
//     int s=3;

//     for(int i=0;i<6;i++){
//         if(flag[i]!=0){
//             flag[i]=1;
//             a[k]=i;
//             k++;
//             int kase=1;
//             for(int j=i+1;j<6;j++){
//                 if(kase==1&&p[i][1]==p[j][1]&&p[i][0]==p[j][0]){
//                     flag[j]=0;
//                     s--;
//                     kase=0;
//                 }
//             }
            

//         }
//     }
//     if(s!=0)return 0;
//     int d[6]={p[a[0]][0],p[a[0]][1],p[a[1]][0],p[a[1]][1],p[a[2]][0],p[a[2]][1]};
//     int b[3]={0,0,0};
//     int c[3]={0,0,0};
//     for(int i=0;i<6;i++){
//         if(d[i]==c[0]||b[0]==0){
//             b[0]++;
//             c[0]=d[i];
//         }
//         else if(d[i]==c[1]||b[1]==0){
//             b[1]++;
//             c[1]=d[i];
//         }
//         else if(d[i]==c[2]||b[2]==0){
//             b[2]++;
//             c[2]=d[i];
//         }
//         else return 0;
//     }
//     int state=0;
//     if(b[1]==0)return 1;
//     else if(b[2]==0){
//         for(int i=0;i<3;i++){
//             if(d[2*i]==d[2*i+1]) state++;
//         }
//         if(state==3)return 0;
//         else return 1;
//     }
//     else {
//         for(int i=0;i<3;i++){
//             if(d[2*i]==d[2*i+1]) state++;
//         }
//         if(state==1) return 0;
//         else return 1;
//     }
// }
// int main(){
//     while(1){
//         int data[6][2];
//         for(int i=0;i<6;i++){
//             if(scanf("%d%d",&data[i][0],&data[i][1])!=2)return 0;
//         }
//         for(int i=0;i<6;i++){
//             int t;
//             if(data[i][0]>data[i][1]){
//                 t=data[i][0];
//                 data[i][0]=data[i][1];
//                 data[i][1]=t;
//             }
            
//         }
//         if(deletep(data)==0) printf("IMPOSSIBLE\n");
//             else printf("POSSIBLE\n");
//     }
// }

// //琐碎冗长的代码写了一坨,真是难受,看到ai给的数组排序后的解法好厉害.
// //最后改的地方在一个将1写成i的笔误,不知道是不是不应该写这么抽象.


//这是ai给的代码,太牛逼了,读一读
#include <stdio.h>
#include <algorithm> // 使用 C++ 的排序更简单

struct Face {
    int w, h;
};

// 面排序规则
bool cmp(Face a, Face b) {
    if (a.w != b.w) return a.w < b.w;
    return a.h < b.h;
}

int main() {
    Face f[6];
    while (scanf("%d %d", &f[0].w, &f[0].h) == 2) {
        // 处理第一个读入的面并规范 w <= h
        if (f[0].w > f[0].h) { int t = f[0].w; f[0].w = f[0].h; f[0].h = t; }
        
        // 读入剩余 5 个面
        for (int i = 1; i < 6; i++) {
            scanf("%d %d", &f[i].w, &f[i].h);
            if (f[i].w > f[i].h) { int t = f[i].w; f[i].w = f[i].h; f[i].h = t; }
        }

        // 1. 排序：让相同的面挨在一起
        std::sort(f, f + 6, cmp);

        // 2. 核心判断：
        // A. 每组对面必须相等：f[0]==f[1], f[2]==f[3], f[4]==f[5]
        // B. 边长要能接上：三组面应为(a,b), (a,c), (b,c)
        //    排序后对应：f[0]是(a,b), f[2]是(a,c), f[4]是(b,c)
        if (f[0].w == f[1].w && f[0].h == f[1].h &&
            f[2].w == f[3].w && f[2].h == f[3].h &&
            f[4].w == f[5].w && f[4].h == f[5].h &&
            f[0].w == f[2].w && f[0].h == f[4].w && f[2].h == f[4].h) {
            printf("POSSIBLE\n");
        } else {
            printf("IMPOSSIBLE\n");
        }
    }
    return 0;
}