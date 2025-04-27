// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductOrder {
    address public owner;

    struct Product {
        uint id;
        string name;
        uint price;
        bool isAvailable;
    }

    struct Order {
        uint orderId;
        address buyer;
        uint productId;
        bool isPaid;
    }

    mapping(uint => Product) public products;
    mapping(uint => Order) public orders;

    uint public productCount;
    uint public orderCount;

    event ProductAdded(uint productId, string name, uint price);
    event ProductOrdered(uint orderId, address buyer, uint productId);
    event PaymentReceived(uint orderId, address buyer, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function addProduct(string memory _name, uint _price) public onlyOwner {
        require(_price > 0, "Price must be greater than 0");

        productCount++;
        products[productCount] = Product(productCount, _name, _price, true);

        emit ProductAdded(productCount, _name, _price);
    }

    function orderProduct(uint _productId) public {
        require(products[_productId].isAvailable, "Product not available");

        orderCount++;
        orders[orderCount] = Order(orderCount, msg.sender, _productId, false);

        emit ProductOrdered(orderCount, msg.sender, _productId);
    }

    function payForOrder(uint _orderId) public payable {
        Order storage order = orders[_orderId];
        Product memory product = products[order.productId];

        require(order.buyer == msg.sender, "Not your order");
        require(!order.isPaid, "Order already paid");
        require(msg.value == product.price, "Incorrect amount");

        order.isPaid = true;

        emit PaymentReceived(_orderId, msg.sender, msg.value);
    }

    function getProduct(uint _productId) public view returns (string memory name, uint price, bool isAvailable) {
        Product memory product = products[_productId];
        return (product.name, product.price, product.isAvailable);
    }

    function getOrder(uint _orderId) public view returns (Order memory) {
        return orders[_orderId];
    }

    function getProductCount() public view returns (uint) {
    return productCount;
    }

}
