import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

import Auth from '../utils/auth';
import { REMOVE_BOOK } from '../graphql/mutations';
import { GET_ME } from '../graphql/queries';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  const { loading, data, refetch } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);
  const [userDataLength, setUserDataLength] = useState(0);

  const userData = data?.me || {
    username: '',
    email: '',
    password: '',
    savedBooks: [],
  };

  useEffect(() => {
    setUserDataLength(Object.keys(userData).length);
  }, [userData]);

  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return false;

    try {
      await removeBook({ variables: { bookId } });
      removeBookId(bookId);
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !userDataLength) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          <h1>Viewing {userData.username}&apos;s saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book: any) => (
            <Col md='4' key={book.bookId}>
              <Card border='dark'>
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant='top'
                  />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className='btn-block btn-danger'
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;