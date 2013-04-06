ko.observable.fn.beginEdit = function (transaction) {

    var self = this;
    var commitSubscription,
        rollbackSubscription;

    // get the current value and store it for editing
    if (self.slice)
        self.editValue = ko.observableArray(self.slice());
    else
        self.editValue = ko.observable(self());

    self.dispose = function () {
        // kill this subscriptions
        commitSubscription.dispose();
        rollbackSubscription.dispose();
    };

    self.commit = function () {
        // update the actual value with the edit value
        self(self.editValue());

        // dispose the subscriptions
        self.dispose();
    };

    self.rollback = function () {
        // rollback the edit value
        self.editValue(self());

        // dispose the subscriptions
        self.dispose();
    };

    //  subscribe to the transation commit and reject calls
    commitSubscription = transaction.subscribe(self.commit,
        self,
        "commit");

    rollbackSubscription = transaction.subscribe(self.rollback,
        self,
        "rollback");

    return self;
}


function Item( name, desc, colour) {
    var self = this;
    self.name = ko.observable(name);
    self.colour = ko.observable(colour);
    self.desc = ko.observable(desc);
};

Item.prototype.beginEdit = function(transaction) {
    this.name.beginEdit(transaction);
    this.colour.beginEdit(transaction);
    this.desc.beginEdit(transaction);
}


/*----------------------------------------------------------------------*/
/* View Model
 /*----------------------------------------------------------------------*/
function FruitColourViewModel() {
    var self = this;

    //  data
    self.availableColours = [];
    self.items = ko.observableArray([]);
    self.editingItem = ko.observable();

    //  create the transaction for commit and reject
    self.editTransaction = new ko.subscribable();

    //  helpers
    self.isItemEditing = function(item) {
        return item == self.editingItem();
    };

    //  behaviour
    self.addFruit = function () {
        var item = new Item("New item","write your desc", self.availableColours[0]);
        self.items.push(item);

        //  begin editing the new item straight away
        self.editFruit(item);
    };

    self.removeFruit = function (item) {
        if (self.editingItem() == null) {
            var answer = true; // confirm('Are you sure you want to delete this item? ' + item.name());
            if (answer) {
                self.items.remove(item)
            }
        }
    };

    self.editFruit = function (item) {
        if (self.editingItem() == null) {
            // start the transaction
            item.beginEdit(self.editTransaction);

            // shows the edit fields
            self.editingItem(item);
        }
    };

    self.applyFruit = function (item) {
        //  commit the edit transaction
        self.editTransaction.notifySubscribers(null, "commit");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.cancelEdit = function (item) {
        //  reject the edit transaction
        self.editTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingItem(null);
    };

}

$(document).ready(function() {
    
    var model = new FruitColourViewModel();
    model.availableColours = ["Blue", "Green", "Orange", "Red", "Yellow"];

    var initData = [
        new Item( "Apple","asdasd", "Green"),
        new Item( "Banana","asdasd",  "Yellow"),
        new Item( "Orange", "asdasd", "Orange"),
        new Item( "Strawberry", "asdasd", "Red")
    ];

    model.items(initData);

    ko.applyBindings( model );
});


