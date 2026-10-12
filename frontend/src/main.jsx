import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// ستايل Bootstrap بنسخة RTL + الجافاسكريبت بتاعه (للـ dropdown والـ collapse)
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// أيقونات Font Awesome
import "@fortawesome/fontawesome-free/css/all.min.css";
// ستايل التوست
import "react-toastify/dist/ReactToastify.css";
// الثيم المخصص بتاعنا (لازم يتحمل بعد Bootstrap عشان يقدر يعدّل عليه)
import "./styles/theme.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
