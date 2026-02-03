/* /e:/programming_works/programming-learning/C/experiment/C primer plus/8.1.c */
#include <stdio.h>

int main(void)
{
    
    char ch;
    while((ch=getchar())!='#')
    {
        putchar(ch);
    }
    return 0;
}