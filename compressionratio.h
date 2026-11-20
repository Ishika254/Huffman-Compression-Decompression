#ifndef COMPRESSIONRATIO_H
#define COMPRESSIONRATIO_H

#include <string>
using namespace std;

class FileSize
{
public:
    long long getSize(string fileName);
};

class CompressionRatio
{
public:
    void calculate(string originalFile, string compressedFile);
};

#endif
