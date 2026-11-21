#include "TreeExporter.h"

void TreeExporter::exportTree(HuffmanNode* root, const char* fileName)
{
    std::ofstream file(fileName);

    if (!file)
    {
        return;
    }

    file << "{\n";
    file << "\"tree\": ";

    writeNode(root, file);

    file << "\n}";
    file.close();
}

void TreeExporter::writeNode(HuffmanNode* node, std::ofstream& file)
{
    if (node == nullptr)
    {
        file << "null";
        return;
    }

    file << "{";
    file << "\"frequency\": " << node->frequency << ",";

    if (node->left == nullptr && node->right == nullptr)
    {
        file << "\"isLeaf\": true,";
        file << "\"characterCode\": "
             << (int)(unsigned char)node->data;
    }
    else
    {
        file << "\"isLeaf\": false,";
        file << "\"left\": ";
        writeNode(node->left, file);

        file << ",\"right\": ";
        writeNode(node->right, file);
    }

    file << "}";
}
