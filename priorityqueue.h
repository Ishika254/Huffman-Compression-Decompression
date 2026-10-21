#ifndef PriorityQueue_h
#define PriorityQueue_h

#include "HuffmanNode.h"

class PriorityQueue
{
private:
    HuffmanNode* heap[256];
    int heapSize;

    void heapifyUp(int index);
    void heapifyDown(int index);

public:
    PriorityQueue();

    void insert(HuffmanNode* node);
    HuffmanNode* getMin();
    int size();
};

#endif
