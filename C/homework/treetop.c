#include<stdio.h>
void treetop(char ch) {
    printf("   %c\n",ch);
    printf("  %c%c%c\n",ch,ch,ch);
    printf(" %c%c%c%c%c\n",ch,ch,ch,ch,ch);
    printf("%c%c%c%c%c%c%c\n",ch,ch,ch,ch,ch,ch,ch);
}
void treetrunk() {
    for (int i=1;i<=3;i++) {
        printf("   #\n");
    }
}
int main() {
    treetop('*');
    treetop('@');
    treetrunk();
    return 0;
}