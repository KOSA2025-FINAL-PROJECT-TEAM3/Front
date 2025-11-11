import MainLayout from '@shared/components/layout/MainLayout'
import styles from './LegalPage.module.scss' // Re-use a generic style

export const TermsOfServicePage = () => {
  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>이용약관</h1>
        </header>
        <div className={styles.content}>
          <h2>제1조 (목적)</h2>
          <p>
            이 약관은 [회사명]이(가) 운영하는 [서비스명] 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
          <h2>제2조 (정의)</h2>
          <p>
            이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
            <br />1. "서비스"라 함은 구현되는 단말기(PC, TV, 휴대형단말기 등의 각종 유무선 장치를 포함)와 상관없이 "회원"이 이용할 수 있는 [서비스명] 및 [서비스명] 관련 제반 서비스를 의미합니다.
            <br />2. "회원"이라 함은 회사의 "서비스"에 접속하여 이 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.
          </p>
          {/* ... more placeholder content ... */}
        </div>
      </div>
    </MainLayout>
  )
}

export default TermsOfServicePage
