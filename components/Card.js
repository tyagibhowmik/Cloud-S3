import styles from './Card.module.css';

function Card({ imageSrc, title, description }) {
  return (
    <div className={styles.card}>
      <img src={imageSrc} alt={title} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}

export default Card;