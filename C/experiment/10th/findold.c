
#include <ctype.h>
#include <stdio.h>
#include <string.h>

int getDigitStr(const char *str, char (*p)[100]) {
    int len=strlen(str);
    int count=0;
    int i; 
    for( i=0;i<len;) {
        if (str[i]>='0' && str[i]<='9') {
            int col=0;
            if (str[i+1]>='0' && str[i+1]<='9') {
                count++;
                int j;
                for (j=i;j<=len;j++) {
                    if (str[j]>='0' && str[j]<='9') {
                        col++;
                    }
                    else {
                        strncpy(p[count-1],str+i,col*sizeof(char));
                        i=j+1;
                        break;
                    }
                }

            }
            else {
                i++;
            }
        }
        else {
            i++;
        }


    }
    return count;
}

int main(void) {
    char digitStr[100][100] = {""}, str[100];
    fgets(str, 100, stdin);
    str[strcspn(str, "\n")] = '\0';

    int counts = getDigitStr(str, digitStr);
    printf("%d\n", counts);
    int i;
    for ( i = 0; i < counts; i++) {
        printf("%s%c", digitStr[i], i == counts - 1 ? '\n' : ' ');
    }

    return 0;
}
