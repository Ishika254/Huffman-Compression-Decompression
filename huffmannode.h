//code written by sanxkar

#ifndef HuffmanNode_h
#define HuffmanNode_h

class HuffmanNode
{
public:
    char data;
    int frequency;

    HuffmanNode* left;
    HuffmanNode* right;

    HuffmanNode(char ch, int freq);
};

#endif
