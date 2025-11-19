#include<stdio.h>
int main()
{
while(1)
{
    double m,kg,bmi;
    printf("Please input your height(m) and weight(kg),input \"0 0\" to quit.");
    scanf("%lf %lf",&m,&kg);
    if(m==0&&kg==0)
    break;
    bmi=kg/m/m;
    bmi>25?(printf("You are so big\n")):(bmi<20?printf("You are so small\n"):printf("You are normal\n"));
}
    return 0;
}

/*伪代码
重复执行：
{
    从键盘输入身高（m）、体重（kg）
    if m=0 and kg=0 ， 退出
    算BMI=体重/（身高*身高）
    BMI>25?输出超重:（BMI<20?输出瘦弱:输出正常）
}

*/