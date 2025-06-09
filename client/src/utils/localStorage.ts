// Retrieve saved book IDs from localStorage
export const getSavedBookIds = (): string[] => {
  const savedBookIds = localStorage.getItem('saved_books');
  return savedBookIds ? JSON.parse(savedBookIds) : [];
};

// Save an array of book IDs to localStorage
export const saveBookIds = (bookIdArr: string[]): void => {
  if (bookIdArr.length) {
    localStorage.setItem('saved_books', JSON.stringify(bookIdArr));
  } else {
    localStorage.removeItem('saved_books');
  }
};

// Remove a specific book ID from localStorage
export const removeBookId = (bookId: string): void => {
  const savedBookIds = getSavedBookIds();
  if (!savedBookIds.length) {
    return;
  }

  const updatedSavedBookIds = savedBookIds.filter((savedBookId) => savedBookId !== bookId);
  saveBookIds(updatedSavedBookIds);
};