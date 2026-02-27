import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function AuthPage() {
  const {
    user,
    loginMutation,
    registerMutation,
    kakaoLoginMutation,
    googleLoginMutation,
  } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [memberType, setMemberType] = useState("individual");

  // OAuth 에러 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error === "google_login_failed") {
      toast({
        title: "구글 로그인 실패",
        description: "구글 로그인 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } else if (error === "kakao_login_failed") {
      toast({
        title: "카카오 로그인 실패",
        description: "카카오 로그인 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    businessNumber: "",
    rememberMe: false,
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    // Common fields
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    userType: "individual",

    // Individual member fields
    birthDate: "",
    gender: "",
    address: "",
    school: "",
    occupation: "",

    // Business member fields
    businessName: "",
    businessNumber: "",
    representativeName: "",
    businessAddress: "",
    businessType: "",

    // Terms
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
  });

  // 회원 유형 변경 시 입력 필드 초기화
  const handleMemberTypeChange = (type: string) => {
    setMemberType(type);
    setLoginForm((prev) => ({
      ...prev,
      email: "",
      password: "",
      businessNumber: "",
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 선생님회원 로그인 시 사업자번호 필수 검증
    if (memberType === "business" && !loginForm.businessNumber.trim()) {
      toast({
        title: "사업자번호 입력 필요",
        description: "선생님회원 로그인 시 사업자번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const loginData: any = {
        username: loginForm.email,
        password: loginForm.password,
        userType: memberType,
      };

      // 선생님회원인 경우 사업자번호 추가
      if (memberType === "business") {
        loginData.businessNumber = loginForm.businessNumber;
      }

      await loginMutation.mutateAsync(loginData);
      setLocation("/");
    } catch (error: any) {
      console.error("Login failed:", error);

      const errorMessage = error?.response?.data?.message || error?.message;
      const errorStatus = error?.response?.status;

      if (errorStatus === 400) {
        toast({
          title: "입력 오류",
          description: errorMessage || "입력하신 정보를 다시 확인해주세요.",
          variant: "destructive",
        });
      } else if (errorStatus === 401) {
        const responseData = error?.response?.data;

        // 회원 유형 불일치 에러 처리
        if (responseData?.userType) {
          const correctTypeText =
            responseData.userType === "business" ? "선생님회원" : "개인회원";
          const wrongTypeText =
            memberType === "business" ? "선생님회원" : "개인회원";

          toast({
            title: "회원 유형 불일치",
            description: `${wrongTypeText}으로 로그인하려 하셨지만, 등록된 계정은 ${correctTypeText}입니다. 올바른 회원 유형을 선택해주세요.`,
            variant: "destructive",
          });

          // 자동으로 올바른 회원 유형으로 변경
          setMemberType(responseData.userType);
        } else if (errorMessage?.includes("사업자번호")) {
          toast({
            title: "사업자번호 오류",
            description: errorMessage,
            variant: "destructive",
          });
        } else if (errorMessage?.includes("비활성화")) {
          toast({
            title: "계정 비활성화",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "로그인 실패",
            description:
              errorMessage || "이메일 또는 비밀번호가 일치하지 않습니다.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "로그인 오류",
          description:
            "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === "kakao") {
      kakaoLoginMutation.mutate();
    } else if (provider === "google") {
      googleLoginMutation.mutate();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!registerForm.termsAgreed || !registerForm.privacyAgreed) {
      toast({
        title: "필수 약관 동의",
        description: "필수 약관에 동의해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await registerMutation.mutateAsync({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        name: registerForm.name,
        phone: registerForm.phone,
        userType: registerForm.userType as "individual" | "business",
        organizationName: registerForm.businessName,
        businessNumber: registerForm.businessNumber,
        representativeName: registerForm.representativeName,
        address:
          registerForm.userType === "individual"
            ? registerForm.address
            : registerForm.businessAddress,
      });
      setLocation("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user) {
    return <div>리다이렉트 중...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div
        className="bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Form */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">교육플랫폼</h2>
                <p className="mt-2 text-gray-600">
                  전문가를 위한 최고의 교육교육 플랫폼
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">로그인</TabsTrigger>
                        <TabsTrigger value="register">회원가입</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    {/* Login Form */}
                    <TabsContent value="login">
                      <form onSubmit={handleLoginSubmit} className="space-y-6">
                        {/* Member Type Selection */}
                        <div className="flex rounded-lg bg-gray-100 p-1">
                          <button
                            type="button"
                            onClick={() => handleMemberTypeChange("individual")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                              memberType === "individual"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            개인회원
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMemberTypeChange("business")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                              memberType === "business"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            선생님회원
                          </button>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            {memberType === "individual"
                              ? "개인회원으로 가입하신 분만 로그인 가능합니다"
                              : "선생님회원으로 가입하신 분만 로그인 가능합니다"}
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="email">이메일</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="이메일을 입력하세요"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        {memberType === "business" && (
                          <div>
                            <Label htmlFor="businessNumber">
                              사업자번호 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="businessNumber"
                              placeholder="0000000000"
                              value={loginForm.businessNumber}
                              onChange={(e) =>
                                setLoginForm((prev) => ({
                                  ...prev,
                                  businessNumber: e.target.value,
                                }))
                              }
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              선생님회원 로그인 시 사업자번호가 필요합니다
                            </p>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="password">비밀번호</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="rememberMe"
                              checked={loginForm.rememberMe}
                              onCheckedChange={(checked) =>
                                setLoginForm((prev) => ({
                                  ...prev,
                                  rememberMe: checked as boolean,
                                }))
                              }
                            />
                            <Label htmlFor="rememberMe" className="text-sm">
                              로그인 상태 유지
                            </Label>
                          </div>
                          <a
                            href="#"
                            className="text-sm text-primary hover:underline"
                          >
                            비밀번호 찾기
                          </a>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "로그인 중..." : "로그인"}
                        </Button>

                        {/* 소셜 로그인 - 개인회원만 */}
                        {memberType === "individual" && (
                          <>
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">
                                  또는
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black border-[#FEE500]"
                                onClick={() => handleSocialLogin("kakao")}
                                disabled={kakaoLoginMutation.isPending}
                              >
                                <svg
                                  className="mr-2 h-4 w-4"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3Z"
                                  />
                                </svg>
                                {kakaoLoginMutation.isPending
                                  ? "카카오 로그인 중..."
                                  : "카카오로 로그인"}
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleSocialLogin("google")}
                                disabled={googleLoginMutation.isPending}
                              >
                                <svg
                                  className="mr-2 h-4 w-4"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  />
                                  <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  />
                                  <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                  />
                                  <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                  />
                                </svg>
                                {googleLoginMutation.isPending
                                  ? "구글 로그인 중..."
                                  : "구글로 로그인"}
                              </Button>
                            </div>
                          </>
                        )}
                      </form>
                    </TabsContent>

                    {/* Registration Form */}
                    <TabsContent value="register">
                      <form
                        onSubmit={handleRegisterSubmit}
                        className="space-y-6"
                      >
                        {/* Member Type Selection */}
                        <RadioGroup
                          value={registerForm.userType}
                          onValueChange={(value) =>
                            setRegisterForm((prev) => ({
                              ...prev,
                              userType: value,
                            }))
                          }
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 p-4 border rounded-lg">
                              <RadioGroupItem
                                value="individual"
                                id="individual"
                              />
                              <Label htmlFor="individual" className="flex-1">
                                <div className="font-medium">개인회원</div>
                                <div className="text-sm text-gray-500">
                                  교사, 교수, 연구원 등
                                </div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-4 border rounded-lg">
                              <RadioGroupItem value="business" id="business" />
                              <Label htmlFor="business" className="flex-1">
                                <div className="font-medium">선생님회원</div>
                                <div className="text-sm text-gray-500">
                                  학교, 교육선생님 등
                                </div>
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>

                        {/* Common Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">이름</Label>
                            <Input
                              id="name"
                              value={registerForm.name}
                              onChange={(e) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="username">사용자명</Label>
                            <Input
                              id="username"
                              value={registerForm.username}
                              onChange={(e) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  username: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">이메일</Label>
                          <Input
                            id="email"
                            type="email"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                              id="password"
                              type="password"
                              value={registerForm.password}
                              onChange={(e) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword">
                              비밀번호 확인
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={registerForm.confirmPassword}
                              onChange={(e) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="phone">전화번호</Label>
                          <Input
                            id="phone"
                            placeholder="010-0000-0000"
                            value={registerForm.phone}
                            onChange={(e) =>
                              setRegisterForm((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>

                        {/* Conditional Fields */}
                        {registerForm.userType === "individual" ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="birthDate">생년월일</Label>
                                <Input
                                  id="birthDate"
                                  type="date"
                                  value={registerForm.birthDate}
                                  onChange={(e) =>
                                    setRegisterForm((prev) => ({
                                      ...prev,
                                      birthDate: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="gender">성별</Label>
                                <Select
                                  value={registerForm.gender}
                                  onValueChange={(value) =>
                                    setRegisterForm((prev) => ({
                                      ...prev,
                                      gender: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="성별 선택" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">남성</SelectItem>
                                    <SelectItem value="female">여성</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="address">주소</Label>
                              <Input
                                id="address"
                                value={registerForm.address}
                                onChange={(e) =>
                                  setRegisterForm((prev) => ({
                                    ...prev,
                                    address: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="school">소속 학교/선생님</Label>
                              <Input
                                id="school"
                                value={registerForm.school}
                                onChange={(e) =>
                                  setRegisterForm((prev) => ({
                                    ...prev,
                                    school: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="businessName">선생님명</Label>
                                <Input
                                  id="businessName"
                                  value={registerForm.businessName}
                                  onChange={(e) =>
                                    setRegisterForm((prev) => ({
                                      ...prev,
                                      businessName: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="businessNumber">
                                  사업자번호
                                </Label>
                                <Input
                                  id="businessNumber"
                                  placeholder="000-00-00000"
                                  value={registerForm.businessNumber}
                                  onChange={(e) =>
                                    setRegisterForm((prev) => ({
                                      ...prev,
                                      businessNumber: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="representativeName">
                                대표자명
                              </Label>
                              <Input
                                id="representativeName"
                                value={registerForm.representativeName}
                                onChange={(e) =>
                                  setRegisterForm((prev) => ({
                                    ...prev,
                                    representativeName: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        )}

                        {/* Terms Agreement */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="termsAgreed"
                              checked={registerForm.termsAgreed}
                              onCheckedChange={(checked) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  termsAgreed: checked as boolean,
                                }))
                              }
                            />
                            <Label htmlFor="termsAgreed" className="text-sm">
                              서비스 이용약관에 동의합니다 (필수)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="privacyAgreed"
                              checked={registerForm.privacyAgreed}
                              onCheckedChange={(checked) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  privacyAgreed: checked as boolean,
                                }))
                              }
                            />
                            <Label htmlFor="privacyAgreed" className="text-sm">
                              개인정보 처리방침에 동의합니다 (필수)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="marketingAgreed"
                              checked={registerForm.marketingAgreed}
                              onCheckedChange={(checked) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  marketingAgreed: checked as boolean,
                                }))
                              }
                            />
                            <Label
                              htmlFor="marketingAgreed"
                              className="text-sm"
                            >
                              마케팅 정보 수신에 동의합니다 (선택)
                            </Label>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending
                            ? "회원가입 중..."
                            : "회원가입"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Hero */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-white">
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 className="text-2xl font-bold">
                  교육 전문가를 위한 플랫폼
                </h3>
                <p className="text-blue-100 text-lg">
                  최고 수준의 교육 교육과 전문성 개발 기회를 제공합니다
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">247+</div>
                    <div className="text-sm text-blue-100">교육과정</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">15K+</div>
                    <div className="text-sm text-blue-100">수강생</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.8★</div>
                    <div className="text-sm text-blue-100">만족도</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">18</div>
                    <div className="text-sm text-blue-100">세미나</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
