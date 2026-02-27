import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 mr-4" />
              <h1 className="text-3xl md:text-4xl font-bold">이용약관</h1>
            </div>
            <p className="text-lg md:text-xl text-green-100">
              (주)지누켐 교육플랫폼 서비스 이용약관을 안내해드립니다
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
                    서비스 이용약관
                  </h2>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    제1장 총칙
                  </h3>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제1조 (목적)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    이 약관은 (주)지누켐(이하 "회사"라 합니다)이 운영하는
                    교육플랫폼(이하 "서비스"라 합니다)의 이용과 관련하여 회사와
                    회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을
                    규정함을 목적으로 합니다.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제2조 (정의)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                    <li>
                      "서비스"란 회사가 제공하는 모든 교육교육 관련 서비스를
                      의미합니다.
                    </li>
                    <li>
                      "회원"이란 이 약관에 동의하고 회사와 서비스 이용계약을
                      체결한 개인 또는 법인을 의미합니다.
                    </li>
                    <li>
                      "아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이
                      정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.
                    </li>
                    <li>
                      "비밀번호"란 회원이 부여받은 아이디와 일치되는 회원임을
                      확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의
                      조합을 의미합니다.
                    </li>
                    <li>
                      "게시물"이란 회원이 서비스를 이용함에 있어 서비스상에
                      게시한 부호, 문자, 음성, 음향, 화상, 동영상 등의 정보
                      형태의 글, 사진, 동영상 및 각종 파일과 링크 등을
                      의미합니다.
                    </li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제3조 (약관의 효력 및 변경)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로
                    회원에게 공지함으로써 효력을 발생합니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    2. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수
                    있으며, 변경된 약관은 제1항과 같은 방법으로 공지 또는
                    통지함으로써 효력을 발생합니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    3. 회원은 변경된 약관에 동의하지 않을 경우 서비스 이용을
                    중단하고 탈퇴할 수 있습니다.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    제2장 서비스 이용계약
                  </h3>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제4조 (이용계약의 성립)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 이용계약은 회원이 되고자 하는 자(이하 "가입신청자"라
                    합니다)가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을
                    하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    2. 회사는 가입신청자의 신청에 대하여 서비스 이용을 승낙함을
                    원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에
                    대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수
                    있습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                    <li>
                      가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한
                      적이 있는 경우
                    </li>
                    <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                    <li>
                      허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지
                      않은 경우
                    </li>
                    <li>
                      기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이
                      있다고 판단되는 경우
                    </li>
                  </ul>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제5조 (회원정보의 변경)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 회원은 개인정보관리화면을 통하여 언제든지 본인의
                    개인정보를 열람하고 수정할 수 있습니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    2. 회원은 회원가입 시 기재한 사항이 변경되었을 경우
                    온라인으로 수정을 하거나 전자우편 기타 방법으로 회사에 그
                    변경사항을 알려야 합니다.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    제3장 계약당사자의 의무
                  </h3>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제6조 (회사의 의무)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 회사는 법령과 이 약관이 금지하거나 공서양속에 반하는
                    행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고,
                    안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    2. 회사는 회원이 안전하게 인터넷 서비스를 이용할 수 있도록
                    회원의 개인정보(신용정보 포함)보호를 위한 보안 시스템을
                    구축하여야 합니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    3. 회사는 서비스 이용과 관련하여 회원으로부터 제기된
                    의견이나 불만이 정당하다고 객관적으로 인정될 경우에는 적절한
                    절차를 거쳐 즉시 처리하여야 합니다.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제7조 (회원의 의무)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 회원은 다음 행위를 하여서는 안 됩니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                    <li>신청 또는 변경 시 허위 내용의 등록</li>
                    <li>타인의 정보 도용</li>
                    <li>회사에 게시된 정보의 변경</li>
                    <li>
                      회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신
                      또는 게시
                    </li>
                    <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                    <li>
                      회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위
                    </li>
                    <li>
                      외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에
                      반하는 정보를 서비스에 공개 또는 게시하는 행위
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    제4장 서비스의 이용
                  </h3>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제8조 (서비스의 이용시간)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이
                    없는 한 연중무휴, 1일 24시간 운영함을 원칙으로 합니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    2. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장,
                    통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을
                    일시적으로 중단할 수 있습니다.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제9조 (서비스의 변경)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에
                    따라 제공하고 있는 전부 또는 일부 서비스를 변경할 수
                    있습니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    2. 서비스의 내용, 이용방법, 이용시간에 대하여 변경이 있는
                    경우에는 변경사유, 변경될 서비스의 내용 및 제공일자 등은 그
                    변경 전에 해당 서비스 초기화면에 게시하여야 합니다.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    제5장 계약해지 및 이용제한
                  </h3>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제10조 (계약해지)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 회원은 언제든지 서비스 초기화면의 고객센터 또는 내 정보
                    관리 메뉴 등을 통하여 이용계약 해지 신청을 할 수 있으며,
                    회사는 관련법 등이 정하는 바에 따라 이를 즉시 처리하여야
                    합니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    2. 회원이 계약을 해지할 경우, 관련법 및 개인정보취급방침에
                    따라 회사가 회원정보를 보유하는 경우를 제외하고는 해지 즉시
                    회원의 모든 데이터는 소멸됩니다.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제11조 (서비스 이용제한)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    회사는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인
                    운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로
                    서비스 이용을 단계적으로 제한할 수 있습니다.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    제6장 손해배상 및 기타사항
                  </h3>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제12조 (손해배상)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한
                    손해가 발생하더라도 동 손해가 회사의 고의 또는 중대한 과실에
                    의한 경우를 제외하고는 이에 대하여 책임을 부담하지
                    아니합니다.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제13조 (면책조항)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여
                    서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이
                    면제됩니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에
                    대하여는 책임을 지지 않습니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    3. 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한
                    것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은
                    자료로 인한 손해에 관하여 책임을 지지 않습니다.
                  </p>

                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    제14조 (재판권 및 준거법)
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    1. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우
                    회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    2. 회사와 회원 간에 제기된 소송에는 대한민국 법을
                    적용합니다.
                  </p>

                  <div className="bg-gray-50 p-6 rounded-lg my-6">
                    <h5 className="font-semibold text-gray-900 mb-3">부칙</h5>
                    <p className="text-gray-700">
                      이 약관은 2025년 3월 5일부터 적용됩니다.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg my-6">
                    <h5 className="font-semibold text-gray-900 mb-3">문의처</h5>
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
                    </div>
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
