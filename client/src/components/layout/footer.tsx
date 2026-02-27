import { useState } from "react";
import { Link } from "wouter";
import {
  Phone,
  Mail,
  MapPin,
  Printer,
  Clock,
} from "lucide-react";
import ChatWidget from "@/components/chat-widget";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <footer className="bg-gray-800 text-white pt-12 pb-6 mt-1 relative">
        <div className="container mx-auto px-4">
          {/* 가운데 정렬된 메인 컨텐츠 */}
          <div className="max-w-5xl mx-auto">
            {/* 5개 컬럼 섹션 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
              {/* 고객만족센터 -> (주)Qnova 정보 */}
              <div className="col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white p-2 rounded-lg shrink-0">
                    <img 
                      src="/images/logo.png" 
                      alt="(주)Qnova 로고" 
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white leading-tight">
                      (주)Qnova
                    </h4>
                    <p className="text-blue-400 font-medium text-xs">내신자료 플랫폼</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs text-gray-400">
                  <p>개인정보보호책임자: 윤한상</p>
                  <div className="flex items-center gap-1">
                    <Printer className="h-3 w-3" />
                    <span>FAX: 050-8907-9703</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>head.qnova@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>평일 09:00-18:00</span>
                  </div>
                </div>
              </div>

              {/* 소개 */}
              <div className="col-span-1">
                <h4 className="text-base md:text-lg font-semibold mb-4 text-white">
                  소개
                </h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link
                      href="/support/about"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      회사 소개
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      서비스 소개
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/careers"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      채용
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 솔루션 */}
              <div className="col-span-1">
                <h4 className="text-base md:text-lg font-semibold mb-4 text-white">
                  솔루션
                </h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link
                      href="/courses"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Qnova 마켓
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/courses"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      자료 보관함
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 고객지원 */}
              <div className="col-span-1">
                <h4 className="text-base md:text-lg font-semibold mb-4 text-white">
                  고객지원
                </h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link
                      href="/help"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      개인정보처리방침
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-service"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      이용약관
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      쿠키정책
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 문의 */}
              <div className="col-span-1">
                <h4 className="text-base md:text-lg font-semibold mb-4 text-white">
                  문의
                </h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link
                      href="/business-partnership"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      사업 제휴
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/author-application"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      저자 신청
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* 구분선 및 하단 정보 */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* 왼쪽: 회사 정보 */}
                <div className="text-gray-400 text-xs md:text-sm space-y-1">
                  <p>
                    (주)Qnova | 대표 윤한상 | 사업자 등록번호: 729-05-02007 | 통신판매업 신고 제2025-경남진주-0571호 | 저작권대리중개업 신고 제1496호
                  </p>
                  <p className="flex items-start">
                    <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                     경남 Hub : 경상남도 진주시 사들로 79, 401호 (충무공동)
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                    이메일 문의 : support@qnova.com | <Phone className="h-3 w-3 ml-2 mr-1 flex-shrink-0" />
                    전화 문의 : 02-2606-4990
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    ⓒ Copyright {currentYear}. Qnova All Rights Reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </footer>

      {/* 우측 하단 채팅 아이콘 및 채널톡 위젯 */}
      <ChatWidget isOpen={isChatOpen} onToggle={setIsChatOpen} />
    </>
  );
}
