ko.observable.fn.beginEdit = function (transaction) {
    var self = this;
    var commitSubscription,
        rollbackSubscription;
    if (self.slice)
        self.editValue = ko.observableArray(self.slice());
    else
        self.editValue = ko.observable(self());

    self.dispose = function () {
        commitSubscription.dispose();
        rollbackSubscription.dispose();
    };

    self.commit = function () {
        self(self.editValue());
        self.dispose();
    };
    self.rollback = function () {
        self.editValue(self());
        self.dispose();
    };
    commitSubscription = transaction.subscribe(self.commit,
        self,
        "commit");

    rollbackSubscription = transaction.subscribe(self.rollback,
        self,
        "rollback");

    return self;
}
function Item( name, desc, behaviour, colour) {
    var self = this;
    self.name = ko.observable(name);
    self.desc = ko.observable(desc);
    self.behaviour = ko.observable(behaviour);
    self.colour = ko.observable(colour);
};

Item.prototype.beginEdit = function(transaction) {
    this.name.beginEdit(transaction);
    this.desc.beginEdit(transaction);
    this.colour.beginEdit(transaction);
}

function ItemColourViewModel() {
    var self = this;

    self.availableColours = [];
    self.items = ko.observableArray([]);
    self.editingItem = ko.observable();

    self.editTransaction = new ko.subscribable();

    self.isItemEditing = function(item) {
        return item == self.editingItem();
    };

    self.addItem = function () {
        var item = new Item("New item","write your desc","Status",self.availableColours[0]);
        self.items.push(item);

        //  begin editing the new item straight away
        self.editItem(item);
    };

    self.removeItem = function (item) {
        if (self.editingItem() == null) {
            var answer = true; // confirm('Are you sure you want to delete this item? ' + item.name());
            if (answer) {
                self.items.remove(item)
            }
        }
    };

    self.editItem = function (item) {
        if (self.editingItem() == null) {
            item.beginEdit(self.editTransaction);
            self.editingItem(item);
        }
    };

    self.applyItem = function () {
        self.editTransaction.notifySubscribers(null, "commit");
        self.editingItem(null);
    };

    self.cancelEdit = function () {
        self.editTransaction.notifySubscribers(null, "rollback");
        self.editingItem(null);
    };

}

$(document).ready(function() {
    
    var model = new ItemColourViewModel();
    model.availableColours = ["Blue", "Green", "Orange", "Red", "Yellow"];

    var initData = [
        new Item( "Apple","asdasd","лллллл", "Green"),
        new Item( "Banana","asdasd","лллллл",  "Yellow"),
        new Item( "Orange", "asdasd","лллллл", "Orange"),
        new Item( "Strawberry", "asdasd","лллллл", "Red")
    ];

    model.items(initData);

    ko.applyBindings( model );
});


