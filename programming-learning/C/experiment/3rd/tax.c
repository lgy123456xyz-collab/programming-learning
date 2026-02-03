#include <stdio.h>
int main() {
    int input=0;
    int output=0;
    while (1) {
        scanf("%d",&input);
        if (input<0)
            break;
        if (input<=36000&&input>=0) {
            output=input*0.03;
            printf("%d\n",output);
        }
        if (input>36000&&input<=144400) {
            output=input*0.1-2520;
            printf("%d\n",output);
        }
        if (input>144400&&input<=300000) {
            output=input*0.2-16920;
            printf("%d\n",output);
        }
        if (input>300000&&input<=420000) {
            output=input*0.25-31920;
            printf("%d\n",output);
        }
        if (input>420000&&input<=660000) {
            output=input*0.3-52920;
            printf("%d\n",output);
        }
        if (input>660000&&input<=960000) {
            output=input*0.35-85920;
            printf("%d\n",output);
        }
        if (input>960000) {
            output=input*0.45-181920;
            printf("%d\n",output);
        }
    }
}