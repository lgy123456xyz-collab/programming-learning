struct LNode{
   int position;
   int password;
   LNode* next;
};
using CyList=LNode*;
void InitCyList(CyList &L);
void InsertCyList(CyList &L,LNode*&Now,int position,int password);
bool isCyListEmpty(CyList L);
int DeleteCyList(CyList &L,LNode* &Now,int &position);//删除Now的下一个节点

