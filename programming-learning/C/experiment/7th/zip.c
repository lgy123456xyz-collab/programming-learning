#include<string.h>
#include <stdio.h>
struct Statistic{
    char name;
    int number;
};
int Length(struct Statistic *a) {
    int tmp=0;
    for (int i=0;i<1010;i++) {
        if (a[i].number!=0) {
            tmp++;
        }
        else {
            break;
        }
    }
    return tmp;
}
int main() {
    char str[1010];
    scanf("%s", str);
    int len = strlen(str);
    int i=0;
    int tmp=1;
    int flag=0;
    struct Statistic ustc[1010];
    for (int i=0;i<1010;i++){
        ustc[i].number=0;
    }
    ustc[0].name=str[0];
    while(i<len) {

        if (str[i]==str[i+1]) {
            tmp++;
            i++;
            continue;
        }
        ustc[flag].number=tmp;
        i++;
        flag++;
        ustc[flag].name=str[i];
        tmp=1;
    }
    int len_new=Length(&ustc);
    if (len>=2*len_new) {
        for (int j=0;j<len_new;j++) {
            printf("%c",ustc[j].name);
            printf("%d",ustc[j].number);
        }
    }
    else {
        printf("%s",str);
    }

}