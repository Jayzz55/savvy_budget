// Budget Model
// ----------

var Budget = Backbone.Model.extend({
  // Default attributes for the category item.
  defaults: function() {
    return {
      id: $('.budget-view').attr('data-id'),
      title: "My budget",
      budget: 0.00
    };
  },

  url: '/api/budgets/'+$('.budget-view').attr('data-id')

});

// Expense Model
// ----------

var Expense = Backbone.Model.extend({
  // Default attributes for the category item.
  defaults: function() {
    return {
      title: "empty expense...",
      cost: 0.00
    };
  },
  urlRoot: '/api/expenses'
});


// Category Model
// ----------

var Category = Backbone.Model.extend({
  // Default attributes for the category item.
  defaults: function() {
    return {
      title: "empty category...",
      sub_total: 0.00,
      budget_id: $('.budget-view').attr('data-id')
    };
  },
  urlRoot: '/api/categories'
});

// Expense Collection
// ---------------

var ExpenseList = Backbone.Collection.extend({
  model: Expense,
  url: '/api/expenses',

});

// Create our global collection of **Expenses**.
var Expenses = new ExpenseList;

// Expense Item View
// --------------

var ExpenseView = Backbone.View.extend({

  //... is a list tag.
  tagName:  "li",

  // Cache the template function for a single item.
  template: _.template($('#expense-item-template').html()),

  // The DOM events specific to an item.
  events: {
    "dblclick .expense-view"  : "editExpense",
    "doubleTap .expense-view"  : "editExpense",
    "longTap .expense-view"  : "editExpense",
    "dblclick .cost-view"  : "editCost",
    "doubleTap .cost-view"  : "editCost",
    "longTap .cost-view"  : "editCost",
    "click a.destroy-expense" : "clear",
    "keypress .expense-edit"  : "updateExpenseOnEnter",
    "blur .expense-edit"      : "closeExpense",
    "keypress .cost-edit"  : "updateCostOnEnter",
    "blur .cost-edit"      : "closeCost"
  },

  // The CategoryView listens for changes to its model, re-rendering. Since there's
  // a one-to-one correspondence between a **Category** and a **CategoryView** in this
  // app, we set a direct reference on the model for convenience.
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
    // this.on('updateSubtotal',this.testing);
  },

  // Re-render the titles of the category item.
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.expenseInput = this.$el.find('.expense-edit');
    this.costInput = this.$el.find('.cost-edit');
    return this;
  },

  testing: function(){
    console.log('Triggered');
  },

  // Switch this view into `"editing"` mode, displaying the input field.
  editExpense: function() {
    this.$el.find('.expense-view').addClass("editing");
    this.expenseInput.focus();
  },

  editCost: function() {
    this.$el.find('.cost-view').addClass("editing");
    this.costInput.focus();
  },

  closeExpense: function() {
    var value = this.expenseInput.val();
    if (!value) {
      this.clear();
    } else {
      this.model.save({title: value});
      this.$el.find('.expense-view').removeClass("editing");
    }
  },

  closeCost: function() {
    // console.log('Just Close cost');
    var value = this.costInput.val();
    var oldCost = Number(this.$el.find('.cost-label').html().substr(1));
    this.model.save({cost: value});
    var newCost = Number(this.model.get('cost'));
    this.$el.find('.cost-view').removeClass("editing");
    Backbone.pubSub.trigger('updateSubtotal', { oldCost: oldCost, newCost: newCost, categoryId: this.model.get('category_id') });
    Backbone.pubSub.trigger('checkBudget');
    
  },

  // If you hit `enter`, we're through editing the item.
  updateExpenseOnEnter: function(e) {
    if (e.keyCode == 13) this.expenseInput.blur();
  },

  updateCostOnEnter: function(e) {
    if (e.keyCode == 13) this.costInput.blur();
  },

  // Remove the item, destroy the model.
  clear: function() {
    var oldCost = Number(this.$el.find('.cost-label').html().substr(1));
    var newCost = 0;
    Backbone.pubSub.trigger('updateSubtotal', { oldCost: oldCost, newCost: newCost, categoryId: this.model.get('category_id') });
    this.model.destroy();
  },

});

// create a global event mechanism
Backbone.pubSub = _.extend({}, Backbone.Events);

// Category Collection
// ---------------

var CategoryList = Backbone.Collection.extend({
  model: Category,
  url: '/api/categories',

});

// Create our global collection of **Categories**.
var Categories = new CategoryList;

// Category Item View
// --------------

// The DOM element for a category item...
var CategoryView = Backbone.View.extend({

  //... is a list tag.
  tagName:  "li",

  // Cache the template function for a single item.
  template: _.template($('#category-item-template').html()),

  // The DOM events specific to an item.
  events: {
    "dblclick .category-view"  : "edit",
    "doubleTap .category-view"  : "edit",
    "longTap .category-view"  : "edit",
    "click a.destroy-category" : "clear",
    "keypress .category-edit"  : "updateOnEnter",
    "blur .category-edit"      : "close",
    "click .category-toggle" : "toggle",
    "keypress #new-expense":  "createOnEnter"
  },

  // The CategoryView listens for changes to its model, re-rendering. Since there's
  // a one-to-one correspondence between a **Category** and a **CategoryView** in this
  // app, we set a direct reference on the model for convenience.
  initialize: function() {

    this.listenTo(this.model, 'change', this.updateRender);
    this.listenTo(this.model, 'destroy', this.remove);

    this.listenTo(Expenses, 'add', this.addOne);
    this.listenTo(Expenses, 'reset', this.addAll);
    Backbone.pubSub.on('updateSubtotal', this.updateSubtotal, this);

    Expenses.fetch();
  },

  // Re-render the titles of the category item.
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.input = this.$('.category-edit');
    this.expenseInput = this.$("#new-expense");
    return this;
  },

  updateSubtotal: function(event){
    if (this.model.id !== event.categoryId) return;
    var updatedSubtotal = Number(this.model.get('sub_total')).toFixed(1) - event.oldCost + event.newCost;
    this.model.set('sub_total', updatedSubtotal);
    this.$el.find('.category-subtotal').html('$' + updatedSubtotal);
    this.model.save();
  },

  updateRender: function(){
    this.$el.find('.category-label').html(this.model.get('title'));
    this.$el.find('.category-subtotal').html('$' + Number(this.model.get('sub_total')).toFixed(1));
  },

  // Switch this view into `"editing"` mode, displaying the input field.
  edit: function() {
    this.$el.addClass("editing");
    this.input.focus();
  },

  // Close the `"editing"` mode, saving changes to the category.
  close: function() {
    var value = this.input.val();
    if (!value) {
      this.clear();
    } else {
      this.model.save({title: value});
      this.$el.removeClass("editing");
    }
  },

  // If you hit `enter`, we're through editing the item.
  updateOnEnter: function(e) {
    if (e.keyCode == 13) this.close();
  },

  // Remove the item, destroy the model.
  clear: function() {
    _.invoke(Expenses.where({category_id: this.model.id}), 'destroy');
    this.model.destroy();
  },

  // Toggle the category item
  toggle: function(){
    if (this.$el.find("span").hasClass("collapse")){
      this.expand();
    }else{
      this.collapse();
    }
  },

  // Expand the category item to show list of expenses and expense input box
  expand: function(){
    this.$el.find("span").removeClass("collapse");
    this.$el.find("span").addClass("expand");
    this.$el.find(".category-toggle").html("-");
    this.$el.find("#expense-list").addClass("open");
  },

  // Collapse the list of expenses and expense input box
  collapse: function(){
    this.$el.find("span").removeClass("expand");
    this.$el.find("span").addClass("collapse");
    this.$el.find(".category-toggle").html("+");
    this.$el.find("#expense-list").removeClass("open");
  },
 
  createOnEnter: function(e) {
    if (e.keyCode != 13) return;
    if (!this.expenseInput.val()) return;
    Expenses.create({title: this.expenseInput.val(), category_id: this.model.id});
    this.expenseInput.val('');
  },

  addOne: function(expense) {
    if (this.model.id !== expense.get('category_id')) return;
    var expenseView = new ExpenseView({model: expense});
    this.$("#expense-list").append(expenseView.render().el);
    // this.model.set('sub_total', Number(this.model.get('sub_total')) + Number(expense.get('cost')));
  },

  addAll: function() {
    Expenses.each(this.addOne, this);  
  }

});

// The Application
// ---------------

// Our overall **AppView** is the top-level piece of UI.
var AppView = Backbone.View.extend({

  // Instead of generating a new element, bind to the existing skeleton of
  // the App already present in the HTML.
  el: $("#categoryapp"),

  // Our template for the line of statistics at the bottom of the app.
  statsTemplate: _.template($('#stats-template').html()),

  // Delegated events for creating new items, and clearing completed ones.
  events: {
    "keypress #new-category":  "createOnEnter",
    "dblclick .budget-view"  : "edit",
    "doubleTap .budget-view"  : "edit",
    "longTap .budget-view"  : "edit",
    "keypress .budget-edit"  : "updateOnEnter",
    "blur .budget-edit"      : "close"
  },

  
  initialize: function() {

    this.budgetView = this.$el.find('.budget-view');
    this.budgetLabel = this.$el.find('.budget-label');
    this.budgetInput = this.$el.find('.budget-edit');
    this.input = this.$("#new-category");

    this.listenTo(Categories, 'add', this.addOne);
    this.listenTo(Categories, 'reset', this.addAll);
    this.listenTo(Categories, 'all', this.render);
    Backbone.pubSub.on('checkBudget', this.checkBudget, this);

    this.footer = this.$('footer');
    this.main = $('#main');

    Categories.fetch();
  },

  // Re-rendering the App just means refreshing the statistics -- the rest
  // of the app doesn't change.
  render: function() {
    var totalCategories = Categories.length;

    if (Categories.length) {
      this.main.show();
      this.footer.show();
      this.footer.html(this.statsTemplate({totalCategories: totalCategories}));
      this.checkBudget();
      $('.spent-label').show();
      $("#total-expenses").html(this.totalExpenses().toFixed(1));
    } else {
      this.main.hide();
      this.footer.hide();
      $('.spent-label').hide();

    }

  },

  checkBudget: function(){
    var budgetSet = Number(this.budgetLabel.html().substr(1));
    if(this.totalExpenses() <= budgetSet){
      this.$el.removeClass("overbudget");
    } else {
      this.$el.addClass("overbudget");
    };

  },

  totalExpenses: function(){
    var collect = [];
    var totalExpenses = 0;
    Categories.each(function(category){collect.push(Number(category.get('sub_total')))});
    return totalExpenses = collect.reduce( function(total, num){ return total + num }, 0);
  },

  // Add a single category item to the list by creating a view for it, and
  // appending its element to the `<ul>`.
  addOne: function(category) {
    var view = new CategoryView({model: category});
    this.$("#category-list").append(view.render().el);
  },

  // Add all items in the **Categories** collection at once.
  addAll: function() {
    Categories.each(this.addOne, this);
  },

  createOnEnter: function(e) {
    if (e.keyCode != 13) return;
    if (!this.input.val()) return;

    Categories.create({title: this.input.val()});
    this.input.val('');
  },

  // Switch this view into `"editing"` mode, displaying the input field.
  edit: function() {
    this.budgetView.addClass("editing");
    this.budgetInput.focus();
  },

  // Close the `"editing"` mode, saving changes to the category.
  close: function() {
    var value = this.budgetInput.val();
    // Instantiate budget model
    budget = new Budget();
    budget.save({budget: value});
    this.budgetView.removeClass("editing");
    this.budgetLabel.html('$'+budget.get("budget"));

  },

  // If you hit `enter`, we're through editing the item.
  updateOnEnter: function(e) {
    if (e.keyCode == 13) this.budgetInput.blur();
  },

});

// Finally, we kick things off by creating the **App**.
var App = new AppView;


