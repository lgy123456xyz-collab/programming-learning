#include<stdio.h>
#include<string.h>
int main()
{   int b;
    char a[256]={0};
    int j=0;
    while(j<=2)
    {
        printf("ÊäÈëÒ»¸ö×Ö·û´®:");
        gets(a);
        b=strlen(a);
        char c[b];
        int i=1;
        for(i=0;i<b-1;i++)
        {
            if(a[i]<=57 && a[i]>=48)
            {
                c[b-i-1]='*'; 
				      
            }
            else
            {
                c[b-i-1]=a[i];
            }
        }
        printf("ÕýÐò:%s\n",a);
        printf("ÄæÐò:%s\n",c);
        j++;

    }
    
}
