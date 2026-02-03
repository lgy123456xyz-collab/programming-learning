#include <iostream>
#include <ctime>
#include <cstdlib>

using namespace std;

int main() {
    srand(time(0));
    int n = rand() % 100 + 1; // 生成 1 到 100 之间的随机长度
    cout << n << endl;
    for (int i = 0; i < n; i++) {
        // 生成 -100 到 100 之间的整数（包含负数才有挑战）
        cout << (rand() % 201 - 100) << " ";
    }
    cout << endl;
    return 0;
}