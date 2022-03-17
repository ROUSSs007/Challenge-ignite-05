//Next and React
import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link'

//Services (Prismic)
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

//Converters and relateds
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

//Visual elements
import { FiUser, FiCalendar } from 'react-icons/fi';

//Components
import Header from '../components/Header'

//Styles
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handlerNextPage() {
    const { next_page, results } = await fetch(nextPage).then(response => response.json())

    setNextPage(next_page);
    setPosts([...posts, ...results]);
  }

  const nextPageLoader = () => {
    if (nextPage) {
      return `${styles.nextPageButton} ${styles.active}`
    } else { return `${styles.nextPageButton}`}
  }

  return(
    <main className={commonStyles.container}>
      <Header />

      <div className={styles.postsContainer}>
        {posts.map(post => {
          return (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.posts}>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div className={styles.subInfo}>
                  <p><FiCalendar /> {post.first_publication_date}</p>
                  <p><FiUser /> {post.data.author}</p>
                </div>
              </a>
            </Link>
          )
        })}

        <button onClick={handlerNextPage} className={nextPageLoader()}>Carregar mais posts</button>
      </div>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'pos'),
    {
      fetch: ['pos.title', 'pos.subtitle', 'pos.author'],
      pageSize: 2,
      page: 1
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = { next_page: postsResponse.next_page, results };

  return {
    props: { postsPagination },
  };
};
