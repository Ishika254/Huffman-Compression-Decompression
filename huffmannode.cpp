//code written by sanxkar
#include "HuffmanNode.h"

HuffmanNode::HuffmanNode(char ch, int freq)
{
    data = ch;
    frequency = freq;
    left = nullptr;
    right = nullptr;
}
