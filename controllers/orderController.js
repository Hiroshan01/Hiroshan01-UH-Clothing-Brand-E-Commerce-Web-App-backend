import Order from "../model/order.js";
import Product from "../model/product.js";

export async function createOrder(req, res) {
  if (req.user == null) {
    res.status(403).json({
      message: "Please Login and try again",
    });
    return;
  }

  const orderInfo = req.body;

  // Validate required fields
  if (!orderInfo.products || orderInfo.products.length === 0) {
    res.status(400).json({
      message: "Products array is required and cannot be empty",
    });
    return;
  }

  if (!orderInfo.phone) {
    res.status(400).json({
      message: "Phone number is required",
    });
    return;
  }

  if (!orderInfo.address) {
    res.status(400).json({
      message: "Address is required",
    });
    return;
  }

  if (orderInfo.name == null) {
    orderInfo.name = req.user.firstName + " " + req.user.lastName;
  }

  try {
    // Order ID Generation (with better query)
    let orderId = "UHB00001";
    const lastOrder = await Order.findOne().sort({ date: -1 }).limit(1);

    if (lastOrder) {
      const lastOrderId = lastOrder.orderId;
      const lastOrderNumberString = lastOrderId.replace("UHB", "");
      const lastOrderNumber = parseInt(lastOrderNumberString);
      const newOrderNumber = lastOrderNumber + 1;
      const newOrderStringNumber = String(newOrderNumber).padStart(5, "0");
      orderId = "UHB" + newOrderStringNumber;
    }

    let total = 0;
    let labelTotal = 0;
    const products = [];

    for (let i = 0; i < orderInfo.products.length; i++) {
      const productItem = orderInfo.products[i];
      
      // Validate product structure
      if (!productItem.productId || !productItem.qty) {
        res.status(400).json({
          message: "Each product must have productId and qty fields",
        });
        return;
      }

      if (productItem.qty <= 0) {
        res.status(400).json({
          message: "Product quantity must be greater than 0",
        });
        return;
      }

      const item = await Product.findOne({
        productId: productItem.productId,
      });

      if (item == null) {
        res.status(404).json({
          message: `Product with productId ${productItem.productId} not found`,
        });
        return;
      }

      if (item.isAvailable == false) {
        res.status(404).json({
          message: `Product with productId ${productItem.productId} is not available right now`,
        });
        return;
      }

      products[i] = {
        productInfo: {
          productId: item.productId,
          name: item.productName, // Fixed: was ProductName
          description: item.description,
          size: item.size,
          category: item.category,
          image: item.images,
          price: item.price,
        },
        quantity: productItem.qty,
      };

      total += item.price * productItem.qty;
      labelTotal += item.labelledPrice * productItem.qty;
    }

    const order = new Order({
      orderId: orderId,
      email: req.user.email,
      name: orderInfo.name,
      address: orderInfo.address,
      phone: orderInfo.phone,
      total: total,
      products: products,
      labelTotal: labelTotal,
    });

    const createdOrder = await order.save();
    res.status(201).json({
      message: "Order created successfully",
      order: createdOrder,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({
      message: "Failed to create order",
      error: err.message || err,
    });
  }
}