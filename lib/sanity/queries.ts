export const HOME_QUERY = `
{
  "featuredArticles": *[_type=="article"] | order(publishedAt desc)[0...4]{
    _id, title, "slug": slug.current, excerpt, publishedAt
  },
  "featuredCourses": *[_type=="course"] | order(_createdAt desc)[0...4]{
    _id, title, "slug": slug.current, summary, level, isFree, price
  }
}
`;

export const ARTICLES_QUERY = `
*[_type=="article"] | order(publishedAt desc){
  _id, title, "slug": slug.current, excerpt, publishedAt
}
`;

export const ARTICLE_BY_SLUG_QUERY = `
*[_type=="article" && slug.current==$slug][0]{
  _id, title, excerpt, body, publishedAt
}
`;

export const COURSES_QUERY = `
*[_type=="course"] | order(_createdAt desc){
  _id, title, "slug": slug.current, summary, level, isFree, price
}
`;
