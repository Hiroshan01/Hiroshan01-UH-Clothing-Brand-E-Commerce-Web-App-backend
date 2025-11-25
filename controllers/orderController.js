import Order from "../model/order.js";
import Product from "../model/product.js";
import { isAdmin } from "../utils/roleCheck.js";

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

  if (!orderInfo.district) {
    res.status(400).json({
      message: "District is required",
    });
    return;
  }

  if (!orderInfo.fullName) {
    res.status(400).json({
      message: "FullName is required",
    });
    return;
  }
  if (!orderInfo.zipCode) {
    res.status(400).json({
      message: "ZipCode is required",
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
          name: item.productName,
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
      fullName: orderInfo.fullName,
      district: orderInfo.district,
      zipCode: orderInfo.zipCode,
      phone: orderInfo.phone,
      phone2: orderInfo.phone2,
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

export async function getUserOrders(req, res) {
  if (req.user == null) {
    res.status(403).json({
      message: "Please Login and try again",
    });
    return;
  }
  try {
    if (req.user.role == "admin") {
      const orders = await Order.find();
      res.json(orders);
    } else {
      const orders = await Order.find({ email: req.user.email });
      res.json(orders);
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: err,
    });
  }
}

// Get All Orders for Admin
export async function getAdminOrders(req, res) {
  if (req.user == null) {
    res.status(403).json({
      message: "Please Login and try again",
    });
    return;
  }
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to access admin orders",
    });
  }
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch admin orders",
      error: err,
    });
  }
}
// Update Order Status
export async function updateAdminOrderStatus(req, res) {
  if (req.user == null) {
    res.status(403).json({
      message: "Please Login and try again",
    });
    return;
  }

  if (req.user.role != "admin") {
    return res.status(403).json({
      message: "You are not authorized to update orders as admin",
    });
  }

  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updated = await Order.updateOne(
      { orderId: orderId },
      { status: status }
    );

    if (updated.matchedCount === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
    });
  } catch (e) {
    res.status(500).json({
      message: "Failed to update order status",
      error: e.message || e,
    });
  }
}

export async function getSalesData(req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Please Login and try again",
    });
  }

  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to access sales data",
    });
  }

  try {
    const today = new Date();
    const lastYear = new Date(today.setFullYear(today.getFullYear() - 1));

    const salesData = await Order.aggregate([
      {
        $match: {
          date: { $gte: lastYear },
          status: { $nin: ["cancelled", "failed"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalSales: { $sum: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          monthYear: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" },
            ],
          },
          totalSales: 1,
          totalOrders: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Sales data fetched successfully",
      data: salesData,
    });
  } catch (err) {
    console.error("Sales data error:", err);
    res.status(500).json({
      message: "Failed to fetch sales data",
      error: err.message || err,
    });
  }
}
