#include <stdio.h>
#define MSG "I'm special"
int main(void) {
    char ar[]=MSG;
    char *pt =MSG;
    printf("%p\n","I'm special");
    printf("%p\n",ar);
    printf("%p\n",pt);
    printf("%p\n",MSG);
    
    return 0;
}