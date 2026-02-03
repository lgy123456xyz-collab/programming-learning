#include <iostream>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    
    long long maxSum = -2e18;
    long long currentSum = 0;
    
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        currentSum += x;
        maxSum = max(maxSum, currentSum);
        // 如果当前和小于0，丢弃它，从下一个位置重新开始
        if (currentSum < 0) currentSum = 0;
    }
    
    cout << maxSum+1 << endl;
    return 0;
}