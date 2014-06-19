# btDelta

* Describes changes to objects in 1d *(one-directional / forwards-only)*
  or 2d *(two-directional / reversible)* formats.

* Automatically creating a delta from two objects.

* Applying a delta to an object.

* Simultaneously apply manual changes to a target object and record them to a delta object
  when automatic detection of changes is inefficient.

The reversible `2d` format produces a larger delta object than the `1d`, but includes
sufficient information to allow the delta to be applied in reverse, making it suitable for
use in undo/redo or revision implementations.

The automatic delta detection produces inefficient results when an index has been removed
near the beginning of an array. In such cases all indexes after the point-of-removal are
interpreted as updates and the last index of the array is interpreted as a deletion.
To compensate for this, *manual change* methods have been implemented which allow
simultaneous application of the change to a target object and recording of that change to
a delta object. In such cases the manual approach can produce significantly smaller delta
objects.

The reversible format features an *object cache*, which increases efficiency when
describing changes such as moving members of an array, where the reversible information
would be redundant with the forward information. This feature is currently only used when
manually specifying a movement change via the `btDelta.delta2d.prototype.doMoveItem`
method.


## Common use

### Creating a 1d forward-only delta:
Instantiate the `btDelta.delta1d` class, and use the `compare` method to automatically
detected changes between old and new objects...
````js
    var delta1d = new btDelta.delta1d();
    var delta = delta1d.compare( oldObj, newObj );
````

### Applying a 1d forward-only delta:
Use the `applyDeltaToObject` method to apply a delta to the old object to reproduce the
new object...
````js
    var delta1d = new btDelta.delta1d();
    var newObj = delta1d.applyDeltaToObj( delta, oldObj );
````

### Creating/applying a 2d reversible delta:
For reversibility instantiate the `btDelta.delta2d` class instead.
````js
    var delta2d = new btDelta.delta2d();
    var delta = delta2d.compare( oldObj, newObj );
    ...
    var newObj = delta2d.applyDeltaToObj( delta, oldObj );
````

### Reversing a 2d delta:
Pass `true` in the last parameter of the `applyDeltaToObject` method to apply a delta in
reverse...
````js
    var delta2d = new btDelta.delta2d();
    var oldObj = delta1d.applyDeltaToObj( delta, newObj, true );
````


## Caveat:
The current hierarchical formats are not well suited to manual recording of multiple
changes to an object, as there is no way of specifying sequentiality of changes.

Future plans involve moving to a hybrid of this structure and a *JSON-patch* style, so
changes can be described sequentially, yet will not lose the benefit which current format
has when dealing with many changes within the same deeply nested path.

The result should be lighter weight than the current format and currently available
JSON-patch formats available at the time of this writing, while still providing the
ability to include reversible information.

