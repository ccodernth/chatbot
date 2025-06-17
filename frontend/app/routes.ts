import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("profile", "routes/profile.tsx"),
  route("orders", "routes/orders.tsx"),
  route("orders/:id", "routes/order.tsx"),
  route("chatbot", "routes/chatbot.tsx"),
];

