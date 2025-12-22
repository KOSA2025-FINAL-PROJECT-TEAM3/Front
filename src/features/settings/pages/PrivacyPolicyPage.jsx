import MainLayout from '@shared/components/layout/MainLayout'
import { Divider, Paper, Stack, Typography } from '@mui/material'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'

export const PrivacyPolicyPage = () => {
  return (
    <MainLayout>
      <PageStack>
        <PageHeader leading={<BackButton />} title="개인정보 처리방침" />

        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              시행일자: 2025년 12월 22일
            </Typography>
            <Divider />

            <Stack spacing={3}>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                AMApill(이하 &quot;회사&quot;)은 이용자의 개인정보를 매우 중요하게 생각하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 개인정보 보호 관련 법령을 준수하고 있습니다.
                본 개인정보 처리방침은 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보 보호를 위해 회사가 어떠한 조치를 취하고 있는지 알려드립니다.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 2 }}>
                1. 수집하는 개인정보의 항목 및 수집방법
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>가. 회원가입 시 수집항목 (필수)</strong>
                  <br />• 이름, 이메일 주소, 비밀번호, 생년월일, 성별, 전화번호
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>나. 건강정보 관리 서비스 이용 시 수집항목</strong>
                  <br />• 복용 약물 정보 (약품명, 복용량, 복용시간, 복용기록)
                  <br />• 질병정보 (진단명, 증상, 관리 기록)
                  <br />• 병원 예약 정보 (병원명, 진료과목, 예약일시, 위치정보)
                  <br />• 식단 정보 (식사 내용, 식사 시간, 식단 이미지)
                  <br />• 건강 관리 기록 및 통계 정보
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>다. 가족 돌봄 서비스 이용 시 수집항목</strong>
                  <br />• 가족 구성원 정보 (이름, 관계, 초대 정보)
                  <br />• 보호자-피보호자 관계 정보
                  <br />• 가족 간 공유되는 건강정보 및 일정 정보
                  <br />• 가족 채팅 메시지 내용
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>라. 서비스 이용 과정에서 자동으로 수집되는 정보</strong>
                  <br />• 접속 IP 주소, 쿠키, 방문 일시, 서비스 이용기록
                  <br />• 기기정보 (OS 버전, 브라우저 종류, 디바이스 식별정보)
                  <br />• 푸시 알림 토큰 (알림 서비스 제공 시)
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>마. 수집방법</strong>
                  <br />• 웹사이트 및 모바일 애플리케이션 회원가입 및 서비스 이용 과정에서 이용자가 직접 입력
                  <br />• 로그 분석 프로그램을 통한 자동 수집
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                2. 개인정보의 수집 및 이용 목적
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                회사는 수집한 개인정보를 다음의 목적으로 이용합니다.
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>가. 회원 관리</strong>
                  <br />• 회원제 서비스 이용에 따른 본인확인, 개인식별, 부정이용 방지
                  <br />• 가입의사 확인, 연령확인, 불만처리 등 민원처리
                  <br />• 고지사항 전달
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>나. 서비스 제공</strong>
                  <br />• 약물 복용 관리 및 알림 서비스 제공
                  <br />• 병원 예약 일정 관리 및 리마인더 제공
                  <br />• 질병 관리 및 건강 정보 제공
                  <br />• 식단 기록 및 분석 서비스 제공
                  <br />• 가족 간 건강정보 공유 및 돌봄 서비스 제공
                  <br />• 복약 준수율 및 주간 건강 통계 리포트 제공
                  <br />• 맞춤형 건강 정보 및 콘텐츠 추천
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>다. 서비스 개선 및 신규 서비스 개발</strong>
                  <br />• 신규 서비스 개발 및 맞춤형 서비스 제공
                  <br />• 통계학적 특성에 따른 서비스 제공 및 광고 게재
                  <br />• 서비스 이용 통계 분석 및 품질 개선
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                3. 개인정보의 보유 및 이용기간
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다.
                단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>가. 회사 내부 방침에 의한 정보보유 사유</strong>
                  <br />• 부정이용 기록: 1년 (부정 이용 방지)
                  <br />• 서비스 이용 기록: 회원 탈퇴 시까지
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>나. 관련 법령에 의한 정보보유 사유</strong>
                  <br />「전자상거래 등에서의 소비자보호에 관한 법률」, 「통신비밀보호법」 등 관련 법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 관련 법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
                  <br />• 계약 또는 청약철회 등에 관한 기록: 5년
                  <br />• 대금결제 및 재화 등의 공급에 관한 기록: 5년
                  <br />• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년
                  <br />• 서비스 방문기록: 3개월
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                4. 개인정보의 파기절차 및 방법
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다.
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>가. 파기절차</strong>
                  <br />• 이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>나. 파기방법</strong>
                  <br />• 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.
                  <br />• 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                5. 개인정보의 제3자 제공
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
                다만, 다음의 경우에는 예외로 합니다.
                <br />• 이용자가 사전에 동의한 경우
                <br />• 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                6. 개인정보 처리의 위탁
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                회사는 서비스 향상을 위해 개인정보를 외부에 위탁하여 처리할 수 있습니다.
                개인정보의 처리를 위탁하는 경우 회사는 다음 사항을 준수합니다.
                <br />• 위탁계약 체결 시 개인정보 보호법 제26조에 따라 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정
                <br />• 수탁자가 준수하여야 할 의무사항 명시 및 관리·감독
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                7. 정보주체의 권리·의무 및 행사방법
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                이용자는 언제든지 등록되어 있는 본인의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보의 삭제를 요청할 수 있습니다.
                <br />• 개인정보 조회·수정: 앱 내 &apos;마이페이지&apos; &gt; &apos;회원정보 수정&apos;
                <br />• 회원 탈퇴: 앱 내 &apos;마이페이지&apos; &gt; &apos;설정&apos; &gt; &apos;회원 탈퇴&apos;
                <br />• 개인정보 보호책임자에게 서면, 전화, 이메일로 연락하여 열람, 정정, 삭제 요구 가능
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                8. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다.
                <br />• 쿠키는 웹사이트가 귀하의 브라우저로 전송하는 소량의 정보로, 이용자 PC 하드디스크에 저장됩니다.
                <br />• 이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 웹브라우저 옵션 설정을 통해 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
                <br />• 다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                9. 개인정보의 기술적·관리적 보호 대책
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                회사는 이용자의 개인정보를 안전하게 관리하기 위하여 다음과 같은 보안조치를 시행하고 있습니다.
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>가. 기술적 대책</strong>
                  <br />• 개인정보는 비밀번호에 의해 보호되며, 파일 및 전송 데이터를 암호화하여 중요한 데이터는 별도의 보안기능을 통해 보호
                  <br />• 백신 프로그램을 이용하여 컴퓨터바이러스에 의한 피해를 방지
                  <br />• 해킹 등 외부 침입에 대비하여 침입차단시스템 및 취약점 분석 시스템 등을 이용
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  <strong>나. 관리적 대책</strong>
                  <br />• 개인정보 접근 권한을 최소한의 인원으로 제한
                  <br />• 개인정보 처리 직원에 대한 정기적 교육 실시
                  <br />• 개인정보보호 내부관리계획 수립 및 시행
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                10. 개인정보 보호책임자
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                회사는 이용자의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </Typography>
              <Stack spacing={1} sx={{ pl: 2, mt: 1 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  • 개인정보 보호책임자: AMApill 개인정보보호팀
                  <br />• 이메일: privacy@amapill.com
                  <br />• 전화번호: 02-1234-5678
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ lineHeight: 1.8, mt: 1.5 }}>
                개인정보 침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하실 수 있습니다.
              </Typography>
              <Stack spacing={1} sx={{ pl: 2, mt: 1 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  • 개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)
                  <br />• 대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301)
                  <br />• 경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                11. 개인정보 처리방침의 변경
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                본 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                다만, 개인정보의 수집 및 활용, 제3자 제공 등과 같이 이용자 권리의 중요한 변경이 있을 경우에는 최소 30일 전에 고지합니다.
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mt: 3 }}>
                • 공고일자: 2025년 12월 22일
                <br />• 시행일자: 2025년 12월 22일
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </PageStack>
    </MainLayout>
  )
}

export default PrivacyPolicyPage
