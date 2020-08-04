var budgetController = (function () {

	var Expense = function (id, description, value) {
		this.id = id,
		this.description = description,
		this.value = value
	}

	var Income = function (id, description, value) {
		this.id = id,
		this.description = description,
		this.value = value
	}

	Expense.prototype.calcPercentage = function (totalIncome) {
		if (totalIncome > 0) {
			// this.percentage = Math.round((this.value/totalIncome) * 100);
			//I didn't use the math.round because it was rounding down smaller values like 0.38
			this.percentage = ((this.value/totalIncome) * 100).toFixed(2);
		} else {
			this.percentage = -1;
		}
	}

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	}

	var calcTotal = function (type) {
		var sum = 0;
		data.allItems[type].forEach(function (cur) {
			sum += cur.value;
		});
		data.allTotals[type] = sum;
	}


	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		allTotals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	}


	return {
		addItem: function (type, desc, value) {
			var ID, newItem;
			if(data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			if (type === 'exp') {
				newItem = new Expense(ID, desc, value);
			} else if (type === 'inc') {
				newItem = new Income(ID, desc, value);
			}

			data.allItems[type].push(newItem);

			// budgetController.calcBudget();

			return newItem;
		}, 

		calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.allTotals.inc);
            });
        },

        getPercentages: function () {
        	var allPerc = data.allItems.exp.map(function (cur) {
        		return cur.getPercentage();
        	});
        	return allPerc; 
        },

		testing: function () {
			return data;
		}, 

		calcBudget: function () {
		calcTotal('exp');
		calcTotal('inc');

		data.budget = data.allTotals.inc - data.allTotals.exp;

		if (data.allTotals.inc > 0) {
			// data.percentage = Math.round((data.allTotals.exp / data.allTotals.inc) * 100);
			//I didn't use the math.round because it was rounding down smaller values like 0.38
			data.percentage = ((data.allTotals.exp / data.allTotals.inc) * 100).toFixed(2);
		} else {
			data.percentage = -1;
		}
	},

	getBudget: function () {
		return {
			budget: data.budget,
            totalInc: data.allTotals.inc,
            totalExp: data.allTotals.exp,
            exp: data.allItems.exp,
            inc: data.allItems.inc,
            percentage: data.percentage
		}
	},

	deleteItem: function (type, id) {
		var ids, index;

		ids = data.allItems[type].map(function (cur) {
			return cur.id;
		});

		index = ids.indexOf(id);

		data.allItems[type].splice(index, 1);
	}
	}


})();



var UIController = (function () {

	var DOMStrings = {
		inputBtn: '.add__btn',
		inputDesc: '.add__description',
		inputType: '.add__type',
		inputValue: '.add__value',
		budgetValue: '.budget__value',
		incomeValue: '.budget__income--value',
		expenseValue: '.budget__expenses--value',
		expensePercent: '.budget__expenses--percentage',
		incomeList: '.income__list',
		expenseList: '.expenses__list',
		expensesPercLabel: '.item__percentage',
		deleteBtn: '.item__delete--btn',
		container: '.container',
		dateLabel: '.budget__title--month'

	}


	var formatBudget = function (obj) {
		//2 d.p for the figures
		let newObj = parseFloat(obj).toFixed(2);
		if (newObj < 0) {
			return newObj.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
		} else {
			return '+ ' + newObj.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
		}
		//return obj.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	}

	var formatInc = function (obj) {
		let newObj = parseFloat(obj).toFixed(2);
		return '+ ' + newObj.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	}

	var formatExp = function (obj) {
		let newObj = parseFloat(obj).toFixed(2);
		return '- ' + newObj.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	} 

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


	return {

		getDOMqueries: function () {
			return DOMStrings;
		},

		getInput: function () {

			return {
				type: document.querySelector(DOMStrings.inputType).value,
				desc: document.querySelector(DOMStrings.inputDesc).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			};
		},

	   	clearFields: function() {
        var fields, fieldsArr;
        
	        fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputValue);
	        console.log(fields);
	        console.log(Array.prototype.slice.call(fields));
	        
	        fieldsArr = Array.prototype.slice.call(fields);
	        
	        fieldsArr.forEach(function(current, index, array) {
	            current.value = "";
        });
        
        fieldsArr[0].focus();
        },
        

		displayBudget: function (obj) {
			var type;

			obj.budget > 0 ? type === 'inc' : type === 'exp';

			document.querySelector(DOMStrings.budgetValue).textContent = formatBudget(obj.budget);
			document.querySelector(DOMStrings.incomeValue).textContent = formatInc(obj.totalInc);
			document.querySelector(DOMStrings.expenseValue).textContent = formatExp(obj.totalExp);

			if (obj.percentage > 0) {
			document.querySelector(DOMStrings.expensePercent).textContent = obj.percentage + '%';
		} else {
			document.querySelector(DOMStrings.expensePercent).textContent = '----';
		}

		},
        
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },

		budgetList: function (obj, type) {

			var html, newHtml, element, value;

			if (type === 'inc') {
			element = DOMStrings.incomeList;
			html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			value = formatInc(obj.value);
		} else if (type === 'exp') {
			element = DOMStrings.expenseList;
			html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			value = formatExp(obj.value);	
		}

		newHtml = html.replace('%id%', obj.id);
		newHtml = newHtml.replace('%description%', obj.description);
		newHtml = newHtml.replace('%value%', value);


		document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

	}, 

	deleteItem: function (selectorID) {
		var el = document.getElementById(selectorID);
		el.parentNode.removeChild(el);
	},

	changedType: function () {
		var fields = document.querySelectorAll(
			DOMStrings.inputDesc + ',' +
			DOMStrings.inputType + ',' +
			DOMStrings.inputValue);

		nodeListForEach(fields, function(cur) {
			cur.classList.toggle('red-focus');
		});

		document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
	},

	displayMonth: function () {
		var now, month, months, year;

		now = new Date();
		months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		month = now.getMonth();
		year = now.getFullYear();

		document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
	}
}
})();


var controller = (function (bdgtCtrl, UICtrl) {

	var DOM, value;

	var setupEventListeners = function () {

	DOM = UICtrl.getDOMqueries();

	document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
	document.addEventListener('keypress', function (e) {
		//some code here
		if (e.keycode === 13 || e.which === 13) {
			ctrlAddItem();
		}
	});
	document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);




	};

	var updateBudget = function () {
		bdgtCtrl.calcBudget();
		var input = UICtrl.getInput();

		var budget = bdgtCtrl.getBudget();

		UICtrl.displayBudget(budget);
	}

	var updatePercentages = function () {
		bdgtCtrl.calculatePercentages();
		var percentages = bdgtCtrl.getPercentages();
		UICtrl.displayPercentages(percentages);


	}

	var ctrlAddItem = function () {
			var input, newItem;
			input = UICtrl.getInput();
			// console.log(input);

			newItem = bdgtCtrl.addItem(input.type, input.desc, input.value);
			UICtrl.budgetList(newItem, input.type);

			UICtrl.clearFields();

			updateBudget();
			updatePercentages();
		}

	var ctrlDeleteItem = function (e) {
		var itemID, splitID, type, ID;

		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
		splitID = itemID.split('-');

		type = splitID[0];
		ID = parseInt(splitID[1]);

		bdgtCtrl.deleteItem(type, ID);
		UICtrl.deleteItem(itemID);
		updateBudget();
		updatePercentages();
	}

	// var changedSpending = function (e) {
	// 	var description = document.querySelector(DOM.inputDesc);
	// 	var value = document.querySelector(DOM.inputValue);
	// 	var type = document.querySelector(DOM.inputType);
	// 	var btn = document.querySelector(DOM.inputBtn);

	// 	var divArr = [description, value, type];
	// 	if (e.target.value = 'inc') {
	// 		for(i=0; i<divArr.length; i++) {
	// 			divArr[i].style.border = "1px solid #e7e7e7";
	// 			btn.style.color = "#28B9B5";
	// 		};
 
	// 	} else if (e.target.value = 'exp') {
	// 		for(i=0; i<divArr.length; i++) {
	// 			divArr[i].style.border = "1px solid red";
	// 			btn.style.color = "red";
	// 		};
	// 	}

	// }



	return {
		init: function () {
			console.log('Application is starting');
			setupEventListeners();
	
		var reset =  {
		budget: '-0.00',
        totalInc: '+0.00',
        totalExp: '-0.00',
        percentage: '---'
		}

		UICtrl.displayBudget(reset);
		UICtrl.displayMonth();


			// return {
			// val[budget]: 0,
   //          val[totalInc]: 0,
   //          val[totalExp]: 0,
   //          val[percentage]: 0
			// }
		}
	}

	

})(budgetController, UIController);

controller.init();