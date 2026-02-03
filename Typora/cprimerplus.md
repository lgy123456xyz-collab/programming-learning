C Primer plus
发现编程语言学习不能靠手写笔记，还是得用电子的

strlen不计‘\0‘
switch后面的表达式必须是整数值
# 第十一章 字符串函数
11.5.7 其他字符串函数
- int \*strchr(const char * s, int c);
- 如果s字符串中包含c字符，则返回指向s字符串首次出现的c字符的指针
- __*gets(str); 接受空格制表符，将回车换成'\0'储存
- __*puts(str); 将’\0‘换成回车输出
# 第十二章 存储类别 链接 内存管理
12.1.1
- 块作用域
- 函数作用域
- 函数原型作用域
- 文件作用域
12.1.2 链接
- 无链接变量
- 外部链接变量
- 内部链接变量
12.1.3 存储期
- 静态存储期
- 线程存储期
- 自动存储期
- 动态分配存储期
12.1.4 自动变量
12.1.5 寄存器变量
12.1.6 块作用域的静态变量
12.1.7 外部链接的静态变量
12.1.8 内部链接的静态变量
12.1.11 
- 外部函数
- 静态函数
12.2 随机数
- \#include<time.h> 
- srand((unsigned int)time(0));
- xx=rand()%n;
12.4 分配内存
- \#include<stdlib.h>
- double \*ptd;
- ptd=(double \*)malloc(30\*sizeof(double));
- free(ptd);
- [ ] exit()函数 能够直接退出程序
12.4.2
- long \* newmen;
- newmen=(long\*)calloc(100,sizeof(long));
12.4.3 变长数组(VLA)
- int (\*p3)\[m];
- p3=(int(\*)\[m])malloc(n\*m\*sizeof(int));
12.5 类型限定符
- const
- volatile
- restrict
- \_Atomic
typedef const int zip;
12.5.1 const
12.5.2 volatile
12.5.3 restrict
12.5.4 \_Atomic
12.5.5 C99新规
```
 s_gets(char \* st, int n){
	char * ret_val;
	char * find;
	ret_val=fgets(st,n,stdin);
	if(ret_val){
		find=strchr(st,’\n’);
		if(find)
			* find=‘\0’;
		else
			while(getchar()!=‘\n’)
				continue;
	}
	return ret_val;
}
```
此函数可以避免scanf不读取\n导致下一次输入直接读取\n 还会把\n后面的内容都清除
# 第十三章 文件输入输出
13.2.2fopen()函数
- "r" 读模式
- "w"写模式,现有文件长度截为0
- "a"写模式,在现有文件末尾添加内容
- "r+"更新(读写)模式
- "w+"更新模式,如果文件存在,长度截为0,否则创建新文件
- "a+"更新模式,如果文件存在,在末尾添加内容,非则创建新文件
- "rb" "wb" "ab" "rb+" "r+b" "wb+" "w+b" "ab+" "a+b" 二进制模式打开文件
- "wx" "wbx" "w+b" "wb+x" "w+xb" 类似非x模式，若文件已存在则打开失败
- FILE \*fp;
- fp = fopen(文件名, "r"));(fopen返回文件指针)
13.2.3 getc() putc()
- ch=getc(fp); 从fp指定的文件获取一个字符
- putc(ch,fp); 把ch放入FILE指针fp指定的文件中
- putc(ch,stdout) 与putchar(ch)作用相同
13.2.4文件结尾
- fclose(fp); 成功关闭返回0,否则EOF
13.4 文件io
13.4.1 fprintf() fscanf()
- fprintf(stderr,"xxx",xxx);
- fscanf(stdinn,"xxx",xxx);
- 与scanf printf差不多,就是前面加上写入的文件
- rewind(fp);回到文件的开头处,fp是一个文件指针
- [ ] 13.4.2 fgets()和fputs()
- __*fgets(buf,STLEN,fp);  地址，长度，stdin/文件 
- 注意,buf是储存输入位置的地址,STLEN是字符串大小而不是长度,fp是文件指针 遇到EOF返回NULL 否则返回第一个参数的地址
- __*fputs(buf,fp);  地址，stdout/文件
- buf 字符串地址,fp 文件指针
- fgets保留换行符 fputs不添加换行符
13.5 随机访问
-  fseek()
- fseek(fp,0L,SEEK_END); 
	- 第一个参数是文件指针,
	- 第二个参数是偏移量(从起始点开始移动的距离(必须long类型)),
	- 第三个参数是模式,确定起始点 
		- SEEK_SET 文件开始处
		- SEEK_CUR 当前位置
		- SEEK_END 文件末尾 
	- 返回值:
		- 0 正常
		- -1 错误
		
- ftell()
- ch=ftell(fp);
	- 返回long 是指向文件当前位置距文件开始处的字节数
	- 第一个字节到开始处的距离是0
13.5.4
- fgetpos() 
	- 新类型fpos_t 
	- fgetpos(fp,fpos_t \*pos); 
- fsetpos()
	- fsetpos(fp,fpos_t \*pos);
13.7.1 int ungetc(int c,FILE \*fp)
- 把c指定的字符放回输入流中 即不把这个字符输入进来,读取了再放回去
13.7.2 int fflush()
- int fflush(FILE \*fp);
- 刷新缓冲区
13.7.3 int setvbuf()
- int setvbuf(FILE *restrict fp,char * restrict buf, int mode, size_t size);
- 看不懂
13.7.4 二进制 io
- fread() fwrite()
- fwrite(&num,sizeof(int),1,fp);
- fwrite(earnings,sizeof(double),10,fp)
	- num 是待写入数据块的地址
	- 第二个参数是待写入数据块的大小 
	- 第三个参数是待写入数据块的数量
	- 第四个参数是文件指针 
	- 返回成功写入项的数量
- fread(earnings,sizeof(double),10,fp);
	- 把十个doble大小的值拷贝进earnings数组中
	- 返回成功读取项的数量
13.7.7 int feof() int ferror()
不行了,这些新东西太多了,回头有时间再看吧,先往后过了,毕竟c还是很重要的
# 第十四章 结构和其他数据类型
14.1 
- 结构声明
- struct book{
		char title\[xxx];
		char author\[xxx];
		float value;
	};
- 定义结构变量 
	- struct book library;
	- struct \*ptbook;
- 初始化结构
	- struct book library={
		- “….”,
		- “…”,
		- 1.95
	- };
	- 用逗号隔开，必须用常量初始化
- 结构的初始化器```
  ```
	- struct book gift={
		- .value=25.59,
		- .author=“…”,
		- .title=“…”
	- };
- 声明结构数组
	- struct book library\[100];
14.5 嵌套结构
- struct names{
		…;
		…;
	};
	struct guy{
		struct names handle;
		…;
		…;
	};
- 初始化时 struct guy={
		 {…,
		 …
		 },…,
		 …
	- };
14.6指向结构的指针
14.7.8 复合字面量和结构 C99

# 第十七章 高级数据表示
## 17.2 从数组到链表
```
struct film{
	char title[TSIZE];
	int rating;
	struct film *next;
	};
```

# B.2 运算符
优先级 非算关与fu
结合律：从右往左：单目运算符(++x - -x + - ~ ! & \* ) 三目运算符 赋值运算符
 