/**
 * @author Natnael Eshetu
 * @exports List
 * @exports ListNode
 */
export declare class ListNode<T> {
    value: T;
    prev?: ListNode<T> | undefined;
    next?: ListNode<T> | undefined;
    constructor(value: T, prev?: ListNode<T> | undefined, next?: ListNode<T> | undefined);
}
export declare class List<T> {
    #private;
    constructor(iterable?: Iterable<T>);
    [Symbol.iterator](): IterableIterator<T>;
    entries(): IterableIterator<T>;
    iterator(): IterableIterator<ListNode<T>>;
    reverseIterator(): IterableIterator<ListNode<T>>;
    toArray(): T[];
    toJSON(): T[];
    toString(): string;
    [Symbol.toPrimitive](hint?: string): T[];
    get size(): number;
    get first(): ListNode<T> | undefined;
    get last(): ListNode<T> | undefined;
    popFirst(): T | undefined;
    pop(): T | undefined;
    push(value: T): ListNode<T>;
    pushStart(value: T): ListNode<T>;
    insertNodeAfter(node: ListNode<T>, targetNode: ListNode<T>): ListNode<T>;
    insertAfter(value: T, targetNode: ListNode<T>): ListNode<T>;
    insertNodeBefore(node: ListNode<T>, targetNode: ListNode<T>): ListNode<T>;
    insertBefore(value: T, targetNode: ListNode<T>): ListNode<T>;
    remove(node: ListNode<T>): ListNode<T>;
    clear(): void;
    rotate(amount: number): number;
    trimStart(amount: number): ListNode<T> | undefined;
    trimEnd(amount: number): ListNode<T> | undefined;
}
export default List;
