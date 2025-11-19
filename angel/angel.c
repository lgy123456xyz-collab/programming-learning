#include<stdio.h>
#include<math.h>
#include<stdlib.h>



#define FLU 0.002 //采样器频率

double angle_difference(double theta_new, double theta_prev) //角度修正函数
    {
        double delta=theta_new-theta_prev;
        if(delta>M_PI)
        {
            delta=delta-2*M_PI;
        }
        else if(delta<-M_PI)
        {
            delta=delta+2*M_PI;
        }
        return delta;
    }
int main()
{
    double ALPHA;
    printf("Please enter the 滤波器参数.");
    scanf("%lf",&ALPHA); //滤波器参数
    FILE *angle_data= fopen("motor_angle.txt","r");
    if(angle_data== NULL)
    {
        printf("文件无法打开");
    }

    int count =0; //统计数据量
    double tmp;
    while (fscanf(angle_data,"%lf", &tmp)==1)
        count++;
    rewind(angle_data);
    
    double *theta=(double*)malloc(count *sizeof(double)); //分配内存
    double *omega_est=(double*)malloc(count*sizeof(double));
    if(theta==NULL||omega_est==NULL)
    {
        printf("内存分配失败\n");
        return -1;
    }

    for(int i=0;i<count;i++) //读取角度数据
    {
        fscanf(angle_data,"%lf",&theta[i]);
        omega_est[i]=0.0; //初始化角速度输出
    }
    fclose(angle_data);

    for (int j=1; j<count; j++)     //角速度计算
    {
    double delta_theta=angle_difference(theta[j],theta[j-1]);
    double omega_instant=delta_theta /FLU;
    omega_est[j]=ALPHA*omega_instant+(1-ALPHA)*omega_est[j-1];
    }
    FILE *fout=fopen("motor_speed.txt","w");//输出文件
    if(fout==NULL)
    {
        printf("无法输出到文件\n");
        return -1;
    }
    for(int i=0;i<count;i++)
    {
        fprintf(fout,"%.6f\n",omega_est[i]);
    }

    fclose(fout);

    free(theta);//释放内存
    free(omega_est);
    printf("角速度计算完成,输出到motor_speed.txt\n");
    system("python E:\\programming_works\\angel\\angel.py");
    return 0;
}