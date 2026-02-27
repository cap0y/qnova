import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-amber-700 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Cookie className="h-12 w-12 mr-4" />
              <h1 className="text-3xl md:text-4xl font-bold">쿠키정책</h1>
            </div>
            <p className="text-lg md:text-xl text-orange-100">
              (주)지누켐의 쿠키 사용 정책을 안내해드립니다
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-gray max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    쿠키정책
                  </h2>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    1. 쿠키란 무엇인가요?
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    쿠키(Cookie)는 웹사이트를 방문할 때 사용자의 컴퓨터에
                    저장되는 작은 텍스트 파일입니다. 쿠키는 웹사이트가 사용자의
                    브라우저를 통해 정보를 저장하고 나중에 그 정보를 다시 불러올
                    수 있게 해줍니다.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    2. 쿠키 사용 목적
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    (주)지누켐은 다음과 같은 목적으로 쿠키를 사용합니다:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                    <li>
                      <strong>필수 쿠키:</strong> 웹사이트의 기본 기능을
                      제공하기 위해 반드시 필요한 쿠키
                    </li>
                    <li>
                      <strong>기능성 쿠키:</strong> 사용자의 선택사항을 기억하여
                      향상된 기능을 제공
                    </li>
                    <li>
                      <strong>성능 쿠키:</strong> 웹사이트 사용 현황을 분석하여
                      성능을 개선
                    </li>
                    <li>
                      <strong>마케팅 쿠키:</strong> 사용자의 관심사에 맞는
                      광고를 제공
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    3. 사용하는 쿠키의 종류
                  </h3>

                  <div className="bg-blue-50 p-6 rounded-lg my-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      3.1 필수 쿠키
                    </h4>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      웹사이트의 기본적인 기능을 수행하기 위해 반드시 필요한
                      쿠키입니다.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>세션 관리 쿠키 (로그인 상태 유지)</li>
                      <li>보안 쿠키 (CSRF 방지)</li>
                      <li>장바구니 쿠키 (쇼핑 기능)</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg my-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      3.2 기능성 쿠키
                    </h4>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      사용자 경험을 향상시키기 위한 쿠키입니다.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>언어 설정 쿠키</li>
                      <li>테마 설정 쿠키</li>
                      <li>사용자 선호도 쿠키</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg my-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      3.3 성능 쿠키
                    </h4>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      웹사이트 성능 분석을 위한 쿠키입니다.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>Google Analytics 쿠키</li>
                      <li>페이지 조회수 추적 쿠키</li>
                      <li>사용자 행동 분석 쿠키</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg my-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      3.4 마케팅 쿠키
                    </h4>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      맞춤형 광고 제공을 위한 쿠키입니다.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>광고 타겟팅 쿠키</li>
                      <li>소셜 미디어 쿠키</li>
                      <li>리마케팅 쿠키</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    4. 쿠키의 보존 기간
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300 mb-6">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                            쿠키 유형
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                            보존 기간
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                            설명
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            세션 쿠키
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            브라우저 종료 시
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            임시 저장, 브라우저 종료 시 자동 삭제
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            로그인 상태
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            30일
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            자동 로그인 기능
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            사용자 설정
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            1년
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            언어, 테마 등 개인 설정
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            분석 쿠키
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            2년
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">
                            Google Analytics 등
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    5. 쿠키 관리 방법
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    사용자는 쿠키 설정을 통해 쿠키의 사용을 제어할 수 있습니다:
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    5.1 브라우저 설정을 통한 쿠키 관리
                  </h4>
                  <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                    <li>
                      <strong>Chrome:</strong> 설정 &gt; 개인정보 및 보안 &gt;
                      쿠키 및 기타 사이트 데이터
                    </li>
                    <li>
                      <strong>Firefox:</strong> 설정 &gt; 개인정보 및 보안 &gt;
                      쿠키 및 사이트 데이터
                    </li>
                    <li>
                      <strong>Safari:</strong> 환경설정 &gt; 개인정보 보호 &gt;
                      쿠키 및 웹사이트 데이터
                    </li>
                    <li>
                      <strong>Edge:</strong> 설정 &gt; 쿠키 및 사이트 권한 &gt;
                      쿠키 및 저장된 데이터
                    </li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    5.2 쿠키 거부 시 영향
                  </h4>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                    <p className="text-amber-800 leading-relaxed">
                      <strong>주의:</strong> 필수 쿠키를 거부하실 경우
                      웹사이트의 일부 기능이 정상적으로 작동하지 않을 수
                      있습니다. 로그인, 장바구니, 결제 등의 기능에 제한이 있을
                      수 있습니다.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    6. 제3자 쿠키
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    저희 웹사이트는 다음과 같은 제3자 서비스의 쿠키를 사용할 수
                    있습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                    <li>
                      <strong>Google Analytics:</strong> 웹사이트 사용 현황 분석
                    </li>
                    <li>
                      <strong>Google Ads:</strong> 광고 효과 측정
                    </li>
                    <li>
                      <strong>Facebook Pixel:</strong> 소셜 미디어 마케팅
                    </li>
                    <li>
                      <strong>YouTube:</strong> 동영상 콘텐츠 제공
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    7. 쿠키정책 변경
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    이 쿠키정책은 법령 변경이나 서비스 개선을 위해 변경될 수
                    있습니다. 중요한 변경사항이 있을 경우 웹사이트를 통해 사전에
                    공지해드립니다.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    8. 문의하기
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    쿠키 사용에 대해 궁금한 점이 있으시면 언제든지 문의해주세요.
                  </p>

                  <div className="bg-gray-50 p-6 rounded-lg my-6">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      연락처 정보
                    </h5>
                    <div className="space-y-2 text-gray-700">
                      <p>
                        <strong>회사명:</strong> (주)지누켐
                      </p>
                      <p>
                        <strong>주소:</strong> 경상남도 진주시 진주대로 501,
                        창업보육센터 B동 202호
                      </p>
                      <p>
                        <strong>전화:</strong> 055-772-2226
                      </p>
                      <p>
                        <strong>이메일:</strong> support@jinuchem.kr
                      </p>
                      <p>
                        <strong>개인정보보호책임자:</strong> 김병선
                        (bkim@jinuchem.co.kr)
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg my-6">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      쿠키 설정 관리
                    </h5>
                    <p className="text-gray-700 mb-4">
                      아래 버튼을 클릭하여 쿠키 설정을 관리할 수 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm">
                        필수 쿠키만 허용
                      </Button>
                      <Button variant="outline" size="sm">
                        모든 쿠키 허용
                      </Button>
                      <Button variant="outline" size="sm">
                        쿠키 설정 변경
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 italic">
                      최종 업데이트: 2025년 3월 5일
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      이 쿠키정책은 2025년 3월 5일부터 시행됩니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="mt-8 text-center">
              <Link href="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
