int max_min(int a[],int n) {

    int max=a[0];
    int min=a[0];
    for (int i=0;i<10;i++) {
        if (a[i]>max) {
            max=a[i];
        }
        if (a[i]<min) {
            min=a[i];
        }

    }
    return max-min;
}