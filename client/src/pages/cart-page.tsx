import React, { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ShoppingCart, CreditCard, DollarSign } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const CartPage: React.FC = () => {
  const { items, itemCount, totalPrice, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("신용카드");
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 아이템 삭제 핸들러
  const handleRemoveItem = async (itemId: number) => {
    setIsRemoving(itemId);
    try {
      await removeFromCart(itemId);
      toast({
        title: "장바구니에서 제거되었습니다.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "제거 실패",
        description: "장바구니에서 제거하는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(null);
    }
  };

  // 전체 삭제 핸들러
  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      toast({
        title: "장바구니가 비워졌습니다.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "장바구니 비우기에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  // 결제 진행 핸들러
  const handleCheckout = () => {
    toast({
      title: "결제 기능 준비중",
      description: "곧 결제 기능을 제공할 예정입니다.",
      variant: "default",
    });
  };

  // 총 결제 금액 계산
  const calculateTotalAmount = () => {
    if (!items?.length) return 0;
    return items.reduce(
      (total, item) => total + (item.discountPrice || item.price),
      0,
    );
  };

  // 결제 처리 함수
  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "결제 방법을 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // 결제 API 호출
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("결제 처리 중 오류가 발생했습니다.");
      }

      // 결제 성공
      toast({
        title: "결제가 완료되었습니다",
        description: "강의실에서 수강을 시작할 수 있습니다.",
      });

      // 장바구니 비우기
      await fetch("/api/cart/clear", { method: "POST" });

      // 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });

      // 모달 닫기
      setShowPaymentModal(false);

      // 수강신청 페이지로 이동 (수정된 부분)
      setLocation("/my-page?tab=enrollments");
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "결제 실패",
        description: "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                로그인이 필요합니다
              </h2>
              <p className="text-gray-600 mb-4">
                장바구니를 이용하려면 로그인해주세요.
              </p>
              <Link href="/auth">
                <Button className="w-full">로그인하기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                장바구니
              </h1>
              <p className="text-gray-600">
                {itemCount > 0
                  ? `${itemCount}개의 교육과정이 담겨있습니다.`
                  : "장바구니가 비어있습니다."}
              </p>
            </div>

            {itemCount === 0 ? (
              /* 빈 장바구니 */
              <Card className="text-center py-16">
                <CardContent>
                  <ShoppingCart className="h-24 w-24 mx-auto text-gray-400 mb-6" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    장바구니가 비어있습니다
                  </h2>
                  <p className="text-gray-600 mb-8">
                    관심있는 교육과정을 장바구니에 담아보세요.
                  </p>
                  <Link href="/courses">
                    <Button size="lg">교육과정 둘러보기</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 장바구니 아이템 목록 */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>교육과정 목록</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearCart}
                        disabled={isClearing}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isClearing ? "삭제중..." : "전체 삭제"}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg"
                        >
                          {/* 과정 이미지 */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.courseImage || "/uploads/images/1.jpg"}
                              alt={item.courseName}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>

                          {/* 과정 정보 */}
                          <div className="flex-grow">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {item.courseName}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              강사: {item.instructor}
                            </p>
                            <div className="flex items-center space-x-2">
                              {item.discountPrice &&
                              item.discountPrice < item.price ? (
                                <>
                                  <span className="text-lg font-bold text-indigo-600">
                                    {formatPrice(item.discountPrice)}원
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(item.price)}원
                                  </span>
                                  <Badge className="bg-red-500 hover:bg-red-600">
                                    {Math.round(
                                      ((item.price - item.discountPrice) /
                                        item.price) *
                                        100,
                                    )}
                                    % 할인
                                  </Badge>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-indigo-600">
                                  {formatPrice(item.price)}원
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 삭제 버튼 */}
                          <div className="flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving === item.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* 주문 요약 */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>주문 요약</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>상품 수량</span>
                          <span>{itemCount}개</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>상품 금액</span>
                          <span>{formatPrice(totalPrice)}원</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>총 결제 금액</span>
                            <span className="text-indigo-600">
                              {formatPrice(totalPrice)}원
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
                        size="lg"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        결제하기
                      </Button>

                      <div className="text-xs text-gray-500 text-center">
                        결제 시 이용약관 및 개인정보처리방침에 동의한 것으로
                        간주됩니다.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* 결제 모달 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">결제하기</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">결제 상세</h3>
                <div className="space-y-2">
                  {items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.courseName}</span>
                      <span>
                        {(item.discountPrice || item.price).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>총 결제금액</span>
                    <span className="text-blue-600">
                      {calculateTotalAmount().toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">결제 방법</h4>
                <div className="space-y-2">
                  {["신용카드", "계좌이체", "카카오페이"].map((method) => (
                    <Button
                      key={method}
                      variant="outline"
                      className={`w-full justify-start ${
                        selectedPaymentMethod === method
                          ? "border-blue-600 bg-blue-50"
                          : ""
                      }`}
                      onClick={() => setSelectedPaymentMethod(method)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {method}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
              >
                취소
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? "처리 중..." : "결제하기"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartPage;
