#include <ctype.h>
#include <stdio.h>
#include <string.h>

int getDigitStr(const char *str, char (*p)[100]) {
    int sum=0;
    while (*str) {

        if (*str >= '0' && *str <= '9') {
            int count=0;
            while (*str >= '0' && *str <= '9') {
                count++;
                str++;
            }
            if (count>1) {

                strncpy(p[sum],str-count,count*sizeof(char));
                sum++;
            }
        }
        str++;
    }
    return sum;
}

int main(void) {
    char digitStr[100][100] = {""}, str[100];
    fgets(str, 100, stdin);
    str[strcspn(str, "\n")] = '\0';

    int counts = getDigitStr(str, digitStr);
    printf("%d\n", counts);
    for (int i = 0; i < counts; i++) {
        printf("%s%c", digitStr[i], i == counts - 1 ? '\n' : ' ');
    }

    return 0;
}
