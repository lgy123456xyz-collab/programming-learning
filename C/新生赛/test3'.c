#include <stdio.h>
#include <stdlib.h>

int cmp(const void *a, const void *b) {  // 用于排序
    return *(int *)a - *(int *)b;
}

int main() {
    int T;
    scanf("%d", &T);

    while (T--) {
        int n, m;
        scanf("%d %d", &n, &m);

        int edges[n + 1][m + 1];   // 存出边节点编号
        int count[n + 1];          // 每个点出边数

        // 初始化
        for (int i = 1; i <= n; i++) {
            count[i] = 0;
        }

        // 读入边
        for (int i = 0; i < m; i++) {
            int u, v;
            scanf("%d %d", &u, &v);
            edges[u][count[u]++] = v;  // 记录出边
        }

        // 对每个点的出边排序并输出
        for (int i = 1; i <= n; i++) {
            if (count[i] > 0)
                qsort(edges[i], count[i], sizeof(int), cmp);

            for (int j = 0; j < count[i]; j++) {
                if (j > 0) printf(" ");
                printf("%d", edges[i][j]);
            }
            printf("\n");  // 每个点一行
        }
    }

    return 0;
}
