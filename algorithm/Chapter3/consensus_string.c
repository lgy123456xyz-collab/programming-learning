#include<stdio.h>
#include<string.h>
int main(){
    int T;
    scanf("%d",&T);
    while(T--){
        int r,c;
        scanf("%d %d",&r,&c);
        char dna[r][c];
        memset(dna,r,sizeof(dna));
        for(int i=0;i<r;i++){
            scanf("%s",dna[i]);
        }

    }
}