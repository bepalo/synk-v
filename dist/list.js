"use strict";
/**
 * @file A minimal and efficient implementation of a doubly-linked list with node-level access.
 * @author Natnael Eshetu
 * @exports List
 * @exports ListNode
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _List_first, _List_last, _List_size;
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = exports.ListNode = void 0;
/**
 * A node in a doubly linked list.
 * @template T
 */
class ListNode {
    /**
     * Creates a new ListNode.
     * @param {T} value - Value held by this node.
     * @param {ListNode<T>} [prev] - Previous node in the list.
     * @param {ListNode<T>} [next] - Next node in the list.
     */
    constructor(value, prev, next) {
        this.value = value;
        this.prev = prev;
        this.next = next;
    }
}
exports.ListNode = ListNode;
class List {
    /**
     * Creates a new List instance. If an iterable is provided, pushes all values into the list.
     * @param {Iterable<T>} [iterable] - Optional iterable of values to initialize the list.
     */
    constructor(iterable) {
        // Private fields
        _List_first.set(this, undefined);
        _List_last.set(this, undefined);
        _List_size.set(this, 0);
        if (iterable) {
            for (const value of iterable) {
                this.push(value);
            }
        }
    }
    /**
     * Iterates over the values in the list from first to last.
     * @returns {IterableIterator<T>}
     */
    *[(_List_first = new WeakMap(), _List_last = new WeakMap(), _List_size = new WeakMap(), Symbol.iterator)]() {
        for (let it = __classPrivateFieldGet(this, _List_first, "f"); it != null; it = it.next) {
            yield it.value;
        }
    }
    /**
     * Alias for [Symbol.iterator].
     * @returns {IterableIterator<T>}
     */
    *entries() {
        for (let it = __classPrivateFieldGet(this, _List_first, "f"); it != null; it = it.next) {
            yield it.value;
        }
    }
    /**
     * Iterates over the list nodes (including value, prev, and next).
     * @returns {IterableIterator<ListNode<T>>}
     */
    *iterator() {
        for (let it = __classPrivateFieldGet(this, _List_first, "f"); it != null; it = it.next) {
            yield it;
        }
    }
    /**
     * Iterates over the list nodes in reverse (last to first).
     * @returns {IterableIterator<ListNode<T>>}
     */
    *reverseIterator() {
        for (let it = __classPrivateFieldGet(this, _List_last, "f"); it != null; it = it.prev) {
            yield it;
        }
    }
    /**
     * Converts the list to an array of values.
     * @returns {T[]}
     */
    toArray() {
        const values = new Array(__classPrivateFieldGet(this, _List_size, "f"));
        for (let it = __classPrivateFieldGet(this, _List_first, "f"), i = 0; it != null; it = it.next, i++) {
            values[i] = it.value;
        }
        return values;
    }
    /**
     * Serializes the list to a JSON-compatible array.
     * @returns {T[]}
     */
    toJSON() {
        return this.toArray();
    }
    /**
     * Returns a stringified JSON representation of the list.
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toArray());
    }
    /** @returns {T[]} The list in array form */
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return this.toArray();
    }
    /** @returns {T[]} The list in array form */
    [Symbol.toPrimitive](_hint) {
        return this.toArray();
    }
    /** @returns {number} Current size of the list */
    get size() {
        return __classPrivateFieldGet(this, _List_size, "f");
    }
    /** @returns {ListNode<T>|undefined} First node in the list */
    get first() {
        return __classPrivateFieldGet(this, _List_first, "f");
    }
    /** @returns {ListNode<T>|undefined} Last node in the list */
    get last() {
        return __classPrivateFieldGet(this, _List_last, "f");
    }
    /**
     * Removes and returns the first value in the list.
     * @returns {T | undefined}
     */
    popFirst() {
        var _a;
        var _b, _c;
        const value = (_a = __classPrivateFieldGet(this, _List_first, "f")) === null || _a === void 0 ? void 0 : _a.value;
        if (__classPrivateFieldGet(this, _List_first, "f") == null || __classPrivateFieldGet(this, _List_last, "f") == null) { // empty
            return undefined;
        }
        else if (__classPrivateFieldGet(this, _List_first, "f") == __classPrivateFieldGet(this, _List_last, "f")) { // one element
            __classPrivateFieldSet(this, _List_first, undefined, "f");
            __classPrivateFieldSet(this, _List_last, undefined, "f");
            __classPrivateFieldSet(this, _List_size, (_b = __classPrivateFieldGet(this, _List_size, "f"), _b--, _b), "f");
        }
        else { // many elements
            __classPrivateFieldSet(this, _List_first, __classPrivateFieldGet(this, _List_first, "f").next, "f");
            if (__classPrivateFieldGet(this, _List_first, "f") != null) {
                __classPrivateFieldGet(this, _List_first, "f").prev = undefined;
            }
            __classPrivateFieldSet(this, _List_size, (_c = __classPrivateFieldGet(this, _List_size, "f"), _c--, _c), "f");
        }
        return value;
    }
    /**
     * Removes and returns the last value in the list.
     * @returns {T | undefined}
     */
    pop() {
        var _a;
        var _b, _c;
        const value = (_a = __classPrivateFieldGet(this, _List_last, "f")) === null || _a === void 0 ? void 0 : _a.value;
        if (__classPrivateFieldGet(this, _List_first, "f") == null || __classPrivateFieldGet(this, _List_last, "f") == null) { // empty
            return undefined;
        }
        else if (__classPrivateFieldGet(this, _List_first, "f") == __classPrivateFieldGet(this, _List_last, "f")) { // one element
            __classPrivateFieldSet(this, _List_first, undefined, "f");
            __classPrivateFieldSet(this, _List_last, undefined, "f");
            __classPrivateFieldSet(this, _List_size, (_b = __classPrivateFieldGet(this, _List_size, "f"), _b--, _b), "f");
        }
        else { // many elements
            __classPrivateFieldSet(this, _List_last, __classPrivateFieldGet(this, _List_last, "f").prev, "f");
            if (__classPrivateFieldGet(this, _List_last, "f") != null) {
                __classPrivateFieldGet(this, _List_last, "f").next = undefined;
            }
            __classPrivateFieldSet(this, _List_size, (_c = __classPrivateFieldGet(this, _List_size, "f"), _c--, _c), "f");
        }
        return value;
    }
    /**
     * Appends a new value to the end of the list.
     * @param {T} value - Value to append.
     * @returns {ListNode<T>} The inserted node.
     */
    push(value) {
        var _a;
        const node = new ListNode(value);
        if (__classPrivateFieldGet(this, _List_first, "f") == null || __classPrivateFieldGet(this, _List_last, "f") == null) { // empty
            __classPrivateFieldSet(this, _List_first, __classPrivateFieldSet(this, _List_last, node, "f"), "f");
        }
        else { // many elements
            node.prev = __classPrivateFieldGet(this, _List_last, "f");
            __classPrivateFieldGet(this, _List_last, "f").next = node;
            __classPrivateFieldSet(this, _List_last, node, "f");
        }
        __classPrivateFieldSet(this, _List_size, (_a = __classPrivateFieldGet(this, _List_size, "f"), _a++, _a), "f");
        return node;
    }
    /**
     * Prepends a new value to the beginning of the list.
     * @param {T} value - Value to prepend.
     * @returns {ListNode<T>} The inserted node.
     */
    pushStart(value) {
        var _a;
        const node = new ListNode(value);
        if (__classPrivateFieldGet(this, _List_first, "f") == null || __classPrivateFieldGet(this, _List_last, "f") == null) { // empty
            __classPrivateFieldSet(this, _List_first, __classPrivateFieldSet(this, _List_last, node, "f"), "f");
        }
        else { // many elements
            node.next = __classPrivateFieldGet(this, _List_first, "f");
            __classPrivateFieldGet(this, _List_first, "f").prev = node;
            __classPrivateFieldSet(this, _List_first, node, "f");
        }
        __classPrivateFieldSet(this, _List_size, (_a = __classPrivateFieldGet(this, _List_size, "f"), _a++, _a), "f");
        return node;
    }
    /**
     * Inserts an existing node after the target node.
     * @param {ListNode<T>} node - Node to insert.
     * @param {ListNode<T>} targetNode - Node to insert after.
     * @returns {ListNode<T>} The inserted node.
     */
    insertNodeAfter(node, targetNode) {
        var _a;
        node.prev = targetNode;
        node.next = targetNode.next;
        if (targetNode.next != null) {
            targetNode.next.prev = node;
        }
        targetNode.next = node;
        if (targetNode === __classPrivateFieldGet(this, _List_last, "f")) {
            __classPrivateFieldSet(this, _List_last, node, "f");
        }
        __classPrivateFieldSet(this, _List_size, (_a = __classPrivateFieldGet(this, _List_size, "f"), _a++, _a), "f");
        return node;
    }
    /**
     * Inserts a new value after the target node.
     * @param {T} value - Value to insert.
     * @param {ListNode<T>} targetNode - Node to insert after.
     * @returns {ListNode<T>} The new node.
     */
    insertAfter(value, targetNode) {
        var _a;
        const node = new ListNode(value, targetNode, targetNode.next);
        if (targetNode.next != null) {
            targetNode.next.prev = node;
        }
        targetNode.next = node;
        if (targetNode === __classPrivateFieldGet(this, _List_last, "f")) {
            __classPrivateFieldSet(this, _List_last, node, "f");
        }
        __classPrivateFieldSet(this, _List_size, (_a = __classPrivateFieldGet(this, _List_size, "f"), _a++, _a), "f");
        return node;
    }
    /**
     * Inserts an existing node before the target node.
     * @param {ListNode<T>} node - Node to insert.
     * @param {ListNode<T>} targetNode - Node to insert before.
     * @returns {ListNode<T>} The inserted node.
     */
    insertNodeBefore(node, targetNode) {
        var _a;
        node.prev = targetNode.prev;
        node.next = targetNode;
        if (targetNode.prev != null) {
            targetNode.prev.next = node;
        }
        targetNode.prev = node;
        if (targetNode === __classPrivateFieldGet(this, _List_first, "f")) {
            __classPrivateFieldSet(this, _List_first, node, "f");
        }
        __classPrivateFieldSet(this, _List_size, (_a = __classPrivateFieldGet(this, _List_size, "f"), _a++, _a), "f");
        return node;
    }
    /**
     * Inserts a new value before the target node.
     * @param {T} value - Value to insert.
     * @param {ListNode<T>} targetNode - Node to insert before.
     * @returns {ListNode<T>} The new node.
     */
    insertBefore(value, targetNode) {
        var _a;
        const node = new ListNode(value, targetNode.prev, targetNode);
        if (targetNode.prev != null) {
            targetNode.prev.next = node;
        }
        targetNode.prev = node;
        if (targetNode === __classPrivateFieldGet(this, _List_first, "f")) {
            __classPrivateFieldSet(this, _List_first, node, "f");
        }
        __classPrivateFieldSet(this, _List_size, (_a = __classPrivateFieldGet(this, _List_size, "f"), _a++, _a), "f");
        return node;
    }
    /**
     * Removes the given node from the list.
     * @param {ListNode<T>} node - Node to remove.
     * @returns {ListNode<T>} The removed node.
     */
    remove(node) {
        var _a;
        if (node.next != null) {
            node.next.prev = node.prev;
        }
        if (node.prev != null) {
            node.prev.next = node.next;
        }
        if (__classPrivateFieldGet(this, _List_first, "f") === node) {
            __classPrivateFieldSet(this, _List_first, node.next, "f");
        }
        if (__classPrivateFieldGet(this, _List_last, "f") === node) {
            __classPrivateFieldSet(this, _List_last, node.prev, "f");
        }
        __classPrivateFieldSet(this, _List_size, (_a = __classPrivateFieldGet(this, _List_size, "f"), _a--, _a), "f");
        return node;
    }
    /**
     * Clears the list.
     * @returns {void}
     */
    clear() {
        __classPrivateFieldSet(this, _List_first, __classPrivateFieldSet(this, _List_last, undefined, "f"), "f");
        __classPrivateFieldSet(this, _List_size, 0, "f");
    }
    /**
     * Rotates the list by the given amount.
     * Positive values move nodes from first to last.
     * Negative values move nodes from last to first.
     * @param {number} amount - Number of positions to rotate.
     * @returns {number} The absolute number of rotations performed.
     */
    rotate(amount) {
        if (__classPrivateFieldGet(this, _List_first, "f") == null || __classPrivateFieldGet(this, _List_last, "f") == null || __classPrivateFieldGet(this, _List_size, "f") === 0) { // empty or invalid
            return 0;
        }
        else if (__classPrivateFieldGet(this, _List_size, "f") === 1) {
            return 1;
        }
        amount = amount % __classPrivateFieldGet(this, _List_size, "f");
        if (amount === 0) {
            return 0;
        }
        // rotate via the shortest path
        const absAmount = Math.abs(amount);
        if (absAmount > __classPrivateFieldGet(this, _List_size, "f") / 2) {
            amount = amount > 0 ? amount - __classPrivateFieldGet(this, _List_size, "f") : __classPrivateFieldGet(this, _List_size, "f") + amount;
        }
        // make circular
        __classPrivateFieldGet(this, _List_first, "f").prev = __classPrivateFieldGet(this, _List_last, "f");
        __classPrivateFieldGet(this, _List_last, "f").next = __classPrivateFieldGet(this, _List_first, "f");
        // find the new start node
        let it = __classPrivateFieldGet(this, _List_first, "f");
        if (amount > 0) {
            while (amount-- > 0)
                it = it.next;
        }
        else {
            while (amount++ < 0)
                it = it.prev;
        }
        // reset the first and last nodes
        __classPrivateFieldSet(this, _List_first, it, "f");
        __classPrivateFieldSet(this, _List_last, it.prev, "f");
        // detach first and last nodes
        __classPrivateFieldGet(this, _List_first, "f").prev = undefined;
        __classPrivateFieldGet(this, _List_last, "f").next = undefined;
        return absAmount;
    }
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
    trimStart(amount) {
        if (__classPrivateFieldGet(this, _List_first, "f") == null || __classPrivateFieldGet(this, _List_last, "f") == null || amount <= 0) { // empty
            return undefined;
        }
        let node = __classPrivateFieldGet(this, _List_first, "f");
        if (__classPrivateFieldGet(this, _List_first, "f") == __classPrivateFieldGet(this, _List_last, "f")) { // one element
            __classPrivateFieldSet(this, _List_first, undefined, "f");
            __classPrivateFieldSet(this, _List_last, undefined, "f");
            __classPrivateFieldSet(this, _List_size, 0, "f");
        }
        else if (amount >= __classPrivateFieldGet(this, _List_size, "f")) { // trimming all elements
            // clear
            __classPrivateFieldSet(this, _List_first, __classPrivateFieldSet(this, _List_last, undefined, "f"), "f");
            __classPrivateFieldSet(this, _List_size, 0, "f");
        }
        else { // many elements
            // iterate via the shortest path
            const absAmount = Math.abs(amount);
            if (absAmount > __classPrivateFieldGet(this, _List_size, "f") / 2) {
                amount = amount > 0 ? amount - __classPrivateFieldGet(this, _List_size, "f") : __classPrivateFieldGet(this, _List_size, "f") + amount;
            }
            let it;
            if (amount > 0) {
                it = __classPrivateFieldGet(this, _List_first, "f");
                while (amount-- > 0)
                    it = it.next;
            }
            else {
                it = __classPrivateFieldGet(this, _List_last, "f");
                while (++amount < 0)
                    it = it.prev;
            }
            // detach end
            node = it.prev;
            it.prev.next = undefined;
            it.prev = undefined;
            __classPrivateFieldSet(this, _List_first, it, "f");
            __classPrivateFieldSet(this, _List_size, __classPrivateFieldGet(this, _List_size, "f") - absAmount, "f");
        }
        return node;
    }
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
    trimEnd(amount) {
        var _a;
        if (__classPrivateFieldGet(this, _List_first, "f") == null || __classPrivateFieldGet(this, _List_last, "f") == null || amount <= 0) { // empty
            return undefined;
        }
        let node = __classPrivateFieldGet(this, _List_last, "f");
        if (__classPrivateFieldGet(this, _List_first, "f") == __classPrivateFieldGet(this, _List_last, "f")) { // one element
            __classPrivateFieldSet(this, _List_first, undefined, "f");
            __classPrivateFieldSet(this, _List_last, undefined, "f");
            __classPrivateFieldSet(this, _List_size, (_a = __classPrivateFieldGet(this, _List_size, "f"), _a--, _a), "f");
        }
        else if (amount >= __classPrivateFieldGet(this, _List_size, "f")) { // trimming all elements
            // clear
            __classPrivateFieldSet(this, _List_first, __classPrivateFieldSet(this, _List_last, undefined, "f"), "f");
            __classPrivateFieldSet(this, _List_size, 0, "f");
        }
        else { // many elements
            // iterate via the shortest path
            const absAmount = Math.abs(amount);
            if (absAmount > __classPrivateFieldGet(this, _List_size, "f") / 2) {
                amount = amount > 0 ? amount - __classPrivateFieldGet(this, _List_size, "f") : __classPrivateFieldGet(this, _List_size, "f") + amount;
            }
            let it;
            if (amount > 0) {
                it = __classPrivateFieldGet(this, _List_last, "f");
                while (amount-- > 0)
                    it = it.prev;
            }
            else {
                it = __classPrivateFieldGet(this, _List_first, "f");
                while (++amount < 0)
                    it = it.next;
            }
            // detach end
            node = it.next;
            it.next.prev = undefined;
            it.next = undefined;
            __classPrivateFieldSet(this, _List_last, it, "f");
            __classPrivateFieldSet(this, _List_size, __classPrivateFieldGet(this, _List_size, "f") - absAmount, "f");
        }
        return node;
    }
}
exports.List = List;
exports.default = List;
//# sourceMappingURL=list.js.map