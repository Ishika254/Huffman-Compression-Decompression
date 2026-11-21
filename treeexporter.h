#ifndef TREEEXPORTER_H
#define TREEEXPORTER_H

#include "HuffmanNode.h"
#include <fstream>

class TreeExporter
{
public:
    void exportTree(HuffmanNode* root, const char* fileName);

private:
    void writeNode(HuffmanNode* node, std::ofstream& file);
};

#endif
