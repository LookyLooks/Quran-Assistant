export async function getChapters() {
    const response = await fetch('https://api.quran.com/api/v4/chapters');
    const data = await response.json();
    return data.chapters;
  }
  
  export async function getChapterVerses(chapterId: number) {
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=en&words=true&translations=131&audio=1`
    );
    const data = await response.json();
    return data.verses;
  }
  
  export async function getChapterAudio(chapterId: number, reciterId: number = 7) {
    const response = await fetch(
      `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${chapterId}`
    );
    const data = await response.json();
    return data.audio_file;
  }