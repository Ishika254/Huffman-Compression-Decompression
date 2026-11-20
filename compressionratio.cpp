#include <iostream>
#include <fstream>
#include "CompressionRatio.h"

using namespace std;

// Class to find file size
long long FileSize::getSize(string fileName)
{
    ifstream file(fileName, ios::binary);

    if (!file)
        return -1;

    file.seekg(0, ios::end);
    long long size = file.tellg();

    file.close();
    return size;
}

// Class to calculate compression ratio
void CompressionRatio::calculate(string originalFile,string compressedFile)
{
    FileSize file;

    long long originalSize = file.getSize(originalFile);
    long long compressedSize = file.getSize(compressedFile);

    if (originalSize < 0 || compressedSize < 0)
    {
        cout << "File not found!" << endl;
        return;
    }

    if (originalSize == 0)
    {
        cout << "Original file is empty." << endl;
        return;
    }

    double ratio = (double)compressedSize / originalSize;
    double saved = (1.0 - ratio) * 100;
    long long spaceSaved = originalSize - compressedSize;

    cout << "\nOriginal File Size:" << originalSize << " bytes" << endl;

    cout << "Compressed File Size:"<< compressedSize << " bytes" << endl;

    cout << "Compression Ratio: "<< ratio << endl;

    cout << "Space Saved: "<< spaceSaved << " bytes" << endl;
    cout << "Percentage of Space Saved: "<< saved << "%" << endl;
}
