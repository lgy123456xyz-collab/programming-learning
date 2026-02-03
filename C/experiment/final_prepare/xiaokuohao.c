// #include<stdio.h>
// #include <string.h>

// int main(){
// char brackets[1000];
// scanf("%s",brackets);
// int len=strlen(brackets);
//     int cnt1=0,cnt2=0;
//     for (int i=0;i<len;i++) {
//         if (brackets[i]=='(')
//             cnt1++;
//         else if (brackets[i]==')')
//             cnt2++;
//         if (cnt1<cnt2)
//         {printf("No");
//             return 0;
//         }
//     }
//     if (cnt1!=cnt2) {
//         printf("No");
//         return 0;
//     }
//     printf("Yes");
// }

#include<stdio.h>
#include<string.h>
int main(){
    char a[1002]={0};
    scanf("%s",a);
    int cnt=0;
    int len=strlen(a);
    for(int i=0;i<len;i++){
        if(a[i]=='('){
            cnt++;
        }
        if(a[i]==')'){
            cnt--;
        }
        if(cnt<0){
            printf("No");
            return 0;
        }
    }
    if(cnt==0)
    {printf("Yes");}
    else
    printf("No");
    return 0;
}