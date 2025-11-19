#include<stdio.h>
int main()
{
    int i=0x7fffffff;
    unsigned u=0xffffffff;
    float f=0xffffffff;
    printf("int_max=%d\n",i);
    i=0x80000000;
    printf("int_min=%d\n",i);
    printf("unsigned int_max=%u\n",u);
    i=0xff7fffff;
    f=*(float*)&i;
    printf("float_min=%g\n",f);
    i=0x80000001;
    f=*(float*)&i;
    printf("float_0-=%g\n",f);
    i=0x00000001;
    f=*(float*)&i;
    printf("float_0+=%g\n",f);
    i=0x7f7fffff;
    f=*(float*)&i;
    printf("float_max=%g\n",f);
    return 0;
}

// #include<stdio.h>
// int main()
// {
// 	printf("int_max=2147483647\n");
// 	printf("int_min=-2147483648\n");
// 	printf("unsigned int_max=4294967295\n");
// 	printf("float_min=-3.40282e+38\n");
// 	printf("float_0-=-1.4013e-45\n");
// 	printf("float_0+=1.4013e-45\n");
// 	printf("float_max=3.40282e+38\n");
// }