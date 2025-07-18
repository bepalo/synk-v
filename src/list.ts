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
export class ListNode<T> {
  /**
   * Creates a new ListNode.
   * @param {T} value - Value held by this node.
   * @param {ListNode<T>} [prev] - Previous node in the list.
   * @param {ListNode<T>} [next] - Next node in the list.
   */
  constructor(
    public value: T,
    public prev?: ListNode<T>,
    public next?: ListNode<T>,
  ) {}
}

export class List<T> {
  // Private fields
  #first?: ListNode<T> = undefined;
  #last?: ListNode<T> = undefined;
  #size: number = 0;

  /**
   * Creates a new List instance. If an iterable is provided, pushes all values into the list.
   * @param {Iterable<T>} [iterable] - Optional iterable of values to initialize the list.
   */
  constructor(iterable?: Iterable<T>) {
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
  *[Symbol.iterator](): IterableIterator<T> {
    for (let it = this.#first; it != null; it = it.next) {
      yield it.value;
    }
  }

  /**
   * Alias for [Symbol.iterator].
   * @returns {IterableIterator<T>}
   */
  *entries(): IterableIterator<T> {
    for (let it = this.#first; it != null; it = it.next) {
      yield it.value;
    }
  }

  /**
   * Iterates over the list nodes (including value, prev, and next).
   * @returns {IterableIterator<ListNode<T>>}
   */
  *iterator(): IterableIterator<ListNode<T>> {
    for (let it = this.#first; it != null; it = it.next) {
      yield it;
    }
  }

  /**
   * Iterates over the list nodes in reverse (last to first).
   * @returns {IterableIterator<ListNode<T>>}
   */
  *reverseIterator(): IterableIterator<ListNode<T>> {
    for (let it = this.#last; it != null; it = it.prev) {
      yield it;
    }
  }

  /**
   * Converts the list to an array of values.
   * @returns {T[]}
   */
  toArray(): T[] {
    const values: T[] = new Array(this.#size);
    for (let it = this.#first, i = 0; it != null; it = it.next, i++) {
      values[i] = it.value;
    }
    return values;
  }

  /**
   * Serializes the list to a JSON-compatible array.
   * @returns {T[]}
   */
  toJSON(): T[] {
    return this.toArray();
  }

  /**
   * Returns a stringified JSON representation of the list.
   * @returns {string}
   */
  toString(): string {
    return JSON.stringify(this.toArray());
  }

  /** @returns {T[]} The list in array form */
  [Symbol.for("nodejs.util.inspect.custom")](): T[] {
    return this.toArray();
  }

  /** @returns {T[]} The list in array form */
  [Symbol.toPrimitive](_hint?: string): T[] {
    return this.toArray();
  }

  /** @returns {number} Current size of the list */
  get size(): number {
    return this.#size;
  }

  /** @returns {ListNode<T>|undefined} First node in the list */
  get first(): ListNode<T> | undefined {
    return this.#first;
  }

  /** @returns {ListNode<T>|undefined} Last node in the list */
  get last(): ListNode<T> | undefined {
    return this.#last;
  }

  /**
   * Removes and returns the first value in the list.
   * @returns {T | undefined}
   */
  popFirst(): T | undefined {
    const value = this.#first?.value;
    if (this.#first == null || this.#last == null) { // empty
      return undefined;
    } else if (this.#first == this.#last) { // one element
      this.#first = undefined;
      this.#last = undefined;
      this.#size--;
    } else { // many elements
      this.#first = this.#first.next;
      if (this.#first != null) {
        this.#first.prev = undefined;
      }
      this.#size--;
    }
    return value;
  }

  /**
   * Removes and returns the last value in the list.
   * @returns {T | undefined}
   */
  pop(): T | undefined {
    const value = this.#last?.value;
    if (this.#first == null || this.#last == null) { // empty
      return undefined;
    } else if (this.#first == this.#last) { // one element
      this.#first = undefined;
      this.#last = undefined;
      this.#size--;
    } else { // many elements
      this.#last = this.#last.prev;
      if (this.#last != null) {
        this.#last.next = undefined;
      }
      this.#size--;
    }
    return value;
  }

  /**
   * Appends a new value to the end of the list.
   * @param {T} value - Value to append.
   * @returns {ListNode<T>} The inserted node.
   */
  push(value: T): ListNode<T> {
    const node = new ListNode<T>(value);
    if (this.#first == null || this.#last == null) { // empty
      this.#first = this.#last = node;
    } else { // many elements
      node.prev = this.#last;
      this.#last.next = node;
      this.#last = node;
    }
    this.#size++;
    return node;
  }

  /**
   * Prepends a new value to the beginning of the list.
   * @param {T} value - Value to prepend.
   * @returns {ListNode<T>} The inserted node.
   */
  pushStart(value: T): ListNode<T> {
    const node = new ListNode<T>(value);
    if (this.#first == null || this.#last == null) { // empty
      this.#first = this.#last = node;
    } else { // many elements
      node.next = this.#first;
      this.#first.prev = node;
      this.#first = node;
    }
    this.#size++;
    return node;
  }

  /**
   * Inserts an existing node after the target node.
   * @param {ListNode<T>} node - Node to insert.
   * @param {ListNode<T>} targetNode - Node to insert after.
   * @returns {ListNode<T>} The inserted node.
   */
  insertNodeAfter(node: ListNode<T>, targetNode: ListNode<T>): ListNode<T> {
    node.prev = targetNode;
    node.next = targetNode.next;
    if (targetNode.next != null) {
      targetNode.next.prev = node;
    }
    targetNode.next = node;
    if (targetNode === this.#last) {
      this.#last = node;
    }
    this.#size++;
    return node;
  }

  /**
   * Inserts a new value after the target node.
   * @param {T} value - Value to insert.
   * @param {ListNode<T>} targetNode - Node to insert after.
   * @returns {ListNode<T>} The new node.
   */
  insertAfter(value: T, targetNode: ListNode<T>): ListNode<T> {
    const node = new ListNode<T>(value, targetNode, targetNode.next);
    if (targetNode.next != null) {
      targetNode.next.prev = node;
    }
    targetNode.next = node;
    if (targetNode === this.#last) {
      this.#last = node;
    }
    this.#size++;
    return node;
  }

  /**
   * Inserts an existing node before the target node.
   * @param {ListNode<T>} node - Node to insert.
   * @param {ListNode<T>} targetNode - Node to insert before.
   * @returns {ListNode<T>} The inserted node.
   */
  insertNodeBefore(node: ListNode<T>, targetNode: ListNode<T>): ListNode<T> {
    node.prev = targetNode.prev;
    node.next = targetNode;
    if (targetNode.prev != null) {
      targetNode.prev.next = node;
    }
    targetNode.prev = node;
    if (targetNode === this.#first) {
      this.#first = node;
    }
    this.#size++;
    return node;
  }

  /**
   * Inserts a new value before the target node.
   * @param {T} value - Value to insert.
   * @param {ListNode<T>} targetNode - Node to insert before.
   * @returns {ListNode<T>} The new node.
   */
  insertBefore(value: T, targetNode: ListNode<T>): ListNode<T> {
    const node = new ListNode<T>(value, targetNode.prev, targetNode);
    if (targetNode.prev != null) {
      targetNode.prev.next = node;
    }
    targetNode.prev = node;
    if (targetNode === this.#first) {
      this.#first = node;
    }
    this.#size++;
    return node;
  }

  /**
   * Removes the given node from the list.
   * @param {ListNode<T>} node - Node to remove.
   * @returns {ListNode<T>} The removed node.
   */
  remove(node: ListNode<T>): ListNode<T> {
    if (node.next != null) {
      node.next.prev = node.prev;
    }
    if (node.prev != null) {
      node.prev.next = node.next;
    }
    if (this.#first === node) {
      this.#first = node.next;
    }
    if (this.#last === node) {
      this.#last = node.prev;
    }
    this.#size--;
    return node;
  }

  /**
   * Clears the list.
   * @returns {void}
   */
  clear(): void {
    this.#first = this.#last = undefined;
    this.#size = 0;
  }

  /**
   * Rotates the list by the given amount.
   * Positive values move nodes from first to last.
   * Negative values move nodes from last to first.
   * @param {number} amount - Number of positions to rotate.
   * @returns {number} The absolute number of rotations performed.
   */
  rotate(amount: number): number {
    if (this.#first == null || this.#last == null || this.#size === 0) { // empty or invalid
      return 0;
    } else if (this.#size === 1) {
      return 1;
    }
    amount = amount % this.#size;
    if (amount === 0) {
      return 0;
    }
    // rotate via the shortest path
    const absAmount = Math.abs(amount);
    if (absAmount > this.#size / 2) {
      amount = amount > 0 ? amount - this.#size : this.#size + amount;
    }
    // make circular
    this.#first.prev = this.#last;
    this.#last.next = this.#first;
    // find the new start node
    let it: ListNode<T> = this.#first;
    if (amount > 0) {
      while (amount-- > 0) it = it.next!;
    } else {
      while (amount++ < 0) it = it.prev!;
    }
    // reset the first and last nodes
    this.#first = it;
    this.#last = it.prev!;
    // detach first and last nodes
    this.#first.prev = undefined;
    this.#last.next = undefined;
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
  trimStart(amount: number): ListNode<T> | undefined {
    if (this.#first == null || this.#last == null || amount <= 0) { // empty
      return undefined;
    }
    let node = this.#first;
    if (this.#first == this.#last) { // one element
      this.#first = undefined;
      this.#last = undefined;
      this.#size = 0;
    } else if (amount >= this.#size) { // trimming all elements
      // clear
      this.#first = this.#last = undefined;
      this.#size = 0;
    } else { // many elements
      // iterate via the shortest path
      const absAmount = Math.abs(amount);
      if (absAmount > this.#size / 2) {
        amount = amount > 0 ? amount - this.#size : this.#size + amount;
      }
      let it: ListNode<T>;
      if (amount > 0) {
        it = this.#first;
        while (amount-- > 0) it = it.next!;
      } else {
        it = this.#last;
        while (++amount < 0) it = it.prev!;
      }
      // detach end
      node = it.prev!;
      it.prev!.next = undefined;
      it.prev = undefined;
      this.#first = it;
      this.#size -= absAmount;
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
  trimEnd(amount: number): ListNode<T> | undefined {
    if (this.#first == null || this.#last == null || amount <= 0) { // empty
      return undefined;
    }
    let node = this.#last;
    if (this.#first == this.#last) { // one element
      this.#first = undefined;
      this.#last = undefined;
      this.#size--;
    } else if (amount >= this.#size) { // trimming all elements
      // clear
      this.#first = this.#last = undefined;
      this.#size = 0;
    } else { // many elements
      // iterate via the shortest path
      const absAmount = Math.abs(amount);
      if (absAmount > this.#size / 2) {
        amount = amount > 0 ? amount - this.#size : this.#size + amount;
      }
      let it: ListNode<T>;
      if (amount > 0) {
        it = this.#last;
        while (amount-- > 0) it = it.prev!;
      } else {
        it = this.#first;
        while (++amount < 0) it = it.next!;
      }
      // detach end
      node = it.next!;
      it.next!.prev = undefined;
      it.next = undefined;
      this.#last = it;
      this.#size -= absAmount;
    }
    return node;
  }
}

export default List;
