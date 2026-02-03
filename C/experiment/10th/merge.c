void swap(int a,int b,int *c)
{
    int temp1=a/10;
    a%=10;
    int temp2=b/10;
    b%=10;
    *c=1000*temp2+100*temp1+10*b+a;


}