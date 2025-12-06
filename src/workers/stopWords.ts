export const commentStopWords = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during',
  'each',
  'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just',
  'lol',
  'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'still', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up',
  'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'video', 'videos'
]);

export const titleStopWords = new Set([
    ...commentStopWords,
    'official', 'music', 'video', 'trailer', 'teaser', 'lyrics', 'lyric', 'audio',
    'hd', '4k', 'full', 'episode', 'part', 'ep', 'review', 'live', 'ft', 'feat',
    'vs', 'and', 'or', 'in', 'on', 'at', 'the', 'a', 'an',
    '2023', '2024', '2025',
    'how', 'to', 'make', 'diy', 'tutorial', 'guide',
    'top', 'best', 'worst', 'ultimate',
    'compilation', 'highlights',
    'gameplay', 'walkthrough'
]);
