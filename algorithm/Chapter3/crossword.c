<<<<<<< HEAD
#include<string.h>
#include<stdio.h>
int main(){
    int r,c;
    int time=0;
    int first=1;
    while(scanf("%d",&r)&&r!=0&&scanf("%d",&c)){

        char a[10][10];
        int ntab[10][10];
        
        for(int i=0;i<r;i++){
            scanf("%s",a[i]);
        }
        int num=1;
        if(first){
            first=0;
        }else{
            printf("\n");
        }

        for(int i=0;i<r;i++){
            for(int j=0;j<c;j++){
                if(a[i][j]=='*'){
                    ntab[i][j]=-1;
                }else if((i==0)||(j==0)||a[i-1][j]=='*'||a[i][j-1]=='*'){
                    ntab[i][j]=num;
                    num++;
                }else{
                    ntab[i][j]=0;
                }
            }
        }
        time++;
        printf("puzzle #%d:\n",time);
        printf("Across\n");
        for(int i=0;i<r;i++){
            for(int j=0;j<c;j++){
                if(ntab[i][j]>0){
                    printf("%3d.",ntab[i][j]);
                    while(j<c&&ntab[i][j]>=0){
                        printf("%c",a[i][j]);
                        j++;
                    }
                    printf("\n");

                }
            }
        }
        printf("Down\n");
        for(int i=0;i<r;i++){
            for(int j=0;j<c;j++){
                if(ntab[i][j]>0){
                    printf("%3d.",ntab[i][j]);
                    int k=i;
                    while(k<r&&ntab[k][j]>=0){
                        
                        printf("%c",a[k][j]);
                        ntab[k][j]=-1;
                        k++;

                        
                    }
                    printf("\n");
                }
            }
        }

        
    }

}


=======
#include<stdio.h>
int main(){
    int c=-4;
    printf("%c",c);
    getchar();
}
>>>>>>> c04ce2b (coapa刷题没传上去的)
