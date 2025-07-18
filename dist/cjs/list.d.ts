/**
 * @file A minimal and efficient implementation of a doubly-linked list with node-level access.
 * @author Natnael Eshetu
 * @exports List
 * @exports ListNode
 */
/**
 * A node in a doubly linked list.
 * @template T
 */
export declare class ListNode<T> {
    value: T;
    prev?: ListNode<T> | undefined;
    next?: ListNode<T> | undefined;
    /**
     * Creates a new ListNode.
     * @param {T} value - Value held by this node.
     * @param {ListNode<T>} [prev] - Previous node in the list.
     * @param {ListNode<T>} [next] - Next node in the list.
     */
    constructor(value: T, prev?: ListNode<T> | undefined, next?: ListNode<T> | undefined);
}
export declare class List<T> {
    #private;
    /**
     * Creates a new List instance. If an iterable is provided, pushes all values into the list.
     * @param {Iterable<T>} [iterable] - Optional iterable of values to initialize the list.
     */
    constructor(iterable?: Iterable<T>);
    /**
     * Iterates over the values in the list from first to last.
     * @returns {IterableIterator<T>}
     */
    [Symbol.iterator](): IterableIterator<T>;
    /**
     * Alias for [Symbol.iterator].
     * @returns {IterableIterator<T>}
     */
    entries(): IterableIterator<T>;
    /**
     * Iterates over the list nodes (including value, prev, and next).
     * @returns {IterableIterator<ListNode<T>>}
     */
    iterator(): IterableIterator<ListNode<T>>;
    /**
     * Iterates over the list nodes in reverse (last to first).
     * @returns {IterableIterator<ListNode<T>>}
     */
    reverseIterator(): IterableIterator<ListNode<T>>;
    /**
     * Converts the list to an array of values.
     * @returns {T[]}
     */
    toArray(): T[];
    /**
     * Serializes the list to a JSON-compatible array.
     * @returns {T[]}
     */
    toJSON(): T[];
    /**
     * Returns a stringified JSON representation of the list.
     * @returns {string}
     */
    toString(): string;
    /** @returns {T[]} The list in array form */
    [Symbol.toPrimitive](_hint?: string): T[];
    /** @returns {number} Current size of the list */
    get size(): number;
    /** @returns {ListNode<T>|undefined} First node in the list */
    get first(): ListNode<T> | undefined;
    /** @returns {ListNode<T>|undefined} Last node in the list */
    get last(): ListNode<T> | undefined;
    /**
     * Removes and returns the first value in the list.
     * @returns {T | undefined}
     */
    popFirst(): T | undefined;
    /**
     * Removes and returns the last value in the list.
     * @returns {T | undefined}
     */
    pop(): T | undefined;
    /**
     * Appends a new value to the end of the list.
     * @param {T} value - Value to append.
     * @returns {ListNode<T>} The inserted node.
     */
    push(value: T): ListNode<T>;
    /**
     * Prepends a new value to the beginning of the list.
     * @param {T} value - Value to prepend.
     * @returns {ListNode<T>} The inserted node.
     */
    pushStart(value: T): ListNode<T>;
    /**
     * Inserts an existing node after the target node.
     * @param {ListNode<T>} node - Node to insert.
     * @param {ListNode<T>} targetNode - Node to insert after.
     * @returns {ListNode<T>} The inserted node.
     */
    insertNodeAfter(node: ListNode<T>, targetNode: ListNode<T>): ListNode<T>;
    /**
     * Inserts a new value after the target node.
     * @param {T} value - Value to insert.
     * @param {ListNode<T>} targetNode - Node to insert after.
     * @returns {ListNode<T>} The new node.
     */
    insertAfter(value: T, targetNode: ListNode<T>): ListNode<T>;
    /**
     * Inserts an existing node before the target node.
     * @param {ListNode<T>} node - Node to insert.
     * @param {ListNode<T>} targetNode - Node to insert before.
     * @returns {ListNode<T>} The inserted node.
     */
    insertNodeBefore(node: ListNode<T>, targetNode: ListNode<T>): ListNode<T>;
    /**
     * Inserts a new value before the target node.
     * @param {T} value - Value to insert.
     * @param {ListNode<T>} targetNode - Node to insert before.
     * @returns {ListNode<T>} The new node.
     */
    insertBefore(value: T, targetNode: ListNode<T>): ListNode<T>;
    /**
     * Removes the given node from the list.
     * @param {ListNode<T>} node - Node to remove.
     * @returns {ListNode<T>} The removed node.
     */
    remove(node: ListNode<T>): ListNode<T>;
    /**
     * Clears the list.
     * @returns {void}
     */
    clear(): void;
    /**
     * Rotates the list by the given amount.
     * Positive values move nodes from first to last.
     * Negative values move nodes from last to first.
     * @param {number} amount - Number of positions to rotate.
     * @returns {number} The absolute number of rotations performed.
     */
    rotate(amount: number): number;
    /**
     * Removes `amount` nodes from the start of the list and returns the last node
     * of the detached segment (i.e., the node that was at the boundary of the detachment).
     *
     * If `amount` is greater than or equal to the list size, the entire list is cleared,
     * and the original first node is returned.
     *
     * @param {number} amount - Number of nodes to remove from the start.
     * @returns {ListNode<T> | undefined} The first node of the detached segment, or `undefined` if the list was empty or `amount <= 0`.
     */
    trimStart(amount: number): ListNode<T> | undefined;
    /**
     * Removes `amount` nodes from the end of the list and returns the first node
     * of the detached segment (i.e., the node that was at the boundary of the detachment).
     *
     * If `amount` is greater than or equal to the list size, the entire list is cleared,
     * and the original last node is returned.
     *
     * @param {number} amount - Number of nodes to remove from the end.
     * @returns {ListNode<T> | undefined} The first node of the detached segment, or `undefined` if the list was empty or `amount <= 0`.
     */
    trimEnd(amount: number): ListNode<T> | undefined;
}
export default List;
//# sourceMappingURL=list.d.ts.map