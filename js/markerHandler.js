var toyNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    if (toyNumber === null) {
      this.askToyNumber();
    }

    var toys = await this.getToy();

    this.el.addEventListener("markerFound", () => {
      if (toyNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askToyNumber: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";

    swal({
      title: "Welcome to Toys4Ever!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your toy number",
          type: "number",
          min: 1
        }
      }
    }).then(inputValue => {
      toyNumber = inputValue;
    });
  },

  handleMarkerFound: function (dishes, markerId) {
    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    // Sunday - Saturday : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    
    var toy = toys.filter(toy => toy.id === markerId)[0];

    if (toy.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: toy.toy_name.toUpperCase(),
        text: "This toy is sold out!!!",
        timer: 2500,
        buttons: false
      });
    } else {
      // make model visible
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("visible", true);

      // Make description Container visible
      var descriptionContainer = document.querySelector(
        `#main-plane-${toy.id}`
      );
      descriptionContainer.setAttribute("visible", true);

      // Make Price Plane visible
      var pricePlane = document.querySelector(`#price-plane-${toy.id}`);
      pricePlane.setAttribute("visible", true);

      // Make Rating Plane visible
      var ratingPlane = document.querySelector(`#rating-plane-${toy.id}`);
      ratingPlane.setAttribute("visible", false);

      // Make review Plane visible
      var reviewPlane = document.querySelector(`#review-plane-${toy.id}`);
      reviewPlane.setAttribute("visible", false);

      // Changing Model scale to initial scale
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);

      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      var orderSummaryButtton = document.getElementById("order-summary-button");
      var payButton = document.getElementById("pay-button");

      // Handling Click Events
      ratingButton.addEventListener("click", () => this.handleRatings(toy));

      orderButtton.addEventListener("click", () => {
        var tNumber;
        toyNumber <= 9 ? (tNumber = `T0${toyNumber}`) : `T${toyNumber}`;
        this.handleOrder(tNumber, toy);

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For YourOrder !",
          text: "Your order will arrive soon!",
          timer: 2000,
          buttons: false
        });
      });

      orderSummaryButtton.addEventListener("click", () =>
        this.handleOrderSummary()
      );

      payButton.addEventListener("click", () => this.handlePayment());
    }
  },
  
  handleOrder: function (tNumber, toy) {
    // Reading currnt table order details
    firebase
      .firestore()
      .collection("toys")
      .doc(tNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][toy.id]) {
          // Increasing Current Quantity
          details["current_orders"][toy.id]["quantity"] += 1;

          //Calculating Subtotal of item
          var currentQuantity = details["current_orders"][toy.id]["quantity"];

          details["current_orders"][toy.id]["subtotal"] =
            currentQuantity * toy.price;
        } else {
          details["current_orders"][toy.id] = {
            item: toy.toy_name,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price * 1
          };
        }

        details.total_bill += toy.price;

        // Updating Db
        firebase
          .firestore()
          .collection("toys")
          .doc(doc.id)
          .update(details);
      });
  },
  getDishes: async function () {
    return await firebase
    firebase
    .firestore()
    .collection("toys")
    .doc(doc.id)
    .update(details);

  },
  getOrderSummary: async function (tNumber) {
    return await firebase
    firebase
          .firestore()
          .collection("toys")
          .doc(doc.id)
          .update(details);
  },
  handleOrderSummary: async function () {
    // Changing modal div visibility
    var modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";

    var tableBodyTag = document.getElementById("bill-table-body");

    // Removing old tr data
    tableBodyTag.innerHTML = "";

    // Getting Table Number
    var tNumber;
    toyNumber <= 9 ? (tNumber = `T0${toyNumber}`) : `T${toyNumber}`;

    // Getting Order Summary from database
    var orderSummary = await this.getOrderSummary(tNumber);

    var currentOrders = Object.keys(orderSummary.current_orders);

    currentOrders.map(i => {
      var tr = document.createElement("tr");
      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      item.innerHTML = orderSummary.current_orders[i].item;
      price.innerHTML = "$" + orderSummary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
      subtotal.setAttribute("class", "text-center");

      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);
      tableBodyTag.appendChild(tr);
    });

    var totalTr = document.createElement("tr");

    var td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    var td2 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    var td3 = document.createElement("td");
    td1.setAttribute("class", "no-line text-cente");

    var strongTag = document.createElement("strong");
    strongTag.innerHTML = "Total";
    td3.appendChild(strongTag);

    var td4 = document.createElement("td");
    td1.setAttribute("class", "no-line text-right");
    td4.innerHTML = "$" + orderSummary.total_bill;

    totalTr.appendChild(td1);
    totalTr.appendChild(td2);
    totalTr.appendChild(td3);
    totalTr.appendChild(td4);

    tableBodyTag.appendChild(totalTr);
  },
  handlePayment: function () {
    // Close Modal
    document.getElementById("modal-div").style.display = "none";

    // Getting Table Number
    var tNumber;
    toyNumber <= 9 ? (tNumber = `T0${toyNumber}`) : `T${toyNumber}`;

    // Reseting current orders and total bill
    firebase
      .firestore()
      .collection("toys")
      .doc(tNumber)
      .update({
        current_orders: {},
        total_bill: 0
      })
      .then(() => {
        swal({
          icon: "success",
          title: "Thanks For Paying !",
          text: "We Hope You Enjoyed Your Toy !!",
          timer: 2500,
          buttons: false
        });
      });
  },

  handleRatings: async function (toy) {

    // Getting Table Number
    var tNumber;
    toyNumber <= 9 ? (tNumber = `T0${toyNumber}`) : `T${toyNumber}`;
    
    // Getting Order Summary from database
    var orderSummary = await this.getOrderSummary(tNumber);

    var currentOrders = Object.keys(orderSummary.current_orders);    

    if (currentOrders.length > 0 && currentOrders==toy.id) {
      
      // Close Modal
      document.getElementById("rating-modal-div").style.display = "flex";
      document.getElementById("rating-input").value = "0";
      document.getElementById("feedback-input").value = "";

      //Submit button click event
      var saveRatingButton = document.getElementById("save-rating-button");

      saveRatingButton.addEventListener("click", () => {
        document.getElementById("rating-modal-div").style.display = "none";
        //Get the input value(Review & Rating)
        var rating = document.getElementById("rating-input").value;
        var feedback = document.getElementById("feedback-input").value;

        //Update db
        firebase
          .firestore()
          .collection("dishes")
          .doc(dish.id)
          .update({
            last_review: feedback,
            last_rating: rating
          })
          .then(() => {
            swal({
              icon: "success",
              title: "Thanks For Rating!",
              text: "We Hope You Like Your Toy !!",
              timer: 2500,
              buttons: false
            });
          });
      });
    } else{
      swal({
        icon: "warning",
        title: "Oops!",
        text: "No toy found to give ratings!!",
        timer: 2500,
        buttons: false
      });
    }

  },
  handleMarkerLost: function () {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});