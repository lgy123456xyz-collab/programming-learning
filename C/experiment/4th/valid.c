#include<stdio.h>
#include<string.h>
int isInt(char ch[]) {
    int i=0;
    int cnt=0;
    int cnt1=0;
    if (ch[i]=='+'||ch[i]=='-') {
        i++;
        cnt1++;
    }
    while ((ch[i]>='0'&&ch[i]<='9')||(ch[i]=='.'&&cnt==0)) {
        if (ch[i]=='.') {
            if (i>cnt1) {
                cnt++;
            }

        }

        i++;
    }
    if ((ch[i-1]=='.')&&(i-1<=cnt1)) {
return 0;
    }
    if ((ch[i]=='e'||ch[i]=='E')&&((cnt+cnt1<i))) {
        i++;
        if ((!((ch[i]>='0'&&ch[i]<='9')||ch[i]=='+'||ch[i]=='-'))) {
            return 0;
        }
    }
    if ((ch[i]=='+'||ch[i]=='-')&&i>cnt1) {
        i++;
    }

    while (ch[i]>='0'&&ch[i]<='9') {
        i++;
    }
    if (i==strlen(ch)) return 1;
    else return 0;

}





int main() {
    char s[40];
    scanf("%s",s);
    printf("%s",s);
    if (isInt(s)==1) {
        printf("Yes");
        return 0;
    }
    else {
        printf("No");
        return 0;
    }

}