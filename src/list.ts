/**
 * @author Natnael Eshetu
 * @exports List
 * @exports ListNode
 */

export class ListNode<T> {
  constructor(
    public value: T,
    public prev?: ListNode<T>,
    public next?: ListNode<T>,
  ) {}
}

export class List<T> {
  #first?: ListNode<T> = undefined;
  #last?: ListNode<T> = undefined;
  #size: number = 0;

  constructor(iterable?: Iterable<T>) {
    if (iterable) {
      for (const value of iterable) {
        this.push(value);
      }
    }
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for(let it = this.#first; it != null; it = it.next) {
      yield it.value;
    }
  }

  *entries(): IterableIterator<T> {
    for(let it = this.#first; it != null; it = it.next) {
      yield it.value;
    }
  }

  *iterator(): IterableIterator<ListNode<T>> {
    for(let it = this.#first; it != null; it = it.next) {
      yield it;
    }
  }

  *reverseIterator(): IterableIterator<ListNode<T>> {
    for(let it = this.#last; it != null; it = it.prev) {
      yield it;
    }
  }

  toArray(): T[] {
    const values:T[] = new Array(this.#size);
    for(let it = this.#first, i = 0; it != null; it = it.next, i++) {
      values[i] = it.value;
    }
    return values;
  }

  toJSON(): T[] {
    return this.toArray();
  }

  toString(): string {
    return JSON.stringify(this.toArray());
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toArray();
  }

  [Symbol.toPrimitive](hint?: string): T[] {
    return this.toArray();
  }

  get size() {
    return this.#size;
  }

  get first() {
    return this.#first;
  }

  get last() {
    return this.#last;
  }

  // remove from the start
  popFirst(): T | undefined {
    const value = this.#first?.value;
    if(this.#first == null || this.#last == null) { // empty
      return undefined;
    } else if(this.#first == this.#last) { // one element
      this.#first = undefined;
      this.#last = undefined;
      this.#size--;
    } else { // many elements
      this.#first = this.#first.next;
      if(this.#first != null) {
        this.#first.prev = undefined;
      }
      this.#size--;
    }
    return value;
  }

  // remove from the end
  pop(): T | undefined {
    const value = this.#last?.value;
    if(this.#first == null || this.#last == null) { // empty
      return undefined;
    } else if(this.#first == this.#last) { // one element
      this.#first = undefined;
      this.#last = undefined;
      this.#size--;
    } else { // many elements
      this.#last = this.#last.prev;
      if(this.#last != null) {
        this.#last.next = undefined;
      }
      this.#size--;
    }
    return value;
  }

  // insert value at the end
  push(value: T): ListNode<T> {
    const node = new ListNode<T>(value);
    if(this.#first == null || this.#last == null) { // empty
      this.#first = this.#last = node;
    } else { // many elements
      node.prev = this.#last;
      this.#last.next = node;
      this.#last = node;
    }
    this.#size++;
    return node;
  }

  // insert value at the start
  pushStart(value: T): ListNode<T> {
    const node = new ListNode<T>(value);
    if(this.#first == null || this.#last == null) { // empty
      this.#first = this.#last = node;
    } else { // many elements
      node.next = this.#first;
      this.#first.prev = node;
      this.#first = node;
    }
    this.#size++;
    return node;
  }

  // insert after the node
  insertNodeAfter(node: ListNode<T>, targetNode: ListNode<T>): ListNode<T> {
    node.prev = targetNode;
    node.next = targetNode.next;
    if(targetNode.next != null) {
      targetNode.next.prev = node;
    }
    targetNode.next = node;
    if(targetNode === this.#last) {
      this.#last = node;
    }
    this.#size++;
    return node;
  }

  // insert after the node
  insertAfter(value: T, targetNode: ListNode<T>): ListNode<T> {
    const node = new ListNode<T>(value, targetNode, targetNode.next);
    if(targetNode.next != null) {
      targetNode.next.prev = node;
    }
    targetNode.next = node;
    if(targetNode === this.#last) {
      this.#last = node;
    }
    this.#size++;
    return node;
  }

  // insert before the node
  insertNodeBefore(node: ListNode<T>, targetNode: ListNode<T>): ListNode<T> {
    node.prev = targetNode.prev;
    node.next = targetNode;
    if(targetNode.prev != null) {
      targetNode.prev.next = node;
    }
    targetNode.prev = node;
    if(targetNode === this.#first) {
      this.#first = node;
    }
    this.#size++;
    return node;
  }

  // insert before the node
  insertBefore(value: T, targetNode: ListNode<T>): ListNode<T> {
    const node = new ListNode<T>(value, targetNode.prev, targetNode);
    if(targetNode.prev != null) {
      targetNode.prev.next = node;
    }
    targetNode.prev = node;
    if(targetNode === this.#first) {
      this.#first = node;
    }
    this.#size++;
    return node;
  }

  // remove the node
  remove(node: ListNode<T>): ListNode<T> {
    if(node.next != null) {
      node.next.prev = node.prev;
    }
    if(node.prev != null) {
      node.prev.next = node.next;
    }
    if(this.#first === node) {
      this.#first = node.next;
    }
    if(this.#last === node) {
      this.#last = node.prev;
    }
    this.#size--;
    return node;
  }

  // clear the list
  clear() {
    this.#first = this.#last = undefined;
    this.#size = 0;
  }

  // moves around elements across the edges
  rotate(amount: number): number {
    if(this.#first == null || this.#last == null || this.#size === 0) { // empty or invalid
      return 0;
    } else if(this.#size === 1)
      return 1;
    amount = amount % this.#size;
    if( amount === 0)
      return 0;
    // rotate via the shortest path
    const absAmount = Math.abs(amount);
    if(absAmount > this.#size / 2) {
      amount = amount > 0 ? amount - this.#size : this.#size + amount;
    }
    // make circular
    this.#first.prev = this.#last;
    this.#last.next = this.#first;
    // find the new start node
    let it: ListNode<T> = this.#first;
    if(amount > 0) {
      while(amount-- > 0) it = it.next!;
    } else {
      while(amount++ < 0) it = it.prev!;
    }
    // reset the first and last nodes
    this.#first = it;
    this.#last = it.prev!;
    // detach first and last nodes
    this.#first.prev = undefined;
    this.#last.next = undefined;
    return absAmount;
  }

  // removes `amount` elements from the start and returns the node from where detached
  trimStart(amount: number): ListNode<T> | undefined {
    if(this.#first == null || this.#last == null || amount <= 0) { // empty
      return undefined;
    } 
    let node = this.#first;
    if(this.#first == this.#last) { // one element
      this.#first = undefined;
      this.#last = undefined;
      this.#size = 0;
    } else if(amount >= this.#size) { // trimming all elements
      // clear
      this.#first = this.#last = undefined;
      this.#size = 0;
    } else { // many elements
      // iterate via the shortest path
      const absAmount = Math.abs(amount);
      if(absAmount > this.#size / 2) {
        amount = amount > 0 ? amount - this.#size : this.#size + amount;
      }
      let it: ListNode<T>;
      if(amount > 0) {
        it = this.#first;
        while(amount-- > 0) it = it.next!;
      } else {
        it = this.#last;
        while(++amount < 0) it = it.prev!;
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

  // removes `amount` elements from the end and returns the node from where detached
  trimEnd(amount: number): ListNode<T> | undefined {
    if(this.#first == null || this.#last == null || amount <= 0) { // empty
      return undefined;
    }
    let node = this.#last;
    if(this.#first == this.#last) { // one element
      this.#first = undefined;
      this.#last = undefined;
      this.#size--;
    } else if(amount >= this.#size) { // trimming all elements
      // clear
      this.#first = this.#last = undefined;
      this.#size = 0;
    } else { // many elements
      // iterate via the shortest path
      const absAmount = Math.abs(amount);
      if(absAmount > this.#size / 2) {
        amount = amount > 0 ? amount - this.#size : this.#size + amount;
      }
      let it: ListNode<T>;
      if(amount > 0) {
        it = this.#last;
        while(amount-- > 0) it = it.prev!;
      } else {
        it = this.#first;
        while(++amount < 0) it = it.next!;
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
