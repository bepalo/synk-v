"use strict";
/**
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
class ListNode {
    constructor(value, prev, next) {
        this.value = value;
        this.prev = prev;
        this.next = next;
    }
}
exports.ListNode = ListNode;
class List {
    constructor(iterable) {
        _List_first.set(this, undefined);
        _List_last.set(this, undefined);
        _List_size.set(this, 0);
        if (iterable) {
            for (const value of iterable) {
                this.push(value);
            }
        }
    }
    *[(_List_first = new WeakMap(), _List_last = new WeakMap(), _List_size = new WeakMap(), Symbol.iterator)]() {
        for (let it = __classPrivateFieldGet(this, _List_first, "f"); it != null; it = it.next) {
            yield it.value;
        }
    }
    *entries() {
        for (let it = __classPrivateFieldGet(this, _List_first, "f"); it != null; it = it.next) {
            yield it.value;
        }
    }
    *iterator() {
        for (let it = __classPrivateFieldGet(this, _List_first, "f"); it != null; it = it.next) {
            yield it;
        }
    }
    *reverseIterator() {
        for (let it = __classPrivateFieldGet(this, _List_last, "f"); it != null; it = it.prev) {
            yield it;
        }
    }
    toArray() {
        const values = new Array(__classPrivateFieldGet(this, _List_size, "f"));
        for (let it = __classPrivateFieldGet(this, _List_first, "f"), i = 0; it != null; it = it.next, i++) {
            values[i] = it.value;
        }
        return values;
    }
    toJSON() {
        return this.toArray();
    }
    toString() {
        return JSON.stringify(this.toArray());
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return this.toArray();
    }
    [Symbol.toPrimitive](hint) {
        return this.toArray();
    }
    get size() {
        return __classPrivateFieldGet(this, _List_size, "f");
    }
    get first() {
        return __classPrivateFieldGet(this, _List_first, "f");
    }
    get last() {
        return __classPrivateFieldGet(this, _List_last, "f");
    }
    // remove from the start
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
    // remove from the end
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
    // insert value at the end
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
    // insert value at the start
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
    // insert after the node
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
    // insert after the node
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
    // insert before the node
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
    // insert before the node
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
    // remove the node
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
    // clear the list
    clear() {
        __classPrivateFieldSet(this, _List_first, __classPrivateFieldSet(this, _List_last, undefined, "f"), "f");
        __classPrivateFieldSet(this, _List_size, 0, "f");
    }
    // moves around elements across the edges
    rotate(amount) {
        if (__classPrivateFieldGet(this, _List_first, "f") == null || __classPrivateFieldGet(this, _List_last, "f") == null || __classPrivateFieldGet(this, _List_size, "f") === 0) { // empty or invalid
            return 0;
        }
        else if (__classPrivateFieldGet(this, _List_size, "f") === 1)
            return 1;
        amount = amount % __classPrivateFieldGet(this, _List_size, "f");
        if (amount === 0)
            return 0;
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
    // removes `amount` elements from the start and returns the node from where detached
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
    // removes `amount` elements from the end and returns the node from where detached
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