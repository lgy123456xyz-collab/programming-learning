#include<stdio.h>
#include<string.h>
struct voter {
    int num;
    char name[10];
    char gender;
    unsigned tickets;
};
int main() {
    int number;
    printf("有几位候选人:");
    scanf("%d",&number);
    printf("输入%d位候选人信息(编号,姓名,性别):\n",number);
    struct voter person[number];
    for (int i=0;i<number;i++) {
        scanf("%d %s",&person[i].num,person[i].name);
        getchar();
        scanf("%c",&person[i].gender);
        person[i].tickets=0;
    }
    printf("开始投票:\n");
    int input=-1;
    while (input!=10) {
        printf("投票(0 编号,1 姓名,10 结束):\n");

        if (input==0) {
            int information;
            scanf("%d",&information);
            for (int i=0;i<number;i++) {
                if (person[i].num==information) {
                    person[i].tickets++;
                    break;
                }
            }
        }
        if (input==1) {
            char information[10];
            scanf("%s",information);
            getchar();
            for (int i=0;i<number;i++) {
                if (strcmp(information,person[i].name)==0) {
                    person[i].tickets++;
                }
            }
        }
        scanf("%d",&input);
    }
    printf("投票结果:\n");
    for (int i=0;i<number;i++) {
        printf("%d,%s,%c:%d票\n",person[i].num,person[i].name,person[i].gender,person[i].tickets);
    }
}