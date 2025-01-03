# CS571 F24 HW10 API Documentation

## At a Glance

All routes are relative to `https://cs571api.cs.wisc.edu/rest/f24/hw10/`

| Method | URL | Purpose | Return Codes |
| --- | --- | --- | --- |
| `GET`| `/items` | Get all items. | 200, 304 |
| `POST` | `/checkout` | Purchases requested items and returns a purchase ID. | 200, 400 |

An unexpected server error `500` or "hung" response *may* occur during any of these requests. It is likely to do with your request. Make sure that you have included the appropriate headers and, if you are doing a POST, that you have a properly formatted and stringified JSON body. If the error persists, please contact a member of the course staff.

Make sure to include a `Content-Type` header where appropriate. 

## In-Depth Explanations

### Getting all Items
`GET` `https://cs571api.cs.wisc.edu/rest/f24/hw10/items`

A `200` (new) or `304` (cached) response will be sent with the list of all items. Each item contains a `name`, `description`, and `price`. There is no `upperLimit`. You may assume that each `name` is unique.

```json
[
    {
        "name": "Apple",
        "description": "A crisp, juicy fruit with a sweet to tart taste, commonly red, green, or yellow in skin color.",
        "price": 0.75
    },
    {
        "name": "Bagel",
        "description": "A dense, chewy bread roll, traditionally shaped into a ring, often topped with seeds or seasonings.",
        "price": 0.50
    },
    {
        "name": "Coconut",
        "description": "A large, tropical fruit with a hard shell, edible white flesh, and a clear liquid inside, known as coconut water.",
        "price": 2.50
    },
    {
        "name": "Donut",
        "description": "A sweet, fried dough treat, typically circular with a hole in the center, and often glazed or topped with sugar and other sweets.",
        "price": 1.50
    },
    {
        "name": "Egg",
        "description": "A versatile, oval-shaped ingredient with a hard outer shell, containing a protein-rich white and a nutrient-dense yolk inside.",
        "price": 1.00
    }
]
```

### Purchasing Items
`POST` `https://cs571api.cs.wisc.edu/rest/f24/hw10/checkout`

You must checkout with a specified amount for *each* item.

Requests must include a header `Content-Type: application/json`.

**Example Request Body**

```json
{
    "Apple": 0,
    "Bagel": 2,
    "Coconut": 1,
    "Donut": 0,
    "Egg": 4
}
```

If the purchase is successful, the following `200` will be sent...
```json
{
    "msg": "Successfully purchased!",
    "dt": 1713205795333,
    "confirmationId": "fd6fae64-1304-46c0-bcbc-5795beaa480c"
}
```

The provided `dt` and `confirmationId` is unique to each purchase.

In the case of an erroneous request, the following `400` response will be sent...

```json
{
    "msg": "The purchase was unsuccessful. Please refer to the documentation for details."
}
```

This `400` may be sent if...
 - Any item name is ommitted. Item names are case-sensitive and *must* be included even if the quantity is 0.
 - Any quantity is negative or not an integer.
 - No items are ordered (e.g. a *total* quantity of 0).
