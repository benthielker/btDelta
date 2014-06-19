//
// Define delta1d and delta2d instances to test.
//
var delta1d = new btDelta.delta1d({verbose:0}),
	delta2d = new btDelta.delta2d({verbose:0});

//
// Pre-define testing objects...
//

// Base test object. Provides starting point for all tests.
var test0 = {
	'id':'test', 'attributes':['test','model'], 'children':[
		'placeholder', 'placeholder', {
			'id':'section1', 'attributes':['test','section'], 'children':[
				{'id':'child1', 'name':'child one', 'attributes':['test','item']},
				{'id':'child2', 'name':'child two', 'attributes':['test','item']},
				{'id':'child3', 'name':'child three', 'attributes':['test','item']},
				{'id':'child4', 'name':'child four', 'attributes':['test','item']},
				{'id':'child5', 'name':'child five', 'attributes':['test','item']},
			]
		}
	]
};
console.log( "test0:",btClass.clone(test0) );

// Test 1 : simulate deletion of deeply-nested item.
var test1 = {
		'id':'test', 'attributes':['test','model'], 'children':[
			'placeholder', 'placeholder', {
				'id':'section1', 'attributes':['test','section'], 'children':[
					{'id':'child1', 'name':'child one', 'attributes':['test','item']},
					/* CHANGE: deleting child2...
					{'id':'child2', 'name':'child two', 'attributes':['test','item']},*/
					{'id':'child3', 'name':'child three', 'attributes':['test','item']},
					{'id':'child4', 'name':'child four', 'attributes':['test','item']},
					{'id':'child5', 'name':'child five', 'attributes':['test','item']},
				]
			}
		]
	},
	test1delta1,
	test1delta2;

// Test 2 : simulate re-arranging of deeply nested items.
var test2 = {
		'id':'test', 'attributes':['test','model'], 'children':[
			'placeholder', 'placeholder', {
				'id':'section1', 'attributes':['test','section'], 'children':[
					{'id':'child1', 'name':'child one', 'attributes':['test','item']},
					/* CHANGE: swapping child2 and child3... */
					{'id':'child3', 'name':'child three', 'attributes':['test','item']},
					{'id':'child2', 'name':'child two', 'attributes':['test','item']},
					{'id':'child4', 'name':'child four', 'attributes':['test','item']},
					{'id':'child5', 'name':'child five', 'attributes':['test','item']},
				]
			}
		]
	},
	test2delta1,
	test2delta2;

// Test 3 : manually produce deletion change.
var test3a1 = btClass.clone(test0),
	test3a2 = btClass.clone(test0),
	test3delta1,
	test3delta2,
	test3f1,
	test3f2,
	test3r2;

// Test 4 : manually produce movement change.
var test4a1 = btClass.clone(test0),
	test4a2 = btClass.clone(test0),
	test4delta1,
	test4delta2,
	test4f1,
	test4f2,
	test4r2;

// Test 5 : manually produce insertion change.
var test5a1 = btClass.clone(test0),
	test5a2 = btClass.clone(test0),
	test5delta1,
	test5delta2,
	test5f1,
	test5f2,
	test5r2;

// Test 6 : manually produce update change.
var test6a1 = btClass.clone(test0),
	test6a2 = btClass.clone(test0),
	test6delta1,
	test6delta2,
	test6f1,
	test6f2,
	test6r2;

// Test 7 : manually produce multiple changes.
var test7a1 = btClass.clone(test0),
	test7a2 = btClass.clone(test0),
	test7delta1,
	test7delta2,
	test7f1,
	test7f2,
	test7r2;

//
// Conduct tests...
//
describe("btDelta", function() {
	describe("btClass and btDelta should exist", function() {
		it("should have defined `btClass`", function() {
			expect(btClass).toBeDefined();
		});
		it("should have defined `btDelta`", function() {
			expect(btDelta).toBeDefined();
		});
	});
	describe("automatic delta detection", function() {
		describe("automatic 1d delta detection", function() {
			it("should produce 1d delta for test0 v test1", function() {
				test1delta1 = delta1d.compare(test0,test1);
				console.log(
					"test1delta1:",test1delta1,
					"length:"+JSON.stringify(test1delta1).length
				);
				expect(test1delta1).toBeTruthy();
				expect(delta1d.isDelta(test1delta1)).toBeTruthy();
			});
			it("should produce result matching test1 when applying 1d delta to test0", function() {
				test1b1 = delta1d.applyDeltaToObj(test1delta1,test0);
				//console.log( "test1b1:",btClass.clone(test1b1) );
				expect(test1b1).toBeTruthy();
				expect(JSON.stringify(test1b1)==JSON.stringify(test1)).toBeTruthy();
			});
			it("should produce 1d delta for test0 v test2", function() {
				test2delta1 = delta1d.compare(test0,test2);
				console.log(
					"test2delta1:",test2delta1,
					"length:"+JSON.stringify(test2delta1).length
				);
				expect(test2delta1).toBeTruthy();
				expect(delta1d.isDelta(test2delta1)).toBeTruthy();
			});
			it("should produce result matching test2 when applying 1d delta to test0", function() {
				test2b1 = delta1d.applyDeltaToObj(test2delta1,test0);
				//console.log( "test2b1:",btClass.clone(test2b1) );
				expect(test2b1).toBeTruthy();
				expect(JSON.stringify(test2b1)==JSON.stringify(test2)).toBeTruthy();
			});
		});
		describe("automatic 2d delta detection", function() {
			it("should produce 2d delta for test0 v test1", function() {
				test1delta2 = delta2d.compare(test0,test1);
				console.log(
					"test1delta2:",test1delta2,
					"length:"+JSON.stringify(test1delta2).length
				);
				expect(test1delta2).toBeTruthy();
				expect(delta2d.isDelta(test1delta2)).toBeTruthy();
			});
			it("should produce result matching test1 when applying 2d delta to test0", function() {
				test1b2 = delta2d.applyDeltaToObj(test1delta2,test0);
				//console.log( "test1b2:",btClass.clone(test1b2) );
				expect(test1b2).toBeTruthy();
				expect(JSON.stringify(test1b2)==JSON.stringify(test1)).toBeTruthy();
			});
			it("should produce 2d delta for test0 v test2", function() {
				test2delta2 = delta2d.compare(test0,test2);
				console.log(
					"test2delta2:",test2delta2,
					"length:"+JSON.stringify(test2delta2).length
				);
				expect(test2delta2).toBeTruthy();
				expect(delta2d.isDelta(test2delta2)).toBeTruthy();
			});
			it("should produce result matching test2 when applying 2d delta to test0", function() {
				test2b2 = delta2d.applyDeltaToObj(test2delta2,test0);
				//console.log( "test2b2:",btClass.clone(test2b2) );
				expect(test2b2).toBeTruthy();
				expect(JSON.stringify(test2b2)==JSON.stringify(test2)).toBeTruthy();
			});
		});
	});
	describe("manual delta creation", function() {
		describe("manual 1d deletion", function() {
			it("should manually produce 1d deletion change", function() {
				// test3a1 is modified as delta describing change is created.
				test3delta1 = delta1d.doDeleteItem(1,"/children/2/children",test3a1);
				console.log(
					"test3delta1:",test3delta1,
					"length:"+JSON.stringify(test3delta1).length
				);
				expect(test3delta1).toBeTruthy();
				expect(delta1d.isDelta(test3delta1)).toBeTruthy();
			});
			it("should successfully apply 1d deletion change", function() {
				// result of applying delta to test0 should match test3a1.
				test3f1 = delta1d.applyDeltaToObj(test3delta1,test0);
				expect(test3f1).toBeTruthy();
				expect(JSON.stringify(test3f1)===JSON.stringify(test3a1)).toBeTruthy();
			});
		});
		describe("manual 1d movement", function() {
			it("should manually produce 1d movement change", function() {
				// test4a1 is modified as delta describing change is created.
				test4delta1 = delta1d.doMoveItem(3,2,"/children/2/children",test4a1);
				console.log(
					"test4delta1:",test4delta1,
					"length:"+JSON.stringify(test4delta1).length
				);
				expect(test4delta1).toBeTruthy();
				expect(delta1d.isDelta(test4delta1)).toBeTruthy();
			});
			it("should successfully apply 1d movement change", function() {
				// result of applying delta to test0 should match test4a1.
				test4f1 = delta1d.applyDeltaToObj(test4delta1,test0);
				expect(test4f1).toBeTruthy();
				expect(JSON.stringify(test4f1)===JSON.stringify(test4a1)).toBeTruthy();
			});
		});
		describe("manual 1d insert", function() {
			it("should manually produce 1d insert change", function() {
				// test5a1 is modified as delta describing change is created.
				test5delta1 = delta1d.doInsertItem("inserted",1,"/children/2/children",test5a1);
				console.log(
					"test5delta1:",test5delta1,
					"length:"+JSON.stringify(test5delta1).length
				);
				expect(test5delta1).toBeTruthy();
				expect(delta1d.isDelta(test5delta1)).toBeTruthy();
			});
			it("should successfully apply 1d insert change", function() {
				// result of applying delta to test0 should match test5a1.
				test5f1 = delta1d.applyDeltaToObj(test5delta1,test0);
				expect(test5f1).toBeTruthy();
				expect(JSON.stringify(test5f1)===JSON.stringify(test5a1)).toBeTruthy();
			});
		});
		describe("manual 1d update", function() {
			it("should manually produce 1d update change", function() {
				// test6a1 is modified as delta describing change is created.
				test6delta1 = delta1d.doUpdateItem("updated",1,"/children/2/children",test6a1);
				console.log(
					"test6delta1:",test6delta1,
					"length:"+JSON.stringify(test6delta1).length
				);
				expect(test6delta1).toBeTruthy();
				expect(delta1d.isDelta(test6delta1)).toBeTruthy();
			});
			it("should successfully apply 1d update change", function() {
				// result of applying delta to test0 should match test6a1.
				test6f1 = delta1d.applyDeltaToObj(test6delta1,test0);
				expect(test6f1).toBeTruthy();
				expect(JSON.stringify(test6f1)===JSON.stringify(test6a1)).toBeTruthy();
			});
		});
		describe("manual 1d multiple", function() {
			it("should manually produce multiple 1d changes", function() {
				//
				// Caveat:
				// This format is not suited to making multiple changes, because they are
				// not recorded in a sequential manner. A JSON-patch approach would be
				// better suited to describing a long list of changes without producing
				// incorrect results.
				//
				// For example: if the deletion below is executed anywhere but first in
				// the order of changes, the result will be incorrect, as it will be
				// applied first.
				//
				// test7a1 is modified as delta describing change is created.
				test7delta1 = delta1d.doDeleteItem(0,"/children/2/children",test7a1);
				console.log(
					"change 1...",
					"test7delta1:",btClass.clone(test7delta1),
					"length:"+JSON.stringify(test7delta1).length
				);
				test7delta1 = delta1d.doInsertItem("inserted",1,"/children/2/children",test7a1,test7delta1);
				console.log(
					"change 2...",
					"test7delta1:",btClass.clone(test7delta1),
					"length:"+JSON.stringify(test7delta1).length
				);
				test7delta1 = delta1d.doUpdateItem("updated",1,"/children/2/children",test7a1,test7delta1);
				console.log(
					"change 3...",
					"test7delta1:",btClass.clone(test7delta1),
					"length:"+JSON.stringify(test7delta1).length
				);
				test7delta1 = delta1d.doMoveItem(3,2,"/children/2/children",test7a1,test7delta1);
				console.log(
					"change 4...",
					"test7delta1:",btClass.clone(test7delta1),
					"length:"+JSON.stringify(test7delta1).length
				);
				expect(test7delta1).toBeTruthy();
				expect(delta1d.isDelta(test7delta1)).toBeTruthy();
			});
			it("should successfully apply multiple 1d changes", function() {
				// result of applying delta to test0 should match test7a1.
				test7f1 = delta1d.applyDeltaToObj(test7delta1,test0);
				expect(test7f1).toBeTruthy();
				expect(JSON.stringify(test7f1)===JSON.stringify(test7a1)).toBeTruthy();
			});
		});
		
		describe("manual 2d deletion", function() {
			it("should manually produce 2d deletion change", function() {
				// test3a2 is modified as delta describing change is created.
				test3delta2 = delta2d.doDeleteItem(1,"/children/2/children",test3a2);
				console.log(
					"test3delta2:",test3delta2,
					"length:"+JSON.stringify(test3delta2).length
				);
				expect(test3delta2).toBeTruthy();
				expect(delta2d.isDelta(test3delta2)).toBeTruthy();
			});
			it("should successfully apply 2d deletion change", function() {
				// result of applying delta to test0 should match test3a2.
				test3f2 = delta2d.applyDeltaToObj(test3delta2,test0);
				expect(test3f2).toBeTruthy();
				expect(JSON.stringify(test3f2)===JSON.stringify(test3a2)).toBeTruthy();
			});
			it("should successfully reverse 2d deletion change", function() {
				// result of reversing delta on test3a2 should match test0.
				test3r2 = delta2d.applyDeltaToObj(test3delta2,test3a2,true); // pass true to reverse.
				expect(test3r2).toBeTruthy();
				expect(JSON.stringify(test3r2)===JSON.stringify(test0)).toBeTruthy();
			});
		});
		describe("manual 2d movement", function() {
			it("should manually produce 2d movement change", function() {
				// test4a2 is modified as delta describing change is created.
				test4delta2 = delta2d.doMoveItem(3,2,"/children/2/children",test4a2);
				console.log(
					"test4delta2:",test4delta2,
					"length:"+JSON.stringify(test4delta2).length
				);
				expect(test4delta2).toBeTruthy();
				expect(delta2d.isDelta(test4delta2)).toBeTruthy();
			});
			it("should successfully apply 2d movement change", function() {
				// result of applying delta to test0 should match test4a2.
				test4f2 = delta2d.applyDeltaToObj(test4delta2,test0);
				expect(test4f2).toBeTruthy();
				expect(JSON.stringify(test4f2)===JSON.stringify(test4a2)).toBeTruthy();
			});
			it("should successfully reverse 2d movement change", function() {
				// result of reversing delta on test4a2 should match test0.
				test4r2 = delta2d.applyDeltaToObj(test4delta2,test4a2,true); // pass true to reverse.
				expect(test4r2).toBeTruthy();
				expect(JSON.stringify(test4r2)===JSON.stringify(test0)).toBeTruthy();
			});
		});
		describe("manual 2d insert", function() {
			it("should manually produce 2d insert change", function() {
				// test5a2 is modified as delta describing change is created.
				test5delta2 = delta2d.doInsertItem("inserted",1,"/children/2/children",test5a2);
				console.log(
					"test5delta2:",test5delta2,
					"length:"+JSON.stringify(test5delta2).length
				);
				expect(test5delta2).toBeTruthy();
				expect(delta2d.isDelta(test5delta2)).toBeTruthy();
			});
			it("should successfully apply 2d insert change", function() {
				// result of applying delta to test0 should match test5a2.
				test5f2 = delta2d.applyDeltaToObj(test5delta2,test0);
				expect(test5f2).toBeTruthy();
				expect(JSON.stringify(test5f2)===JSON.stringify(test5a2)).toBeTruthy();
			});
			it("should successfully reverse 2d insert change", function() {
				// result of reversing delta on test5a2 should match test0.
				test5r2 = delta2d.applyDeltaToObj(test5delta2,test5a2,true); // pass true to reverse.
				expect(test5r2).toBeTruthy();
				expect(JSON.stringify(test5r2)===JSON.stringify(test0)).toBeTruthy();
			});
		});
		describe("manual 2d update", function() {
			it("should manually produce 2d update change", function() {
				// test6a2 is modified as delta describing change is created.
				test6delta2 = delta2d.doUpdateItem("updated",1,"/children/2/children",test6a2);
				console.log(
					"test6delta2:",test6delta2,
					"length:"+JSON.stringify(test6delta2).length
				);
				expect(test6delta2).toBeTruthy();
				expect(delta2d.isDelta(test6delta2)).toBeTruthy();
			});
			it("should successfully apply 2d update change", function() {
				// result of applying delta to test0 should match test6a2.
				test6f2 = delta2d.applyDeltaToObj(test6delta2,test0);
				expect(test6f2).toBeTruthy();
				expect(JSON.stringify(test6f2)===JSON.stringify(test6a2)).toBeTruthy();
			});
			it("should successfully reverse 2d update change", function() {
				// result of reversing delta on test6a2 should match test0.
				test6r2 = delta2d.applyDeltaToObj(test6delta2,test6a2,true); // pass true to reverse.
				expect(test6r2).toBeTruthy();
				expect(JSON.stringify(test6r2)===JSON.stringify(test0)).toBeTruthy();
			});
		});
		
		/* non-functional...
		describe("manual 2d multiple", function() {
			it("should manually produce multiple 2d changes", function() {
				// test7a2 is modified as delta describing change is created.
				test7delta2 = delta2d.doDeleteItem(0,"/children/2/children",test7a2);
				console.log(
					"change 1...",
					"test7delta2:",btClass.clone(test7delta2),
					"length:"+JSON.stringify(test7delta2).length
				);
				test7delta2 = delta2d.doInsertItem("inserted",1,"/children/2/children",test7a2,test7delta2);
				console.log(
					"change 2...",
					"test7delta2:",btClass.clone(test7delta2),
					"length:"+JSON.stringify(test7delta2).length
				);
				test7delta2 = delta1d.doUpdateItem("updated",1,"/children/2/children",test7a2,test7delta2);
				console.log(
					"change 3...",
					"test7delta1:",btClass.clone(test7delta2),
					"length:"+JSON.stringify(test7delta2).length
				);
				test7delta2 = delta1d.doMoveItem(3,2,"/children/2/children",test7a2,test7delta2);
				console.log(
					"change 4...",
					"test7delta2:",btClass.clone(test7delta2),
					"length:"+JSON.stringify(test7delta2).length
				);
				expect(test7delta2).toBeTruthy();
				expect(delta1d.isDelta(test7delta2)).toBeTruthy();
			});
			it("should successfully apply multiple 2d changes", function() {
				// result of applying delta to test0 should match test7a2.
				test7f2 = delta2d.applyDeltaToObj(test7delta2,test0);
				expect(test7f2).toBeTruthy();
				expect(JSON.stringify(test7f2)===JSON.stringify(test7a2)).toBeTruthy();
			});
		});
		*/
		
	});
});


