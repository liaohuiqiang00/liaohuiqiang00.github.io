---
layout: post
title:  求二进制中1的个数(II)
tags: 编程之美
---

**上篇 >>**
[求二进制中1的个数(I)](/2016/03/29/numOfOne.html)

* content
{:toc}

### 问题描述

1. `输入一个无符号整数，求其二进制表示中“1”的个数`
2. `给定A和B，求其中有多少位不同。(将A与B异或，求1的个数，转化成问题1）`

### 解法5：归并加法

**思路：** <br/>
 相邻位之间两两相加，先1位1位加，再2位2位加，以此类推。

 比如4位整数n=abcd，a+b的结果放在ab位，c+d的结果放在cd位，可以看成0a0c+0b0d。而0b0d = (abcd) & 0101, 0a0c = (abcd)>>1 & 0101。
 
 所以1位1位相加可以看成(n & m1) + ((n >> 1) & m1),其中m1为0101 0101 0101 ... 即0x5555...
 
 然后2位的相加可以看成(n & m2) + ((n >> 2) & m2),其中m2为0011 0011 0011 ... 即0x3333...
 
 以此类推。具体见下代码，共24次算术运算

**代码清单**
{% highlight c %}
typedef unsigned long long uint64;
const uint64 m1 = 0x5555555555555555; //1个0,1个1...
const uint64 m2 = 0x3333333333333333; //2个0,2个1...
const uint64 m4 = 0x0f0f0f0f0f0f0f0f; //4个0,4个1...
const uint64 m8 = 0x00ff00ff00ff00ff; //8个0,8个1...
const uint64 m16 = 0x0000ffff0000ffff; //16个0,16个1...
const uint64 m32 = 0x00000000ffffffff; //32个0,32个1...

int Count(int64 n)
{
  n = (n & m1) + ((n >> 1) & m1);
  n = (n & m2) + ((n >> 2) & m2);
  n = (n & m4) + ((n >> 4) & m4);
  n = (n & m8) + ((n >> 8) & m8);
  n = (n & m16) + ((n >> 16) & m16);
  n = (n & m32) + ((n >> 32) & m32);
  return n;
}
{% endhighlight %}

### 解法6：归并加法的优化

**思路：** <br/>
 对上种解法的6个步骤进行优化，减少运算。

 1. 第1步其实就是把ab(2a+b)变成a+b，所以只要减掉a就可以了。
 2. 第3步不需要先与m4,因为4位加4位最多8(个1),8不会超过4位。
 3. 第4步以后是8位加8位，考虑结果最多7位(64个1),不用管高8位以上，直接加就好了，省掉与操作。
 4. 最后结果取低7位，共17次算术运算

**代码清单**
{% highlight c %}
typedef unsigned long long uint64;
const uint64 m1 = 0x5555555555555555; //1个0,1个1...
const uint64 m2 = 0x3333333333333333; //2个0,2个1...
const uint64 m4 = 0x0f0f0f0f0f0f0f0f; //4个0,4个1...

int Count(uint64 n)
{
  n -= (n >> 1) & m1;
  n = (n & m2) + ((n >> 2) & m2);
  n = (n + (n >> 4)) & m4;
  n += n >> 8;
  n += n >> 16;
  n += n >> 32;
  return n & 0x7f;
}
{% endhighlight %}

### 解法7：归并加法再优化

**思路：** <br/>
 对解法6再进行优化。第三步之后的操作全部去掉，采用8位一组，8个组的数依次相加，可以通过乘法来做到，举个32位的例子，如下框所示，乘以0x01010101，我们需要的结果就是a+b+c+d，把乘法结果右移24位(3乘8)即可。同理，64位则右移56位(7乘8)。共12次运算。
 
{% include numOfOneII/numOfOneII_1.html %}

**代码清单**
{% highlight c %}
typedef unsigned long long uint64;
const uint64 h01 = 0x0101010101010101;
uint64 m1 = 0x5555555555555555; //1个0,1个1...
uint64 m2 = 0x3333333333333333; //2个0,2个1...
uint64 m4 = 0x0f0f0f0f0f0f0f0f; //4个0,4个1...

int Count(uint64 x) {
    x -= (x >> 1) & m1;
    x = (x & m2) + ((x >> 2) & m2);
    x = (x + (x >> 4)) & m4;
    return (x * h01)>>56;
}
{% endhighlight %}

### 解法8：MIT HAKMEM169方法

**思路：** <br/>

 0. 这个有点难想，看着代码来讲思路吧
 1. 第1步3位一组，组内相加。比如x=(abc)2=4a+2b+c，x>>1&m1= 2a+b，x>>2&m2=a，于是 x - x>>1&m1 - x>>2&m2 = a+b+c。
 2. 第2步，三位和三位相加，加成6位，6位为一组。
 3. 第3步对63求余需要解释一下。首先，第2步得到的x是6位一组的，于是有x = A0 * (2^6)^0 + A1 * (2^6)^1 + A2 * (2^6)^2 + ... + A5 * (2^6)^5。在这里我们会发现我们求的就是各组的值相加（各组中1的个数）A0 + A1 + .. A5。那么怎么得到这个呢？我们把2^6用n替换，多项式x变成 A0 * n^0 + A1 * n^1 + .. A5 * n^5,这里有 A0 + A1 + .. A5 = (A0 * n^0 + A1 * n^1 + .. A5 * n^5)%(n-1) = x % 63。
 4. 这里解释一下为什么A0 + A1 + .. A5 = (A0 * n^0 + A1 * n^1 + .. A5 * n^5)%(n-1)，先来几条模运算法则，(a+b)%p = (a%p + b%p) % p，这里的加替换成乘，减都成立，然后(a^b)%p = ((a%p)^b)%p。这些是基本运算法则。由这些得的推论有n^N % (n-1) = 1。 还有一条推论：X * (n^N) % (n-1) = X（前提是X要小于n-1），这条推论+(前面提到的)模加运算法则可以推出A0 + A1 + .. A5 = (A0 * n^0 + A1 * n^1 + .. A5 * n^5)%(n-1)，过程可参考下框。

		(A0 * n^0 + A1 * n^1 + ... + A5 * n^5)%(n-1)
        = [(n^0*A0*)%(n-1) + (n^1*A1*)%(n-1) + ... + (n^5*A5)]%(n-1)]%(n-1)
        = (A0+A1+...+A5)%(n-1)  //显然A0+A1+...+A5小于n-1(即63)
        = (A0+A1+...+A5)
        
**代码清单**
{% highlight c %}
typedef unsigned int uint32;
const uint32 m1=033333333333;
const uint32 m2=011111111111;
const uint32 m3=030707070707;

int Count(uint32 x) {
    x = x - ( ((x >> 1) & m1) + ((x >> 2) & m2));
    x = (x + (x >> 3)) & m3;
    return x % 63;
}
{% endhighlight %}

### 解法9：位标志法

**思路：** <br/>
  建一个字节结构的结构体，取输入参数的地址，然后按bit取值相加，即为1的个数。以1个字节的数据为例。

**代码清单**
{% highlight c %}
struct _byte
{
   unsigned a:1;
   unsigned b:1;
   unsigned c:1;
   unsigned d:1;
   unsigned e:1;
   unsigned f:1;
   unsigned g:1;
   unsigned h:1;
};

int Count(unsigned char x)
{
struct _byte *by = (struct _byte*)&x;
cout <<  by->a + by->b + by->c + by->d + by->e +by->f +by->g + by->h << endl;
}
{% endhighlight %}
