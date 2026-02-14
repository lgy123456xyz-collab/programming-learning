#include<stdio.h>
// int main(){
//     freopen("hanxin.in","r",stdin);
//     freopen("hanxin.out","w",stdout);

//     int a,b,c;
//     while(scanf("%d%d%d",&a,&b,&c)==3){
//             int flag=0;
//         for(int i=10;i<=100;i++){
//             if(i%3==a&&i%5==b&&i%7==c){
//                 printf("%d\n",i);
//                 flag=1;
//                 break;
//             }
//         }
//         if(flag==0)
//         printf("No answer\n");
//     }
//     return 0;

// }
int main(){
    FILE *fin=fopen("hanxin.in","r");
    FILE *fout=fopen("hanxin.out","w");
        fin=stdin;
        fout=stdout;
    int a,b,c;
    while(fscanf(fin,"%d%d%d",&a,&b,&c)==3){
        int flag=0;
        for(int i=10;i<=100;i++){
            if(i%3==a&&i%5==b&&i%7==c){
                fprintf(fout,"%d\n",i);
                flag=1;
                break;
            }
        }
        if(flag==0){
            fprintf(fout,"No answer\n");
        }
    }
    fclose(fin);
    fclose(fout);
    return 0;

}