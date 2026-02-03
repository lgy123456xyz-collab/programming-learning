#include<stdint.h>
#include<stdint.h>
#include <stdio.h>

int legalData(uint64_t n) {
    int year,month,day;
    year=n/10000;
    month=(n-year*10000)/100;
    day=n%100;
    int flagRun=0;
    if ((year%4==0&&year%100!=0)||year%400==0) {
        flagRun=1;
    }
    if (month<1||month>12) {
        return 0;
    }
    else if (month==1||month==3||month==5||month==7||month==8||month==10||month==12) {
        if (day<1||day>31) {
            return 0;
        }
    }
    else if (month==4||month==6||month==9||month==11) {
        if (day<1||day>30) {
            return 0;
        }
    }
    else if (month==2) {
        if (day<1) {
            return 0;
        }
        else if (flagRun==0&&day>28) {
            return 0;
        }
        else if (flagRun==1&&day>29) {
            return 0;
        }
    }
    return 1;
}
int isReturn(uint64_t n) {
    uint64_t new=0;
    uint64_t m=n;
    int rem;
    while (n>0) {
        rem=n%10;
        new=10*new+rem;
        n/=10;
    }
    if (new==m)
        return 1;
    else
        return 0;
}
int main() {
    uint64_t n;
    scanf("%lu",&n);
    if (legalData(n)==0) {
        printf("-1");
    }
    else if (isReturn(n)==0) {
        printf("0");
    }
    else {
        printf("1");
    }

}