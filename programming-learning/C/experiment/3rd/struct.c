#include <math.h>
#include <stdio.h>

int main() {
    struct date {
        int         year;
        unsigned    month;
        unsigned    day;
    };
    struct person {
        unsigned    id;
        char        name[20];
        char        gender;
        struct date birth;
        float       score;
        char        addr[100];
    };
    struct {
        int   a;
        float b;
        char  c;
    } a1, a2;
    struct {
        int   a;
        float b;
        char  c;
    } b[2]={{1,1.1,'1'}};
    struct person zh3, li4={10001,"li si",'M',{2000,1,1},88, "USTC"};


    zh3=li4
    ;  // 相同类型的结构体变量间可以直接赋值

  b[1]= b[0]
    ;  // 相同类型的结构体数组元素间可以直接赋值
    printf("%s:%d,%c,%d-%d-%d,%f,%s\n", zh3.name, zh3.id, zh3.gender, zh3.birth.year, zh3.birth.month, zh3.birth.day, zh3.score, zh3.addr);
    printf("b[1]:%d,%f,%c\n", b[1].a, b[1].b, b[1].c);

    a2.a=2;a2.b=2.1;a2.c='a'
    ;  // 给结构体变量a2的元素赋值
    printf("a2:%d,%f,%c\n", a2.a, a2.b, a2.c);

    return 0;
}