#include<stdio.h>
int canWin(int n);
int main(){
    int n;
    scanf("%d",&n);
    if(canWin(n)){
        printf("1\n");
    }
    else{
        printf("0\n");
    }
    return 0;
}
int canWin(int n){
    //TODO: Complete this function
    if (n%4==0) {
        return 0;
    }
    else {
        return 1;
    }





}