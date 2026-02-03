#include <stdio.h>

int main(void) {
    char *ch="Hello,world!";
    puts(ch);
    char word[81]="Good morning!";
    puts(word);
    word[5]=',';
    puts(word);
    return 0;
}