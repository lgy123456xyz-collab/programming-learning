#include<stdio.h>
#include<string.h>
int deletep(int(*p)[2]){
    int flag[6];
    int a[3];
    memset(flag,-1,sizeof(flag));
    // memset(a,-1,sizeof(a));
    int k=0;
    int s=3;

    for(int i=0;i<6;i++){
        if(flag[i]!=0){
            flag[i]=1;
            a[k]=i;
            k++;
            int kase=1;
            for(int j=i+1;j<6;j++){
                if(kase==1&&p[i][1]==p[j][1]&&p[i][0]==p[j][0]){
                    flag[j]=0;
                    s--;
                    kase=0;
                }
            }
            

        }
    }
    if(s!=0)return 0;
    int d[6]={p[a[0]][0],p[a[0]][1],p[a[1]][0],p[a[1]][1],p[a[2]][0],p[a[2]][1]};
    int b[3]={0,0,0};
    int c[3]={0,0,0};
    for(int i=0;i<6;i++){
        if(d[i]==c[0]||b[0]==0){
            b[0]++;
            c[0]=d[i];
        }
        else if(d[i]==c[1]||b[1]==0){
            b[1]++;
            c[1]=d[i];
        }
        else if(d[i]==c[2]||b[2]==0){
            b[2]++;
            c[2]=d[i];
        }
        else return 0;
    }
    int state=0;
    if(b[1]==0)return 1;
    else if(b[2]==0){
        for(int i=0;i<3;i++){
            if(d[2*i]==d[2*i+1]) state++;
        }
        if(state==3)return 0;
        else return 1;
    }
    else {
        for(int i=0;i<3;i++){
            if(d[2*i]==d[2*i+1]) state++;
        }
        if(state==1) return 0;
        else return 1;
    }
}
int main(){
    while(1){
        int data[6][2];
        for(int i=0;i<6;i++){
            if(scanf("%d%d",&data[i][0],&data[i][1])!=2)return 0;
        }
        for(int i=0;i<6;i++){
            int t;
            if(data[i][0]>data[i][1]){
                t=data[i][0];
                data[i][0]=data[i][1];
                data[i][1]=t;
            }
            
        }
        if(deletep(data)==0) printf("IMPOSSIBLE\n");
            else printf("POSSIBLE\n");
    }
}

//琐碎冗长的代码写了一坨,真是难受,看到ai给的数组排序后的解法好厉害.
//最后改的地方在一个将1写成i的笔误,不知道是不是不应该写这么抽象.