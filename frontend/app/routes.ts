import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("profile", "routes/profile.tsx"),
  route("orders", "routes/orders.tsx"),
  route("orders/:id", "routes/order.tsx"),
  route("product/:id", "routes/product.$id.tsx"),
  route("cart", "routes/cart.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("order-success/:id", "routes/order-success.$id.tsx"),
  route("chatbot", "routes/chatbot.tsx"),
  
  // Admin routes
  route("admin/dashboard", "routes/admin/dashboard.tsx"),
  route("admin/products", "routes/admin/products.tsx"),
  route("admin/orders", "routes/admin/orders.tsx"),
];