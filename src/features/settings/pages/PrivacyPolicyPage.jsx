import MainLayout from '@shared/components/layout/MainLayout'
import styles from './LegalPage.module.scss' // Re-use a generic style

export const PrivacyPolicyPage = () => {
  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>개인정보 처리방침</h1>
        </header>
        <div className={styles.content}>
          <h2>1. 총칙</h2>
          <p>
            [회사명]은(는) 이용자의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호"에 관한 법률을 준수하고 있습니다.
            회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며,
            개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
          </p>
          <h2>2. 수집하는 개인정보의 항목</h2>
          <p>
            회사는 회원가입, 상담, 서비스 신청 등등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
            <br />- 수집항목 : 이름, 이메일, 비밀번호, 연락처, 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보
          </p>
          {/* ... more placeholder content ... */}
        </div>
      </div>
    </MainLayout>
  )
}

export default PrivacyPolicyPage
