#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    long long maxSum = -2e18; // 设一个极小值
    for (int i = 0; i < n; i++) {
        long long currentSum = 0;
        for (int j = i; j < n; j++) {
            currentSum += a[j];
            maxSum = max(maxSum, currentSum);
        }
    }
    cout << maxSum << endl;
    return 0;
}