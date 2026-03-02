#include<stdio.h>
#include<string.h>

// int main(){
//     char s[800]={0};
//     int c;
//     int i=0;
//     while((c=getchar())!=EOF){
//         s[i]=c;
//         i++;
//     }
//     printf("111");
//     return 0;
// }
void Turn(int* a,int *b){
    int temp;
    temp=*a;
    *a=*b;
    *b=temp;
}
int main(){
    int map[5][5];
    int times=0;
    memset(map,0,sizeof(map));
    int c;
    int x;
    int y;
    int first=1;

    while((c=getchar())!='Z'){
        int flag=1;
        map[0][0]=c;
        if(c==' '){
            x=0;y=0;
        }
        for(int i=2;i<=30;i++){
            c=getchar();
            if(i%6!=0){
                map[i/6][i%6-1]=c;
                if(c==' '){
                    y=i/6;
                    x=i%6-1;
                }
            }
            
        }
        
        while((c=getchar())!='0'){
            switch (c)
            {
            case 'A':{
                if(y==0){
                    flag=0;
                }else{
                    Turn(&map[y][x],&map[y-1][x]);
                    y=y-1;
                }

                break;
            }
            case 'B':{
                if(y==4){
                    flag=0;
                }else{
                    Turn(&map[y][x],&map[y+1][x]);
                    y=y+1;
                }
                break;
            }
            case 'R':{
                if(x==4){
                    flag=0;
                }else{
                    Turn(&map[y][x],&map[y][x+1]);
                    x=x+1;
                }
                break;
            }
            case 'L':{
                if(x==0){
                    flag=0;
                }else{
                    Turn(&map[y][x],&map[y][x-1]);
                    x=x-1;
                }
                break;
            }
            default:{
                break;
            }
            }
        }
        c=getchar();
        if(first){
            first=0;
        }else{
            printf("\n");

        }
        times++;
        printf("Puzzle #%d:\n",times);
        if(flag==0){
            printf("This puzzle has no final configuration.\n");
        }else{
            for(int i=0;i<5;i++){
                int linefirst=1;
                for(int j=0;j<5;j++){
                    if(linefirst){
                        linefirst=0;
                    }else{
                        printf(" ");
                    }
                    printf("%c",map[i][j]);

                }
                printf("\n");
            }
        }
    }
    return 0;

}

// TRGSJ
// XDOKI
// M VLN
// WPABE
// UQHCF
// ARRBBL0
// ABCDE
// FGHIJ
// KLMNO
// PQRS 
// TUVWX
// AAA
// LLLL0
// ABCDE
// FGHIJ
// KLMNO
// PQRS 
// TUVWX
// AAAAABBRRRLL0
// Z

