import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, CheckCircle, Clock, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function BusinessRegistrationPage() {
  const { user, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    phone: "",
    userType: "business",
    organizationName: "",
    businessNumber: "",
    representativeName: "",
    address: "",
    businessType: "",
    description: "",
    website: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState([]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.agreeTerms || !formData.agreePrivacy) {
      toast({
        title: "약관 동의 필요",
        description: "필수 약관에 동의해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    const registrationData = {
      ...formData,
      // 확인 비밀번호 제거
      confirmPassword: undefined,
    };

    registerMutation.mutate(registrationData, {
      onSuccess: () => {
        toast({
          title: "선생님 회원가입 완료",
          description:
            "회원가입이 완료되었습니다. 지금 바로 서비스를 이용하실 수 있습니다.",
        });
        setLocation("/");
      },
      onError: (error) => {
        toast({
          title: "등록 실패",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.name &&
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.username
        );
      case 2:
        return (
          formData.organizationName &&
          formData.businessNumber &&
          formData.representativeName &&
          formData.phone
        );
      case 3:
        return formData.agreeTerms && formData.agreePrivacy;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              선생님/사업자 회원가입
            </h1>
            <p className="text-gray-600">
              강의를 제공하는 선생님이나 사업자로 등록하여 교육 과정을 개설할 수
              있습니다.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
                >
                  1
                </div>
                <span className="text-sm font-medium">기본 정보</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div
                className={`flex items-center space-x-2 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
                >
                  2
                </div>
                <span className="text-sm font-medium">선생님 정보</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div
                className={`flex items-center space-x-2 ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
                >
                  3
                </div>
                <span className="text-sm font-medium">약관 동의</span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>
                  {step === 1 && "기본 정보 입력"}
                  {step === 2 && "선생님 정보 입력"}
                  {step === 3 && "약관 동의 및 완료"}
                </span>
              </CardTitle>
              <CardDescription>
                {step === 1 && "계정 생성을 위한 기본 정보를 입력해주세요."}
                {step === 2 && "선생님 또는 사업자 정보를 입력해주세요."}
                {step === 3 && "서비스 이용 약관에 동의해주세요."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: 기본 정보 */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">이름 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="실명을 입력하세요"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">사용자명 *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        placeholder="로그인시 사용할 ID"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="example@company.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호 *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder="8자 이상"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        placeholder="비밀번호 재입력"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: 선생님 정보 */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">선생님/회사명 *</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) =>
                        handleInputChange("organizationName", e.target.value)
                      }
                      placeholder="선생님 또는 회사 이름"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessNumber">사업자등록번호 *</Label>
                      <Input
                        id="businessNumber"
                        value={formData.businessNumber}
                        onChange={(e) =>
                          handleInputChange("businessNumber", e.target.value)
                        }
                        placeholder="000-00-00000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representativeName">대표자명 *</Label>
                      <Input
                        id="representativeName"
                        value={formData.representativeName}
                        onChange={(e) =>
                          handleInputChange(
                            "representativeName",
                            e.target.value,
                          )
                        }
                        placeholder="대표자 이름"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">연락처 *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="010-0000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">업종</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) =>
                          handleInputChange("businessType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="업종 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">교육 선생님</SelectItem>
                          <SelectItem value="training">교육 선생님</SelectItem>
                          <SelectItem value="consulting">컨설팅</SelectItem>
                          <SelectItem value="corporation">일반 기업</SelectItem>
                          <SelectItem value="government">공공 선생님</SelectItem>
                          <SelectItem value="nonprofit">비영리 단체</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">주소</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="선생님 주소"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">웹사이트</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://www.company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">선생님 소개</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="선생님의 주요 사업 영역과 특징을 간단히 소개해주세요"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: 약관 동의 */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">
                      회원가입 안내
                    </h3>
                    <p className="text-blue-800 text-sm">
                      입력하신 정보를 바탕으로 즉시 회원가입이 처리됩니다.
                      가입 완료 후 모든 기능을 바로 이용하실 수 있습니다.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) =>
                          handleInputChange("agreeTerms", checked)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="agreeTerms"
                          className="text-sm font-medium"
                        >
                          서비스 이용약관에 동의합니다 (필수)
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          서비스 이용에 관한 기본 약관입니다.
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        보기
                      </Button>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreePrivacy"
                        checked={formData.agreePrivacy}
                        onCheckedChange={(checked) =>
                          handleInputChange("agreePrivacy", checked)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="agreePrivacy"
                          className="text-sm font-medium"
                        >
                          개인정보 처리방침에 동의합니다 (필수)
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          개인정보 수집 및 이용에 관한 동의입니다.
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        보기
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          가입 안내
                        </h4>
                        <ul className="text-sm text-blue-800 mt-2 space-y-1">
                          <li>• 가입 즉시 모든 기능을 이용하실 수 있습니다.</li>
                          <li>• 교재 및 자료 등록, 판매 관리가 바로 가능합니다.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={step === 1}
                >
                  이전
                </Button>

                {step < 3 ? (
                  <Button onClick={handleNextStep} disabled={!isStepValid()}>
                    다음
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepValid() || registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? "처리 중..."
                      : "선생님 등록 신청"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
