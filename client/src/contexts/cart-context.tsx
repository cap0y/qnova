import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";

export interface CartItem {
  id: number;
  courseId: number;
  courseName: string;
  courseImage: string;
  price: number;
  discountPrice?: number;
  instructor: string;
  addedAt: Date;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addToCart: (courseId: number, courseData?: any) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isInCart: (courseId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // 장바구니 아이템 수
  const itemCount = items.length;

  // 총 가격 계산
  const totalPrice = items.reduce((total, item) => {
    return total + (item.discountPrice || item.price);
  }, 0);

  // 장바구니에 아이템이 있는지 확인
  const isInCart = (courseId: number): boolean => {
    return items.some((item) => item.courseId === courseId);
  };

  // 장바구니 데이터 새로고침
  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      const response = await fetch("/api/cart/items", {
        credentials: "include",
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setItems(data.items || []);
        } else {
          // HTML 응답인 경우 (API가 아직 구현되지 않음)
          console.log("Cart API not implemented yet, using empty cart");
          setItems([]);
        }
      } else if (response.status === 404) {
        // API 엔드포인트가 없는 경우
        console.log("Cart API endpoint not found, using empty cart");
        setItems([]);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.log("Cart API not available, using empty cart");
      setItems([]);
    }
  };

  // 장바구니에 추가
  const addToCart = async (courseId: number, courseData?: any) => {
    if (!user) {
      throw new Error("로그인이 필요합니다.");
    }

    // 이미 장바구니에 있는지 확인
    if (isInCart(courseId)) {
      throw new Error("이미 장바구니에 있는 상품입니다.");
    }

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          courseId,
          type: "course",
        }),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          await refreshCart();
        } else {
          // API가 구현되지 않은 경우 임시로 로컬 상태 업데이트
          console.log("Cart API not implemented, simulating add to cart");
          // 실제 과정 데이터가 있으면 사용, 없으면 기본값 사용
          const newItem: CartItem = {
            id: Date.now(),
            courseId,
            courseName: courseData?.title || `교육과정 ${courseId}`,
            courseImage: courseData?.imageUrl || "/uploads/images/1.jpg",
            price: courseData?.price || 0,
            discountPrice:
              courseData?.discountPrice ||
              (courseData?.price ? Math.round(courseData.price * 0.8) : 0),
            instructor: courseData?.instructorName || "강사명",
            addedAt: new Date(),
          };
          setItems((prev) => [...prev, newItem]);
        }
      } else if (response.status === 404) {
        // API 엔드포인트가 없는 경우 임시 처리
        console.log("Cart API not implemented, simulating add to cart");
        const newItem: CartItem = {
          id: Date.now(),
          courseId,
          courseName: courseData?.title || `교육과정 ${courseId}`,
          courseImage: courseData?.imageUrl || "/uploads/images/1.jpg",
          price: courseData?.price || 0,
          discountPrice:
            courseData?.discountPrice ||
            (courseData?.price ? Math.round(courseData.price * 0.8) : 0),
          instructor: courseData?.instructorName || "강사명",
          addedAt: new Date(),
        };
        setItems((prev) => [...prev, newItem]);
      } else {
        throw new Error("장바구니 추가에 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // 네트워크 오류인 경우 임시 처리
        console.log("Network error, simulating add to cart");
        const newItem: CartItem = {
          id: Date.now(),
          courseId,
          courseName: courseData?.title || `교육과정 ${courseId}`,
          courseImage: courseData?.imageUrl || "/uploads/images/1.jpg",
          price: courseData?.price || 0,
          discountPrice:
            courseData?.discountPrice ||
            (courseData?.price ? Math.round(courseData.price * 0.8) : 0),
          instructor: courseData?.instructorName || "강사명",
          addedAt: new Date(),
        };
        setItems((prev) => [...prev, newItem]);
      } else {
        throw error;
      }
    }
  };

  // 장바구니에서 제거
  const removeFromCart = async (itemId: number) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await refreshCart();
      } else if (response.status === 404) {
        // API가 구현되지 않은 경우 로컬에서 제거
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        throw new Error("장바구니에서 제거하는데 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // 네트워크 오류인 경우 로컬에서 제거
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        throw error;
      }
    }
  };

  // 장바구니 비우기
  const clearCart = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/cart/items", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setItems([]);
      } else if (response.status === 404) {
        // API가 구현되지 않은 경우 로컬에서 비우기
        setItems([]);
      } else {
        throw new Error("장바구니 비우기에 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // 네트워크 오류인 경우 로컬에서 비우기
        setItems([]);
      } else {
        throw error;
      }
    }
  };

  // 사용자 로그인 상태 변경 시 장바구니 새로고침
  useEffect(() => {
    refreshCart();
  }, [user]);

  const value: CartContextType = {
    items,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
