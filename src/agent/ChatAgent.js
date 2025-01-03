
const createChatAgent = () => {

    const CS571_WITAI_ACCESS_TOKEN = "KM7BTV4URJSJXDNIVMOEDVKJTRTIIPCU"; // Put your CLIENT access token here.

    let availableItems = [];
    let cart = {};

    // Copied a lot from the lecture code examples

    const handleInitialize = async () => {
        const resp = await fetch("https://cs571api.cs.wisc.edu/rest/f24/hw10/items", {
            headers: {
                "X-CS571-ID": "bid_847d09ed085dacaedc451fd225893d7a6d17095344e4ca85c2843d44093da7cb"
            }
        })
        availableItems = await resp.json()

        // fill the cart with the correct initial values
        // used the same keys as the API description
        // cart will only consist of availableItems
        for (let i = 0; i < availableItems.length; i++) {
            cart[availableItems[i].name] = 0
        }

        // initial message
        return "Welcome to BadgerMart Voice! :) Type your question, or ask for help if you're lost!"
    }

    const handleReceive = async (prompt) => {
        // TODO: Replace this with your code to handle a user's message!
        const resp = await fetch("https://api.wit.ai/message?q=" + encodeURIComponent(prompt), {
            headers: {
                "Authorization": "Bearer " + CS571_WITAI_ACCESS_TOKEN
            }
        })
        const data = await resp.json();

        // based on the user's prompt, a different function will be executed
        if (data.intents.length > 0) {
            switch(data.intents[0].name) {
                case "get_help": return getHelp();
                case "get_items": return getItems();
                case "get_price": return getPrice(data);
                case "add_item": return addItem(data);
                case "remove_item": return removeItem(data);
                case "view_cart": return viewCart();
                case "checkout": return checkout();
            }
        }

        // fallback message incase the prompt doesn't match anything 
        return "Sorry, I didn't get that. Type 'help' to see what you can do!"
    }

    const getHelp = async () => {
        // help message
        return "In BadgerMart Voice, you can get the list of items, the price of an item, add or remove an item from your cart, and checkout!";
    }

    const getItems = async () => {
        // iterate through the availableItems and add each name to a new list
        // got idea from ChatGPT
        let itemList = []
        for (let i = 0; i < availableItems.length; i++) {
            itemList.push(availableItems[i].name.toLowerCase())
        }
        // Used this source to figure out how to combine all the elements in an array into one string: https://www.w3schools.com/jsref/jsref_join.asp
        return "We have " + itemList.join(" and ") + " for sale!"
    }

    const getPrice = async (promptData) => {
        // copied these snippets from lecture code example
        const hasSpecifiedType = promptData.entities["item_type:item_type"] ? true : false
        const itemType = hasSpecifiedType ? promptData.entities["item_type:item_type"][0].value : "any"
        
        // check if the item specified by the user is part of the available items
        // then find the price
        for (let i = 0; i < availableItems.length; i++) {
            if (itemType === availableItems[i].name.toLowerCase()) {
                return availableItems[i].name + "s cost $" + availableItems[i].price.toFixed(2) + " each."
            }
        }

        // if the item is not available
        return "Sorry, we don't have that item in stock."
    }

    const addItem = async (promptData) => {
        // copied these snippets from lecture code example
        const hasSpecifiedType = promptData.entities["item_type:item_type"] ? true : false
        const hasSpecifiedNumber = promptData.entities["wit$number:number"] ? true : false;

        const itemType = hasSpecifiedType ? promptData.entities["item_type:item_type"][0].value : "any"
        // rounds down the number if it is a decimal 
        // also defaults to 1 if a number isn't provided by the user
        const numItems = hasSpecifiedNumber ? Math.floor(promptData.entities["wit$number:number"][0].value) : 1;

        // if the number of items requested is less than or eqaul to 0
        if (numItems <= 0) {
            return "I cannot add that quantity of " + itemType + " to your cart."
        }

        // Used this source to figure out how to make first letter capital: https://www.geeksforgeeks.org/how-to-make-first-letter-of-a-string-uppercase-in-javascript/
        // Do this in order to match the keys in the cart objects
        const cartItem = itemType.charAt(0).toUpperCase() + itemType.slice(1)

        // if the item is available to be added then increment 
        if (cartItem in cart) {
            cart[cartItem] += numItems

            return "Sure, adding " + numItems + " " + itemType + " to your cart."
        }

        // if the item cannot be added to the cart
        return "Sorry, we don't have that item in stock."
    }

    const removeItem = async (promptData) => {
        // copied these snippets from lecture code example
        const hasSpecifiedType = promptData.entities["item_type:item_type"] ? true : false
        const hasSpecifiedNumber = promptData.entities["wit$number:number"] ? true : false;

        const itemType = hasSpecifiedType ? promptData.entities["item_type:item_type"][0].value : "any"
        const numItems = hasSpecifiedNumber ? Math.floor(promptData.entities["wit$number:number"][0].value) : 1;

        // Used this source to get the values of an object: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
        // Altered code from this source: https://stackoverflow.com/questions/14832603/check-if-all-values-of-array-are-equal
        // got the logic for this section from previous HWs 
        // checks if cart is empty 
        const values = Object.values(cart)
        const empty = values => values.every((v) => v === 0)
        if (empty(values) === true) {
            return "Your cart is empty"
        }

        // if the number of items removed is less than or eqaul to 0
        if (numItems <= 0) {
            return "I cannot remove that number of " + itemType + " from your cart."
        }

        const cartItem = itemType.charAt(0).toUpperCase() + itemType.slice(1)

        // If you try to remove an item that is not currently in the cart
        if (cart[cartItem] === 0) {
            return "You don't have any " + itemType + "s in your cart!" 
        }

        // If the user has asked to remove more of item than is present in the cart
        // If true remove all of the item from the cart
        if (numItems > cart[cartItem]) {
            let prevAmount = cart[cartItem]
            cart[cartItem] -= cart[cartItem]
            return "Removed " + prevAmount + " " + itemType + " from your cart as that's all you had!"
        }

        // If there some amount in the cart, then decrement 
        if (cartItem in cart) {
            cart[cartItem] -= numItems

            return "Sure, removing " + numItems + " " + itemType + " from your cart."
        }

        // if the item is not part of availableItems
        return "Sorry, we don't have that item in stock."
    }

    const viewCart = async () => {
        let total = 0
        // used same logic from getItems for this part
        let itemList = []

        // Used this source to get the keys and values from an object: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
        for (const [key, value] of Object.entries(cart)) {
            // checks if there some amount of the item in the cart
            if (value > 0) {
                for (let i = 0; i < availableItems.length; i++) {
                    // only use the corresponding key to calculate the price
                    if (key == availableItems[i].name) {
                        total += availableItems[i].price * value
                    }
                }
                // create a string with the amount of an item and the item itself
                let item = value.toString() + " " + key.toLowerCase()
                itemList.push(item)
            }
        }

        // copied from removeItem
        const values = Object.values(cart)
        const empty = values => values.every((v) => v === 0)
        if (empty(values) === true) {
            return "You have nothing in your cart, totaling $0.00"
        }

        return "You have " + itemList.join(" and ") + " in you cart, totaling $" + total.toFixed(2).toString()
    }

    const checkout = async () => {
        // copied from previous functions
        const values = Object.values(cart)
        const empty = values => values.every((v) => v === 0)
        if (empty(values) === true) {
            return "You don't have any items in your cart to purchase!"
        }

        // Used the API documentation to help with this part
        // I made the cart object as compatible as possible with this part 
        const resp = await fetch("https://cs571api.cs.wisc.edu/rest/f24/hw10/checkout", {
            method: "POST",
            headers: {
                "X-CS571-ID": "bid_847d09ed085dacaedc451fd225893d7a6d17095344e4ca85c2843d44093da7cb",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cart)
        })
        // if succesful then clear the cart and provide the confirmationId
        if (resp.status === 200) {
            let result = await resp.json()
            for (let i = 0; i < availableItems.length; i++) {
                cart[availableItems[i].name] = 0
            }
            return "Success! Your confirmation ID is " + result.confirmationId
        }
        else {
            return "Something went wrong!"
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createChatAgent;
