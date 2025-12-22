import MainLayout from '@shared/components/layout/MainLayout'
import { Divider, Paper, Stack, Typography } from '@mui/material'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'

export const TermsOfServicePage = () => {
  return (
    <MainLayout>
      <PageStack>
        <PageHeader leading={<BackButton />} title="이용약관" />

        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              시행일자: 2025년 12월 22일
            </Typography>
            <Divider />

            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                제1조 (목적)
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                본 약관은 AMApill(이하 &quot;회사&quot;)가 비영리 목적으로 무료 제공하는 건강관리 및 약물복용 관리 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 서비스 이용조건 및 절차 등 기타 필요한 사항을 규정함을 목적으로 합니다.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제2조 (정의)
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  1. &quot;서비스&quot;라 함은 구현되는 단말기(PC, 모바일 기기, 태블릿 등의 각종 유무선 장치를 포함)와 상관없이 회원이 무료로 이용할 수 있는 AMApill의 건강관리, 약물복용 관리, 병원 예약 관리, 식단 관리, 가족 돌봄 서비스 등 제반 서비스를 의미하며, 본 서비스는 비영리 목적으로 제공됩니다.
                  <br />2. &quot;회원&quot;이라 함은 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 이용자를 말합니다.
                  <br />3. &quot;아이디(ID)&quot;라 함은 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인하는 이메일 주소를 말합니다.
                  <br />4. &quot;비밀번호&quot;라 함은 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 회원 자신의 비밀을 보호하기 위하여 회원 스스로가 설정한 문자와 숫자의 조합을 말합니다.
                  <br />5. &quot;건강정보&quot;라 함은 회원이 서비스 이용 과정에서 입력하는 약물정보, 질병정보, 병원 예약정보, 식단정보 등 건강과 관련된 모든 정보를 말합니다.
                  <br />6. &quot;가족 그룹&quot;이라 함은 가족 돌봄 서비스를 위해 회원 간에 형성되는 그룹으로, 보호자와 피보호자 관계로 구성됩니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제3조 (약관의 효력 및 변경)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력을 발생합니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경사항을 시행일자 7일 전부터 서비스 내 공지사항을 통해 공지합니다. 다만, 회원에게 불리한 약관의 변경인 경우에는 시행일자 30일 전부터 공지합니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ③ 회원은 변경된 약관에 동의하지 않을 권리가 있으며, 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다. 단, 약관 변경 공지 후 7일 이내에 거부 의사를 표시하지 않을 경우 약관 변경에 동의한 것으로 간주합니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제4조 (서비스의 제공)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 회사는 다음과 같은 서비스를 제공합니다.
                </Typography>
                <Stack spacing={0.5} sx={{ pl: 2 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    1. 약물 복용 관리 및 알림 서비스
                    <br />2. 병원 예약 일정 관리 및 리마인더 서비스
                    <br />3. 질병 관리 및 건강정보 제공 서비스
                    <br />4. 식단 기록 및 분석 서비스
                    <br />5. 가족 간 건강정보 공유 및 돌봄 서비스
                    <br />6. 복약 준수율 및 주간 건강 통계 리포트 제공
                    <br />7. 기타 회사가 추가 개발하거나 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회사는 서비스를 일정 범위로 분할하여 각 범위별로 이용가능 시간을 별도로 정할 수 있으며, 이 경우 그 내용을 사전에 공지합니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ③ 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 다만, 회사는 서비스의 효율적 운영을 위해 필요한 경우 서비스의 전부 또는 일부를 일시 중단할 수 있으며, 이 경우 사전 또는 사후에 이를 공지합니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제5조 (이용계약의 성립)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 이용계약은 회원이 되고자 하는 자(이하 &quot;가입신청자&quot;)가 본 약관의 내용에 동의한 다음 회원가입 신청을 하고, 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회사는 가입신청자의 신청에 대하여 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                </Typography>
                <Stack spacing={0.5} sx={{ pl: 2 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    1. 가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우
                    <br />2. 실명이 아니거나 타인의 명의를 이용한 경우
                    <br />3. 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우
                    <br />4. 만 14세 미만 아동이 법정대리인의 동의를 얻지 아니한 경우
                    <br />5. 이용자의 귀책사유로 인하여 승인이 불가능하거나 기타 규정한 제반 사항을 위반하며 신청하는 경우
                  </Typography>
                </Stack>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제6조 (회원정보의 변경)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 회원은 개인정보관리 화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회원은 회원가입 신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 기타 방법으로 회사에 대하여 그 변경사항을 알려야 합니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ③ 제2항의 변경사항을 회사에 알리지 않아 발생한 불이익에 대하여 회사는 책임지지 않습니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제7조 (회원 탈퇴 및 자격 상실)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며, 회사는 즉시 회원탈퇴를 처리합니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.
                </Typography>
                <Stack spacing={0.5} sx={{ pl: 2 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    1. 가입 신청 시에 허위 내용을 등록한 경우
                    <br />2. 다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우
                    <br />3. 서비스를 이용하여 법령 또는 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우
                    <br />4. 타인의 개인정보 또는 건강정보를 무단으로 수집, 저장, 공개하는 경우
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ③ 회사가 회원자격을 제한·정지시킨 후, 동일한 행위가 2회 이상 반복되거나 30일 이내에 그 사유가 시정되지 아니하는 경우 회사는 회원자격을 상실시킬 수 있습니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제8조 (회원에 대한 통지)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 회사가 회원에 대한 통지를 하는 경우, 회원이 회사와 미리 약정하여 지정한 전자우편 주소, 푸시 알림 등으로 할 수 있습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회사는 불특정다수 회원에 대한 통지의 경우 1주일 이상 서비스 내 공지사항에 게시함으로써 개별 통지에 갈음할 수 있습니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제9조 (개인정보 보호)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 이용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회사는 회원의 건강정보를 포함한 민감정보를 수집하며, 이는 서비스 제공을 위한 필수 정보입니다. 회사는 관련 법령에 따라 이를 안전하게 보호하며, 회원의 동의 없이 제3자에게 제공하지 않습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ③ 가족 그룹 서비스를 이용하는 경우, 회원은 그룹 내 다른 회원과 본인의 건강정보가 공유됨에 동의한 것으로 간주됩니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제10조 (회원의 의무)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 회원은 다음 행위를 하여서는 안 됩니다.
                </Typography>
                <Stack spacing={0.5} sx={{ pl: 2 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    1. 신청 또는 변경 시 허위 내용의 등록
                    <br />2. 타인의 정보 도용
                    <br />3. 회사에 게시된 정보의 무단 변경
                    <br />4. 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시
                    <br />5. 회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해
                    <br />6. 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위
                    <br />7. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위
                    <br />8. 회사의 동의 없이 영리를 목적으로 서비스를 사용하는 행위
                    <br />9. 타인의 건강정보를 무단으로 수집, 저장, 공개하는 행위
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회원은 관계 법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제11조 (서비스의 중단)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사에 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제12조 (의료행위의 부인 및 이용자 책임)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8, fontWeight: 700, color: 'error.main' }}>
                  ⚠️ 중요: 본 서비스는 의료행위가 아니며, 의학적 조언을 제공하지 않습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 본 서비스는 개인 건강관리 및 약물복용 기록 관리를 위한 정보제공 도구이며, 의료행위를 대체하거나 의학적 진단, 처방, 치료를 제공하지 않습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회원은 서비스에서 제공하는 모든 정보를 참고용으로만 활용해야 하며, 약물 복용, 질병 관리, 건강 관련 의사결정은 반드시 의사, 약사 등 전문의료인의 지도 하에 이루어져야 합니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ③ 회사는 회원이 서비스에 입력한 정보(약물정보, 질병정보, 식단정보 등)의 정확성, 완전성, 신뢰성에 대해 보증하지 않으며, 회원은 본인이 입력한 정보에 대한 책임을 부담합니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ④ 회원이 서비스의 정보에 의존하여 의료적 판단을 내리거나 약물 복용을 결정함으로써 발생하는 건강상의 문제, 부작용, 질병 악화 등 일체의 결과에 대해 회사는 책임지지 않습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ⑤ 응급상황, 심각한 증상, 약물 부작용 등이 발생한 경우 즉시 의료기관을 방문하거나 응급서비스(119)에 연락해야 하며, 본 서비스에만 의존해서는 안 됩니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제13조 (손해배상 및 책임의 제한)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 본 서비스는 비영리 목적으로 무료 제공되는 서비스이므로, 회사는 회원에게 발생한 손해에 대하여 회사의 고의 또는 중대한 과실에 의한 경우를 제외하고는 책임을 부담하지 않습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회원이 서비스에 입력한 정보의 부정확성, 약물 복용 누락, 건강정보 관리 소홀 등으로 인해 발생한 손해에 대해 회사는 책임지지 않습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ③ 회원이 서비스를 이용함에 있어 행한 불법행위나 본 약관 위반행위로 인하여 회사가 당해 회원 이외의 제3자로부터 손해배상 청구 또는 소송을 비롯한 각종 이의제기를 받는 경우, 당해 회원은 자신의 책임과 비용으로 회사를 면책시켜야 하며, 회사가 면책되지 못한 경우 당해 회원은 그로 인하여 회사에 발생한 모든 손해를 배상하여야 합니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ④ 단, 회사의 고의 또는 중대한 과실로 인한 개인정보 유출, 서비스 장애 등으로 회원에게 직접적인 손해가 발생한 경우 관련 법령에 따라 회사는 배상 책임을 부담합니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제14조 (면책조항)
              </Typography>
              <Stack spacing={1.5} sx={{ pl: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ① 본 서비스는 비영리 목적의 무료 서비스로서, 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우 서비스 제공에 관한 책임이 면제됩니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ③ 회사는 회원이 서비스를 이용하여 기대하는 효과나 결과를 얻지 못한 것에 대하여 책임을 지지 않으며, 서비스를 통하여 얻은 정보나 자료로 인한 손해 등에 대하여도 책임을 지지 않습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ④ 회사는 회원이 서비스에 게재하거나 입력한 정보, 자료, 건강정보의 신뢰도, 정확성, 완전성 등 내용에 관하여는 책임을 지지 않습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ⑤ 회사는 회원 간 또는 회원과 제3자 간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임이 없습니다.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  ⑥ 본 서비스는 정보 제공 및 기록 관리 목적의 도구이며, 의학적 효능이나 건강 개선 결과를 보장하지 않습니다. 회원은 본인의 건강 관리에 대한 전적인 책임을 부담합니다.
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제15조 (관할법원)
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는 법원을 관할법원으로 합니다.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 3 }}>
                제16조 (준거법)
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                본 약관과 회사와 회원 간의 서비스 이용계약에는 대한민국 법률이 적용됩니다.
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mt: 4 }}>
                • 공고일자: 2025년 12월 22일
                <br />• 시행일자: 2025년 12월 22일
              </Typography>

              <Divider sx={{ mt: 3 }} />

              <Typography variant="body2" sx={{ lineHeight: 1.8, mt: 2 }}>
                본 약관은 2025년 12월 22일부터 적용됩니다.
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </PageStack>
    </MainLayout>
  )
}

export default TermsOfServicePage
