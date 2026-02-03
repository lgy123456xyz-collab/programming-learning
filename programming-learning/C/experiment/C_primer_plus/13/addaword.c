#include<stdio.h>
#include<string.h>
#include<stdlib.h>
int main() {
    FILE *fp;
    char words[41];
    if ((fp = fopen("test.txt", "a+")) == NULL) {
        fprintf(stderr, "Error opening file test.txt\n");
        exit(1);
    }
    puts("Enter words to add to the file; press the #");
    puts("key at the beginning of a line to terminate.");
    while ((fscanf(stdin,"%40s",words)==1)&&(words[0]!='#')) {
        fprintf(fp,"%s\n",words);
    }
    puts("The words are:");
    rewind(fp);
    while (fscanf(fp,"%s",words)==1) {
        puts(words);
    }
    puts("Done!");
    if (fclose(fp) != 0) {
        fprintf(stderr, "Error closing file test.txt\n");
        exit(1);
    }
    return 0;
}