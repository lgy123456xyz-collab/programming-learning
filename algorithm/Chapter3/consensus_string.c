#include<stdio.h>
#include<string.h>
int main(){
    int T;
    scanf("%d",&T);
    while(T--){
        int r,c;
        scanf("%d %d",&r,&c);
        char dna[r][c];
        memset(dna,'0',sizeof(dna));
        for(int i=0;i<r;i++){
            scanf("%s",dna[i]);
        }
        int times[20][c];
        memset(times,0,sizeof(times));//0 2 6 19代表 ACGT
        for(int i=0;i<r;i++){
            for(int j=0;j<c;j++){
                times[dna[i][j]-65][j]++;
            }
        }
        int sum=0;
        char output[c];
        for(int j=0;j<c;j++){
            int temp=times[0][j];
            int row=0;
            for(int i=1;i<20;i++){
                if(times[i][j]>temp){
                    temp=times[i][j];
                    row=i;
                }
            }  
            output[j]=row+65;
            printf("%c",output[j]);
            for(int i=0;i<20;i++){
                if(i!=row){
                    sum+=times[i][j];
                }
            }
        }
        printf("\n");
        printf("%d\n",sum);
    }
}

