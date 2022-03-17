import styles from './header.module.scss'

export default function Header() {
  return(
    <div className={styles.header}>
      <a href="/">
        <img src="/Logo.svg" alt="logo" className={styles.logo}/>
      </a>
    </div>
  )
}
