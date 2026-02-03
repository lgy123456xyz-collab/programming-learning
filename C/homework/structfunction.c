#include <stdio.h>
struct two {
    int a;
    int b;
}a;
struct two swap(struct two at) {
    int temp = at.a;
    at.a = at.b;
    at.b = temp;
    return at;
}
int main() {
    struct two a={3,5};
    printf("a的内容是:%d,%d\n",a.a,a.b);
    a=swap(a);
    printf("a的内容是:%d,%d\n",a.a,a.b);
    return 0;
}
//不同点：用数组传递的是地址，对变量的修改对全局生效。
//用结构体传递的是结构体的值，对其修改只有在函数将修改后的结构体返回才能作用在主函数中。